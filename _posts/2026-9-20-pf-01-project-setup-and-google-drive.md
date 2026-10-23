---
layout: single
title: "Building a Personal Finance App, Part 1: Project Setup and the Google Drive Explorer"
date: 2026-9-20
show_date: true
toc: true
toc_label: "Setup and Drive"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - Entity Framework
  - SQLite
  - Google Drive API
  - Caching
---

Every project starts with an empty folder and a lot of decisions. On September 20, 2026, I went from that empty folder to a working multi-project .NET 10 solution with a database, migrations, and a first real feature: a page that connects to a Google Drive folder and lists the files in it. My budget lives in Google Sheets, so reading Drive was the first thing the app had to do well.

**In this post you'll learn:**
- How I laid out a .NET 10 solution with separate Web, API, Data, and Shared projects
- Why I switched from SQL Server LocalDB to SQLite on day one, and how a small helper kept every project pointed at the same database file
- How to call the Google Drive API v3 with an API key, page through results, and turn HTTP errors into useful messages
- How I persisted connections, cached file lists, and synced them incrementally
- The mistakes I made on that first day, including one I'm still paying for

---

## The Problem

I track my money in Google Sheets, one spreadsheet per year, all in one Drive folder. I wanted an app that could read that folder and eventually turn the spreadsheets into reports (that's [Part 2]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %})). Before any of the finance work, I needed:

- A solution structure I wouldn't have to tear down a week later
- A local database that needed zero setup
- A way to paste a Drive folder link and see its files
- Something that remembered my folder, so I didn't have to paste the link every time I logged in

Constraints: it's a side project, so local development had to be quick to start, and I didn't want to set up Google OAuth just to list files in a folder I'd already shared.

---

## Step 1: The Solution Layout

The first real commit (`72b6346`, "initial commit") created four projects under `PersonalFinance/src/`:

| Project | Job |
|---|---|
| `PersonalFinance.Web` | ASP.NET Core MVC + Razor Pages frontend, ASP.NET Core Identity for login |
| `PersonalFinance.ApiService` | REST API with controllers, OpenAPI, Scalar docs, and `/health` |
| `PersonalFinance.Data` | EF Core `AppDbContext`, entities, migrations |
| `PersonalFinance.Shared` | DTOs, Refit contracts, shared exceptions, version metadata |

The Web project doesn't touch business logic directly. It calls the API over HTTP using **Refit**, a library that turns a C# interface into a typed HTTP client. Each Refit client also gets a **resilience handler** (retries with backoff and a circuit breaker) from `Microsoft.Extensions.Http.Resilience`:

```csharp
builder.Services.AddRefitClient<IItemsApi>()
    .ConfigureHttpClient(client =>
    {
        client.BaseAddress = new Uri(apiBaseUrl);
        client.Timeout = TimeSpan.FromSeconds(15);
    })
    // retries with exponential jitter, circuit breaker, rate limiter
    .AddStandardResilienceHandler();
```

The starter feature was a placeholder "Items" CRUD page. It existed only to prove the Web-to-API-to-database round trip worked, and I deleted it the same afternoon (more on that below).

```text
 Browser ──► PersonalFinance.Web ──(Refit/HTTP)──► PersonalFinance.ApiService
                    │                                        │
                    └────────── PersonalFinance.Data ◄───────┘
                                   (EF Core)
            PersonalFinance.Shared: DTOs + contracts used by everyone
```

---

## Step 2: SQL Server to SQLite, and Migrations from the Start

The template defaulted to SQL Server LocalDB. About fifteen minutes later I switched to **SQLite**, a database that lives in a single file and needs no server (`1d23a35`). The change in `PersonalFinance.Web/Program.cs` was small:

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));
```

and the connection string became `Data Source=PersonalFinance.db`. I also added `*.db`, `*.db-shm`, and `*.db-wal` to `.gitignore` so the database file (and SQLite's lock/journal files) never get committed.

### The two-database problem

That relative path caused a problem right away. `Data Source=PersonalFinance.db` is resolved against the **current working directory**. The API runs from its project folder, the Web app from another, and the EF Core CLI from a third. So you get three different `PersonalFinance.db` files, each with its own data.

The fix was `DatabasePathHelper` in `PersonalFinance.Data/DatabasePathHelper.cs` (`3cffe38`). It walks up the directory tree until it finds the `.sln` file and puts the database there. The interesting part is `ResolveConnectionString`, which only rewrites *relative* paths and leaves everything else alone:

```csharp
public static string ResolveConnectionString(string? connectionString, string defaultDatabaseName = DefaultDatabaseFileName)
{
    if (string.IsNullOrWhiteSpace(connectionString))
        return GetSqliteConnectionString(defaultDatabaseName);

    var builder = new SqliteConnectionStringBuilder(connectionString);
    var dataSource = builder.DataSource;

    // If in-memory or already absolute, preserve as-is
    if (dataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase) ||
        dataSource.StartsWith("file:", StringComparison.OrdinalIgnoreCase) ||
        Path.IsPathRooted(dataSource))
    {
        return connectionString;
    }

    builder.DataSource = GetDatabasePath(dataSource); // <solution root>/PersonalFinance.db
    return builder.ConnectionString;
}
```

Leaving `:memory:` alone matters. Tests use an in-memory SQLite database, and rewriting that into a file path would have broken them.

### Migrations instead of EnsureCreated

The same commit replaced `db.Database.EnsureCreated()` with `db.Database.Migrate()` in both `Program.cs` files. `EnsureCreated` builds the schema once and can never change it. `Migrate` applies **EF Core migrations**, versioned C# files that describe each schema change, so the database can evolve.

To run `dotnet ef` commands directly against the Data project, I added a **design-time factory**. EF Core's tools look for this class when they can't build the `DbContext` from a startup project:

```csharp
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlite(DatabasePathHelper.GetSqliteConnectionString());
        return new AppDbContext(optionsBuilder.Options);
    }
}
```

The first migration, `InitialCreate`, created the Items table plus the ASP.NET Core Identity tables.

---

## Step 3: The Google Drive Explorer

Next came the feature I actually cared about (`7e879fc`). You paste a Drive folder link, and the app lists the files.

### Parsing whatever link the user pastes

Drive links come in several shapes: `/drive/folders/<id>`, `/drive/u/0/folders/<id>`, `/open?id=<id>`, or just the raw ID. `GoogleDriveHelper.ExtractFolderId` in `PersonalFinance.Shared/Helpers/GoogleDriveHelper.cs` handles all of them with one regex plus a raw-ID check:

```csharp
private static readonly Regex FolderUrlRegex = new(
    @"(?:folders\/|id=|file\/d\/)([a-zA-Z0-9_-]{15,})",
    RegexOptions.Compiled | RegexOptions.IgnoreCase);

