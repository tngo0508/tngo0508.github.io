---
layout: single
title: "Building a Personal Finance App, Part 10: RBAC and Account Isolation"
date: 2026-10-18
show_date: true
toc: true
toc_label: "RBAC and Isolation"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - Security
  - Authorization
  - RBAC
  - Testing
---

The app is two services: a Web front end that users sign in to, and an ApiService behind it that owns the data. This part covers how I added roles and an admin dashboard, and then the harder question underneath: how does ApiService know *which* user is calling, and how do I make sure one account can never read another account's data? I got the first answer partly wrong, and the fix three days later is the most useful part of this post.

**In this post you'll learn:**

- How to model roles with named policies instead of `[Authorize(Roles = "...")]`
- Why roles should never travel in a request header between services
- How a shared secret with a fixed-time comparison authenticates Web to ApiService
- How a single forgotten `[Authorize]` can undo a defense, and how a convention test stops it from happening again
- Where anti-forgery tokens fit into a cookie-authenticated app

---

## The Problem

Here is how a request travels through the app:

```text
 Browser --(Identity cookie)--> Web --(Refit HTTP call)--> ApiService --> Azure SQL
                                 |                             |
                         knows the user              needs to know the user
```

The browser signs in to **Web** with ASP.NET Core Identity (covered in [Part 3]({% post_url 2026-10-3-pf-03-identity-email-and-google-sign-in %})). Web then calls **ApiService** with [Refit](https://github.com/reactiveui/refit), a library that turns a C# interface into an HTTP client. ApiService has no cookie, so Web has to tell it who the user is. It did that with an `X-User-Id` header.

That was fine while ApiService was only reachable from Web. But on 2026-10-05 I added an `exposePublicly` option to the ApiService Bicep module so I could test it directly. Once ApiService is public, **any caller can set any header**. An `X-User-Id` header is just a string anyone can type.

Then in mid-October I needed admin-only pages, and I wanted room for future restrictive roles like ReadOnly or Guest. So I had two problems tangled together:

| Question | Term |
|---|---|
| What is this user allowed to do? | Authorization / RBAC (role-based access control) |
| Is this request really from that user? | Authentication between services |
| Can user A reach user B's rows? | Account isolation |

I wrote the decisions down in `docs/adr/0004-rbac-roles-from-database-and-policy-checks.md`. An **ADR** (Architecture Decision Record) is a short document that records a decision, the options I rejected, and the consequences, so future me knows *why*.

---

## Step 1: Roles and Named Policies

Role names and policy names live as constants in `PersonalFinance.Shared/Constants`, so Web and ApiService share one spelling.

```csharp
public static class AppRoles
{
    public const string Admin = "Admin";
    public const string User = "User";

    /// Every Role the database seeder must ensure exists.
    public static readonly IReadOnlyList<string> All = [Admin, User];
}

public static class AppPolicies
{
    public const string RequireAdmin = "RequireAdmin";
}
```

Both apps enable Identity roles with `.AddRoles<IdentityRole>()` and register the same policy:

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(AppPolicies.RequireAdmin, policy => policy
        .RequireAuthenticatedUser()
        .RequireRole(AppRoles.Admin));
```

Controllers then say `[Authorize(Policy = AppPolicies.RequireAdmin)]`, never `[Authorize(Roles = "Admin")]`.

Why the extra layer? A **policy** is a named rule. If I later add a ReadOnly role that should be blocked from writes, I change one policy definition. With role names sprinkled across attributes, I'd have to edit every controller. The ADR lists `[Authorize(Roles = "Admin")]` everywhere as a rejected option for exactly this reason.

---

## Step 2: Who Becomes Admin?

There is no "make me admin" button. On startup, `PersonalFinance.Data/RbacSeeder.cs` creates every role in `AppRoles.All` and grants Admin to the account whose email matches the `Rbac:AdminEmail` setting. It has three safety rules:

1. **Add-only.** The seeder never removes a role.
2. **Confirmed email only.** If that account exists but its email isn't confirmed, no grant.
3. **Bump the security stamp** after granting, so the user's existing cookie picks up the new role.

```csharp
var user = await userManager.FindByEmailAsync(adminEmail.Trim());
if (user is null)
{
    logger?.LogInformation("Configured admin account does not exist yet; restart after it registers.");
    return;
}

if (!user.EmailConfirmed)
{
    logger?.LogWarning("Configured admin account has an unconfirmed email; Admin role not granted.");
    return;
}

if (await userManager.IsInRoleAsync(user, AppRoles.Admin)) return;

var added = await userManager.AddToRoleAsync(user, AppRoles.Admin);
// throw if it failed ...
await userManager.UpdateSecurityStampAsync(user);
```

Rule 2 matters more than it looks. Admin rights now depend on email confirmation being trustworthy. In Part 3, a user who signed in with Google and typed in an email by hand got that email auto-confirmed. With RBAC in place, that would let someone type the admin's email and walk in. The same RBAC commit closed that hole: a typed email now creates an unconfirmed account and sends the normal confirmation email.

### The default `User` role

An amendment the same day added a built-in `User` role that every new account gets, from both password and external-login registration. Existing accounts were backfilled once, only on the startup where the seeder first creates the `User` role. That "only once" is deliberate: if an Admin removes `User` from someone, a later restart must not quietly add it back.

---

## Step 3: The Admin Dashboard

The Web `/Admin` page shows account counts and lets an Admin manage roles. Two design choices:

**Non-admins get 404, not 403.** A 403 says "this exists, you just can't have it." A 404 keeps the admin area hidden. I did this with a custom `IAuthorizationMiddlewareResultHandler` in `PersonalFinance.Web/Services/AdminNotFoundAuthorizationResultHandler.cs`:

```csharp
public Task HandleAsync(RequestDelegate next, HttpContext context,
    AuthorizationPolicy policy, PolicyAuthorizationResult authorizeResult)
{
    if (authorizeResult.Forbidden && RequiresAdminPolicy(context))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return Task.CompletedTask;
    }

    return _default.HandleAsync(next, context, policy, authorizeResult);
}
```

Signed-out users still get the normal login redirect. Only a signed-in non-admin hitting an admin page sees the 404. ApiService's admin endpoints return 403 ProblemDetails instead, since that's an API, not a page.

**Role management has guardrails.** An Admin can't remove their own Admin role, can't delete the built-in roles, can't delete a role that still has members, and can't remove the last Admin. That last check is "count the Admins, then remove one," which is a race if two requests run at once. `AdminService.RemoveRoleAsync` wraps it in a `SemaphoreSlim` (`AdminRoleLock.Instance`) so the check and the removal happen as one step.

---

## Step 4: Why Roles Never Travel in a Header

The obvious way to give ApiService the user's roles is another header: `X-User-Roles: Admin`. The ADR rejects it in one line: *when ApiService is public, anyone can make themselves Admin.*

Instead, `PersonalFinance.ApiService/Infrastructure/XUserIdAuthenticationHandler.cs` looks the roles up in the Identity tables on every request, with no caching:

```csharp
var user = await userManager.FindByIdAsync(userId);
if (user is not null)
{
    var roles = await userManager.GetRolesAsync(user);
    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
}
```

A side benefit: role changes take effect in ApiService immediately. (In Web they wait for the next cookie security-stamp check, which the ADR notes can be up to 30 minutes. That's why role changes call `UpdateSecurityStampAsync`.)

But reading roles from the database only answers "what roles does user X have?" It does not answer "is this request really from user X?" Anyone could still send `X-User-Id: <the admin's id>` and the handler would happily load Admin roles for them. I noticed this before merging and added decision 4 to the ADR.

