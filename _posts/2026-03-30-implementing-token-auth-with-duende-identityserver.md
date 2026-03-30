---
layout: single
title: "Implementing Token Authentication with Duende IdentityServer in .NET 10: Production-Ready Guide"
date: 2026-03-30 00:00:00 +0000
categories: .NET C#
tags: [duende, identityserver, oauth2, oidc, security, webapi, dotnet10, production]
toc: true
toc_label: "Duende IdentityServer"
---

Today, we’re going to build a **production-ready Identity Provider** using **Duende IdentityServer**. 

While in-memory setups are great for learning, a real-world deployment requires persistent storage, secure credential management, and robust configuration.

---

## 1. What is Duende IdentityServer?

Think of Duende IdentityServer as a **"Security Broker"**. 

When a user or a client (like a mobile app) wants to access your Web API, they don't talk to the API directly first. Instead:
1.  They go to **IdentityServer** to prove who they are.
2.  IdentityServer gives them a **Token**.
3.  They show that token to your **Web API**.
4.  Your Web API trusts the token because it was issued by your IdentityServer.

By using Duende, you centralize all login and permission logic in one place.

---

## 2. Setting Up the Identity Server Project

Instead of building from scratch, Duende provides official templates that give you a solid foundation for your security server.

### 1. Install Duende Templates
```bash
dotnet new install Duende.IdentityServer.Templates
```

### 2. Create the Project using a Template
For a **production-ready** setup with **Entity Framework Core** persistence, we'll use the `is-ef` template.
```bash
dotnet new is-ef -n MyIdentityServer
```
This template automatically:
1.  Adds the core **Duende.IdentityServer** and **Duende.IdentityServer.EntityFramework** packages.
2.  Scaffolds the database context and configuration for persistence.
3.  Provides a base `Config.cs` and a clean `Program.cs` structure.

---

## 3. Understanding the Project Structure

Once the template is created, you'll see several key files that form the backbone of your IdentityServer:

- **`Program.cs` & `HostingExtensions.cs`**: These handle the application startup. In modern Duende templates, `HostingExtensions.cs` contains the DI and middleware pipeline configuration to keep `Program.cs` clean.
- **`Config.cs`**: A "blueprint" file where you define your initial API scopes, identity resources, and clients. This data is used by the seeder to populate the database.
- **`SeedData.cs`**: A utility class to initialize your database with the definitions from `Config.cs`. You typically run this once with the `/seed` argument.
- **`appsettings.json`**: Contains configuration like connection strings for your SQL database.
- **`Data/`**: Contains the Entity Framework DbContexts and migrations for the Configuration and Operational stores.

---

## 4. Defining Your Configuration (Config.cs)

The template provides a `Config.cs` file. This is where you define your initial state (clients, scopes, and resources) which will be used to seed the database during the first deployment.

### `Config.cs`
```csharp
using Duende.IdentityServer;
using Duende.IdentityServer.Models;

public static class Config
{
    public static IEnumerable<IdentityResource> IdentityResources =>
        new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new List<ApiScope>
        {
            new ApiScope("api.read", "Read access to the API"),
            new ApiScope("api.write", "Write access to the API")
        };

    public static IEnumerable<Client> Clients =>
        new List<Client>
        {
            // Machine-to-machine client
            new Client
            {
                ClientId = "m2m.client",
                ClientName = "Service to Service Client",
                AllowedGrantTypes = GrantTypes.ClientCredentials,
                // In production, use a secure secret from a Vault
                ClientSecrets = { new Secret("StrongProductionSecret".Sha256()) },
                AllowedScopes = { "api.read" }
            }
        };
}
```

---

## 5. Configuring Persistence in Program.cs

The `is-ef` template does most of the heavy lifting. Your `Program.cs` (or `HostingExtensions.cs` depending on the template version) will look like this to enable database-backed configuration and operational stores.

