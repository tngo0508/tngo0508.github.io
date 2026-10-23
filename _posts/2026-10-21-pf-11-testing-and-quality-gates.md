---
layout: single
title: "Building a Personal Finance App, Part 11: Testing and Quality Gates"
date: 2026-10-21
show_date: true
toc: true
toc_label: "Quality Gates"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - xUnit
  - EF Core
  - Playwright
  - GitHub Actions
  - Code Quality
---

This part is about the safety net under the Personal Finance app: the tests, linters, analyzers and CI jobs that have to pass before anything reaches Azure. It is also about the time the safety net had a hole in it. Global Search passed every test and still failed for every user in production. Most of the gates in this post exist because something slipped through earlier, so I'll show each one next to the problem it fixed.

**In this post you'll learn:**

- Why EF Core's InMemory provider can pass a query that Azure SQL can't run, and a cheap way to catch that without a database
- How to write *convention tests* that scan your assemblies and fail when someone breaks a project rule
- How I added Playwright E2E tests, ESLint, `dotnet format` and .NET analyzers to CI one at a time
- How I got the build to zero warnings, then made any new warning fail the build (and why I had to pin the SDK)
- How to apply migrations to a real SQL Server in CI and block the deploy if they fail

---

## The Problem

The app has three .NET projects that matter for testing: `PersonalFinance.Web` (MVC + Razor), `PersonalFinance.ApiService` (the API and business logic) and `PersonalFinance.Data` (EF Core). Production runs on Azure SQL. The browser side is plain JavaScript under `wwwroot/js`.

My constraints were:

- **Tests must be fast and need no setup.** Every test lives in one xUnit project, `PersonalFinance/tests/PersonalFinance.Tests`, and runs on a plain `dotnet test`. No Docker, no SQL Server.
- **The deploy is automatic.** A push to `main` runs one GitHub Actions workflow (`.github/workflows/deploy-azure.yml`) that builds, tests and deploys to Azure Container Apps. If CI is green, the code ships.
- **A lot of the code was written with AI coding agents** (more on that in Part 12). Agents follow written rules most of the time. A test or a linter catches the rest.

That last point shaped everything. A rule that only lives in `AGENTS.md` gets broken eventually. A rule that lives in a test gets broken once, and then the build goes red.

---

## Layer 1: xUnit + EF Core InMemory

The base layer is ordinary xUnit tests. Service tests build a real `AppDbContext` on the EF Core **InMemory provider**, a fake database that keeps rows in memory. The test project pulls in exactly what it needs:

```xml
<ItemGroup>
    <PackageReference Include="coverlet.collector" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="xunit" />
    <PackageReference Include="xunit.runner.visualstudio" />
</ItemGroup>
```

Tests are grouped in folders by feature (`Budget/`, `NetWorth/`, `Search/`, `Security/`, `Web/`, `Infrastructure/`...) plus a `TestSupport/` folder for shared helpers. At the time of writing there are roughly 670 `[Fact]` and `[Theory]` methods.

InMemory is great for speed. It also has a trap that bit me hard.

### The trap: InMemory runs queries Azure SQL can't

When EF Core talks to SQL Server, it has to *translate* your LINQ into T-SQL. If it can't translate something, it throws at runtime. The InMemory provider never translates anything. It just runs your LINQ as normal C# code, so **any** query works.

