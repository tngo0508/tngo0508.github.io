---
layout: single
title: "Building an API Gateway with Ocelot in .NET 10"
date: 2026-03-29
show_date: true
toc: true
toc_label: "Ocelot Guide"
8:classes: wide
tags:
  - .NET
  - C#
  - Ocelot
  - API Gateway
  - Microservices
---

In the world of microservices, managing how clients interact with your backend services is a critical design decision. While we recently explored **YARP**, another heavyweight in the .NET ecosystem is **Ocelot**. In this post, we'll dive into how to set up and use Ocelot as an API Gateway in **.NET 10**.

---

## 1. What is Ocelot?

**Ocelot** is an open-source API Gateway designed specifically for .NET microservices architectures. It works by providing a unified entry point to your system, routing incoming HTTP requests to appropriate downstream services.

Ocelot is known for being:
*   **Feature-Rich:** Out-of-the-box support for routing, authentication, rate limiting, load balancing, and more.
*   **Middleware-Based:** It sits as a piece of middleware in your ASP.NET Core pipeline.
*   **Configuration-First:** Most of its behavior is defined in a JSON configuration file (`ocelot.json`).

### Ocelot vs. YARP
While YARP (Yet Another Reverse Proxy) is a newer, highly customizable toolkit from Microsoft, Ocelot has been a community staple for years. Ocelot offers a more "opinionated" set of features that are ready to use with minimal code, whereas YARP provides a more flexible foundation for building your own proxy logic.

---

## 2. Basic Setup in .NET 10

Setting up Ocelot in .NET 10 is straightforward and follows the standard ASP.NET Core pattern.

### Step 1: Create a New Project
Start with an empty ASP.NET Core web project:

```bash
dotnet new web -n OcelotGateway
cd OcelotGateway
```

### Step 2: Install Ocelot NuGet Package
Add the Ocelot package to your project:

```bash
dotnet add package Ocelot
```

### Step 3: Configure `Program.cs`
In .NET 10, you register Ocelot in the service container and add it to the request pipeline.

```csharp
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot configuration file
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Add Ocelot services
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// Use Ocelot middleware
await app.UseOcelot();

app.Run();
```

---

## 3. Configuring Routes

The heart of Ocelot is the `ocelot.json` file. This is where you define your **Routes** (formerly called ReRoutes). Each route maps an **Upstream** request (from the client) to a **Downstream** request (to the microservice).

### What are Upstream and Downstream?

To understand Ocelot's configuration, it's essential to understand the flow of data:

*   **Upstream:** This refers to the **Client** (e.g., your website, mobile app, or another service) that is calling the Gateway. In Ocelot, anything named "Upstream" defines the properties of the request the Gateway expects to receive.
*   **Downstream:** This refers to the **Backend Service** (the microservice) that the Gateway is proxying the request to. Anything named "Downstream" tells Ocelot how to call that backend service.

Imagine a river: the request starts at the client (**Upstream**), flows into the Gateway, and is then sent out to the microservice (**Downstream**).

Create an `ocelot.json` file in your project root:

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/products/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 5001
        }
      ],
      "UpstreamPathTemplate": "/products/{everything}",
      "UpstreamHttpMethod": [ "Get", "Post" ]
    },
    {
      "DownstreamPathTemplate": "/api/users/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        {
          "Host": "localhost",
          "Port": 6001
        }
      ],
      "UpstreamPathTemplate": "/users/{everything}",
      "UpstreamHttpMethod": [ "Get" ]
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "https://localhost:5000"
  }
}
```

### Key Concepts:
*   **UpstreamPathTemplate:** The URL pattern the client calls on the gateway.
*   **DownstreamPathTemplate:** The URL pattern Ocelot uses to call the backend service.
*   **DownstreamHostAndPorts:** The location of the backend service.

---

## 4. Advanced Features

Ocelot provides built-in support for common API Gateway concerns.

### 4.1 JWT Authentication

To secure your routes, Ocelot integrates with ASP.NET Core's standard authentication.

**1. Register Authentication in `Program.cs`:**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("ApiSecurityKey", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "your-issuer",
            ValidAudience = "your-audience",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-very-long-secret-key"))
        };
    });
```

**2. Protect a Route in `ocelot.json`:**
```json
{
  "DownstreamPathTemplate": "/api/orders/{everything}",
  "UpstreamPathTemplate": "/orders/{everything}",
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "ApiSecurityKey",
    "AllowedScopes": []
  }
}
```

### 4.2 Rate Limiting

Prevent service abuse by limiting the number of requests a client can make within a time window.

Add `RateLimitOptions` to your route in `ocelot.json`:

```json
{
  "DownstreamPathTemplate": "/api/search/{everything}",
  "UpstreamPathTemplate": "/search/{everything}",
  "RateLimitOptions": {
    "ClientWhitelist": [],
    "EnableRateLimiting": true,
    "Period": "10s",
    "PeriodTimespan": 5,
    "Limit": 3
  }
}
```
*   **Period:** The window size (e.g., 1s, 5m, 1h).
*   **Limit:** The maximum number of requests allowed in the period.

### 4.3 Quality of Service (Circuit Breaker)

Ocelot uses **Polly** to provide Quality of Service (QoS) features like Circuit Breakers.

**1. Install the Ocelot Polly Provider:**
```bash
dotnet add package Ocelot.Provider.Polly
```

**2. Register in `Program.cs`:**
```csharp
using Ocelot.Provider.Polly;

builder.Services.AddOcelot(builder.Configuration)
    .AddPolly();
```

**3. Configure in `ocelot.json`:**
```json
{
  "DownstreamPathTemplate": "/api/unstable/{everything}",
  "UpstreamPathTemplate": "/unstable/{everything}",
  "QoSOptions": {
    "ExceptionsAllowedBeforeBreaking": 3,
    "DurationOfBreak": 10000,
    "TimeoutValue": 5000
  }
}
```
*   **ExceptionsAllowedBeforeBreaking:** The circuit will trip after 3 failures.
*   **DurationOfBreak:** The circuit stays open for 10 seconds before trying again.

---

## 5. Summary: Ocelot vs. YARP

| Feature | Ocelot | YARP |
| :--- | :--- | :--- |
| **Philosophy** | Opinionated, feature-rich gateway. | High-performance, flexible proxy toolkit. |
| **Configuration** | Primarily JSON (`ocelot.json`). | Code or `appsettings.json`. |
| **Resilience** | Polly (via Provider package). | Built-in .NET 10 Resilience handlers. |
| **Customization** | Standard ASP.NET Core Middleware. | Full control over the proxy pipeline. |
| **Performance** | Very good. | Excellent (built by the ASP.NET team). |

---

## 6. Further Reading & References

- [**Ocelot Documentation**](https://ocelot.readthedocs.io/): The official guide for Ocelot.
- [**Ocelot GitHub Repository**](https://github.com/ThreeMammals/Ocelot): Source code and issue tracking.
- [**Microservices with Ocelot**](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/multi-container-microservice-net-applications/implement-api-gateways-with-ocelot): Microsoft's architectural guidance.

## Summary

Ocelot remains a powerful and easy-to-configure option for building API Gateways in .NET 10. Its JSON-driven configuration and built-in support for security and resilience make it a great choice for teams that want to get a gateway up and running quickly without writing extensive custom proxy logic.
