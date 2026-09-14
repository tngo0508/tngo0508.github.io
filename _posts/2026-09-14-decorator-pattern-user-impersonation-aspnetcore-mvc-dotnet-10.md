---
layout: single
title: "A Simple Guide to the Decorator Pattern: User Impersonation in ASP.NET Core MVC (.NET 10)"
date: 2026-09-14
show_date: true
toc: true
toc_label: "Decorator Pattern Guide"
toc_sticky: true
classes: wide
categories:
  - .NET
  - Design Patterns
  - Web Development
tags:
  - .NET
  - .NET 10
  - C#
  - C# 14
  - Design Patterns
  - Decorator Pattern
  - ASP.NET Core
  - MVC
  - Impersonation
---

Design patterns often feel intimidating when buried under enterprise boilerplate or third-party libraries. However, the **Decorator Pattern** is simple, elegant, and can be implemented entirely in **pure C# and native ASP.NET Core MVC (.NET 10)** without any external packages.

In this tutorial, we will build a complete, runnable **User Impersonation feature** in ASP.NET Core MVC using pure C# and standard built-in Dependency Injection.

---

## 1. What is the Decorator Pattern?

Think of the Decorator Pattern like **putting on a winter coat**:
- You are still the same person.
- The coat wraps around you and adds extra warmth without changing who you are inside.

In code, the **Decorator Pattern** allows you to attach new behavior or override data on an existing object **without modifying its original source code**.

```
   [ Controller / View ]
            │
            ▼ calls
   ┌──────────────────┐
   │   IUserContext   │ (Interface)
   └──────────────────┘
            ▲
            │ implemented by
   ┌──────────────────────────────────┐
   │ ImpersonatedUserContextDecorator │ ─── (Wraps default context & overrides UserId if impersonating)
   └──────────────────────────────────┘
            │ delegates to
            ▼
   ┌──────────────────────────────────┐
   │        DefaultUserContext        │ ─── (Reads real logged-in user from HttpContext)
   └──────────────────────────────────┘
```

---

## 2. The Problem: The "Messy If" Anti-Pattern

When adding user impersonation (e.g., an Admin troubleshooting an issue by viewing the app as a regular user), developers often scatter `if-else` checks:

```csharp
// ❌ Anti-pattern: If-checks everywhere in controllers and services
public class ProfileController : Controller
{
    public IActionResult Index()
    {
        string userId;
        if (HttpContext.Session.GetString("ImpersonatedUserId") != null)
        {
            userId = HttpContext.Session.GetString("ImpersonatedUserId")!;
        }
        else
        {
            userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        }

        // ... Load profile for userId
        return View();
    }
}
```

**Why this hurts:**
- You have to repeat this `if-else` check in every controller and service.
- If impersonation logic changes (e.g., adding logging or switching session stores), you have to modify dozens of files.

---

## 3. The Pure C# Decorator Implementation

We only need three clean files for the core pattern: the interface, the default implementation, and the decorator.

### Step 1: `Services/IUserContext.cs`

This interface defines the contract for accessing user identity throughout the application:

```csharp
namespace ImpersonationDemo.Services;

public interface IUserContext
{
    string UserId { get; }
    string UserName { get; }
    bool IsImpersonating { get; }
}
```

---

### Step 2: `Services/DefaultUserContext.cs`

This class represents the real logged-in user from ASP.NET Core's `HttpContext`:

```csharp
namespace ImpersonationDemo.Services;

using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public class DefaultUserContext : IUserContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public DefaultUserContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string UserId => User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "guest";
    public string UserName => User?.Identity?.Name ?? "Guest";
    public bool IsImpersonating => false;
}
```

---

### Step 3: `Services/ImpersonatedUserContextDecorator.cs`

The decorator implements `IUserContext` and wraps `_inner` (`DefaultUserContext`). If an impersonation session is active, it returns the impersonated user; otherwise, it passes through to the default user:

```csharp
namespace ImpersonationDemo.Services;

using Microsoft.AspNetCore.Http;

public class ImpersonatedUserContextDecorator : IUserContext
{
    private readonly IUserContext _inner;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ImpersonatedUserContextDecorator(
        IUserContext inner, 
        IHttpContextAccessor httpContextAccessor)
    {
        _inner = inner;
        _httpContextAccessor = httpContextAccessor;
    }

    private ISession? Session => _httpContextAccessor.HttpContext?.Session;
    private string? ImpersonatedUserId => Session?.GetString("ImpersonatedUserId");
    private string? ImpersonatedUserName => Session?.GetString("ImpersonatedUserName");

    public string UserId => ImpersonatedUserId ?? _inner.UserId;
    public string UserName => ImpersonatedUserName ?? _inner.UserName;
    public bool IsImpersonating => !string.IsNullOrEmpty(ImpersonatedUserId);
}
```

---

## 4. Complete `Program.cs` (Pure .NET DI)

No third-party packages are needed. Native .NET factory delegates let you register and wrap decorators cleanly:

