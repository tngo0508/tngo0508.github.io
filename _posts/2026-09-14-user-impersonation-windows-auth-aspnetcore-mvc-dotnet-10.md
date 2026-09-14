---
title: "User Impersonation for QA & Dev in Windows Auth with ASP.NET Core MVC (.NET 10)"
excerpt: "Learn how to build a safe, production-grade user impersonation mechanism in ASP.NET Core MVC (.NET 10) to streamline QA and local development for Windows Authentication apps."
date: 2026-09-14
show_date: true
toc: true
toc_label: "Windows Auth Impersonation"
toc_sticky: true
classes: wide
categories:
  - .NET
  - Web Development
tags:
  - ASP.NET Core
  - MVC
  - Windows Authentication
  - .NET 10
  - Testing
  - Impersonation
---

### 1. Introduction

In enterprise environments, ASP.NET Core MVC applications often rely on **Windows Authentication (Negotiate / Kerberos / NTLM)**. While seamless for corporate end users, it introduces friction during development and Quality Assurance (QA):
- Developers and QA testers are automatically authenticated under their local or domain Windows account.
- Testing role-based views, authorization policies, or edge-case permissions often requires managing secondary Windows domain accounts or provisioning separate virtual machines.

Implementing an environment-restricted **impersonation middleware** maximizes development velocity and testing utility by enabling QA and developers to switch persona identities on the fly without weakening production security.

---

### 2. Solution Architecture

The solution uses a pipeline component that:
1. Executes **only** in non-production environments (`Development` / `QA`).
2. Reads the desired persona from a secure cookie.
3. Overrides `HttpContext.User` with a synthetic `ClaimsPrincipal` populated with the target persona's claims and roles before authorization filters execute.

```
+------------------+     +--------------------------+     +------------------------+
|  Incoming HTTP   | --> | Windows Authentication   | --> | Impersonation          |
|  Request         |     | (Sets WindowsPrincipal)  |     | Middleware (Dev/QA)    |
+------------------+     +--------------------------+     +-----------+------------+
                                                                      |
                                                                      v
                                                  Overrides HttpContext.User
                                                  with Target ClaimsPrincipal
                                                                      |
                                                                      v
                                                          +------------------------+
                                                          | MVC Controllers/Views  |
                                                          | (Evaluates User/Roles) |
                                                          +------------------------+
```

---

### 3. Project Configuration: Enabling Windows Auth (`launchSettings.json`)

To run and demo Windows Authentication locally with Kestrel or IIS Express in .NET 10, configure `Properties/launchSettings.json`:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "iisSettings": {
    "windowsAuthentication": true,
    "anonymousAuthentication": false,
    "iisExpress": {
      "applicationUrl": "http://localhost:52400",
      "sslPort": 44300
    }
  },
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5000;https://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "IIS Express": {
      "commandName": "IISExpress",
      "launchBrowser": true,
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

---

### 4. Implementing the Impersonation Middleware & Provider

Following Microsoft software engineering best practices, we decouple persona claim resolution into an injectable service (`IImpersonationClaimsProvider`) and expose an idiomatic `IApplicationBuilder` extension.

#### A. Define the Claims Provider Interface and Implementation
```csharp
using System.Security.Claims;

public interface IImpersonationClaimsProvider
{
    IEnumerable<Claim> GetClaimsForUser(string username);
}

public class DevImpersonationClaimsProvider : IImpersonationClaimsProvider
{
    public IEnumerable<Claim> GetClaimsForUser(string username)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, username),
            new(ClaimTypes.NameIdentifier, username),
            new("IsImpersonated", "true")
        };

        // Map persona names to test roles
        switch (username.ToLowerInvariant())
        {
            case "admin_test":
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
                claims.Add(new Claim(ClaimTypes.Role, "Manager"));
                break;
            case "auditor_test":
                claims.Add(new Claim(ClaimTypes.Role, "Auditor"));
                break;
            default:
                claims.Add(new Claim(ClaimTypes.Role, "StandardUser"));
                break;
        }

        return claims;
    }
}
```