Global Search (issue #92) is the textbook case. The old `SearchService` lower-cased strings inside the query:

```csharp
// Before: works on InMemory, throws on Azure SQL
var searchQuery = query.Trim().ToLowerInvariant();

var transactions = await _dbContext.SpreadsheetTransactionRecords
    .Where(t => t.UserId == userId &&
                (t.Description.ToLowerInvariant().Contains(searchQuery) ||
                 t.Category.ToLowerInvariant().Contains(searchQuery)))
    ...
```

EF Core can't turn `ToLowerInvariant()` into SQL, so every search failed on Azure SQL. It also ran three queries at the same time on one `DbContext` with `Task.WhenAll`, which a `DbContext` doesn't support. And `search.js` swallowed the error, so the user just saw "no results". All the service tests were green.

The fix in commit `3024169` used a case-insensitive SQL `LIKE` with wildcards escaped, and read the groups one after another:

```csharp
internal static string? ToContainsPattern(string? query)
{
    var trimmed = query?.Trim() ?? string.Empty;
    if (trimmed.Length < MinQueryLength)   // MinQueryLength = 2
    {
        return null;
    }

    if (trimmed.Length > MaxQueryLength)   // MaxQueryLength = 100
    {
        trimmed = trimmed[..MaxQueryLength];
    }

    var escaped = trimmed
        .Replace(LikeEscape, LikeEscape + LikeEscape)
        .Replace("%", LikeEscape + "%")
        .Replace("_", LikeEscape + "_")
        .Replace("[", LikeEscape + "[");

    return $"%{escaped}%";
}

// ...inside each query:
.Where(t => t.UserId == userId && EF.Functions.Like(t.Description, pattern, LikeEscape))
```

### The guard: translate without a database

Fixing one query wasn't enough. I wanted a test that fails the next time someone writes a query Azure SQL can't run. The trick is that EF Core can translate a query to SQL **without connecting**: `ToQueryString()` builds the SQL text and stops. So `TestSupport/AzureSqlTranslation.cs` creates a context on the SQL Server provider with a dummy connection string that is never opened:

```csharp
public static class AzureSqlTranslation
{
    private const string OfflineConnectionString =
        "Server=localhost;Database=PersonalFinance_TranslationCheck;Trusted_Connection=True;TrustServerCertificate=True;";

    /// <summary>A context on the Azure SQL provider. It never connects: use it only to translate queries.</summary>
    public static AzureSqlAppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AzureSqlAppDbContext>()
            .UseSqlServer(OfflineConnectionString)
            .Options;
        return new AzureSqlAppDbContext(options);
    }

    /// <summary>Translates <paramref name="query"/> to T-SQL and returns it; fails the test if it cannot.</summary>
    public static string AssertTranslates<T>(IQueryable<T> query)
    {
        try
        {
            return query.ToQueryString();
        }
        catch (InvalidOperationException ex)
        {
            Assert.Fail($"Query does not translate to Azure SQL: {ex.Message}");
            throw;
        }
    }
}
```

For this to work, the service has to expose its queries as `IQueryable` methods instead of hiding them inside `async` methods. Then the test runs each one through the guard, and even checks that the escape clause made it into the SQL:

```csharp
[Fact]
public void AllSearchQueries_TranslateToAzureSql()
{
    using var db = AzureSqlTranslation.CreateContext();
    var service = CreateService(db);
    var pattern = SearchService.ToContainsPattern("50%_[x]")!;

    var queries = new[]
    {
        AzureSqlTranslation.AssertTranslates(service.SheetTransactionsQuery(UserId, pattern)),
        AzureSqlTranslation.AssertTranslates(service.TrackerTransactionsQuery(UserId, pattern)),
        AzureSqlTranslation.AssertTranslates(service.SavingsGoalsQuery(UserId, pattern))
        // ...
    };

    Assert.All(queries, sql => Assert.Contains("ESCAPE", sql, StringComparison.Ordinal));
}
```

After the retro on this bug (commit `48b3977`), the guard became a written rule in `docs/CODING_STANDARDS.md`: any new or changed EF Core query that uses string, date or collation-dependent operations needs an Azure SQL translation check. Later features (the admin inbox, the data export) followed it.

This guard is cheap and catches the "can't translate" class of bugs. It does **not** prove the query returns the right rows on SQL Server. Collation and case-sensitivity still only show up against a real database.
{: .notice--info}

---

## Layer 2: Convention Tests

A **convention test** doesn't test one feature. It uses reflection to scan the whole codebase and checks that a project-wide rule holds everywhere. These are cheap to write and they are the best tool I found for keeping AI agents (and me) inside the lines.

| Test | Rule it enforces |
|---|---|
| `Security/AccountIsolationTests` | Every ApiService controller has `[Authorize]` or an explicit `[AllowAnonymous]` |
| `Web/InternalApiClientRegistrationTests` | Every Refit contract in `Shared/Contracts` is registered, and forwards the signed-in Account and internal key |
| `Web/WebApiRouteTests` | Every `/api/X` path the browser JavaScript calls has a matching `[Authorize]` Web controller |
| `Infrastructure/ModelValidationConventionTests` | No `[Required]` on a `bool` |
| `Infrastructure/GitHubActionsDeploymentWorkflowTests` | The workflow keeps the warnings-as-errors flag and pinned SDK |

Here is the authorization one. Look at how short it is for how much it protects:

```csharp
[Fact]
public void EveryApiServiceController_RequiresAuthorizationOrOptsOutExplicitly()
{
    var controllerTypes = typeof(ApiGoogleDriveController).Assembly.GetTypes()
        .Where(t => t is { IsClass: true, IsAbstract: false } && typeof(ControllerBase).IsAssignableFrom(t));

    var unprotected = controllerTypes
        .Where(t => !t.IsDefined(typeof(AuthorizeAttribute), inherit: true)
                    && !t.IsDefined(typeof(AllowAnonymousAttribute), inherit: true))
        .Select(t => t.Name)
        .ToList();

    Assert.True(unprotected.Count == 0,
        $"ApiService controllers without [Authorize] or [AllowAnonymous]: {string.Join(", ", unprotected)}");
}
```

The failure message lists the offenders by name, so a red build tells you exactly what to fix.

`WebApiRouteTests` is my favorite because it crosses languages. It reads every `.js` file under `wwwroot/js`, pulls out `/api/<Name>` paths with a regex, and checks each one against the Web controllers:

```csharp
var calledControllers = Directory.EnumerateFiles(jsRoot, "*.js", SearchOption.AllDirectories)
    .SelectMany(file => ApiPathPattern().Matches(File.ReadAllText(file)).Select(m => m.Groups[1].Value))
    .ToHashSet(StringComparer.OrdinalIgnoreCase);
// ...
var missing = calledControllers.Where(name => !apiControllers.ContainsKey(name)).ToList();
Assert.True(missing.Count == 0, $"JavaScript calls /api/ paths with no Web controller: {string.Join(", ", missing)}");
```

### The "never `[Required]` on a bool" test

This one came up while building the "I agree to the Terms" checkbox on the registration page (#67). `[Required]` on a non-nullable `bool` does nothing: `false` is a value, so the check always passes, and a checkbox marked `[Required]` happily accepts an unchecked box. The register page enforces acceptance with an explicit `ModelState` error instead. The pitfall is easy to forget, so the next PR, commit `ef42c60`, added a test that bans the pattern across all product assemblies:

```csharp
[Fact]
public void BooleanProperties_DoNotUseRequiredAttribute()
{
    // [Required] on a non-nullable bool is always satisfied (false is a value), so it never rejects
    // an unchecked box. Enforce acceptance explicitly (ModelState error) or use [Range(typeof(bool), "true", "true")].
    var offenders = ProductAssemblies
        .SelectMany(assembly => assembly.GetTypes())
        .SelectMany(type => type.GetProperties(BindingFlags.Public | BindingFlags.NonPublic |
                                               BindingFlags.Instance | BindingFlags.DeclaredOnly))
        .Where(p => p.PropertyType == typeof(bool) && p.IsDefined(typeof(RequiredAttribute), inherit: true))
        .Select(p => $"{p.DeclaringType?.FullName}.{p.Name}")
        .ToList();

    Assert.True(offenders.Count == 0, $"[Required] has no effect on bool properties: {string.Join(", ", offenders)}");
}
```

The comment in the test *is* the documentation. Anyone who trips it learns the fix from the failure.

---

## Layer 3: HTTP Tests with WebApplicationFactory

Some things only show up when the real ASP.NET Core pipeline runs: middleware order, authentication handlers, routing. For those I use `WebApplicationFactory<T>` from `Microsoft.AspNetCore.Mvc.Testing`. It starts the whole app in-process and hands you an `HttpClient`. No ports, no Docker.

`Security/ApiServiceInternalKeyHttpTests.cs` checks the rule from Part 10: an `X-User-Id` header only counts if it comes with the right `X-Internal-Key`. The host swaps the database for InMemory and sets a test secret:

```csharp
public sealed class ApiServiceHost : WebApplicationFactory<AdminController>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Database:Provider", "InMemory");
        builder.UseSetting("ConnectionStrings:DefaultConnection", $"InMemory:ApiHttpTests_{Guid.NewGuid():N}");
        builder.UseSetting("Internal:ApiKey", InternalKey);
    }
}
```

Then one `[Theory]` per attack runs against a list of real endpoints:

```csharp
[Theory]
[MemberData(nameof(Endpoints))]
public async Task SpoofedUserIdWithWrongKey_Returns401(string endpoint)
{
    var response = await _client.SendAsync(Request(endpoint, userId: "victim", internalKey: "guessed"));

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}
```

Four theories (no headers, spoofed id, wrong key, right key) times seven endpoints gives 28 cases from about 40 lines of test code.

---

## Layer 4: Playwright End-to-End Tests

Unit tests can't tell you the login page renders, or that the layout works on a phone. For that I added **Playwright**, a library that drives a real browser from code.

It started small. Commit `2e4d539` (Oct 14) added one script that checked auth pages, layout, HTTPS redirects and health endpoints. Two days later, commit `88071a3` turned it into a proper CI job:

- Moved the script to `e2e-tests/ui-test.js` with a configurable base URL
- Added `e2e-tests/api-test.js` for plain HTTP checks against the API
- Added `test:e2e` and `test:api` npm scripts
- Added an `e2e-browser-tests` job that starts ApiService and Web **on the InMemory database** on random ports, waits for `/health`, then runs both suites

E2E tests need to register a user, and registration sends a confirmation email. Commit `2d318f9` added an `E2E_DISABLE_EMAIL_CONFIRMATION` environment variable so CI can skip that step.

### The preflight check

Running E2E locally needs three things up: SQL Server, the Web app and ApiService. When one was down, the suite failed with a wall of timeouts that told me nothing. Commit `ef42c60` added `e2e-tests/preflight.js` (`npm run e2e:preflight`), which checks each dependency in order and prints a hint:

```javascript
const checks = [
    {
        name: `SQL Server at ${dbHost}:${dbPort}`,
        run: () => checkPort(dbHost, dbPort),
        hint: 'Start Docker Desktop and the SQL container, or point E2E_DB_HOST/E2E_DB_PORT at your SQL Server.'
    },
    // ...then the Web app and ApiService, each via GET /alive
];
```

It's deliberately not wired into `test:e2e`, so CI is unaffected. It exists for humans and agents running E2E on their own machine.

---

## Layer 5: Linters and Formatters

### ESLint for the JavaScript

The browser code had no compiler checking it. Commit `277d59e` (Oct 17) added a parallel `lint-js` job to CI that runs `npm run lint`. The first pass found a lot of style violations; the CHANGELOG records 227 of them fixed across the frontend files.

The next day, commit `f016dfe` added a **pre-commit hook** with Husky and lint-staged, so problems get fixed before they're even committed. `.husky/pre-commit` is one line (`npx lint-staged`), and `.lintstagedrc.json` runs ESLint with `--fix` on staged JS files only:

```json
{
  "PersonalFinance/src/PersonalFinance.Web/wwwroot/js/**/*.js": [
    "npx eslint@8 --no-eslintrc -c PersonalFinance/src/PersonalFinance.Web/wwwroot/.eslintrc.js --fix"
  ]
}
```

After the Global Search retro, I moved some JavaScript rules out of `AGENTS.md` and into ESLint, where they're actually enforced. They're warnings, so old files still pass, but `--fix` converts every file a commit touches:

```javascript
// --- Modern JS (CODING_STANDARDS.md "JavaScript") ---
'prefer-template': 'warn',
'prefer-arrow-callback': 'warn',
'no-restricted-syntax': ['warn',
    {
        selector: "CallExpression[callee.property.name='then']",
        message: 'Use async/await with try/catch instead of .then() chains.'
    },
    {
        selector: "AssignmentExpression[left.property.name='innerHTML']",
        message: 'Build DOM nodes with textContent (clear with replaceChildren()) instead of assigning innerHTML.'
    }
],
```

`no-restricted-syntax` with an AST selector is a handy trick: you can ban almost any pattern with a custom message, without writing an ESLint plugin.

### .editorconfig, analyzers and dotnet format for C#

On Oct 21 I brought the same discipline to C#, in three small commits:

1. **`d3dc92a`** added `PersonalFinance/Directory.Build.props` (shared settings for every project) and a root `.editorconfig`. It turned on the .NET analyzers at `latest-recommended` and made code-style rules run during build.
2. **`17de2d3`** ran `dotnet format whitespace` across the solution. Whitespace only, no code changes, in its own commit so the diff is easy to skip in `git blame`.
3. **`fc68c00`** added a CI step that reports format drift but doesn't fail the build yet.

Here's the heart of `Directory.Build.props` as it is today:

```xml
<PropertyGroup>
  <TargetFramework>net10.0</TargetFramework>
  <Nullable>enable</Nullable>
  <ImplicitUsings>enable</ImplicitUsings>

  <!-- Code-quality analyzers and .editorconfig style rules run during build. -->
  <AnalysisLevel>latest-recommended</AnalysisLevel>
  <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>

  <!-- CI builds with -p:EnforceWarningsAsErrors=true, so any new warning fails the deploy workflow. -->
  <TreatWarningsAsErrors Condition="'$(EnforceWarningsAsErrors)' == 'true'">true</TreatWarningsAsErrors>
</PropertyGroup>
```

The `Condition` is the important bit. Turning analyzers on in an existing codebase produces a pile of warnings. If you also make them errors on day one, nothing builds. So warnings-as-errors was **opt-in** through a property until the count reached zero.

---

## Layer 6: Zero Warnings, Then Fail on Any Warning

Getting to zero was tracked as issue #125, split into smaller tickets that each cleared one family of warnings:

| Ticket | What it cleared |
|---|---|
| #126 | Upgraded Aspire to remove a vulnerable transitive MessagePack (NU1902) |
| #127 | Culture-dependent formatting and parsing (CA1305, CA1304, CA1311, CA1310) |
| #128 | String-comparison and collection-check warnings |
| #129 | Design and performance analyzer warnings in `src` |
| #131 | Analyzer warnings in the test project |
| #132 | Turned on `-p:EnforceWarningsAsErrors=true` in CI (commit `7b48d5f`) |

One of these is worth a closer look.

**#127 found real bugs, not just noise.** Formatting a budget period key like `yyyy-MM` with the current culture means the output depends on the server's locale. The fix used the invariant culture for machine-readable values and the app culture (en-US) for user-facing text, and added culture-switch tests with `de-DE` and `th-TH`.

### Why the SDK had to be pinned

Right after the gate went on, CI broke on code that built cleanly on my machine. CI's `setup-dotnet` installed the newest `10.0.x` SDK, which was `10.0.402`, and that SDK added a new analyzer, **CA1873** (avoid expensive argument evaluation in log calls). It flagged 35 log calls. With warnings as errors, that's 35 build errors.

Commit `647b575` fixed it both ways: wrap the log calls in `IsEnabled` checks, and pin the SDK in a root `global.json` so new analyzers arrive when *I* upgrade, not when GitHub's runner image does:

```json
{
  "sdk": {
    "version": "10.0.402",
    "rollForward": "latestPatch"
  }
}
```

Every `setup-dotnet` step now reads that file instead of a version string:

```yaml
- name: Setup .NET SDK (from global.json)
  uses: actions/setup-dotnet@v4
  with:
    global-json-file: global.json
```

And so nobody quietly turns the gate off, `GitHubActionsDeploymentWorkflowTests` reads the workflow YAML and asserts the flag is on both solution builds:

```csharp
Assert.Equal(2, solutionBuilds.Count);
foreach (Match build in solutionBuilds)
{
    Assert.Contains("-p:EnforceWarningsAsErrors=true", build.Value);
}
```

Yes, a C# test that checks a YAML file. It's crude, and it works.

---

## Layer 7: Migrations on a Real SQL Server

The last gap was the database schema. InMemory doesn't run migrations at all, so a broken migration would only fail during the real deploy, against the production database.

Commit `48fa8d9` added a `sql-server-migrations` job. It starts SQL Server 2022 in Docker with the same `npm run db:up` I use locally, then runs the ApiService with a `--migrate-only` flag **twice**. The first run must apply migrations. The second must apply nothing, which proves the migrations are idempotent:

```bash
migrate 1
first=$(applied_migrations)        # COUNT(*) FROM __EFMigrationsHistory
if [ -z "${first}" ] || [ "${first}" -eq 0 ]; then
  echo "::error::The first run applied no migrations to the empty database."
  exit 1
fi

migrate 2
second=$(applied_migrations)
if [ "${second}" != "${first}" ]; then
  echo "::error::The second run applied migrations again (${first} -> ${second}); they are not idempotent."
  exit 1
fi
```

The `sa` password is generated fresh for each run (`openssl rand`) and masked in the logs, so there's no repository secret to manage. On failure the job dumps the container and app logs, and `npm run db:down` always runs.

Then the important line: the deploy job now `needs` it.

```yaml
deploy-azure:
  name: Deploy to Azure Container Apps
  needs: [build-and-test, sql-server-migrations, validate-infra, build-and-push-containers]
```

---

## The CI Pipeline Today

Here's the shape of `deploy-azure.yml` after all of the above:

```text
 push / PR to main
        |
        +--> build-and-test ---------------+  restore, build -warnaserror, format check (non-blocking), dotnet test
        +--> lint-js                       |  npm run lint (ESLint)
        +--> e2e-browser-tests             |  ApiService + Web on InMemory, Playwright UI + API tests
        +--> sql-server-migrations --------+  SQL Server 2022 in Docker, --migrate-only x2
        +--> validate-infra ---------------+  Bicep templates
        +--> build-and-push-containers ----+  api + web images to GHCR (matrix)
                                           |
                                           v   (push / manual run only, not PRs)
                                     deploy-azure      Bicep -> Azure Container Apps
                                           |
                                           v
                                      smoke-test       HTTP checks against the live URLs
                                           |
                                           v
                                     promote-latest    tag deployed images as :latest
```

Everything in the first column runs in parallel. Only the jobs joined by the right-hand line gate the deploy.

---

## Gotchas and Lessons Learned

**1. Green InMemory tests shipped a broken feature.** Global Search had service tests and they all passed. It still failed every search on Azure SQL, because InMemory runs any LINQ in memory. The lesson isn't "don't use InMemory". It's "know what it can't tell you", and add a cheap check (`ToQueryString()`) for that gap.

**2. The frontend hid the backend error.** Part of why Global Search took a while to notice was that `search.js` swallowed the failure and showed an empty result. A quiet catch block turns a loud bug into a silent one.

**3. A migration job that always passed.** The first version of the migrations job grepped the log for a "finished" message, because `Program.cs` logged fatal startup errors and then **exited 0**. A failed migration looked like success to any script checking the exit code. Commit `b5b0129` (#108) made both `Program.cs` files return 1 on a fatal error, and switched the job to check the exit code and count rows in `__EFMigrationsHistory` instead of matching log text.

**4. A floating SDK broke a strict build.** Warnings-as-errors plus "install the latest SDK" means a Microsoft release can break your CI overnight. Pin the SDK with `global.json` and upgrade on purpose.

**5. Don't flip warnings-as-errors on day one.** I made it opt-in with an MSBuild property, cleared warnings ticket by ticket, and only then turned it on. Each ticket was a small, reviewable PR instead of one giant one.

**6. Pin your linter too.** ESLint 9 can't read the old `.eslintrc.js` format. The npm scripts pin `eslint@8`, and `AGENTS.md` now says never to call a bare `eslint`. Without that note, agents kept reaching for `npx eslint` and getting confusing errors.

**7. Not every gate blocks yet.** To be honest about the current state: the `dotnet format` step still has `continue-on-error: true`, and `lint-js` and `e2e-browser-tests` run on every push but aren't in the deploy job's `needs`. They show red, but they don't stop a deploy. That's on my list to tighten.

---

## Recap

- EF Core InMemory is fast but runs queries Azure SQL can't. `ToQueryString()` on a never-connected SQL Server context catches untranslatable queries without a database.
- Convention tests (reflection over your assemblies) turn project rules like "every controller is authorized" and "no `[Required]` on bool" into build failures with clear messages.
- `WebApplicationFactory` gives you real-pipeline HTTP tests in-process; Playwright covers the browser, and a preflight script makes local E2E failures readable.
- Introduce analyzers gradually: opt-in warnings-as-errors, clear warnings in small tickets, then flip the switch, and pin the SDK in `global.json`.
- Run migrations against a real SQL Server in CI, twice, and make the deploy depend on it.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 10: RBAC and Account Isolation]({% post_url 2026-10-18-pf-10-rbac-and-account-isolation %}) · Next: [Part 12: Building with AI Coding Agents]({% post_url 2026-10-21-pf-12-building-with-ai-coding-agents %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
