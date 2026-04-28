---
layout: single
title: "Securing .NET 10 Web APIs with OAuth 2.0 and OpenID Connect: A Beginner's Guide"
date: 2026-03-30 00:00:00 +0000
categories: .NET C#
tags: [oauth2, oidc, security, webapi, dotnet10]
toc: true
toc_label: "OAuth & OIDC"
---

Welcome! In this post, we're going to dive into the world of **OAuth 2.0** and **OpenID Connect (OIDC)** and learn how to use them to secure your **.NET 10 Web APIs**. 

Security can be intimidating for beginners, but it doesn't have to be. We'll break it down into simple terms and then see how it's implemented in .NET.

---

## 1. OAuth 2.0 vs. OpenID Connect (OIDC): What's the Difference?

Before we look at the code, let's clarify these two terms:

*   **OAuth 2.0 (Authorization):** This is about **permissions**. It tells the system what a user is *allowed* to do. Imagine a valet key for a car: it gives the valet permission to park it, but not to open the trunk or drive fast.
*   **OpenID Connect (Authentication):** This is about **identity**. It tells the system *who* the user is. Imagine a driver's license: it proves you are who you say you are.

OIDC is a layer on top of OAuth 2.0. When you use them together, your API knows both who the user is and what they are allowed to do.

---

## 2. The Simple Flow

1.  **User logs in** through an Identity Provider (IDP) like Auth0, Azure AD, or Google.
2.  **IDP issues a Token** (usually a JWT - JSON Web Token).
3.  **Client (your frontend)** sends this token in the header of every request to your API.
4.  **Your API validates the token** to ensure it's legitimate and hasn't been tampered with.

---

## 3. Setting Up the .NET 10 Web API

To secure your API, you'll need the `Microsoft.AspNetCore.Authentication.JwtBearer` NuGet package.

### NuGet Package (`.csproj`)
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.0" />
</ItemGroup>
```

---

## 4. Configuring Authentication in `Program.cs`

In .NET 10, the configuration is very straightforward. You'll need to tell your app how to validate the incoming tokens.

### The Code (`Program.cs`)
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Authentication Services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Replace with your Identity Provider's information
        options.Authority = "https://your-identity-provider.com"; 
        options.Audience = "your-api-identifier";
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// 2. Enable Authentication & Authorization Middleware
app.UseAuthentication(); // Who are you?
app.UseAuthorization();  // What can you do?

// 3. Define a Protected Endpoint
app.MapGet("/secure-data", () => new { message = "This is secret data!" })
   .RequireAuthorization(); // This makes the endpoint secure

// A Public Endpoint
app.MapGet("/public-data", () => new { message = "Anyone can see this." });

app.Run();
```

---

## 5. Protecting Endpoints with `[Authorize]`

If you are using Controllers instead of Minimal APIs, you can use the `[Authorize]` attribute.

```csharp
[ApiController]
[Route("api/[controller]")]
public class SecretController : ControllerBase
{
    [HttpGet]
    [Authorize] // Only authenticated users can access this
    public IActionResult GetSecret()
    {
        return Ok(new { data = "Top secret information!" });
    }
}
```

---

## 6. How to Test Your Secure API

To test your API, you'll need to send a JWT token in the `Authorization` header.

1.  **Get a Token:** Use your Identity Provider's dashboard or a tool like Postman to get a token for your user.
2.  **Send the Request:**
    *   **Method:** GET
    *   **URL:** `https://localhost:5001/secure-data`
    *   **Headers:**
        *   `Authorization`: `Bearer YOUR_TOKEN_HERE`

If the token is valid, you'll get a `200 OK`. If not, you'll get a `401 Unauthorized`.

---

## 7. Beginner Tips & Best Practices

1.  **Use HTTPS:** Never send tokens over unencrypted connections (HTTP).
2.  **Validate Everything:** Don't just trust the token. Ensure it's signed by your IDP and hasn't expired.
3.  **Start Small:** Don't try to build your own Identity Provider. Use established services like Auth0, Firebase, or Azure AD.
4.  **Scopes are Your Friend:** Use OAuth scopes (like `read:orders`, `write:orders`) to control granular access within your API.

---

## 8. Summary

*   **OIDC** handles login (Who).
*   **OAuth 2.0** handles permissions (What).
*   **.NET 10** makes it easy with `AddAuthentication` and `AddJwtBearer`.
*   Always protect your endpoints with `RequireAuthorization()` or `[Authorize]`.

Securing an API is a critical skill for any modern developer. Now you have the foundation to build safe and professional .NET applications!

---

## 9. References & Further Reading
*   **Microsoft Learn:** [Overview of ASP.NET Core Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
*   **OAuth.net:** [OAuth 2.0 Simplified](https://oauth.net/2/)
*   **Auth0 Blog:** [OAuth 2.0 and OpenID Connect Explained](https://auth0.com/blog/oauth2-openid-connect-overview/)