public static string? ExtractFolderId(string? input)
{
    if (string.IsNullOrWhiteSpace(input)) return null;
    var trimmed = input.Trim();

    var match = FolderUrlRegex.Match(trimmed);
    if (match.Success && match.Groups[1].Value.Length >= 15)
        return match.Groups[1].Value;

    // No slashes or query params: treat it as a raw folder ID
    if (Regex.IsMatch(trimmed, @"^[a-zA-Z0-9_-]{15,100}$"))
        return trimmed;

    return null;
}
```

This was a pure function, so it was the first thing I covered with xUnit `[Theory]` tests, one `[InlineData]` per link format.

### Calling the Drive API v3

I used a plain **API key** instead of OAuth. An API key can read files that are shared as "Anyone with the link", which was enough for my own folder. The service in `PersonalFinance.ApiService/Services/GoogleDriveService.cs` uses a typed `HttpClient` and loops over pages until there's no `nextPageToken`:

```csharp
do
{
    var query = $"'{folderId}' in parents and trashed = false";
    var fields = "nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink,thumbnailLink)";
    var listUrl = $"https://www.googleapis.com/drive/v3/files?q={Uri.EscapeDataString(query)}" +
                  $"&fields={Uri.EscapeDataString(fields)}&orderBy={Uri.EscapeDataString("modifiedTime desc")}" +
                  $"&pageSize=100&key={Uri.EscapeDataString(apiKey)}";

    if (!string.IsNullOrEmpty(pageToken))
        listUrl += $"&pageToken={Uri.EscapeDataString(pageToken)}";

    using var response = await _httpClient.GetAsync(listUrl, cancellationToken);
    // ... parse "files" and read "nextPageToken" ...
} while (!string.IsNullOrEmpty(pageToken));
```

Two details worth copying:
- **`fields=`** asks Drive for only the properties you need, which keeps responses small.
- **`orderBy=modifiedTime desc`** was added a few minutes later (`7b3a578`) so the newest files show first, matching the default sort in the table.

### Turning HTTP errors into instructions

The most useful thing I did here was translate status codes into fixes. Google returns **404 for private folders**, not 403. That's confusing the first time you hit it, so the service says so:

| Status | What it usually means | Message tells the user to... |
|---|---|---|
| 404 | Wrong ID, **or** the folder is "Restricted" (Google hides private folders as 404) | Share the folder as "Anyone with the link" (Viewer) |
| 403 | Drive API not enabled, or API key restrictions | Enable the Drive API in Google Cloud Console |
| 400 | Malformed API key | Check the key |

I also separated **caller cancellation** from **timeouts**. Both throw `OperationCanceledException`, but only one means the user gave up:

```csharp
catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
{
    // The caller canceled: report it, don't fall back
    return new GoogleDriveFolderResponseDto { Success = false, ErrorMessage = "The request was canceled." };
}
catch (OperationCanceledException)
{
    // HttpClient timed out
    return GeneratePreviewResponse(folderId, rawInput, "The request to Google Drive API timed out. ...");
}
```

That `when` filter is a handy pattern any time you call `HttpClient` with a `CancellationToken`.

Notice the `GeneratePreviewResponse` call, though. When something failed, the service returned a list of **fake demo files**. Hold that thought for the Gotchas section.
{: .notice--warning}

---

## Step 4: Cleanup, Auth, and a UI Redesign

Within the next 20 minutes I made three quick changes:

- **Removed the Items placeholder** (`5b10569`): its controller, view, nav link, and Refit client registration. Scaffolding that isn't your product is noise.
- **Required login** for the explorer by adding `[Authorize]` to the Web `GoogleDriveController`, and showed the nav link only to signed-in users.
- **Redesigned the page** (`52d7c2f`) with category filter chips (Folders, Spreadsheets, Documents, PDFs, Images, Slides, Other), a grid/table toggle, and copy-to-clipboard actions.

---

## Step 5: Remembering Connections, Caching, and Sync

Pasting the folder link on every visit got old fast. Commit `f717bc1` added persistence with two new entities in `PersonalFinance.Data/Entities/`:

```text
 GoogleDriveConnection (one per user per folder)
 ├── UserId, Name, FolderId, FolderUrl
 ├── EncryptedApiKey, MaskedApiKey
 ├── IsValid, SyncStatus ("Pending" | "Synced" | "NeedsReauth" ...)
 ├── LastSyncedAtUtc
 └── CachedFiles ──► GoogleDriveCachedFile (many)
                     DriveFileId, Name, MimeType, Size, ModifiedTime, ...
