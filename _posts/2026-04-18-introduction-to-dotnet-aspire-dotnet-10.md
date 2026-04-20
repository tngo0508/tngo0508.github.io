---
layout: single
title: "Introduction to .NET Aspire in .NET 10"
date: 2026-04-18
show_date: true
toc: true
toc_label: "Inside this post"
classes: wide
categories:
  - .NET
  - Distributed Systems
tags:
  - .NET
  - C#
  - Aspire
  - Cloud
  - .NET 10
---

Building modern, distributed applications can be complex. Between managing multiple services, setting up databases, and ensuring your logs and metrics are all in one place, it’s easy to get overwhelmed. 

Enter **.NET Aspire**. Introduced to simplify the developer experience for cloud-native apps, .NET Aspire in **.NET 10** continues to make building robust, observable, and scalable systems easier than ever—even for beginners.

---

## 1. What is .NET Aspire?

At its core, **.NET Aspire** is an opinionated, cloud-ready stack for building observable, production-ready, distributed applications. It’s not just a single library; it’s a collection of tools and patterns that help you:

- **Orchestrate** multiple projects and resources (like databases or caches) during local development.
- **Connect** services easily using pre-configured NuGet packages called **Components**.
- **Observe** your system’s health and performance with built-in dashboards.

Think of it as a "starter kit" that handles the plumbing so you can focus on writing your business logic.

---

## 2. Why Use .NET Aspire?

If you’ve ever tried to run a frontend, three microservices, a Redis cache, and a SQL database all at once on your machine, you know the pain. 

**.NET Aspire solves this by providing:**

- **Simplified Local Development:** Run your entire stack with a single "F5" click in Visual Studio or `dotnet run`.
- **Automatic Service Discovery:** Your services can "find" each other without you manually managing URLs and ports.
- **Built-in Observability:** It uses OpenTelemetry by default, providing a dashboard to see logs, traces, and metrics across all your services immediately.
- **Components:** Want to add Redis? Just add a .NET Aspire component, and it handles the connection strings and health checks for you.

---

## 3. Getting Started: Prerequisites

To start using .NET Aspire with .NET 10, you'll need:

1. **.NET 10 SDK** installed on your machine.
2. **Docker Desktop** or **Podman** (for running containers like databases locally).
3. **Visual Studio 2022** (v17.12+) or **VS Code** with the C# Dev Kit.

### Installation
Open your terminal and run the following command to install the Aspire workload:

```bash
dotnet workload install aspire
```

> **Why not just install templates?** You might be used to running `dotnet new install`. However, .NET Aspire is more than just templates—it includes the dashboard and SDK components. Using the **workload** command ensures you get the full toolset required for orchestration and observability.

---

## 4. The Three Pillars of .NET Aspire

### A. The App Host (Orchestrator)
The **App Host** is a simple .NET project that acts as the "brain." It describes which projects, containers, or executable files make up your application.

### B. Service Defaults
This project contains shared configuration for all your services. It sets up common things like:
- **Health Checks:** So the system knows if a service is "up."
- **OpenTelemetry:** For logging and tracing.
- **Service Discovery:** Allowing services to talk to each other by name.

### C. Components
These are NuGet packages (e.g., `Aspire.StackExchange.Redis`) that simplify connecting to popular services. They handle the "boring" parts like retries, health checks, and logging for that specific resource.

---

## 5. A Simple Example: Healthcare API + PostgreSQL

Imagine you have a Patients API and you want to use PostgreSQL for storage. Here is how simple the **App Host** code looks in .NET 10:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

// 1. Add a PostgreSQL server
var postgres = builder.AddPostgres("pg");

// 2. Add a database for the Patients service
var patientsDb = postgres.AddDatabase("patientsdb");

// 3. Add your Patients API project and give it a reference to the database
builder.AddProject<Projects.HealthcareAspire_PatientsApi>("patientsapi")
       .WithReference(patientsDb);