```csharp
var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var migrationsAssembly = typeof(Program).Assembly.GetName().Name;

// 1. Add IdentityServer Services
builder.Services.AddIdentityServer()
    // Configuration Store: Clients, Scopes, and Resources
    .AddConfigurationStore(options =>
    {
        options.ConfigureDbContext = b => b.UseSqlServer(connectionString,
            sql => sql.MigrationsAssembly(migrationsAssembly));
    })
    // Operational Store: Tokens, Consents, and Codes
    .AddOperationalStore(options =>
    {
        options.ConfigureDbContext = b => b.UseSqlServer(connectionString,
            sql => sql.MigrationsAssembly(migrationsAssembly));
    })
    // For Production, load a real certificate from Key Vault or Certificate Store
    // .AddSigningCredential(new X509Certificate2("path-to-cert.pfx", "password"));
    .AddDeveloperSigningCredential(); // USE ONLY IN DEV!

var app = builder.Build();

// Note: The template includes a SeedData.cs to populate the DB from Config.cs
// Run: dotnet run -- /seed
app.UseIdentityServer();
app.MapGet("/", () => "IdentityServer is running on production-ready stores!");
app.Run();
```

---

## 6. Connecting Your Web API

Now that your IdentityServer is running (let's say on `https://localhost:5001`), you need to tell your **Web API** to trust it.

### Web API `Program.cs`
In this step, we'll configure the `Authority` to be *your* IdentityServer.

```csharp
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        // Replace with your real URL in production
        options.Authority = "https://localhost:5001"; 
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = "api.read", // Must match a defined scope
            ValidateIssuer = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/secret", () => "You found the secret!")
   .RequireAuthorization();

app.Run();
```

---

## 7. How to Test the Flow

1.  **Start IdentityServer:** Run your `MyIdentityServer` project.
2.  **Start the Web API:** Run your Web API project.
3.  **Get a Token:** Use a tool like Postman or `curl` to ask IdentityServer for a token.
    *   **Method:** POST
    *   **URL:** `https://localhost:5001/connect/token`
    *   **Body (Form-Data):**
        *   `client_id`: `m2m.client`
        *   `client_secret`: `StrongProductionSecret`
        *   `grant_type`: `client_credentials`
        *   `scope`: `api.read`
4.  **Use the Token:** Copy the `access_token` and send it to your Web API's `/secret` endpoint in the `Authorization` header as `Bearer <YOUR_TOKEN>`.

---

## 8. Production Checklist & Security Tips

Moving from development to production requires a shift in mindset:

- **Database Persistence:** Always use `AddConfigurationStore` and `AddOperationalStore` with a reliable DB like SQL Server or PostgreSQL.
- **Signing Credentials:** Use `AddSigningCredential()` with a valid certificate (X.509). Never use `AddDeveloperSigningCredential()` in production.
- **Secrets Management:** Use **Azure Key Vault**, **AWS Secrets Manager**, or environment variables for client secrets and DB connection strings.
- **HTTPS Only:** Ensure your IdentityServer and APIs only communicate over HTTPS. Use `app.UseHttpsRedirection()`.
- **Audience Validation:** Always set `ValidateAudience = true` on the API side to prevent token reuse across different services.
- **Logging & Monitoring:** Integrate with Serilog and tools like Application Insights to monitor token issuance and failed authentication attempts.

---

## 9. Summary

- **Duende IdentityServer Templates** are the fastest way to bootstrap a secure project.
- **Duende IdentityServer** acts as your own personal "Passport Office."
- It issues **Tokens** to clients based on your rules defined in `Config.cs`.
- Your **Web API** validates those tokens by pointing its `Authority` to your IdentityServer.

Setting up an Identity Provider gives you full control over your application's security. Happy coding!

---

## 10. References
- **Duende Software Documentation:** [Introduction to IdentityServer](https://docs.duendesoftware.com/identityserver/v7/introduction/)
- **Microsoft Learn:** [Secure a Web API with IdentityServer](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-server)
- **IdentityServer Samples:** [GitHub Repository](https://github.com/DuendeSoftware/Samples)
