---
layout: single
title: "Advanced Security: Role-Based Access and MFA in Blazor Web Apps (.NET 10)"
date: 2026-03-29
show_date: true
toc: true
toc_label: "Advanced Security"
classes: wide
tags:
  - .NET
  - C#
  - Blazor
  - Identity
  - Security
  - Authentication
  - Authorization
  - MFA
  - RBAC
---

In our previous post, we covered the basics of [**Implementing ASP.NET Core Identity in Blazor Web Apps**](/2026/03/29/identity-blazor-web-app-dotnet-10/). Today, we're taking it a step further by exploring two critical security features for production-ready applications: **Role-Based Access Control (RBAC)** and **Multi-Factor Authentication (MFA)**.

With **.NET 10**, these features are more integrated into the Blazor component model than ever before, providing a seamless experience for both developers and end-users.

---

## 1. Role-Based Access Control (RBAC)

Roles allow you to group users and grant permissions based on their responsibilities (e.g., Admin, Editor, User).

### Step 1: Registering Role Services

By default, the standard `AddIdentityCore` doesn't include role support. You need to explicitly add it in `Program.cs`.

```csharp
builder.Services.AddIdentityCore<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddRoles<IdentityRole>() // Add this line to enable roles
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();
```

### Step 2: Seeding Roles and an Admin User

A common pattern is to ensure certain roles exist when the application starts. You can do this in `Program.cs` or a separate initialization service.

```csharp
// Simple seeding logic in Program.cs
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    string[] roleNames = { "Admin", "User", "Manager" };
    foreach (var roleName in roleNames)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    // Assign the Admin role to a specific user
    var adminEmail = "admin@example.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser != null && !await userManager.IsInRoleAsync(adminUser, "Admin"))
    {
        await userManager.AddToRoleAsync(adminUser, "Admin");
    }
}
```

### Step 3: Protecting Pages and Components

Once roles are assigned, you can use the `[Authorize]` attribute or the `AuthorizeView` component.

#### Protecting a Page
```razor
@page "/admin-dashboard"
@attribute [Authorize(Roles = "Admin")]

<h3>Admin Dashboard</h3>
<p>This page is only accessible to users with the 'Admin' role.</p>
```

#### Conditional UI in Components
```razor
<AuthorizeView Roles="Admin, Manager">
    <Authorized>
        <button class="btn btn-danger">Delete Record</button>
    </Authorized>
    <NotAuthorized>
        <p>You do not have permission to delete records.</p>
    </NotAuthorized>
</AuthorizeView>
```

---

## 2. Enabling Multi-Factor Authentication (MFA)

MFA adds an extra layer of security by requiring users to provide a second form of verification (typically a TOTP code from an app like Google Authenticator).

### Step 1: Configuring Identity for MFA

In `Program.cs`, you can enforce MFA requirements or simply enable the infrastructure.

```csharp
builder.Services.AddIdentityCore<ApplicationUser>(options => 
    {
        options.SignIn.RequireConfirmedAccount = true;
        // Optional: Force MFA for all users
        // options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();
```

### Step 2: The MFA User Experience in Blazor

If you used the `--auth Individual` template, your app already contains the necessary components in `Components/Account/Pages/Manage/`.

1.  **Enable Authenticator:** Users can go to `/Account/Manage/EnableAuthenticator` to see a QR code and set up their app.
2.  **Two-Factor Login:** When a user with MFA enabled logs in, they are automatically redirected to `/Account/LoginWith2fa` to enter their code.

### Step 3: Customizing MFA Logic

You can programmatically check if a user has MFA enabled or even require it for specific actions. If you want to force 2FA for all users by default, check out our guide on [**Forcing 2FA by Default**](/2026/03/29/forced-2fa-blazor-dotnet-10/).

```csharp
@inject UserManager<ApplicationUser> UserManager
@inject AuthenticationStateProvider AuthStateProvider

@code {
    private async Task CheckMfaStatus()
    {
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var user = await UserManager.GetUserAsync(authState.User);
        
        if (user != null && await UserManager.GetTwoFactorEnabledAsync(user))
        {
            // MFA is enabled for this user
        }
    }
}
```

---

## 3. Best Practices for .NET 10 Security

*   **Use Policy-Based Authorization:** For complex scenarios, instead of hardcoding roles in your components, use **Policies**. Define them in `Program.cs` and reference them by name.
*   **Secure Your API Gateway:** If you're using **Ocelot** or **YARP**, ensure they are configured to forward authentication tokens correctly.
*   **Monitor Failed Logins:** Use the built-in lockout features in Identity to protect against brute-force attacks.

---

## Summary

Implementing **Role-Based Access Control** and **Multi-Factor Authentication** in **Blazor Web Apps (.NET 10)** is straightforward thanks to the unified identity model. By leveraging `AddRoles`, `AuthorizeView`, and the built-in MFA components, you can build highly secure applications without reinventing the wheel.

---

## Further Reading & Related Posts

*   [**Forcing 2FA by Default in Blazor Web Apps**](/2026/03/29/forced-2fa-blazor-dotnet-10/)
*   [**Implementing ASP.NET Core Identity in Blazor Web Apps**](/2026/03/29/identity-blazor-web-app-dotnet-10/)
*   [**Resilient Blazor Web Server Apps with Polly**](/2026/03/29/polly-blazor-web-server-dotnet-10/)
*   [**Building an API Gateway with Ocelot in .NET 10**](/2026/03/29/ocelot-api-gateway-dotnet-10/)
*   [**BFF Pattern with .NET 10 and Docker**](/2026/03/29/bff-pattern-dotnet-10-docker/)
*   [**Microsoft: ASP.NET Core Authorization Documentation**](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction)
