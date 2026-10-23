---
layout: single
title: "Building a Personal Finance App, Part 3: Identity, Email Confirmation, and Google Sign-In"
date: 2026-10-3
show_date: true
toc: true
toc_label: "Identity and Sign-In"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - Identity
  - OAuth
  - Security
  - Email
---

A personal finance app is useless if anyone can read anyone else's budget, so after the first features worked I turned to accounts. This part covers how I set up ASP.NET Core Identity, made new users confirm their email through Brevo, and added "Sign in with Google" without opening a way to hijack existing accounts. It also covers a sign-in bug that only showed up ten days later.

**In this post you'll learn:**

- How to plug a custom email sender into ASP.NET Core Identity with `IEmailSender`
- Why I replaced an SMTP fallback with a single REST call the same evening I wrote it
- How to add Google OAuth only when credentials are configured
- What a "pre-account-takeover" attack is and how to block it when linking social logins
- Why `RefreshSignInAsync` broke the Google callback and what replaced it

---

## The Problem

The app already used ASP.NET Core Identity's default setup (`AddDefaultIdentity<IdentityUser>`), but with `RequireConfirmedAccount = false`. Anyone could register with any email address, including one they didn't own, and sign in immediately.

What I wanted:

| Need | Why |
|---|---|
| Email confirmation before sign-in | Prove the person owns the address; cut down spam accounts |
| A real transactional email provider | Confirmation and password reset emails must actually arrive |
| Social sign-in | Less friction: no new password to remember |
| Safe account linking | A Google login must never take over someone else's account |
| No secrets in the repo | API keys and OAuth secrets live in User Secrets or environment variables |
| Runs without credentials | A fresh clone should start even if no email key or Google client is configured |

That last point turned out to shape a lot of the code: almost every feature in this post is "on if configured, quietly off if not."

---

## Step 1: Require Confirmed Accounts

The first change was a single flag in `PersonalFinance.Web/Program.cs`. With `RequireConfirmedAccount = true`, Identity refuses to sign in a user whose `EmailConfirmed` column is still false.

```csharp
builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<AppDbContext>();

// Register Brevo Email Sender
builder.Services.Configure<BrevoOptions>(
    builder.Configuration.GetSection("Brevo"));
builder.Services.AddHttpClient<IEmailSender, BrevoEmailSender>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
});
```

The second half is the interesting part. Identity's built-in pages (Register, Forgot Password, Resend Confirmation) all call `IEmailSender.SendEmailAsync(to, subject, html)`. They don't care how the email is sent. If you register your own implementation, every Identity page uses it automatically.

`AddHttpClient<IEmailSender, BrevoEmailSender>` does two things at once: it registers `BrevoEmailSender` as the `IEmailSender`, and it hands it a managed `HttpClient` (with a 15-second timeout) through the constructor. That makes the sender easy to unit test, since a test can pass an `HttpClient` with a fake handler.

I also added `IdentityConfigurationTests` to lock the policy in, so nobody (including future me) can quietly flip the flag back.

---

## Step 2: The Brevo Email Sender, Twice

