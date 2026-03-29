---
layout: single
title: "Backend-for-Frontends (BFF) Pattern with .NET 10 and Docker"
date: 2026-03-29
show_date: true
toc: true
toc_label: "BFF Guide"
classes: wide
tags:
  - .NET
  - C#
  - BFF
  - Docker
  - Microservices
  - YARP
  - Ocelot
---

As microservice architectures grow, a single API gateway often becomes a bottleneck or overly complex as it tries to serve diverse clients like web apps, mobile apps, and IoT devices. This is where the **Backend-for-Frontends (BFF)** pattern shines.

In this post, we'll explore how to implement the BFF pattern using **.NET 10** and **Docker**.

---

## 1. What is the BFF Pattern?

The **Backend-for-Frontends (BFF)** pattern is a variation of the API Gateway pattern. Instead of a single gateway for all clients, you create a separate gateway (the BFF) for each specific client type.

### Why use a BFF?

*   **Client Optimization:** A mobile app might only need 3 fields from a service, while a web app needs 20. The BFF can prune or aggregate data specifically for that client.
*   **Security:** You can implement different authentication/authorization strategies for web (e.g., cookies) versus mobile (e.g., JWT).
*   **Autonomy:** Frontend teams can manage their own BFF, allowing them to change the API without waiting for the backend team.

---

## 2. Implementing BFF with YARP

The most efficient way to build a BFF in .NET 10 is by using **YARP (Yet Another Reverse Proxy)**. It provides the routing power of a gateway while allowing you to add custom logic for data aggregation or transformation.

### Step 1: Create the BFF Project

```bash
dotnet new web -n Web.Bff
cd Web.Bff
dotnet add package Yarp.ReverseProxy
```

### Step 2: Configure `Program.cs`
In .NET 10, setting up YARP is clean and simple:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add YARP services
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapReverseProxy();

app.Run();
```

### Step 3: Configure `appsettings.json`
Define your downstream microservices. For a BFF, these are the services the frontend needs to talk to.

```json
{
  "ReverseProxy": {
    "Routes": {
      "product-route": {
        "ClusterId": "product-cluster",
        "Match": {
          "Path": "/api/products/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "product-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "http://product-service:8080"
          }
        }
      }
    }
  }
}
```

---

## 3. Implementing BFF with Ocelot

If you prefer a configuration-driven approach, **Ocelot** is an excellent alternative for your BFF. It's especially useful if you need standard gateway features (like authentication, rate limiting, and caching) with minimal code.

### Step 1: Create the BFF Project

```bash
dotnet new web -n Web.Bff
cd Web.Bff
dotnet add package Ocelot
```

### Step 2: Configure `Program.cs`
Setting up Ocelot is quick and follows the standard middleware pattern:

```csharp
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// Add Ocelot services
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

// Use Ocelot middleware
await app.UseOcelot();

app.Run();
```

### Step 3: Configure `ocelot.json`
Define your routes in the Ocelot configuration file. This is perfect for a BFF because you can easily map client-specific paths.

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/users/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        {
          "Host": "user-service",
          "Port": 8080
        }
      ],
      "UpstreamPathTemplate": "/api/users/{everything}",
      "UpstreamHttpMethod": [ "Get" ]
    }
  ],
  "GlobalConfiguration": {
    "BaseUrl": "http://localhost:5000"
  }
}
```

---

## 4. Dockerizing the BFF

To run our BFF in a containerized environment, we need a `Dockerfile`. .NET 10 simplifies this with optimized container images.

### The `Dockerfile`
Create a `Dockerfile` in the `Web.Bff` directory:

```dockerfile
# Use the .NET 10 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Web.Bff.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

# Use the .NET 10 Runtime for running
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Web.Bff.dll"]
```

---

## 5. Orchestrating with Docker Compose

A BFF usually sits in front of several services. Let's use `docker-compose.yml` to see how they interact.

```yaml
services:
  web-bff:
    image: web-bff:latest
    build:
      context: ./Web.Bff
    ports:
      - "5000:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - product-service
      - user-service

  product-service:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    # In a real app, this would be your Product Microservice

  user-service:
    image: mcr.microsoft.com/dotnet/samples:aspnetapp
    # In a real app, this would be your User Microservice
```

### Key takeaway:
The `web-bff` service maps its internal port `8080` (standard for .NET 10 containers) to the host port `5000`. The frontend (web app) will point its API calls to `http://localhost:5000`.

---

## 6. BFF Best Practices

1.  **Don't Overcomplicate:** A BFF should be "thin." Avoid putting complex business logic in it. It's for routing, aggregation, and client-side formatting.
2.  **Use Aggregate Services:** If you need to call three services to build a single page, perform that aggregation in the BFF to save the client from multiple round trips.
3.  **Cross-Cutting Concerns:** Implement logging, rate limiting, and caching at the BFF level to ensure consistency for that specific client.

---

## Summary

The BFF pattern is a powerful architectural choice for modern .NET 10 microservices. By using YARP or Ocelot and Docker, you can create client-specific gateways that are easy to deploy, scale, and maintain, providing your frontend teams with the exact APIs they need.

---

## Further Reading & Related Posts

- [**Building an API Gateway with Ocelot in .NET 10**](/2026/03/29/ocelot-api-gateway-dotnet-10/): Learn about the more opinionated Ocelot gateway.
- [**Implementing ASP.NET Core Identity in Blazor Web Apps**](/2026/03/29/identity-blazor-web-app-dotnet-10/): Manage users and security.
- [**Resilient Blazor Web Server Apps with Polly and .NET 10**](/2026/03/29/polly-blazor-web-server-dotnet-10/): Implement modern resilience strategies.
- [**Introduction to YARP in .NET 10**](/2026/03/28/yarp-api-gateway-dotnet-10/): Deep dive into the reverse proxy used in our BFF example.
- [**Microsoft: Backend for Frontends Pattern**](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends): Official cloud design pattern guide.