---

## Step 5: The Shared Secret Between Web and ApiService

Web now sends a second header, `X-Internal-Key`, holding a secret (`Internal:ApiKey`) that only Web and ApiService know. Here is `PersonalFinance.Web/Services/UserIdForwardingHandler.cs`, a `DelegatingHandler` (a piece of middleware for outgoing `HttpClient` calls) attached to every Refit client:

```csharp
protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
{
    // Signed-out visitors are not forwarded as an Account, so ApiService answers 401 instead of
    // serving data for a shared placeholder id.
    var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    if (!string.IsNullOrEmpty(userId))
    {
        request.Headers.Add("X-User-Id", userId);
    }

    if (!string.IsNullOrEmpty(_internalKey))
    {
        request.Headers.Add(InternalKeyHeader, _internalKey);
    }

    return await base.SendAsync(request, cancellationToken);
}
```

On the ApiService side, the authentication handler checks the secret before it trusts the user id:

```csharp
var configuredKey = Context.RequestServices.GetService<IConfiguration>()?[XUserIdAuthenticationDefaults.InternalKeyConfig];
var keyConfigured = !string.IsNullOrEmpty(configuredKey);
if (keyConfigured)
{
    // A configured shared secret is mandatory: callers without it are not authenticated at all.
    var supplied = Request.Headers[XUserIdAuthenticationDefaults.InternalKeyHeader].FirstOrDefault() ?? string.Empty;
    if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(configuredKey!)))
    {
        _logger.LogWarning("Rejected X-User-Id request with a missing or invalid internal key.");
        return AuthenticateResult.NoResult();
    }
}
```