```csharp
using ImpersonationDemo.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add MVC and session services
builder.Services.AddControllersWithViews();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// 2. Register DefaultUserContext as a concrete service
builder.Services.AddScoped<DefaultUserContext>();

// 3. Register IUserContext using pure C# factory delegate to wrap with the Decorator
builder.Services.AddScoped<IUserContext>(sp =>
{
    var defaultContext = sp.GetRequiredService<DefaultUserContext>();
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
    return new ImpersonatedUserContextDecorator(defaultContext, httpContextAccessor);
});

var app = builder.Build();

// 4. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Enable session before routing to controllers
app.UseSession();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

---

## 5. Complete MVC Controllers & Views

### 5.1 `Controllers/ProfileController.cs`

Controllers inject `IUserContext` directly. They do not need to know whether the user is real or impersonated:

```csharp
namespace ImpersonationDemo.Controllers;

using ImpersonationDemo.Services;
using Microsoft.AspNetCore.Mvc;

public class ProfileController : Controller
{
    private readonly IUserContext _userContext;

    public ProfileController(IUserContext userContext)
    {
        _userContext = userContext;
    }

    public IActionResult Index()
    {
        ViewBag.UserId = _userContext.UserId;
        ViewBag.UserName = _userContext.UserName;
        ViewBag.IsImpersonating = _userContext.IsImpersonating;

        return View();
    }
}
```

---

### 5.2 `Controllers/AdminController.cs`

A dedicated controller to start and stop impersonation sessions:

```csharp
namespace ImpersonationDemo.Controllers;

using Microsoft.AspNetCore.Mvc;

public class AdminController : Controller
{
    [HttpPost]
    public IActionResult StartImpersonation(string targetUserId, string targetUserName)
    {
        HttpContext.Session.SetString("ImpersonatedUserId", targetUserId);
        HttpContext.Session.SetString("ImpersonatedUserName", targetUserName);
        return RedirectToAction("Index", "Profile");
    }

    [HttpPost]
    public IActionResult StopImpersonation()
    {
        HttpContext.Session.Remove("ImpersonatedUserId");
        HttpContext.Session.Remove("ImpersonatedUserName");
        return RedirectToAction("Index", "Profile");
    }
}
```

---

### 5.3 `Views/Shared/_Layout.cshtml`

Inject `IUserContext` into Razor layouts to show a persistent banner whenever impersonation is active:

```html
@inject ImpersonationDemo.Services.IUserContext UserContext
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Impersonation Demo</title>
    <link rel="stylesheet" href="~/css/site.css" />
</head>
<body>
    @if (UserContext.IsImpersonating)
    {
        <div style="background-color: #fff3cd; color: #856404; padding: 12px 20px; border-bottom: 2px solid #ffeeba; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <strong>⚠️ Impersonation Active:</strong> You are currently viewing the system as 
                <strong>@UserContext.UserName</strong> (ID: <code>@UserContext.UserId</code>).
            </div>
            <form asp-controller="Admin" asp-action="StopImpersonation" method="post" style="margin: 0;">
                <button type="submit" style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                    Exit Impersonation
                </button>
            </form>
        </div>
    }

    <div class="container" style="padding: 20px;">
        <main role="main">
            @RenderBody()
        </main>
    </div>
</body>
</html>
```

---

### 5.4 `Views/Profile/Index.cshtml`

A simple view demonstrating how profile data displays transparently:

```html
@{
    ViewData["Title"] = "User Profile";
}

<h2>User Profile</h2>

<div style="border: 1px solid #ddd; padding: 16px; border-radius: 6px; max-width: 500px;">
    <p><strong>User ID:</strong> @ViewBag.UserId</p>
    <p><strong>User Name:</strong> @ViewBag.UserName</p>
    <p><strong>Impersonation Status:</strong> @(ViewBag.IsImpersonating ? "Impersonated" : "Normal")</p>
</div>

<hr style="margin: 20px 0;" />

<h3>Admin Tools: Test Impersonation</h3>
<form asp-controller="Admin" asp-action="StartImpersonation" method="post" style="display: flex; gap: 10px; align-items: center;">
    <input type="text" name="targetUserId" placeholder="Target User ID (e.g. 42)" required style="padding: 6px;" />
    <input type="text" name="targetUserName" placeholder="Target User Name (e.g. Alice)" required style="padding: 6px;" />
    <button type="submit" style="background-color: #007bff; color: white; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer;">
        Impersonate User
    </button>
</form>
```

---

## 6. Summary of Benefits

| Benefit | How It Works |
| :--- | :--- |
| **Pure C# / Zero Dependencies** | No Scrutor or third-party packages required; uses native .NET DI factory delegates. |
| **Zero Code Duplication** | Eliminates repetitive `if (impersonating)` checks across controllers and business services. |
| **Open/Closed Principle (OCP)** | Adds impersonation capability without changing `DefaultUserContext` or controller code. |
| **Easy Unit Testing** | Unit tests can inject a mock `IUserContext` directly without mocking `HttpContext` or `ISession`. |