builder.Build().Run();
```

With just those few lines, .NET Aspire will:
- Start a PostgreSQL container for you.
- Start your Patients API.
- Automatically provide the connection string to your API.

---

## 6. Step-by-Step: Applying Aspire to Healthcare APIs

If you have existing Patients and Appointments microservices, here is how you "Aspire-ify" your solution in .NET 10:

### Step 1: Add the Aspire Projects
You need two special projects in your solution. You can add them via Visual Studio (Add > New Project) or via CLI:
- **App Host:** The orchestrator that runs your projects.
- **Service Defaults:** A shared project that configures logging, health checks, and service discovery.

```bash
dotnet new aspire-apphost -n HealthcareAspire.AppHost
dotnet new aspire-servicedefaults -n HealthcareAspire.ServiceDefaults
```

### Step 2: Reference Your Projects
In your **App Host** project, add project references to your existing **PatientsApi** and **AppointmentsApi** projects. This tells the orchestrator that these projects are part of your system.

### Step 3: Orchestrate in the App Host
Open `AppHost.cs` (or `Program.cs`) in the **App Host** and define your services. This is where the magic happens:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

// 1. Register the Patients API
var patients = builder.AddProject<Projects.HealthcareAspire_PatientsApi>("patientsapi");

// 2. Register the Appointments API and give it a reference to the Patients API
builder.AddProject<Projects.HealthcareAspire_AppointmentsApi>("appointmentsapi")
       .WithReference(patients);

builder.Build().Run();
```

### Step 4: Use Service Defaults
In both your **Patients** and **Appointments** `Program.cs` files, add this line right after creating the builder:

```csharp
builder.AddServiceDefaults();
```
*Note: Make sure these projects also reference the **ServiceDefaults** project.*

### Step 5: Simple Service Discovery
In your Appointments API, you no longer need to worry about ports or hardcoded URLs. Just use the name you defined in the App Host:

```csharp
// In Appointments API Program.cs
builder.Services.AddHttpClient<PatientsClient>(client => 
{
    // "patientsapi" matches the name we used in Step 3!
    client.BaseAddress = new("http://patientsapi"); 
});
```

---

## 7. The Developer Dashboard

One of the coolest features for beginners is the **Aspire Dashboard**. When you run your application, it automatically opens a web page that shows:

- **Projects:** All running services and their status.
- **Containers:** Any databases or caches you’ve added.
- **Logs:** Real-time logs from *all* your services in one view.
- **Traces:** A visual map of how a request moves from your frontend to your backend services.

---

## 8. Summary

.NET Aspire takes the "guesswork" out of building modern apps. It brings together the best practices of cloud-native development into a single, easy-to-use package.

| Feature | Without Aspire | With .NET Aspire |
| :--- | :--- | :--- |
| **Service Discovery** | Manual URLs in `appsettings.json` | Automatic via Service Name |
| **Local Resources** | Manually start Docker/DBs | Orchestrated by App Host |
| **Observability** | Complex OTel setup | Ready out-of-the-box |
| **Complexity** | High (lots of "plumbing") | Low (focus on logic) |

---

## 9. Further Reading
*   [Official .NET Aspire Documentation](https://learn.microsoft.com/dotnet/aspire/)
*   [.NET Aspire GitHub Repository](https://github.com/dotnet/aspire)
*   [Introduction to Cloud-Native Apps](https://dotnet.microsoft.com/en-us/apps/cloud-native)
*   [Microservices Design Patterns in .NET (Second Edition) by Trevor Williams - Chapter 16](https://www.packtpub.com/en-us/product/microservices-design-patterns-in-net-9781837027415)
*   [Sample Healthcare Aspire Project (GitHub)](https://github.com/tngo0508/aspire-learning)

---

### Next Steps
Try creating your first Aspire project by running:
```bash
dotnet new aspire-starter -n MyFirstAspireApp
```