#### B. Define the Middleware
```csharp
using System.Security.Claims;

public class WindowsImpersonationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<WindowsImpersonationMiddleware> _logger;
    public const string ImpersonationCookieName = "Dev_ImpersonatedUser";

    public WindowsImpersonationMiddleware(
        RequestDelegate next, 
        ILogger<WindowsImpersonationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IImpersonationClaimsProvider claimsProvider)
    {
        if (context.Request.Cookies.TryGetValue(ImpersonationCookieName, out var impersonatedUsername) 
            && !string.IsNullOrWhiteSpace(impersonatedUsername))
        {
            var claims = claimsProvider.GetClaimsForUser(impersonatedUsername);

            var identity = new ClaimsIdentity(
                claims,
                authenticationType: "WindowsImpersonation",
                nameType: ClaimTypes.Name,
                roleType: ClaimTypes.Role);

            var originalUser = context.User.Identity?.Name ?? "Anonymous";
            _logger.LogInformation("Impersonating user '{TargetUser}' over original Windows identity '{OriginalUser}'", 
                impersonatedUsername, originalUser);

            context.User = new ClaimsPrincipal(identity);
        }

        await _next(context);
    }
}

// Pipeline extension method
public static class WindowsImpersonationMiddlewareExtensions
{
    public static IApplicationBuilder UseWindowsImpersonation(this IApplicationBuilder app)
    {
        return app.UseMiddleware<WindowsImpersonationMiddleware>();
    }
}
```

---

### 5. Dev Controller & UI Persona Switcher

#### A. Dev Controller with CSRF & Open-Redirect Protection
```csharp
using Microsoft.AspNetCore.Mvc;

[Route("dev/impersonate")]
public class DevImpersonationController : Controller
{
    private readonly IWebHostEnvironment _env;

    public DevImpersonationController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("set")]
    [ValidateAntiForgeryToken]
    public IActionResult SetUser([FromForm] string username, [FromForm] string returnUrl = "/")
    {
        // Enforce non-production safety gate
        if (!_env.IsDevelopment() && !_env.IsEnvironment("QA"))
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(username))
        {
            Response.Cookies.Delete(WindowsImpersonationMiddleware.ImpersonationCookieName);
        }
        else
        {
            Response.Cookies.Append(
                WindowsImpersonationMiddleware.ImpersonationCookieName,
                username.Trim(),
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Lax,
                    IsEssential = true
                });
        }

        // Validate local redirect URL against open-redirect attacks
        var destination = Url.IsLocalUrl(returnUrl) ? returnUrl : "/";
        return LocalRedirect(destination);
    }

    [HttpPost("clear")]
    [ValidateAntiForgeryToken]
    public IActionResult Clear([FromForm] string returnUrl = "/")
    {
        if (!_env.IsDevelopment() && !_env.IsEnvironment("QA"))
        {
            return NotFound();
        }

        Response.Cookies.Delete(WindowsImpersonationMiddleware.ImpersonationCookieName);
        var destination = Url.IsLocalUrl(returnUrl) ? returnUrl : "/";
        return LocalRedirect(destination);
    }
}
```

#### B. Persona Switcher Banner in `Views/Shared/_Layout.cshtml`
```html
@inject IWebHostEnvironment Env

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - DemoApp</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
</head>
<body>
    @if (Env.IsDevelopment() || Env.IsEnvironment("QA"))
    {
        <div class="alert alert-warning py-2 px-3 mb-0 d-flex flex-wrap align-items-center justify-content-between border-bottom">
            <div>
                <strong>QA Impersonation Tool:</strong>
                <span>Active Identity: <code>@(User.Identity?.Name ?? "None")</code></span>
                @if (User.HasClaim("IsImpersonated", "true"))
                {
                    <span class="badge bg-danger ms-2">Impersonated</span>
                }
                else
                {
                    <span class="badge bg-secondary ms-2">Windows Identity</span>
                }
            </div>
            <form asp-controller="DevImpersonation" asp-action="SetUser" method="post" class="d-inline-flex align-items-center gap-2 my-1">
                @Html.AntiForgeryToken()
                <select name="username" class="form-select form-select-sm" onchange="this.form.submit()">
                    <option value="">-- Actual Windows Account --</option>
                    <option value="admin_test">Admin User (Role: Admin, Manager)</option>
                    <option value="auditor_test">Auditor User (Role: Auditor)</option>
                    <option value="regular_user">Standard User (Role: StandardUser)</option>
                </select>
                <input type="hidden" name="returnUrl" value="@Context.Request.Path@Context.Request.QueryString" />
            </form>
        </div>
    }

    <div class="container py-4">
        @RenderBody()
    </div>
</body>
</html>
```

---

### 6. Sample Demo Controller (`HomeController.cs`)

Create sample endpoints to immediately verify authorization policies and roles:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