[Brevo](https://www.brevo.com/) is a transactional email service. It offers both an SMTP relay and a REST API (`POST https://api.brevo.com/v3/smtp/email`).

### Version 1: REST with an SMTP fallback

My first version (commit `79cfc8c`) tried to support both. If an API key was set, it used REST. Otherwise, if SMTP credentials were set, it built a `MailMessage` and sent it through `SmtpClient`. To test the SMTP path I added an `ISmtpClient` interface.

```csharp
// 1. If Brevo API Key is configured, prioritize REST API over HTTPS
if (!string.IsNullOrWhiteSpace(_options.ApiKey))
{
    await SendViaApiAsync(toEmail, subject, htmlMessage, senderEmail);
    return;
}

// 2. Fall back to SMTP Relay if credentials or mock client are provided
if (!string.IsNullOrWhiteSpace(_options.Login) && !string.IsNullOrWhiteSpace(_options.Password) || _smtpClient != null)
{
    await SendViaSmtpAsync(toEmail, subject, htmlMessage, senderEmail);
    return;
}
```

It worked, but it was two delivery paths, two sets of credentials, an extra interface, and an `if` condition that mixes `&&` and `||` without parentheses. `BrevoOptions` also carried six SMTP settings (server, port, login, password, SSL) with default values baked into the class.

### Version 2: REST only

About twenty minutes later (commit `6fe46bd`) I deleted the SMTP path. Here is the core (lightly trimmed) of the final `PersonalFinance.Web/Services/BrevoEmailSender.cs`. Notice that a missing key or sender is a logged warning, not an exception, which is what lets a fresh clone run without any email setup.

```csharp
public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
{
    if (string.IsNullOrWhiteSpace(_options.ApiKey))
    {
        _logger.LogWarning("Brevo API key is not configured. Email to {ToEmail} skipped.", toEmail);
        return;
    }
    // (same check and warning for a missing SenderEmail)

    var payload = new
    {
        sender = new { name = _options.SenderName ?? "PersonalFinance", email = _options.SenderEmail },
        to = new[] { new { email = toEmail } },
        subject = subject,
        htmlContent = htmlMessage
    };

    using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
    {
        Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
    };
    request.Headers.Add("api-key", _options.ApiKey);

    var response = await _httpClient.SendAsync(request);
    // log success, or log status code + body on failure
}
```

`BrevoOptions` shrank to three properties: `ApiKey`, `SenderEmail`, and `SenderName`. The key goes into User Secrets locally:

```bash
dotnet user-secrets set "Brevo:ApiKey" "<YOUR_BREVO_API_KEY>" --project PersonalFinance/src/PersonalFinance.Web
```

---

## Step 3: Scaffolding the Identity Pages

The default Identity UI ships as a compiled Razor class library. You can't edit its pages, but you can **scaffold** them: generate a copy into your project under `Areas/Identity/Pages/Account/`, and your copy wins over the built-in one.

```bash
dotnet tool install --global dotnet-aspnet-codegenerator

dotnet aspnet-codegenerator identity \
  --project PersonalFinance/src/PersonalFinance.Web/PersonalFinance.Web.csproj \
  --dbContext PersonalFinance.Data.AppDbContext \
  --files "Account.ExternalLogin;Account.Login;Account.Register"
```

Only scaffold the pages you need to change. Every scaffolded page is code you now own and maintain. I took `Login`, `Register`, `ResendEmailConfirmation`, and later `ExternalLogin`.

The reason for scaffolding `Register` was the email body. The default confirmation email is one plain line with a link. I wanted a branded HTML email with a big button, so I wrote `EmailTemplateHelper.BuildConfirmationEmail` and called it from the page. This is the part of `Register.cshtml.cs` that builds the confirmation link:

```csharp
var userId = await _userManager.GetUserIdAsync(user);
var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
var callbackUrl = Url.Page(
    "/Account/ConfirmEmail",
    pageHandler: null,
    values: new { area = "Identity", userId = userId, code = code, returnUrl = returnUrl },
    protocol: Request.Scheme);

var appName = _brevoOptions.SenderName ?? "PersonalFinance";
var htmlBody = EmailTemplateHelper.BuildConfirmationEmail(callbackUrl ?? string.Empty, appName);

await _emailSender.SendEmailAsync(Input.Email, $"Confirm your {appName} account", htmlBody);
```

Two details worth copying:

- The token is **Base64Url-encoded** before it goes into the URL. Raw Identity tokens contain characters like `+` and `/` that break in query strings.
- The template runs both the app name and the URL through `WebUtility.HtmlEncode` before putting them into HTML. Anything you interpolate into an HTML string needs encoding, even values you think you control.

---

## Step 4: Adding Google Sign-In

### What actually shipped

My plan for this feature (an AI-assisted plan file in `.junie/plans/add-social-sign-in.md`) listed Google, Facebook, and Twitter. The commit that landed (`a410ee1`) is even titled "Add social sign-in with Google, Facebook, and Twitter support." But if you look at the diff, only one package was added: `Microsoft.AspNetCore.Authentication.Google`. Facebook and Twitter never made it into the code. More on that in the Gotchas section.

### Register the provider only if configured

Google sign-in is registered conditionally in `Program.cs`. If the client ID or secret is empty, the scheme simply doesn't exist and the Google button doesn't render.

```csharp
var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
            options.CallbackPath = "/signin-google";
            options.Scope.Add("profile");
            options.Scope.Add("email");

            // Map extra fields from Google's userinfo JSON into claims
            options.ClaimActions.MapJsonKey("urn:google:picture", "picture", "url");
            options.ClaimActions.MapJsonKey("urn:google:locale", "locale", "string");
        });
}
```

The Login and Register pages don't hard-code a Google button. They call `SignInManager.GetExternalAuthenticationSchemesAsync()` and render one button per registered scheme. Adding another provider later is a package plus one `Add...()` call; the UI follows automatically.

A **claim** is a key-value fact about the user (email, name, picture URL). `ClaimActions.MapJsonKey` copies a field from Google's profile JSON into a claim so the app can use it later. I used the picture claim to show the user's avatar in `_LoginPartial.cshtml`.

### API-aware cookie redirects

The same commit fixed a smaller annoyance. When a signed-out user's JavaScript `fetch` hits a protected endpoint, the cookie handler's default answer is a `302` redirect to the login page. The browser follows it and the script receives login-page HTML instead of an error. I changed `OnRedirectToLogin` (and `OnRedirectToAccessDenied`) to return a plain status code for API-style requests:

```csharp
options.Events.OnRedirectToLogin = context =>
{
    if (context.Request.Path.StartsWithSegments("/api") ||
        context.Request.Headers.Accept.Any(h => h != null && h.Contains("application/json")) ||
        context.Request.Headers.XRequestedWith == "XMLHttpRequest")
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    }

    context.Response.Redirect(context.RedirectUri);
    return Task.CompletedTask;
};
```

This logic later moved into its own file, `PersonalFinance.Web/Infrastructure/ApiAwareCookieRedirects.cs`.

---

## Step 5: The External Login Callback and Account Linking

This is the heart of the feature, in `Areas/Identity/Pages/Account/ExternalLogin.cshtml.cs`. Here is the flow:

```text
 Browser            Web (ExternalLogin page)              Google
    |  click "Google"        |                               |
    |----------------------->|  OnPost: ChallengeResult      |
    |<-----------------------|  302 to Google                |
    |---------------------------------------------------------->  user consents
    |<----------------------------------------------------------  302 /signin-google
    |----------------------->|  OnGetCallbackAsync           |
    |                        |  1. login already linked?  -> sign in
    |                        |  2. email matches a user?
    |                        |       confirmed   -> link + sign in
    |                        |       unconfirmed -> refuse
    |                        |  3. no user       -> create (confirmed) + link
```

Identity stores the link between an app user and a Google account in the `AspNetUserLogins` table: one row per `(LoginProvider, ProviderKey)` pair, pointing at a `UserId`. A user created only through Google has a `NULL` `PasswordHash`. (I wrote up the full schema in `docs/IDENTITY_SCHEMA.md` while I was at it.)

### Pre-account-takeover defense

Case 2 is where things get dangerous. A **pre-account-takeover** works like this: an attacker registers a local account with your email address before you ever sign up. They can't confirm it because they can't read your inbox, so the account sits there unconfirmed. Later you click "Sign in with Google." If the app sees "a user with this email exists" and links your Google login to it, you are now sharing an account whose password the attacker set.

The defense is to link only when the existing account's email is already confirmed:

```csharp
var existingUser = await _userManager.FindByEmailAsync(email);
if (existingUser != null)
{
    if (existingUser.EmailConfirmed)
    {
        var addLoginResult = await _userManager.AddLoginAsync(existingUser, info);
        if (addLoginResult.Succeeded)
        {
            await SynchronizeCustomClaimsAsync(existingUser, info.Principal);
            await _signInManager.SignInAsync(existingUser, isPersistent: false, info.LoginProvider);
            return LocalRedirect(returnUrl);
        }
    }
    else
    {
        ModelState.AddModelError(string.Empty,
            "An account with this email address already exists but has not been confirmed. Please confirm your email address first.");
    }

    Input.Email = email;
    return Page();
}
```

A confirmed email means the real owner proved they read that inbox, so the account is theirs and linking is safe. An unconfirmed one might belong to anyone.

For brand-new users (case 3), the account is created with `EmailConfirmed = true`, because Google has already verified that address. That is the "no confirmation email" convenience social sign-in is supposed to give you.

### Keeping profile claims fresh

`SynchronizeCustomClaimsAsync` runs on every successful callback. It compares the picture URL, given name, and locale from Google against the user's stored claims in `AspNetUserClaims`, and adds or replaces any that changed. Because the auth cookie is built from stored claims at sign-in time, the app then signs the user in again so the new cookie carries the fresh values. That re-sign-in is exactly where the bug below lived.

---

## Gotchas and Lessons Learned

### 1. The `RefreshSignInAsync` callback bug (fixed 2026-10-14)

Ten days after launch, Google sign-in failed for returning users with this error:

```text
RefreshSignInAsync prevented because the user is not currently authenticated
```

The code path for an already-linked login looked like this:

```csharp
var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
if (result.Succeeded)
{
    var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
    if (user != null)
    {
        await SynchronizeCustomClaimsAsync(user, info.Principal);
        await _signInManager.RefreshSignInAsync(user);   // <-- the bug
    }
    return LocalRedirect(returnUrl);
}
```

`RefreshSignInAsync` is meant for a user who is **already** signed in on this request: it reads the current auth cookie and re-issues it with fresh claims. But during the OAuth callback, `ExternalLoginSignInAsync` has only *written* a new cookie to the response. The incoming request still carries no application cookie, so from Identity's point of view nobody is signed in yet, and the refresh is refused.

The fix (commit `24b0d15`) was a one-line swap to a fresh sign-in, the same call the other two branches already used:

```csharp
await _signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
```

Why didn't I catch it on day one? The first time you sign in with Google, you go through the "create user" or "link to existing user" branch, and both of those already called `SignInAsync`. Only the **second** visit takes the "login already linked" branch. Lesson: test the returning-user path, not just first-time sign-up.

### 2. The commit title promised more than the diff

`a410ee1` says "Google, Facebook, and Twitter." The code only has Google. The plan file listed all three, and the commit message was written from the plan, not from the diff. The follow-up commit `c7b00f3` is documentation only (CHANGELOG and `DEVELOPMENT.md`), and it correctly describes Google alone. Lesson: write commit messages from `git diff --staged`, especially when an AI agent drafted the plan.

### 3. A typed-in email was trusted (fixed later in Part 10)

If Google doesn't return an email, `ExternalLogin` shows a form asking the user to type one. In the original `OnPostConfirmationAsync`, that typed email was handled just like a Google-verified one: it could be linked to an existing confirmed account, and new accounts were created with `EmailConfirmed = true`. But a typed email proves nothing. I closed this on 2026-10-18 while building RBAC: a typed email now never links to an existing account, creates an **unconfirmed** user, and sends the normal confirmation email. The rule I now follow: only a provider-verified email may be treated as confirmed.

### 4. Two delivery paths was one too many

Adding SMTP "just in case" doubled the configuration surface and the test matrix for no real benefit, since the REST API was already working. I removed it the same evening. If you catch yourself writing a fallback for a dependency that hasn't failed yet, ask whether you will ever actually configure it.

### 5. Google Cloud Console: origins vs. redirect URIs

The most common setup mistake (I documented it in `docs/DEVELOPMENT.md` after hitting it): **Authorized JavaScript origins** takes only `scheme://host:port`, with no path and no trailing slash. The `/signin-google` path belongs only in **Authorized redirect URIs**. Mixing them up gives an "Invalid Origin" error in the console.

---

## Recap

- Plug a custom `IEmailSender` into Identity and every built-in page (register, reset, resend) uses it; `AddHttpClient<IEmailSender, T>` makes it testable.
- Keep one delivery path. I went from REST + SMTP to REST only in about twenty minutes.
- Scaffold only the Identity pages you need to change, Base64Url-encode tokens in links, and HTML-encode anything you put into an email body.
- Register OAuth providers conditionally so the app runs without credentials, and render buttons from `GetExternalAuthenticationSchemesAsync()`.
- Only link a social login to an existing account whose email is confirmed, and only trust provider-verified emails.
- During an OAuth callback, use `SignInAsync`, not `RefreshSignInAsync`. The user isn't authenticated on that request yet.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 2: Turning Budget Spreadsheets into Reports]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %}) · Next: [Part 4: .NET Aspire and Observability]({% post_url 2026-10-4-pf-04-dotnet-aspire-and-observability %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
