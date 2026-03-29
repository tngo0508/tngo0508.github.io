---
layout: single
title: "Getting Started with YARP as an API Gateway in .NET 10"
date: 2026-03-28
show_date: true
toc: true
toc_label: "YARP Guide"
classes: wide
tags:
  - .NET
  - C#
  - YARP
  - API Gateway
  - Microservices
---

As modern application architectures shift towards microservices, the need for a central entry point to manage traffic becomes crucial. This is where an **API Gateway** comes into play. In this post, we'll explore **YARP (Yet Another Reverse Proxy)**, a highly customizable reverse proxy built on ASP.NET Core, and how to set it up in **.NET 10**.

---

## 1. What is an API Gateway?

An **API Gateway** is a server that acts as an entry point for all client requests to your backend services. Instead of clients calling each microservice directly, they send requests to the API Gateway, which then routes the requests to the appropriate service.

### Why do we need it?

Think of an API Gateway as the "front door" of your system. Here are the key reasons why it's essential:

1.  **Centralized Entry Point:** Simplifies client-side development by providing a single URL for all backend functionality.
2.  **Security:** It's the perfect place to handle authentication and authorization before requests reach internal services.
3.  **Load Balancing:** It can distribute incoming traffic across multiple instances of a service to ensure high availability.
4.  **SSL Termination:** Offloads the overhead of SSL/TLS encryption/decryption from backend services.
5.  **Cross-Cutting Concerns:** Handles logging, caching, rate limiting, and request transformation in one place.

---

## 2. What is YARP?

**YARP (Yet Another Reverse Proxy)** is an open-source project from Microsoft. Unlike other reverse proxies like Nginx or HAProxy, YARP is built on top of the **ASP.NET Core** infrastructure. 

### What is a Reverse Proxy?

A **Reverse Proxy** is a server that sits in front of one or more web servers and intercepts requests from clients. This is different from a forward proxy, which sits in front of clients. 

YARP acts as this intermediary, receiving requests and deciding which backend service should handle them. This allows it to provide:
*   **Abstraction:** Clients only see the gateway, not the individual microservices.
*   **Security:** Hide the internal network structure and provide a single point for SSL termination and firewalling.
*   **Control:** Easily manage traffic flow, versions (canary releases), and maintenance windows.

### Why YARP?
*   **Performance:** It leverages the high-performance Kestrel web server.
*   **Customization:** Since it's built in C#, you can easily customize its behavior using standard .NET middleware and code.
*   **Integration:** It fits naturally into the .NET ecosystem, using familiar configuration patterns (`appsettings.json`, dependency injection, etc.).

---

## 3. Setting Up YARP in .NET 10

Let's walk through a basic setup to turn an ASP.NET Core application into an API Gateway.

### Step 1: Create a new project
First, create an empty ASP.NET Core project using the CLI:

```bash
dotnet new web -n MyApiGateway
cd MyApiGateway
```

### Step 2: Add the YARP NuGet Package
Add the `Yarp.ReverseProxy` package to your project:

```bash
dotnet add package Yarp.ReverseProxy
```

### Step 3: Configure Services and Middleware
In .NET 10, the configuration is still handled in `Program.cs`. We need to register the YARP services and map the proxy middleware.

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add YARP services and load configuration from appsettings.json
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Map YARP routes
app.MapReverseProxy();

app.Run();
```

---

## 4. Configuring Routes and Clusters

YARP uses two main concepts: **Routes** and **Clusters**.

*   **Routes:** Define which incoming requests should be proxied (based on path, host, methods, etc.).
*   **Clusters:** Define the backend services (destinations) where the requests should be sent.

Open your `appsettings.json` and add the following configuration:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ReverseProxy": {
    "Routes": {
      "service1_route": {
        "ClusterId": "cluster1",
        "Match": {
          "Path": "/api/products/{**catch-all}"
        }
      },
      "service2_route": {
        "ClusterId": "cluster2",
        "Match": {
          "Path": "/api/users/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "cluster1": {
        "Destinations": {
          "destination1": {
            "Address": "https://localhost:5001/"
          }
        }
      },
      "cluster2": {
        "Destinations": {
          "destination1": {
            "Address": "https://localhost:6001/"
          }
        }
      }
    }
  }
}
```