### Why a fixed-time comparison?

A normal string comparison (`==`) stops at the first character that differs. That means a guess with the right first character takes a tiny bit longer to reject than a guess with the wrong one. Over many requests, an attacker can measure those differences and recover a secret one character at a time. This is a **timing attack**.

`CryptographicOperations.FixedTimeEquals` compares every byte no matter where the first difference is, so the response time doesn't leak how close a guess was. Any time you compare a secret (API key, token, HMAC), use it.

### What if the secret isn't configured?

Local development often runs without it. In that case the handler still authenticates the user id, but attaches **no roles** unless the environment is Development. So a misconfigured production deployment fails closed (admin calls return 403) instead of failing open. The deploy pipeline passes the same secret to both container apps as a secure Bicep parameter.

{: .notice--info}
Why not a JWT or managed identity between the services? The handler's doc comment states the goal: let internal calls satisfy `[Authorize]` "without requiring a separate JWT or cookie-based authentication layer." A shared secret was the smallest step that closed the spoofing hole. It is a trade-off, not the only right answer.

---

## Step 6: The 2026-10-21 Fix — Every Request Scoped to the Account

Three days after RBAC shipped, I found something uncomfortable. The shared secret was checked in the authentication handler, and a request without the right key came out of it unauthenticated. But "unauthenticated" only blocks a request at endpoints that **require** an authenticated user. Eight ApiService controllers (Budget, Community, Dashboard, NetWorth, Notification, SavingsGoals, Search, Watchlist) had no `[Authorize]` attribute. They read the raw header themselves:

```csharp
// Before: a private helper copied into many controllers
private string GetUserId()
{
    if (Request.Headers.TryGetValue("X-User-Id", out var userId))
    {
        var value = userId.First();
        if (!string.IsNullOrEmpty(value)) return value;
    }

    return "anonymous";
}
```

Since these controllers never consulted the authenticated user, the `X-Internal-Key` check simply never applied to them. Google Drive had a related problem: it took `userId` from the query string or request body. And one lookup in `SpreadsheetReaderService` found a Drive connection by `connectionId` alone when no user id was given, which meant it could resolve **any** account's connection and decrypt that account's stored Google API key.