public class HomeController : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        return View();
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-portal")]
    public IActionResult AdminPortal()
    {
        return View();
    }

    [Authorize(Roles = "Auditor")]
    [HttpGet("audit-logs")]
    public IActionResult AuditLogs()
    {
        return View();
    }
}
```

#### Demo View (`Views/Home/Index.cshtml`):
```html
@{
    ViewData["Title"] = "Impersonation Demo";
}

<h3>Persona Authorization Test Page</h3>
<p class="text-muted">Use the top bar to switch personas and test access to restricted actions below.</p>

<ul class="list-group mb-4">
    <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Public Area</span>
        <span class="badge bg-success">Everyone</span>
    </li>
    <li class="list-group-item d-flex justify-content-between align-items-center">
        <a asp-action="AdminPortal">Admin Portal</a>
        <span class="badge bg-danger">Requires 'Admin' Role</span>
    </li>
    <li class="list-group-item d-flex justify-content-between align-items-center">
        <a asp-action="AuditLogs">Audit Logs</a>
        <span class="badge bg-info text-dark">Requires 'Auditor' Role</span>
    </li>
</ul>

<h4>Current Claims Diagnostic:</h4>
<table class="table table-bordered table-sm">
    <thead>
        <tr>
            <th>Claim Type</th>
            <th>Value</th>
        </tr>
    </thead>
    <tbody>
        @foreach (var claim in User.Claims)
        {
            <tr>
                <td><code>@claim.Type</code></td>
                <td>@claim.Value</td>
            </tr>
        }
    </tbody>
</table>
```

---

### 7. Pipeline Registration in `Program.cs` (.NET 10)

Register the claims provider, configure Negotiate authentication, and place `UseWindowsImpersonation` between `UseAuthentication` and `UseAuthorization`.

```csharp
using Microsoft.AspNetCore.Authentication.Negotiate;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Windows Authentication
builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
    .AddNegotiate();

builder.Services.AddAuthorization();
builder.Services.AddControllersWithViews();

// 2. Register Impersonation Claims Provider
builder.Services.AddSingleton<IImpersonationClaimsProvider, DevImpersonationClaimsProvider>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// 3. Authenticate original request
app.UseAuthentication();

// 4. Impersonate ONLY in non-production environments
if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("QA"))
{
    app.UseWindowsImpersonation();
}

// 5. Authorize against current HttpContext.User
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

---

### 8. Microsoft SWE Best Practices & Security Guardrails

1. **Environment Separation:** Always enforce environment checks (`IsDevelopment() || IsEnvironment("QA")`) at both the pipeline registration level and inside controller endpoints.
2. **CSRF & Open Redirect Mitigation:** Always apply `[ValidateAntiForgeryToken]` on state-changing impersonation actions and sanitize return URLs with `Url.IsLocalUrl()`.
3. **Structured Logging:** Use structured `ILogger` messages to record impersonation actions, capturing both target persona and base identity for traceability.
4. **Cookie Hardening:** Set `HttpOnly = true`, `SameSite = SameSiteMode.Lax`, and `Secure = true` to guard impersonation cookies against client script exposure.
5. **Downstream Service Delegation Boundary:** Impersonating `HttpContext.User` alters claims evaluation within the ASP.NET Core process. If your application invokes downstream resources (e.g. SQL Server via Kerberos constrained delegation using `WindowsIdentity.RunImpersonated`), downstream calls still use the underlying Windows OS token unless mock delegation services are injected in test environments.

---

### 9. Automated Testing with `WebApplicationFactory`

You can test persona-based authorization in integration tests without a Windows domain controller:

```csharp
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class ImpersonationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ImpersonationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AdminPortal_WithAdminPersonaCookie_ReturnsSuccess()
    {
        // Arrange
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        client.DefaultRequestHeaders.Add("Cookie", $"{WindowsImpersonationMiddleware.ImpersonationCookieName}=admin_test");

        // Act
        var response = await client.GetAsync("/admin-portal");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminPortal_WithStandardUserPersona_ReturnsForbiddenOrRedirect()
    {
        // Arrange
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        client.DefaultRequestHeaders.Add("Cookie", $"{WindowsImpersonationMiddleware.ImpersonationCookieName}=regular_user");

        // Act
        var response = await client.GetAsync("/admin-portal");

        // Assert
        Assert.True(response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.Redirect);
    }
}
```

---

### 10. References

- [Microsoft Docs: Configure Windows Authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/windowsauth)
- [Microsoft Docs: ASP.NET Core Middleware Pipeline](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/)
- [Microsoft Docs: Claims-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims)
- [Microsoft Docs: Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)