### Breaking down the config:
1.  **Routes:**
    *   `service1_route`: Matches any request starting with `/api/products/` and sends it to `cluster1`.
2.  **Clusters:**
    *   `cluster1`: Contains a single destination pointing to our product service running on port 5001.

---

## 5. Advanced Features in .NET 10

One of YARP's greatest strengths is how easily it integrates with standard ASP.NET Core features. In .NET 10, these integrations are more seamless than ever.

### 5.1 Setting up JWT Authentication

To secure your routes using JWT (JSON Web Tokens), you first need to configure authentication in `Program.cs`.

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AuthenticatedUser", policy => policy.RequireAuthenticatedUser());
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapReverseProxy();
app.Run();
```

In your `appsettings.json`, you can then apply this policy to specific routes:

```json
"service1_route": {
  "ClusterId": "cluster1",
  "AuthorizationPolicy": "AuthenticatedUser",
  "Match": { "Path": "/api/products/{**catch-all}" }
}
```

### 5.2 Rate Limiting

Rate limiting protects your backend services from being overwhelmed by too many requests. ASP.NET Core provides a built-in rate-limiting middleware that YARP supports natively.

**Register in `Program.cs`:**
```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.Window = TimeSpan.FromSeconds(10);
        opt.PermitLimit = 5; // Allow 5 requests every 10 seconds
    });
});

// ... inside app ...
app.UseRateLimiter();
```

**Apply in `appsettings.json`:**
```json
"service1_route": {
  "ClusterId": "cluster1",
  "RateLimiterPolicy": "fixed",
  "Match": { "Path": "/api/products/{**catch-all}" }
}
```

### 5.3 Circuit Breaker and Resilience

In .NET 10, resilience is handled through the `Microsoft.Extensions.Resilience` library, which is built on Polly v8. You can define a resilience pipeline and apply it to your YARP clusters.

**Setup in `Program.cs`:**
```csharp
builder.Services.AddResiliencePipeline("my-resilience-policy", pipeline =>
{
    pipeline.AddCircuitBreaker(new CircuitBreakerStrategyOptions
    {
        FailureRatio = 0.5,
        SamplingDuration = TimeSpan.FromSeconds(10),
        MinimumThroughput = 10,
        BreakDuration = TimeSpan.FromSeconds(30)
    });
});
```

**Apply to a Cluster in `appsettings.json`:**
```json
"Clusters": {
  "cluster1": {
    "Metadata": {
      "ResiliencePipeline": "my-resilience-policy"
    },
    "Destinations": {
      "destination1": { "Address": "https://localhost:5001/" }
    }
  }
}
```

---

## 6. Further Reading & References

To dive deeper into YARP and building resilient API gateways, check out these official resources:

- [**Official YARP Documentation**](https://microsoft.github.io/reverse-proxy/): The starting point for all things YARP.
- [**YARP GitHub Repository**](https://github.com/microsoft/reverse-proxy): The source code and community discussions.
- [**ASP.NET Core Rate Limiting Middleware**](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit): Detailed guide on how to configure the built-in rate limiter.
- [**App Resilience in .NET**](https://learn.microsoft.com/en-us/dotnet/core/resilience/resilience): Learn more about the new resilience features in .NET 10.
- [**YARP Route Configuration Reference**](https://microsoft.github.io/reverse-proxy/articles/config-files.html): Complete reference for all configuration options.

---

## Summary

Setting up an API Gateway with YARP in .NET 10 is straightforward yet incredibly powerful. It provides:
*   A familiar development experience for .NET developers.
*   High-performance routing using Kestrel.
*   The flexibility to customize every aspect of the proxy process using C#.

Whether you're building a simple microservices architecture or a complex enterprise system, YARP is an excellent choice for your gateway needs!