The fix (commit `38d94a2`, merged as PR #82) had four parts:

| Change | Effect |
|---|---|
| `[Authorize]` on every ApiService controller | Requests without a valid secret + user id get 401 |
| One `User.GetUserId()` extension, 15 private helpers deleted | The Account always comes from authenticated claims |
| `userId` removed from `IGoogleDriveApi` and Drive DTOs | Callers can't name another account |
| Connection lookups always filtered by owner | A foreign `connectionId` resolves to nothing |

The new helper lives in `PersonalFinance.Shared/Helpers/ClaimsPrincipalExtensions.cs`. Notice it throws instead of returning a fallback:

```csharp
public static string GetUserId(this ClaimsPrincipal user)
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrWhiteSpace(userId))
    {
        throw new InvalidOperationException(
            "The current principal has no Account id. Is the endpoint missing [Authorize]?");
    }

    return userId;
}
```

And the spreadsheet lookup now starts from "this account's connections" and only then narrows down:

```csharp
// A connection (and its stored API key) is only ever resolved for the Account that owns it.
if (!string.IsNullOrWhiteSpace(userId))
{
    var ownConnections = _dbContext.GoogleDriveConnections
        .Where(c => c.UserId == userId);

    connection = connectionId is > 0
        ? await ownConnections.FirstOrDefaultAsync(c => c.Id == connectionId.Value, cancellationToken)
        : await ownConnections.FirstOrDefaultAsync(c => c.CachedFiles.Any(f => f.DriveFileId == fileId), cancellationToken);
}
```

`docs/ARCHITECTURE.md` now has three rules for new code: never read `X-User-Id` in a controller, never accept a user id from the query string or body, and filter every query by the Account id, **including lookups by id**.

---

## Step 7: Tests That Keep It Fixed

### A convention test

A rule in a doc is easy to forget. A failing build is not. `tests/PersonalFinance.Tests/Security/AccountIsolationTests.cs` uses reflection to find every ApiService controller and fails if any lacks `[Authorize]` or an explicit `[AllowAnonymous]`:

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

The same file seeds a Drive connection owned by one account and checks that another account (or an empty user id) passing that `connectionId` never causes the owner's API key to be used in an outgoing request.

### HTTP-level tests against the real pipeline

Attribute checks prove the attribute is there; they don't prove the pipeline honors it. Commit `830abff` added `Security/ApiServiceInternalKeyHttpTests.cs`, which uses `WebApplicationFactory` to host the real ApiService in-process with an in-memory database and a test-only secret. For seven account endpoints it checks:

| Request | Expected |
|---|---|
| No headers | 401 |
| `X-User-Id` without `X-Internal-Key` | 401 |
| `X-User-Id` with a wrong key | 401 |
| `X-User-Id` with the correct key | 200 |
| `/health` (no headers) | 200 |
| Unknown route | 404 |

The commit message notes that removing `[Authorize]` from one controller makes its cases fail, which is exactly the regression this guards against.

---

## A Note on Anti-Forgery

Everything above protects ApiService. Web has a different risk. Because Web uses a cookie, the browser sends that cookie automatically on any request to the site, including one triggered by a form on a malicious page. That is **CSRF** (cross-site request forgery).

ASP.NET Core's defense is an anti-forgery token: a value embedded in your own pages that a foreign page can't read. On 2026-10-06 (commit `ab29c58`) I turned validation on globally for every unsafe MVC request (POST, PUT, PATCH, DELETE):

```csharp
builder.Services.AddControllersWithViews(options =>
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));
```

JavaScript `fetch` calls send the token in a `RequestVerificationToken` header. Seven scripts each had their own lookup code, which I later folded into one helper, `PFUtils.getAntiForgeryToken()` in `wwwroot/js/core/utils.js` (form field first, then a meta tag in the layout).

---

## Gotchas and Lessons Learned

1. **Loading roles from the database did not authenticate anyone.** My first RBAC draft felt safe because roles came from the database. But the user id that selected those roles still came from a spoofable header. "Where does the data come from?" and "who is asking?" are separate questions. The ADR's amendment says it plainly: "Reading roles from the database did not authenticate the caller; the shared secret does."
2. **A defense only protects code that goes through it.** The `X-Internal-Key` check was correct, and eight controllers bypassed it by reading the header directly. The bug wasn't in the security code; it was in the code that didn't use it. Hence the convention test.
3. **Fallback values are dangerous in security code.** Returning `"anonymous"` when the header was missing meant every signed-out request shared one fake account. `GetUserId()` now throws, and Web forwards nothing for signed-out visitors so ApiService answers 401.
4. **Lookups by id need an owner filter too.** It's easy to write `Where(c => c.Id == id)` and forget that ids are guessable. Start every query from "rows owned by this account."
5. **Admin depends on email confirmation.** Granting Admin by email meant any path that auto-confirms an email became a privilege escalation path. That's why the typed-email path in external login had to change in the same commit.
6. **Config mismatches fail closed, which can look like a bug.** If Web and ApiService have different `Internal__ApiKey` values, admin calls return 403. The ADR lists this as a known consequence so I don't chase it later.
7. **The last-Admin lock is in-process.** A `SemaphoreSlim` only serializes requests inside one ApiService instance. The ADR records that this isn't safe across multiple instances and accepts it at current scale.

---

## Recap

- Check **named policies**, not role names, so new roles mean one change instead of many.
- **Never forward roles in a header.** Load them from the database on the receiving side.
- Authenticate service-to-service calls (here, a shared secret compared with `CryptographicOperations.FixedTimeEquals`), and fail closed when it isn't configured.
- Take the user id **only** from authenticated claims, and scope every query, including lookups by id, to that account.
- Turn security rules into tests: a reflection-based convention test plus HTTP tests against the real pipeline.
- Cookie-authenticated apps need anti-forgery validation on every unsafe request.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 9: Budget Tracker and Two Data Sources]({% post_url 2026-10-17-pf-09-budget-tracker-two-data-sources %}) · Next: [Part 11: Testing and Quality Gates]({% post_url 2026-10-21-pf-11-testing-and-quality-gates %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