```

The relationship is configured in `AppDbContext` with **cascade delete**, so removing a connection removes its cached files too. There are also indexes on `UserId` and `(UserId, FolderId)` because every query filters by user.

### A 30-minute cache

When you open the page, the API serves files from the database if the last sync was recent. Otherwise it goes to Google:

```csharp
var isCacheFresh = connection.LastSyncedAtUtc.HasValue &&
                   (DateTime.UtcNow - connection.LastSyncedAtUtc.Value) < TimeSpan.FromMinutes(30) &&
                   connection.CachedFiles.Any(f => !f.IsTrashed);

if (!forceRefresh && isCacheFresh)
{
    return MapConnectionToFolderResponse(connection); // zero calls to Google
}

return await SyncConnectionInternalAsync(connection, forceRefresh, cancellationToken);
```

A **Sync / Refresh** button sets `forceRefresh` to skip the cache.

### Incremental sync

A sync doesn't wipe and reload the cache. It **diffs** the live list against what's stored: update files that exist in both, add new ones, and delete the ones that disappeared from Drive.

```csharp
var existingFilesMap = connection.CachedFiles.ToDictionary(f => f.DriveFileId, f => f);
var activeFileIds = new HashSet<string>();

foreach (var fetchedFile in liveResponse.Files)
{
    activeFileIds.Add(fetchedFile.Id);
    if (existingFilesMap.TryGetValue(fetchedFile.Id, out var existing))
    {
        existing.Name = fetchedFile.Name;
        existing.ModifiedTime = fetchedFile.ModifiedTime;
        // ... other fields ...
    }
    else
    {
        connection.CachedFiles.Add(new GoogleDriveCachedFile { DriveFileId = fetchedFile.Id, /* ... */ });
    }
}

// Purge cached files that no longer exist in Drive
foreach (var removed in connection.CachedFiles.Where(f => !activeFileIds.Contains(f.DriveFileId)).ToList())
    _dbContext.GoogleDriveCachedFiles.Remove(removed);
