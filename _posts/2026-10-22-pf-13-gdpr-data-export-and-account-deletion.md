---
layout: single
title: "Building a Personal Finance App, Part 13: GDPR Data Export and Account Deletion"
date: 2026-10-22
show_date: true
toc: true
toc_label: "Export and Erasure"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - GDPR
  - EF Core
  - ASP.NET Core Identity
  - Azure Container Apps
  - Bicep
---

In this final part I add the two privacy features every app holding personal data should have: "download my data" and "delete my account". They sound like a button each. In practice, deleting an account touched every table, the sign-in system, the infrastructure and the Privacy Policy, so I designed it on paper first and then shipped it in four small pull requests.

**In this post you'll learn:**

- How to turn GDPR's right to erasure into a concrete timeline: request, grace period, purge
- How one shared `DeletedAt` stamp makes "undo my deletion" exact
- How to write a hard delete that is idempotent and safe when two runs overlap
- Why a scheduled Container Apps Job beat a `BackgroundService` for an app that scales to zero
- Why community posts were anonymized instead of deleted

This is an engineering write-up of what I built and why, not legal advice. If you handle real users' data, check your obligations with someone qualified.
{: .notice--warning}

---

## The Problem

**GDPR** (the EU's General Data Protection Regulation) gives people, among other rights, a *right to erasure* (delete everything about me) and a *right to data portability* (give me my data in a format another app can read).

My app already had a rule that made erasure impossible. Every user-owned table inherits `AuditableEntity` and uses **soft delete**: a row is marked `IsDeleted = true` with a `DeletedAt` time and hidden by an EF Core global query filter, but it stays in the database. The opposite, a **hard delete**, removes the row for good. `AGENTS.md` said, flatly, never hard-delete user-owned entities.

On top of that:

- The Privacy Policy (more on it below) already promised to erase data "within 30 days" of a request, but nothing did it.
- The built-in ASP.NET Core Identity "Delete personal data" page deleted only the sign-in user and **orphaned** all of its financial data.
- The original issue (#65) asked for soft deletion only, which would not meet erasure.

### Where this started: legal pages and consent

The groundwork came earlier, in commit `c7cdf57` (#67): a footer with Privacy Policy, Terms, Disclaimer, Cookie Policy and Contact pages, a registration consent checkbox that stores a `UserConsent` row with the policy version, and a cookie banner that holds back third-party scripts (Google Fonts, Lucide icons) until the visitor picks "Accept All" or "Essential Only".

Those pages made promises. This part is about keeping them.

---

## Design First: ADR 0005

Before writing code I wrote an Architecture Decision Record, `docs/adr/0005-account-purge-hard-deletes-after-grace-period.md` (commit `9ff3a81`), and added four terms to `GLOSSARY.md`:

| Term | Meaning |
|---|---|
| Deletion Request | An Account's confirmed request to be erased, which hides its data and starts the Grace Period |
| Grace Period | The 30 days after a Deletion Request during which the Account can still cancel it |
| Purge | The permanent erasure of an Account and its data when its Grace Period ends |
| Data Export | A JSON file of the data an Account currently holds, which it downloads for itself |

A review pass (`36e9a30`) added decisions the first draft skipped (confirmation, the cancel link, the lockout, the placeholder user id, the export format) and pointed the "never hard-delete" rule in `AGENTS.md` at the ADR, so the exception is written where agents and humans look first.

The final decisions, in short:

1. Export and deletion both live on the Identity **Personal data** page. Password accounts confirm with their password; Google-only accounts type `DELETE`. The last Admin cannot delete themselves.
2. A Deletion Request **soft-deletes first** with one shared `DeletedAt` stamp and locks the user out.
3. Cancel is a **single-use link**, valid until the Grace Period ends, and restores only rows with that exact stamp.
4. The **Purge** is the one sanctioned hard delete: daily, idempotent, one transaction per Account.
5. **Community content is anonymized**, not deleted.
6. Only a **minimal audit record** survives.
7. Data Export is **one JSON file** of live rows only. It never changes data.

### The considered options

The most useful part of the ADR is the list of what I *didn't* do:

| Option | Verdict | Why |
|---|---|---|
| Soft-delete only, rewrite the Privacy Policy | Rejected | Keeps personal financial data forever; does not meet erasure |
| Anonymize all rows in place, no hard delete | Rejected | Financial records stay re-identifiable through amounts, dates and descriptions |
| Immediate hard delete | Rejected | Irreversible after an accidental or malicious request |
| `BackgroundService` in the ApiService | First chosen, then rejected | The ApiService scales to zero, so an in-app timer only runs while traffic keeps it awake |
| Admin-triggered purge | Rejected | A manual button can miss the promised timeline |

The anonymization row is the one I'd point other developers at. Swapping a name for "Deleted User" feels like erasure, but a list of transactions with amounts, dates and merchant descriptions is a fingerprint. For financial data, the honest answer was to actually delete it.

### The 31-day timeline

A follow-up commit (`c8896e9`) fixed a small but real promise problem. If the Grace Period is 30 days and the Purge runs once a day, the actual erasure can land up to a day later. So the ADR now says: the Grace Period stays 30 days, and erasure completes **within 31 days** of the request.

```text
Day 0                       Day 30                    Day 31
  |                           |                         |
  | Deletion Request          | Grace Period ends       | latest Purge run
  | - rows soft-deleted       | (PurgeAfter)            | - rows hard-deleted
  | - user locked out         |                         | - Identity user removed
  | - cancel link emailed     |                         | - posts -> "Deleted User"
  |                           |                         | - request marked Purged
  |<--- cancel link works --->|                         |
  |<-------------- erasure completes within 31 days --->|
```

---

## Step 1: Data Export as One JSON File

The first PR (`92a2bbf`, #141) added `GET /api/data-export`, backed by `DataExportService`. It runs one read-only query per section (consents, net worth parameters, budgets, transactions, Google Drive connections, community posts, and so on), each filtered by the Account and ordered deterministically so two exports of the same data are identical.

The Web side lives on the Personal data page. Here is the download handler from `PersonalData.cshtml.cs`; note the `no-store` header, because a personal data file should never sit in a cache:

```csharp
public async Task<IActionResult> OnPostDownloadAsync()
{
    try
    {
        var export = await _dataExportApi.ExportAsync(HttpContext.RequestAborted);
        var fileName = string.Create(CultureInfo.InvariantCulture,
            $"personal-finance-export-{export.ExportedAtUtc:yyyy-MM-dd}.json");

        Response.Headers.CacheControl = "no-store";
        return File(JsonSerializer.SerializeToUtf8Bytes(export, FileJsonOptions), "application/json", fileName);
    }
    catch (Exception ex) when ((ex is Refit.ApiException or HttpRequestException or TaskCanceledException)
                               && !HttpContext.RequestAborted.IsCancellationRequested)
    {
        _logger.LogWarning(ex, "Exporting personal data failed.");
        ErrorMessage = ApiErrorMessages.ForUser(ex, "Your data could not be exported. Please try again later.");
        return Page();
    }
}
```

Two decisions worth copying:

- **Live rows only, no secrets.** Soft-deleted rows are left out, and so are secrets like the encrypted Google Drive API key. The export shows what the Account currently holds.
- **Neutralize the dangerous default.** The same PR replaced Identity's built-in Delete personal data page with one that deleted nothing and pointed to the Contact page, until the real Deletion Request existed. The code review (`fb26242`) also redirected the default `DownloadPersonalData` page, so there is exactly one download.

---

## Step 2: The Deletion Request

The second PR (`d4d8786`, #142, release 4.0.0) is the heart of the feature. In **one** `SaveChanges` call, `AccountDeletionService.RequestAsync` hides every user-owned row, locks the user out, and stores the request.

Look at three things in this trimmed excerpt: the stamp is rounded to whole milliseconds, the lockout uses Identity's own fields, and only a *hash* of the cancel token is stored.

```csharp
// Whole milliseconds, so the stamp round-trips exactly through any datetime2 precision.
var now = UtcNow();
var stamp = new DateTime(now.Ticks - now.Ticks % TimeSpan.TicksPerMillisecond, DateTimeKind.Utc);
foreach (var type in HiddenEntityTypes())
{
    await InvokeAsync(HideRowsMethod, type, userId, stamp, cancellationToken);
}

// Lockout also stops external (Google) sign-in; the new security stamp ends other signed-in sessions.
user.LockoutEnabled = true;
user.LockoutEnd = DateTimeOffset.MaxValue;
RotateStamps(user);

var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(CancelTokenBytes));
_db.DeletionRequests.Add(new DeletionRequest
{
    UserId = userId,
    RequestedAt = stamp,
    PurgeAfter = stamp + GracePeriod,
    CancelTokenHash = HashToken(token)   // SHA-256 hex; the token itself is never stored
});

await _db.SaveChangesAsync(cancellationToken);
```

`HiddenEntityTypes()` doesn't keep a hand-written list. It asks the EF Core model for every `AuditableEntity` type, so a new table is covered automatically:

```csharp
internal IReadOnlyList<Type> HiddenEntityTypes() =>
    _db.Model.GetEntityTypes()
        .Select(t => t.ClrType)
        .Where(t => typeof(AuditableEntity).IsAssignableFrom(t) && t != typeof(AiUsageRecord))
        .OrderBy(t => t.Name, StringComparer.Ordinal)
        .ToList();
```

### Why one shared stamp

This is the reusable trick. Every row the request hides gets `DeletedAt = RequestedAt`, the exact same value. Cancelling restores rows **with that stamp and nothing else**:

```csharp
var rows = await _db.Set<TEntity>().IgnoreQueryFilters()
    .Where(e => e.UserId == userId && e.IsDeleted && e.DeletedAt == stamp)
    .ToListAsync(cancellationToken);
foreach (var row in rows)
{
    row.IsDeleted = false;
    row.DeletedAt = null;
}
```

A transaction you deleted last month has a different `DeletedAt`, so cancelling your account deletion doesn't resurrect it. "Undo" puts you back exactly where you were.

### The cancel link

The confirmation email carries a link to an anonymous `CancelDeletion` page. The Account can't sign in (it's locked out), so the single-use token *is* the authorization. Opening the link changes nothing; only the button, a POST, cancels. The page's own comment explains why: email scanners follow links, and a GET that cancels would be triggered by a robot.

---

## Step 3: The Purge

The third PR (`a4fbfcd`, #143, release 4.1.0) is the one sanctioned hard delete. Two properties matter:

- **Idempotent** means running it twice has the same effect as running it once. The Purge only picks `Pending` requests whose `PurgeAfter` has passed and marks each one `Purged`, so a second run finds nothing to do.
- **One transaction per Account.** Each Account is erased in a single `SaveChanges`, so either everything about it goes, or nothing does. One failure doesn't stop the others.

Here is the core of `AccountPurgeService.PurgeOneAsync`:

```csharp
var request = await _db.DeletionRequests.FirstOrDefaultAsync(r =>
    r.Id == requestId && r.Status == DeletionRequestStatus.Pending && r.PurgeAfter <= now, cancellationToken);
if (request is null)
{
    return false;
}

var userId = request.UserId;
await UncountLikesAsync(userId, request.RequestedAt, cancellationToken);
await AnonymizeCommunityContentAsync(userId, request.RequestedAt, cancellationToken);
await RemoveCachedDriveFilesAsync(userId, cancellationToken);
foreach (var type in DeletedEntityTypes())
{
    await (Task)RemoveRowsMethod.MakeGenericMethod(type).Invoke(this, [userId, cancellationToken])!;
}

await RemoveIdentityUserAsync(userId, cancellationToken);

request.Status = DeletionRequestStatus.Purged;
request.PurgedAt = now;
request.UserId = DeletedAccount.UserId;
await _db.SaveChangesAsync(cancellationToken);
return true;
```

It removes every user-owned row (including ones soft-deleted long ago), the cached Google Drive listings, and the Identity user with its roles, claims, logins and tokens. Those Identity rows are removed explicitly rather than left to a database cascade, so the result is the same on every provider.

### Concurrency tokens for overlapping runs

A **concurrency token** is a column EF Core checks when saving: if its value changed since the row was loaded, the update affects zero rows and EF throws `DbUpdateConcurrencyException`. I made `DeletionRequest.Status` one:

```csharp
// Concurrency token: a cancel and the Purge (or two cancels) cannot both act on the same pending request.
entity.Property(e => e.Status).IsRequired().IsConcurrencyToken();
```

So if a user cancels while the Purge is mid-flight, or a retried job overlaps the first, whichever saves second fails. The Purge catches that, counts the Account as skipped, and logs only the request id, never the Account's id, email or data.

### Anonymizing community content

The app has community stories and comments. Deleting a story would break threads other people replied to. So the Purge keeps them, sets `AuthorName` to "Deleted User" and `UserId` to a placeholder:

```csharp
public static class DeletedAccount
{
    /// <summary>Placeholder Account id. Identity ids are GUIDs, so it matches no Account.</summary>
    public const string UserId = "deleted-account";

    /// <summary>Author name shown on an anonymized story or comment.</summary>
    public const string DisplayName = "Deleted User";
}
```

No schema change was needed. The Account's likes and poll votes are deleted, and stored like counts on other people's posts are corrected.

### The minimal audit record

`DeletionRequest` is deliberately *not* an `AuditableEntity`. It's never soft-deleted, and it's the one record that outlives the Purge: when the request was made and when it was purged. The Purge also swaps its `UserId` for the same placeholder, so no row points at the erased Account.

---

## Step 4: Running It as a Container Apps Job

My ApiService runs on Azure Container Apps with `minReplicas: 0` (see [Part 5]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %})). A timer inside it only ticks while traffic keeps it awake. On a quiet day the Purge wouldn't run at all, and the 31-day promise would break.

The fix: run the *same image* as a scheduled job, with a flag that skips the web server. `AccountPurgeJob` migrates, purges, and returns an exit code:

```csharp
public const string Argument = "--purge-only";

public static async Task<int> RunAsync(IHost host, CancellationToken cancellationToken = default)
{
    await host.MigrateAndSeedDatabaseAsync(cancellationToken);
    // ... resolve IAccountPurgeService and call PurgeDueAsync ...
    return summary.Failed == 0 ? StartupExit.Success : StartupExit.Failure;
}
```

And `Program.cs` branches before the web server starts:

```csharp
// The daily Purge job runs this image with --purge-only (ADR 0005): migrate, purge, exit.
if (AccountPurgeJob.IsRequested(args))
{
    return await AccountPurgeJob.RunAsync(app);
}
```

The infrastructure is `infra/modules/purge-job.bicep`. Look at the schedule trigger, the timeout and the retry limit:

```bicep
resource purgeJob 'Microsoft.App/jobs@2024-03-01' = {
  name: name
  location: location
  properties: {
    environmentId: containerAppEnvironmentId
    workloadProfileName: 'Consumption'
    configuration: {
      triggerType: 'Schedule'
      scheduleTriggerConfig: {
        cronExpression: cronExpression   // default '0 15 * * *'
        parallelism: 1
        replicaCompletionCount: 1
      }
      replicaTimeout: 900
      replicaRetryLimit: 1
    }
    template: {
      containers: [
        {
          name: 'purge'
          image: containerImage
          args: [ '--purge-only' ]
        }
      ]
    }
  }
}
```

15:00 UTC sits inside the hours when the database is usually awake anyway. The job runs for seconds a day, which `infra/main.bicep` estimates at about $0/month within the Consumption free grant. The connection string is passed as a `@secure()` parameter and a job secret, never in plain config.

---

## Step 5: Making the Legal Text Match

The last PR (`d5edcbb`, #144) rewrote the Privacy Policy and Terms. They used to say deleted data is soft-deleted and erasure is processed "within 30 days". Now they describe what actually ships: data hidden straight away, 30 days to cancel from the emailed link, erasure within 31 days, community posts kept as "Deleted User", only a record of *when* kept, and backups gone within 7 days. Both pages link to the Personal data page for self-service.

A new test, `LegalPagesDeletionTextTests`, pins these facts, so if someone changes the Grace Period, the build reminds them the policy says 30 and 31 days.

---

## Gotchas and Lessons Learned

**1. I reversed the runner decision.** The first ADR rejected a Container Apps Job because "a Job adds infrastructure" and picked a `BackgroundService`. While building the Purge I hit the obvious problem: the ApiService scales to zero. The ADR was amended rather than rewritten, and the `BackgroundService` now sits in the considered options as "first chosen, then rejected". Keeping the reversal visible is the point of an ADR.

**2. "Daily" plus "30 days" is not 30 days.** A daily runner adds up to a day. I nearly shipped a Privacy Policy promising something the system couldn't do. Do the arithmetic on the promise, not just the setting.

**3. `IgnoreQueryFilters()` turns off *every* filter in the query.** The export needed deleted budget categories (they still show in past months), so I put `IgnoreQueryFilters()` on the joined categories. But it applies to the whole query, so it also switched off the filter on transactions, budget lines and months, and soft-deleted rows leaked into the export. The review fix (`fb26242`) keeps filters off and excludes deleted rows explicitly with conditions like `!transaction.IsDeleted`.

**4. Google sign-in bypassed the lockout.** The external login page linked a Google login to an existing user by email and then called `SignInAsync`, which skips the lockout check. A locked-out Account could sign straight back in. The fix (`501ec22`) checks `IsLockedOutAsync` before linking anything.

**5. Overlapping runs were a real case, not a theory.** The first ADR worried about "several ApiService replicas". The real overlap is a retried job execution or a manual run. The concurrency token on `Status` handles both, and a test (`Purge_TwoRunsOverlapping_EraseTheAccountOnce_AndTheLateRunSkipsIt`) proves it.

**6. Anonymizing *everything* kept too much.** The first Purge anonymized every story and comment, including ones the user had already deleted themselves. Those were invisible to everyone, so keeping them only kept the person's words forever. The review fix (`3817d72`) erases them, along with other people's likes on them.

**7. A timed-out job looked like a success.** If the job hit `replicaTimeout`, the cancellation exited cleanly. Now an `OperationCanceledException` returns a failure exit code, so the run shows as failed and the remaining Accounts are retried next day.

**8. The design planned for a token that didn't exist.** The ADR said to revoke the Google OAuth token before deleting the Drive connection. When I got there, the app stores no OAuth token: the Drive connection holds the user's own encrypted API key. That became a second amendment.

**9. Let tests guard the "forgot a table" bug.** The ADR's scariest consequence is that a new user-owned table could be silently missed by erasure. Discovering types from the EF model helps, and a test (`EveryTableWithAUserId_IsUserOwned_OrHandledByThePurge`) fails the build if any table with a `UserId` slips through.

---

## Recap

- Write the design first. ADR 0005 and four glossary terms turned "delete my account" into seven concrete decisions, and later absorbed two amendments without losing history.
- Soft-delete on request, hard-delete later: one shared `DeletedAt` stamp makes cancel exact, and a single-use, hashed, POST-only link makes it safe.
- The Purge is idempotent, one transaction per Account, and uses a concurrency token so overlapping runs and cancels can't both win.
- An app that scales to zero can't run its own timers; a Container Apps Job running the same image with `--purge-only` can.
- Anonymize shared content, delete personal records, keep only a "when" audit row, then make the legal text say exactly that.

---

## What's Next / Closing Thoughts

That's the last part of this series. Looking back over thirteen posts, the thing I'd repeat is the habit this post leaned on hardest: write down the decision, ship it in small PRs, and let review findings change the design out loud instead of quietly.

Thanks for reading along. If you're building something similar, I hope a few of these patterns save you a mistake or two.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 12: Building with AI Coding Agents]({% post_url 2026-10-21-pf-12-building-with-ai-coding-agents %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
