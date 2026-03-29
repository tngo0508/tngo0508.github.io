---
layout: single
title: "Forcing Two-Factor Authentication (2FA) by Default in Blazor Web Apps (.NET 10)"
date: 2026-03-29
show_date: true
toc: true
toc_label: "Forcing 2FA"
classes: wide
tags:
  - .NET
  - C#
  - Blazor
  - Identity
  - Security
  - Authentication
  - MFA
---

In our previous posts, we discussed the basics of [**ASP.NET Core Identity**](/2026/03/29/identity-blazor-web-app-dotnet-10/) and [**Role-Based Access**](/2026/03/29/role-based-auth-mfa-blazor-dotnet-10/). A common question is: **"How can I force all my users to use 2FA without making them set it up themselves?"**

By default, 2FA often requires users to scan a QR code with an app like Google Authenticator. However, if you want a simpler experience where the system **automatically sends a code** (via Email or SMS) every time they login, this guide is for you.

---

## 1. Why Force 2FA?

Forcing 2FA by default ensures a higher level of security for every account from the moment it's created. Instead of relying on users to "opt-in," you make it a requirement. To make it user-friendly, we'll use **Email-based 2FA**, which doesn't require the user to install any extra apps.

---

## 2. Step 1: Automatically Enable 2FA for New Users

When a user registers, we want to ensure their account is marked as `TwoFactorEnabled`. You can do this in the registration logic.

Open `Components/Account/Pages/Register.razor` (or wherever your registration logic resides) and find the part where the user is created:

```csharp
var user = CreateUser();

await UserStore.SetUserNameAsync(user, Input.Email, CancellationToken.None);
var emailStore = GetEmailStore();
await emailStore.SetEmailAsync(user, Input.Email, CancellationToken.None);

// Add this line to force 2FA for the new user!
user.TwoFactorEnabled = true; 

var result = await UserManager.CreateAsync(user, Input.Password);
```

By setting `user.TwoFactorEnabled = true`, ASP.NET Core Identity will now require a second factor during every login for this user.

---

## 3. Step 2: Set Up the Email Sender

Since the system needs to "send" a code, you must implement an `IEmailSender`. Identity uses this service to send the 6-digit verification codes.

In your project, create a new file `Services/EmailSender.cs`:

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;

public class EmailSender : IEmailSender<ApplicationUser>
{
    public async Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink)
    {
        // For demonstration, we just log to the console
        Console.WriteLine($"[DEBUG_LOG] Send confirmation link to {email}: {confirmationLink}");
    }

    public async Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink)
    {
        Console.WriteLine($"[DEBUG_LOG] Send reset link to {email}: {resetLink}");
    }

    public async Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode)
    {
        Console.WriteLine($"[DEBUG_LOG] Send reset code to {email}: {resetCode}");
    }

    // This is the important one for 2FA!
    public async Task SendTwoFactorCodeAsync(ApplicationUser user, string email, string twoFactorCode)
    {
        // In a real app, use SendGrid, Mailtrap, or an SMTP client here.
        Console.WriteLine($"[DEBUG_LOG] Your 2FA Code is: {twoFactorCode}");
        
        // Example logic:
        // await myEmailService.SendAsync(email, "Your Login Code", $"Your code is {twoFactorCode}");
    }
}
```

---

## 4. Step 3: Register the Email Service

Now, tell .NET 10 to use your custom email sender. Open `Program.cs` and add the registration:

```csharp
// Register your custom EmailSender
builder.Services.AddTransient<IEmailSender<ApplicationUser>, EmailSender>();

// Ensure Identity is configured to allow Email 2FA
builder.Services.AddIdentityCore<ApplicationUser>(options => 
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Tokens.EmailTwoFactorTokenProvider = TokenOptions.DefaultEmailProvider;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();
```

### What is `TokenOptions.DefaultEmailProvider`?

When you call `.AddDefaultTokenProviders()`, Identity registers several standard providers behind the scenes:
*   **`EmailTokenProvider<TUser>`**: Registered as `"Email"`.
*   **`PhoneNumberTokenProvider<TUser>`**: Registered as `"Phone"`.
*   **`AuthenticatorTokenProvider<TUser>`**: Registered as `"Authenticator"`.

Setting `options.Tokens.EmailTwoFactorTokenProvider = TokenOptions.DefaultEmailProvider;` (which is a constant string with the value `"Email"`) explicitly tells the system: **"When the user needs an email-based two-factor token, use the provider registered under the name 'Email'."** 

This is what allows Identity to generate that 6-digit code which is then passed to your `EmailSender`!

---

## 5. Step 4: Confirming the Email (Crucial!)

Identity will only send 2FA codes to **confirmed** emails. If you are just starting out, you can force emails to be confirmed in your registration logic:

```csharp
// Inside Register.razor after CreateAsync
if (result.Succeeded)
{
    // Automatically confirm the email for new users (for testing/simplicity)
    var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
    await UserManager.ConfirmEmailAsync(user, code);
    
    // ... rest of the logic
}
```

---

## 6. How the Login Flow Works

Now that everything is set up:

1.  **User Enters Credentials:** The user types their email and password on the Login page.
2.  **Redirect to 2FA:** Since `TwoFactorEnabled` is true, Identity redirects the user to `/Account/LoginWith2fa`.
3.  **Code is Sent:** Behind the scenes, `SendTwoFactorCodeAsync` is called, and your `EmailSender` "sends" the code to the user.
4.  **User Enters Code:** The user checks their email, gets the code, and enters it on the screen to complete the login.

**Note:** The standard Blazor template includes the `LoginWith2fa.razor` page. If you want it to **only** use Email and not show the "Authenticator App" option, you can simplify that page to only call the Email provider.

---

## Summary

Forcing 2FA by default in **Blazor (.NET 10)** is a powerful way to protect your users. By:
1.  Setting `TwoFactorEnabled = true` on registration.
2.  Implementing a simple `IEmailSender`.
3.  Registering the services in `Program.cs`.

You create a secure, professional login experience that works right out of the box without requiring complex user configuration.

---

## Further Reading & Related Posts

*   [**Implementing ASP.NET Core Identity in Blazor Web Apps**](/2026/03/29/identity-blazor-web-app-dotnet-10/)
*   [**Advanced Security: Role-Based Access and MFA in Blazor**](/2026/03/29/role-based-auth-mfa-blazor-dotnet-10/)
*   [**Resilient Blazor Web Server Apps with Polly**](/2026/03/29/polly-blazor-web-server-dotnet-10/)
*   [**Building an API Gateway with Ocelot in .NET 10**](/2026/03/29/ocelot-api-gateway-dotnet-10/)
*   [**BFF Pattern with .NET 10 and Docker**](/2026/03/29/bff-pattern-dotnet-10-docker/)