```

Keying on Drive's stable file ID (not the name) is what makes this safe. Files get renamed all the time.

### Expired credentials

If Google answers 401, 403, or 400 during a sync, the connection is marked `NeedsReauth`, the error is saved, and the user still sees the **cached** files with a banner asking for a new key. A bad key shouldn't make your data disappear.

### Storing the API key

Each connection stores its API key. I didn't want it in plain text, so I wrote `CredentialProtector` in `PersonalFinance.Data/Helpers/CredentialProtector.cs`: AES-encrypt before saving, decrypt before calling Google, and **mask** it for display:

```csharp
public static string? Mask(string? secret)
{
    if (string.IsNullOrWhiteSpace(secret)) return null;
    var trimmed = secret.Trim();
    if (trimmed.Length <= 8) return new string('*', trimmed.Length);
    return $"{trimmed[..4]}...{trimmed[^4..]}";   // e.g. "AIza...8xY2"
}
```

### Testing against a real SQLite engine

For the persistence tests (`GoogleDrivePersistenceTests`) I used SQLite in memory instead of a mock. The trick is to **open the connection yourself**. An in-memory SQLite database disappears as soon as its last connection closes:

```csharp
var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlite("DataSource=:memory:")
    .Options;
var context = new AppDbContext(options);
context.Database.OpenConnection();   // keep the in-memory DB alive
context.Database.EnsureCreated();
```

The tests covered first-time setup, returning on a later login, switching between several drives, incremental sync, manual refresh, removal, re-authentication, and making sure one user can't see another user's connections.

---

## Step 6: The Category Filter Bug

The last commit of the day (`1940e13`) fixed the filter chips. The table filtered the "Type" column with a regex like `^Spreadsheet$`. The cell's HTML had whitespace and newlines around the text, so exact matches failed. "Other" used a negative lookahead that broke the same way.

The fix had three parts:
1. Put the plain value in `data-search` / `data-filter` attributes so DataTables doesn't search the rendered HTML.
2. Allow surrounding whitespace in the regex.
3. **Escape** the category before building a regex from it.

```javascript
var escapedCat = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
dataTable.column(2).search('^\\s*' + escapedCat + '\\s*$', true, false).draw();
```

I also added test cases for Google-native MIME types (`application/vnd.google-apps.spreadsheet` with no file extension, for example), since those are the files most likely to be misclassified.

---

## Gotchas and Lessons Learned

**1. Fake fallback data looks like real data.** When Drive failed, the explorer returned demo files. That felt friendly at the time. In [Part 2]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %}) the same habit grew into a budget report that invented a full year of numbers, and removing it took a dedicated refactor. If you can't get real data, show an error.

**2. Relative SQLite paths depend on where you run from.** Without `DatabasePathHelper` I would have had a separate database per project and spent an hour wondering why my migrations "didn't apply".

**3. `EnsureCreated` and `Migrate` don't mix.** A database created with `EnsureCreated` has no `__EFMigrationsHistory` table, so a later `Migrate()` tries to create tables that already exist. In October I had to add a recovery path (`baa18cf`) that detects legacy SQLite schemas with no migration history, resets them, and reapplies migrations. Pick migrations on day one, before any database exists.

**4. SQLite was a stepping stone.** On October 5 the app moved to Azure SQL and the SQLite migrations were deleted (`85be7c7`, covered in [Part 5]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %})). `DatabasePathHelper` still did its job: it made the first two weeks of local development painless.

**5. The API trusted a `userId` query parameter.** The Refit contract passed `userId` as a query string, and the Web app filled it from the logged-in user's claims. That's fine if only the Web app can reach the API. It's not fine if the API is ever exposed. Tightening this is a big part of [Part 10]({% post_url 2026-10-18-pf-10-rbac-and-account-isolation %}).

**6. Google returns 404 for "you don't have access".** Translating that into "change sharing to Anyone with the link" saved me (and future users) a lot of confusion.

---

## Recap

- I set up a four-project .NET 10 solution (Web, ApiService, Data, Shared) with Refit and resilience handlers between Web and API.
- SQLite plus `DatabasePathHelper` gave me a zero-setup, single shared database file, and EF Core migrations replaced `EnsureCreated` from the start.
- The Drive explorer parses any folder link, pages through Drive API v3 results, and turns 404/403/400 into concrete fixes.
- Connections and file lists are stored per user, served from a 30-minute cache, and synced incrementally by Drive file ID.
- The big lesson: don't show made-up data when the real data isn't available.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Next: [Part 2: Turning Budget Spreadsheets into Reports]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
