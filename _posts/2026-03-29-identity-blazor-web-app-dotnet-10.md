---
layout: single
title: "Implementing ASP.NET Core Identity in Blazor Web Apps (.NET 10)"
date: 2026-03-29
show_date: true
toc: true
toc_label: "Blazor Identity"
classes: wide
tags:
  - .NET
  - C#
  - Blazor
  - Identity
  - Security
  - Authentication
  - Authorization
---

With the unified **Blazor Web App** model introduced in .NET 8 and further refined in **.NET 10**, implementing authentication and authorization has never been more streamlined. ASP.NET Core Identity provides a comprehensive solution for managing users, passwords, and multi-factor authentication, all while being deeply integrated into the Blazor component model.

In this post, we'll explore how to set up and customize Identity in a modern Blazor Web App.

---

## 1. Why Identity in Blazor Web Apps?

Modern Blazor apps can render both on the server (SSR) and on the client (WebAssembly). This "hybrid" approach requires a unified security model. **ASP.NET Core Identity** fulfills this by providing:
*   **Unified Authentication State:** Components receive the current user's state regardless of the render mode.
*   **Built-in UI Components:** A set of Razor components for Login, Register, Logout, and Account Management.
*   **Extensibility:** Easily add custom user properties (e.g., Profile Picture, Date of Birth).
*   **Secure Defaults:** Password hashing, lockout policies, and CSRF protection are enabled by default.

---

## 2. Quick Start: Scaffolding a New Project

The easiest way to start with Identity is to use the project template. This generates all the necessary components and configuration.

```bash
dotnet new blazor --auth Individual -n MySecureApp
```

### What's generated?
*   **`Data/ApplicationUser.cs`**: A custom user class extending `IdentityUser`.
*   **`Data/ApplicationDbContext.cs`**: The EF Core database context configured for Identity.
*   **`Components/Account/`**: A folder containing all the Identity UI components (Login, Register, Logout, etc.).
*   **`Components/Routes.razor`**: Includes the `AuthorizeRouteView` to handle page-level authorization.

---

## 3. Configuring Services in .NET 10

In `Program.cs`, Identity services are registered and configured. .NET 10 continues the trend of simplified registration.

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Add DB Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Add Identity Services
builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// 3. Add Authentication & Authorization
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
        options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
    })
    .AddIdentityCookies();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityUserAccessor>();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

var app = builder.Build();

// 4. Map Identity Endpoints
app.MapAdditionalIdentityEndpoints();

app.Run();
```

---

## 4. Protecting Components and Pages

Once Identity is configured, you can secure your application using the standard ASP.NET Core authorization attributes.

### Option A: Protecting a Whole Page
Use the `[Authorize]` attribute in your `.razor` file:

```razor
@page "/secure-data"
@attribute [Authorize]

<h3>Secure Dashboard</h3>
<p>Only logged-in users can see this.</p>
```

### Option B: Conditional UI in Components
Use the `AuthorizeView` component to show or hide content based on the user's role or status:

```razor
<AuthorizeView>
    <Authorized>
        <p>Hello, @context.User.Identity?.Name!</p>
        <button @onclick="Logout">Logout</button>
    </Authorized>
    <NotAuthorized>
        <p>Please <a href="Account/Login">login</a> to continue.</p>
    </NotAuthorized>
</AuthorizeView>
```

### Option C: Role-Based Access
You can also restrict content based on specific roles. For more details on setting up roles and MFA, check out our [**Advanced Security guide**](/2026/03/29/role-based-auth-mfa-blazor-dotnet-10/).

```razor
<AuthorizeView Roles="Admin">
    <p>Welcome, Administrator!</p>
</AuthorizeView>
```

---

## 5. Customizing Identity Logic

One of the strengths of .NET 10 Identity is how easy it is to extend.

### Customizing the User Model
Add properties to `ApplicationUser.cs`:

```csharp
public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public DateTime DateOfBirth { get; set; }
}
```

Then, update your registration form in `Components/Account/Pages/Register.razor` to collect these values.

---

## 6. AuthenticationStateProvider

In Blazor Web Apps, the `AuthenticationStateProvider` is the source of truth for the current user's status. The standard `IdentityRevalidatingAuthenticationStateProvider` ensures that the user's security stamp is checked periodically, automatically logging them out if their account is locked or their password is changed on another device.

### Accessing User State in Code:

```csharp
@inject AuthenticationStateProvider AuthStateProvider

@code {
    protected override async Task OnInitializedAsync()
    {
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;

        if (user.Identity is { IsAuthenticated: true })
        {
            // Do something for authenticated users
        }
    }
}
```

---

## Summary

Setting up Identity in **Blazor Web Apps (.NET 10)** provides a robust, production-ready security foundation. By leveraging the built-in templates and customizing the generated components, you can quickly implement secure authentication flows while maintaining full control over the user experience.

---

## Further Reading & Related Posts

*   [**Implementing ASP.NET Core Identity in Blazor Web Apps**](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
*   [**Advanced Security: Roles and MFA in Blazor**](/2026/03/29/role-based-auth-mfa-blazor-dotnet-10/)
*   [**Forcing 2FA by Default in Blazor Web Apps**](/2026/03/29/forced-2fa-blazor-dotnet-10/)
*   [**Blazor Authentication and Authorization**](https://learn.microsoft.com/en-us/aspnet/core/blazor/security/)
*   [**Resilient Blazor Web Server Apps with Polly**](/2026/03/29/polly-blazor-web-server-dotnet-10/)
*   [**Building an API Gateway with Ocelot in .NET 10**](/2026/03/29/ocelot-api-gateway-dotnet-10/)
*   [**BFF Pattern with .NET 10 and Docker**](/2026/03/29/bff-pattern-dotnet-10-docker/)
