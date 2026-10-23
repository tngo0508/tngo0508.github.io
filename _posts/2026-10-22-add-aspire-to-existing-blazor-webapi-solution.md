---
layout: single
title: "Adding Aspire to an Existing Blazor and Web API Solution: A Step-by-Step Guide"
date: 2026-10-22
show_date: true
toc: true
toc_label: "Aspire Setup Guide"
classes: wide
tags:
  - .NET
  - Aspire
  - Blazor
  - ASP.NET Core
  - Entity Framework
  - Developer Experience
---

You already have a working solution: a Blazor Web App, a Web API, a Data project with your `ApplicationDbContext`, and a Models project with your entities. Running it locally means opening a few terminals, starting SQL Server, copying connection strings into `appsettings.json`, and hoping every port lines up. **Aspire** fixes that. You press one button (or type one command), and everything starts in the right order with logs, traces, and health in one dashboard.

This guide walks through adding Aspire to that kind of solution, one small step at a time. Each step leaves the solution in a working state, so you can stop at any point and still be better off than before.

**In this post you'll learn:**
- What Aspire is, and what it is *not*, so you know what you're signing up for
- How to add an AppHost and ServiceDefaults to an existing solution
- How to connect your Blazor app to your API without hardcoded URLs
- How to give the AppHost a database: SQL Server in a container, or a SQL Server you already have (LocalDB, SQL Express, or a shared dev server) when Docker isn't allowed at work
- How to apply EF Core migrations automatically, handle secrets, and troubleshoot common problems

This guide targets **Aspire 13.6** and **.NET 10**, the versions current when I wrote it (October 2026). Aspire moves quickly, so check the [official docs](https://aspire.dev) if a command or API looks different for you.
{: .notice--info}

---

## 1. What Aspire Is (and What It Isn't)

Aspire is a set of tools for **building, running, and observing multi-project apps**. For an existing solution, it comes down to four pieces:

| Piece | What it is | What it does for you |
|---|---|---|
| **AppHost** | A small C# project that describes your app as code | Starts every project and container in the right order and injects connection strings and URLs |
| **ServiceDefaults** | A shared class library with one `AddServiceDefaults()` method | Turns on OpenTelemetry, health checks, service discovery, and HTTP resilience in every project |
| **Dashboard** | A web UI that opens when the AppHost runs | Shows every resource with its console logs, structured logs, traces, and metrics in one place |
| **Integrations** | NuGet packages like `Aspire.Hosting.SqlServer` | Run infrastructure (SQL Server, Redis, and so on) as containers, plus client packages with sensible defaults |

What Aspire is **not**:

- **It is not a framework you rewrite your app into.** Your Blazor app and Web API stay normal ASP.NET Core projects. You add about two lines to each `Program.cs`.
- **It is not required in production.** The AppHost is mainly a development-time orchestrator. Deploying with Aspire is optional and something you can explore later.
- **It does not replace Docker Compose for everything.** But for a .NET-centric solution, it covers most of what people use Compose for locally, in C# instead of YAML.
- **It does not require Docker.** The AppHost, the dashboard, and your projects all run as plain processes. A container runtime is only needed for resources you *choose* to run as containers, such as SQL Server or Redis. If your workplace doesn't allow Docker, skip the container and point Aspire at a database you already have (Step 5, Option B).

Here's the before and after for a typical day:

| Task | Before Aspire | With Aspire |
|---|---|---|
| Start the app | Start SQL Server, then the API, then Blazor, in separate terminals | `aspire run` (or F5 on the AppHost) |
| Point Blazor at the API | Hardcode `https://localhost:7123` in `appsettings.json` | `https+http://api`, resolved automatically |
| Connection strings | Copy into each project's `appsettings` or user secrets | Injected by the AppHost |
| Find why a request failed | Search through several console windows | Open the trace in the dashboard and follow it from Blazor to API to SQL |
| Onboard a new developer | A page of setup steps | Install the prerequisites, clone the repo, and run one command |

---

## 2. Prerequisites

You need two things installed, and a third that's optional:

1. **.NET 10 SDK.** The AppHost requires it. Your *existing* projects can keep targeting .NET 8 or later, so you don't have to upgrade them first.
2. **The Aspire CLI.** Installation steps are below.
3. **A container runtime (optional).** You only need one if you want the AppHost to run infrastructure such as SQL Server as a container (Step 5, Option A). Docker Desktop is the recommended default. Podman also works (set the `ASPIRE_CONTAINER_RUNTIME` environment variable to `podman`).

**No Docker at work?** That's common in corporate environments, and it's fine. Everything in this guide except Step 5, Option A works without a container runtime, and Option B shows how to use a SQL Server you already have (LocalDB, SQL Express, or a shared dev server). The dashboard, service discovery, telemetry, and the migration worker all work the same.
{: .notice--info}

Install the CLI with one of these commands:

```powershell
# Windows (PowerShell)
irm https://aspire.dev/install.ps1 | iex
```

```bash
# macOS / Linux
curl -sSL https://aspire.dev/install.sh | bash

# Or, on any OS, as a .NET global tool
dotnet tool install -g Aspire.Cli
```

Then check that it worked:

```bash
aspire --version
```

If nothing prints, close and reopen your terminal so it picks up the updated `PATH`.

**IDE:** Visual Studio, VS Code (with the C# and Aspire extensions), and JetBrains Rider all work. You can run the AppHost like any other startup project.

---

## 3. Where You're Starting and Where You're Going

This guide uses the following names. Replace `MyApp` with your own solution name.

```text
BEFORE                                 AFTER
MyApp.sln                              MyApp.sln
├── MyApp.Web          (Blazor)        ├── MyApp.AppHost          ← new: orchestrator
├── MyApp.Web.Client   (optional,      ├── MyApp.ServiceDefaults  ← new: shared defaults
│                      WebAssembly)    ├── MyApp.MigrationService ← new (optional): applies migrations
├── MyApp.Api          (Web API)       ├── MyApp.Web
├── MyApp.Data         (DbContext)     ├── MyApp.Web.Client
└── MyApp.Models       (entities)      ├── MyApp.Api
                                       ├── MyApp.Data
                                       └── MyApp.Models
```

And this is the runtime picture you're building toward:

```text
                    ┌──────────────────────────────┐
                    │        MyApp.AppHost         │
                    │  (describes and starts all)  │
                    └───────┬──────────┬───────────┘
            starts & wires  │          │  starts & wires
                            ▼          ▼
   ┌────────────┐  https+http://api  ┌────────────┐  ConnectionStrings:appdb  ┌────────────────┐
   │ MyApp.Web  │ ─────────────────▶ │ MyApp.Api  │ ────────────────────────▶ │ SQL Server     │
   │  (Blazor)  │                    │            │                           │ (container)    │
   └────────────┘                    └────────────┘                           └────────────────┘
         │                                 │                                          ▲
         └──────── logs, traces, metrics ──┴──────────▶  Aspire Dashboard             │
                                                                                      │
                                     MyApp.MigrationService ── runs migrations first ─┘
```

Notice what's **not** in the picture: `MyApp.Data` and `MyApp.Models`. They are class libraries and stay exactly as they are. Only projects that *run* (Web, Api, MigrationService) are part of the orchestration.

The SQL Server box is drawn as a container, but it can just as well be a SQL Server that already exists on your machine or network. The AppHost hands the API a connection string either way, and nothing else in the picture changes.

Before you start, create a branch (`git checkout -b add-aspire`) and make sure the solution builds. Every step below is small, so commit after each one.
{: .notice--warning}

---

## 4. Step 1: Add the AppHost

The **AppHost** is the heart of Aspire. It's a console project whose `AppHost.cs` lists your resources and how they connect.

### Option A: Use `aspire init` (recommended)

From the folder that contains your `.sln`:

```bash
aspire init
```

When it finds a solution file, `aspire init` creates a **project-based AppHost** (a normal `.csproj` in your solution). It also creates an `aspire.config.json` file that tells the CLI which AppHost to use. The command is interactive and asks a few questions along the way.

`aspire init` also installs an "aspireify" skill for AI coding agents. If you use an agent such as Claude Code or Copilot, you can ask it to finish the wiring for you. It's still worth doing the steps below by hand once, so you understand what it changes.

### Option B: Use the project template

If you prefer `dotnet new`:

```bash
dotnet new install Aspire.ProjectTemplates
dotnet new aspire-apphost -n MyApp.AppHost
dotnet sln add MyApp.AppHost
```

### Reference your runnable projects

The AppHost needs a project reference to every project it should start:

```bash
dotnet add MyApp.AppHost reference MyApp.Api/MyApp.Api.csproj
dotnet add MyApp.AppHost reference MyApp.Web/MyApp.Web.csproj
```

**Don't** reference `MyApp.Data` or `MyApp.Models` from the AppHost. They aren't processes. `MyApp.Api` already references them.

### Describe your app in `AppHost.cs`

Open `MyApp.AppHost/AppHost.cs` and replace its contents with:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.MyApp_Api>("api");

builder.AddProject<Projects.MyApp_Web>("web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
```

What each line does:

| Code | Meaning |
|---|---|
| `Projects.MyApp_Api` | A class generated from your project reference. Dots in the project name become underscores. |
| `"api"` | The **resource name**. It's used in the dashboard and for service discovery (`https+http://api`). Keep it short and lowercase. |
| `WithReference(api)` | Gives the Web project the API's URLs as configuration (more in Step 4). |
| `WaitFor(api)` | Doesn't start Web until the API is running and healthy. |
| `WithExternalHttpEndpoints()` | Marks Web as public-facing. This doesn't change local runs, but it matters if you deploy with Aspire later. |

Aspire still uses each project's `Properties/launchSettings.json`, so your existing ports and profiles keep working.

---

## 5. Step 2: Add ServiceDefaults

**ServiceDefaults** is a small shared project with one extension method, `AddServiceDefaults()`, that turns on the things every service should have.

If `aspire init` didn't already create it:

```bash
dotnet new aspire-servicedefaults -n MyApp.ServiceDefaults
dotnet sln add MyApp.ServiceDefaults
dotnet add MyApp.Api reference MyApp.ServiceDefaults/MyApp.ServiceDefaults.csproj
dotnet add MyApp.Web reference MyApp.ServiceDefaults/MyApp.ServiceDefaults.csproj
```

Then add two lines to `Program.cs` in **both** `MyApp.Api` and `MyApp.Web`:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();          // 1. right after creating the builder

// ... your existing service registrations ...

var app = builder.Build();

app.MapDefaultEndpoints();             // 2. before app.Run()

// ... your existing middleware and endpoints ...

app.Run();
```

What `AddServiceDefaults()` gives you:

| Feature | What it means in practice |
|---|---|
| **OpenTelemetry** | Logs, traces, and metrics flow to the dashboard. ASP.NET Core and `HttpClient` calls are traced automatically. |
| **Health checks** | `/health` (ready: all checks pass) and `/alive` (live: only checks tagged `live` must pass). |
| **Service discovery** | `HttpClient` can resolve names like `https+http://api`. |
| **Resilience** | Every `HttpClient` gets retries, timeouts, and a circuit breaker by default. |

Here's the core of the generated `Extensions.cs`, so it doesn't feel like magic:

```csharp
public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder)
    where TBuilder : IHostApplicationBuilder
{
    builder.ConfigureOpenTelemetry();
    builder.AddDefaultHealthChecks();
    builder.Services.AddServiceDiscovery();

    builder.Services.ConfigureHttpClientDefaults(http =>
    {
        http.AddStandardResilienceHandler();   // retries, timeouts, circuit breaker
        http.AddServiceDiscovery();            // resolve "https+http://api"
    });

    return builder;
}
```

**Tips:**
- **ServiceDefaults is your code.** It's a template, not a locked package, so edit it freely. Add your own trace sources, filter out noisy endpoints, or add Serilog here so every service logs the same way.
- **Health endpoints are mapped only in Development.** The template wraps them in `if (app.Environment.IsDevelopment())`, because exposing health details publicly has security implications. Leave it that way until you have a reason to change it, and [read the guidance](https://aka.ms/dotnet/aspire/healthchecks) first.
- **Keep ServiceDefaults small.** Don't put your models or helpers in it. Those belong in `MyApp.Models` or another class library.

---

## 6. Step 3: Run It and Tour the Dashboard

Make the AppHost your startup project and press F5, or from the terminal:

```bash
aspire run
```

`aspire run` builds the AppHost, starts every resource, and prints a **dashboard URL** with a login token (something like `https://localhost:17244/login?t=...`). Open it. Press Ctrl+C to stop everything.

What to look at in the dashboard:

| Page | Use it for |
|---|---|
| **Resources** | Every project and container, its state, endpoints (clickable), and environment variables |
| **Console logs** | Each resource's stdout, without juggling terminals |
| **Structured logs** | Searchable and filterable logs with properties (for example, show all `Warning`+ logs from `api`) |
| **Traces** | One request followed across Web → API → database, with timings |
| **Metrics** | Request rates, durations, GC, and more, per resource |

At this point you already have one-command startup, ordered startup, and full observability. If you stopped here, your development environment would already be better.

Useful CLI commands for later:

```bash
aspire run --detach     # run in the background
aspire start            # same idea: start detached, return when it's stable
aspire ps               # list running AppHosts
aspire logs             # read logs from a detached AppHost
aspire stop             # stop a detached AppHost
aspire run --isolated   # random ports + isolated secrets (run two copies side by side)
```

By default `aspire run` doesn't watch files. After changing **`AppHost.cs`**, stop and start it again. Changes to your Blazor or API code follow your normal hot reload and rebuild workflow.
{: .notice--info}

---

## 7. Step 4: Connect Blazor to the API with Service Discovery

Right now your Blazor app probably has something like this:

```json
// MyApp.Web/appsettings.Development.json  (BEFORE)
{
  "ApiBaseUrl": "https://localhost:7123"
}
```

With Aspire, the AppHost already gave the Web project the API's address through `WithReference(api)`. Under the hood, it sets environment variables like `services__api__https__0` (for the `https` endpoint of the resource named `api`), and service discovery reads them.

So in `MyApp.Web/Program.cs`, register a typed `HttpClient` that uses the **resource name** instead of a URL:

```csharp
builder.Services.AddHttpClient<TodoApiClient>(client =>
{
    // "https+http" means: prefer https, fall back to http.
    // "api" must match the resource name in AppHost.cs.
    client.BaseAddress = new Uri("https+http://api");
});
```

And a minimal typed client:

```csharp
public class TodoApiClient(HttpClient httpClient)
{
    public async Task<TodoItem[]> GetTodosAsync(CancellationToken ct = default) =>
        await httpClient.GetFromJsonAsync<TodoItem[]>("/api/todos", ct) ?? [];
}
```

`TodoItem` can come straight from `MyApp.Models`. Then delete `ApiBaseUrl` from your settings, or keep it as a fallback (see the tip below).

### A note on Interactive WebAssembly (`MyApp.Web.Client`)

This trips up a lot of people. Code in a Blazor Web App runs in **two places**:

| Where the code runs | Can use `https+http://api`? | Why |
|---|---|---|
| Server (`MyApp.Web`: SSR, Interactive Server, prerendering) | ✅ Yes | It runs in a .NET process that the AppHost started and configured |
| Browser (`MyApp.Web.Client`: Interactive WebAssembly) | ❌ Not directly | It runs in the user's browser, which doesn't have the AppHost's environment variables |

If your `.Client` project calls the API, here are your options, simplest first:

1. **Call the API from the server.** Keep API calls in `MyApp.Web` (Interactive Server components, or services used during prerendering).
2. **Use a backend-for-frontend (BFF).** Add small endpoints in `MyApp.Web` that the WebAssembly code calls on the *same origin*, and have those endpoints call the API with the service-discovery `HttpClient`. This also keeps API tokens off the browser.
3. **Look at `Aspire.Hosting.Blazor`.** Aspire has a newer integration (`AddBlazorWasmProject`, `AddBlazorGateway`) for hosting WebAssembly apps behind a gateway. It's a **prerelease** package whose APIs may change, and its docs focus on standalone WebAssembly apps, so treat it as something to evaluate, not the default.

**Tip: keep the project runnable without Aspire.** Service discovery also reads normal configuration. If a teammate runs `MyApp.Web` on its own, you can add a fallback to `appsettings.Development.json` with the same key shape Aspire uses:

```json
{
  "Services": {
    "api": {
      "https": [ "https://localhost:7123" ]
    }
  }
}
```

---

## 8. Step 5: Give the AppHost a Database

Right now your API still reads a connection string from its own `appsettings.json`. The goal of this step is to have the **AppHost** own that connection string and inject it into the API as `ConnectionStrings:appdb`. There are two ways to get there. Pick the one that fits your environment:

| | Option A: SQL Server in a container | Option B: A SQL Server you already have |
|---|---|---|
| **Needs Docker or Podman** | Yes | No |
| **Good for** | Personal projects, and teams that already use containers | Workplaces that don't allow Docker, or that already run a shared dev SQL Server |
| **Who starts and stops the server** | The AppHost | You, your IT team, or Windows (as a service) |
| **Password** | Generated and stored in user secrets | Windows authentication, or whatever your server uses |
| **What the API receives** | `ConnectionStrings:appdb` | `ConnectionStrings:appdb` (identical) |

Everything after this step (the EF Core client package, the migration worker, parameters) is the same for both options, because your projects only ever see the injected connection string.

### Option A: Run SQL Server in a container

Stop installing SQL Server on every machine and let the AppHost run it in a container. This is the path the official templates assume.

Add the hosting integration to the AppHost (run this from the solution folder):

```bash
aspire add sql-server
```

That adds the `Aspire.Hosting.SqlServer` package to the AppHost. Then update `AppHost.cs`:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var sql = builder.AddSqlServer("sql")
    .WithLifetime(ContainerLifetime.Persistent)   // keep the container between runs
    .WithDataVolume();                            // keep the data between runs

var db = sql.AddDatabase("appdb");                // the name is the connection-string key

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.AddProject<Projects.MyApp_Web>("web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
```

What you get:

- **Container image:** Aspire pulls `mcr.microsoft.com/mssql/server:2022-latest` and starts it. The first run takes a while, because the image is large.
- **Generated password:** a strong `sa` password is generated and stored in the AppHost's user secrets (`sql-password`). No password lives in your repo.
- **Created database:** the `appdb` database is created once the server is ready.
- **Injected connection string:** the API receives `ConnectionStrings__appdb` (which is `ConnectionStrings:appdb` in .NET configuration).
- **Health check:** the API waits until SQL Server actually accepts connections.

**Why `Persistent` and `WithDataVolume()`?** The SQL Server container is slow to start, so a persistent lifetime keeps it running between `aspire run` sessions. The data volume keeps your data even if the container is recreated. One catch: the password is stored inside the volume, so if you change the password later, you must delete the volume.
{: .notice--warning}

### Option B: Use a SQL Server you already have (no Docker)

Many workplaces don't allow Docker Desktop on developer machines. That's fine. Aspire only needs a container runtime for *container resources*, so leave `AddSqlServer` out and point the AppHost at an existing server instead. The AppHost, the dashboard, service discovery, telemetry, and the migration worker all work exactly the same.

You need a SQL Server you can reach from your machine. The usual choices:

| Choice | Connection string | Notes |
|---|---|---|
| **SQL Server LocalDB** | `Server=(localdb)\MSSQLLocalDB;Database=appdb;Trusted_Connection=True;TrustServerCertificate=True` | Comes with Visual Studio (the *Data storage and processing* workload) or the SQL Server Express installer. Per-user, zero admin, Windows only. Run `sqllocaldb info` to see if you already have it. |
| **SQL Server Express or Developer edition** | `Server=localhost\SQLEXPRESS;Database=appdb;Trusted_Connection=True;TrustServerCertificate=True` | Free, runs as a Windows service. Developer edition's default instance is just `Server=localhost`. |
| **A shared dev server** | `Server=devsql.corp.local;Database=MyApp_dev_<yourname>;Trusted_Connection=True;TrustServerCertificate=True` | Whatever your team already uses. Give each developer their own database name so migrations don't collide. |
| **Azure SQL** | From the Azure portal | Works the same way. Keep the password in user secrets (see below). |

No `aspire add` is needed for this option, because `AddConnectionString` is built into the core `Aspire.Hosting` package. Update `AppHost.cs`:

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var db = builder.AddConnectionString("appdb");    // the name is still the connection-string key

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db)
    .WaitFor(db);

builder.AddProject<Projects.MyApp_Web>("web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
```

Then give the AppHost the actual value. It reads it from its **own** configuration under `ConnectionStrings:appdb`:

- **Windows authentication (no password in the string):** it's safe to commit, so put it in `MyApp.AppHost/appsettings.Development.json`. Every developer with LocalDB gets the same value and has nothing to configure. Note the doubled backslash, because this is JSON:

  ```json
  {
    "ConnectionStrings": {
      "appdb": "Server=(localdb)\\MSSQLLocalDB;Database=appdb;Trusted_Connection=True;TrustServerCertificate=True"
    }
  }
  ```

- **SQL authentication (has a password):** keep it out of the repo with user secrets:

  ```bash
  dotnet user-secrets set "ConnectionStrings:appdb" "Server=devsql.corp.local;Database=MyApp_dev;User Id=<USER>;Password=<PASSWORD>;TrustServerCertificate=True" --project MyApp.AppHost
  ```

What you get:

- **Injected connection string:** the API receives `ConnectionStrings__appdb`, exactly as with Option A. The API code doesn't know or care which option you picked.
- **A resource in the dashboard:** `appdb` appears on the Resources page as a connection string resource, so you can confirm what was injected.
- **No image pull and no slow first start.** The server is already running.
- **The database is created on first migration.** EF Core's `MigrateAsync()` creates `appdb` if it doesn't exist, so an empty LocalDB instance is enough. Step 7 covers this.

**What you give up:** Aspire doesn't start, stop, or health-check a server it doesn't own. If the server is down, you'll find out from the API's EF Core health check (`/health`) or the migration worker's console logs instead of from the `appdb` resource itself.
{: .notice--info}

### Supporting both on one team

If some teammates have Docker and others don't, let a configuration switch decide. Both branches produce a resource with a connection string, so nothing else in the AppHost changes:

```csharp
var useContainer = builder.Configuration.GetValue("UseSqlContainer", false);

IResourceBuilder<IResourceWithConnectionString> db = useContainer
    ? builder.AddSqlServer("sql")
             .WithLifetime(ContainerLifetime.Persistent)
             .WithDataVolume()
             .AddDatabase("appdb")
    : builder.AddConnectionString("appdb");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db)
    .WaitFor(db);
```

Developers who want the container set `UseSqlContainer` to `true` in their AppHost user secrets (`dotnet user-secrets set "UseSqlContainer" "true" --project MyApp.AppHost`). Everyone else gets Option B by default. The `Aspire.Hosting.SqlServer` package still has to be referenced by the AppHost for the code to compile, but the package itself doesn't need Docker. Only a running container does.

---

## 9. Step 6: Wire `ApplicationDbContext` to the Database

Your `ApplicationDbContext` lives in `MyApp.Data`, but it's **registered** in `MyApp.Api`. So the Aspire *client* package goes into the API project:

```bash
dotnet add MyApp.Api package Aspire.Microsoft.EntityFrameworkCore.SqlServer
```

You have two ways to register the context. Pick one.

### Option A: Let Aspire register it (simplest)

```csharp
// MyApp.Api/Program.cs
builder.AddSqlServerDbContext<ApplicationDbContext>("appdb");
```

The name `"appdb"` **must match** the resource name in the AppHost: `AddDatabase("appdb")` if you chose Step 5, Option A, or `AddConnectionString("appdb")` if you chose Step 5, Option B. On top of registering the context, this adds:

- **Retries:** transient-failure retries (6 attempts by default).
- **Health check:** a database health check (it calls `CanConnectAsync`) that feeds `/health`.
- **Telemetry:** OpenTelemetry tracing and metrics for EF Core, so every SQL query appears in the dashboard traces.

### Option B: Keep your existing registration and enrich it

If you already have an `AddDbContext` call with custom options (interceptors, a migrations assembly, special SQL options), keep it and add Aspire's extras on top:

```csharp
// MyApp.Api/Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("appdb")
            ?? throw new InvalidOperationException("Connection string 'appdb' not found."),
        sql => sql.MigrationsAssembly("MyApp.Data")));

builder.EnrichSqlServerDbContext<ApplicationDbContext>();
```

**Which should I choose?** If your current registration is a plain `UseSqlServer(...)`, use Option A. If it has custom configuration you want to keep, use Option B. Option B is also the gentler change for an existing codebase, because it doesn't touch your current setup.

**Does your Blazor app use the DbContext too?** Blazor Web App templates with Individual Accounts use EF Core for ASP.NET Core Identity. If `MyApp.Web` also uses `ApplicationDbContext`, add `.WithReference(db).WaitFor(db)` to the `web` resource as well, and register the context in `MyApp.Web` the same way.
{: .notice--info}

---

## 10. Step 7: Apply EF Core Migrations Automatically

A fresh SQL Server container, or an empty LocalDB instance, has no schema yet. You need your migrations applied before the API starts. Here are three ways, from simplest to most automated:

| Approach | How | Good for |
|---|---|---|
| **A. Manual** | Copy the connection string from the dashboard (Resources → `api` → environment variables) and run `dotnet ef database update --connection "<connection string>"` | Getting started, small projects |
| **B. Migration worker** (official pattern) | A small worker project that runs `MigrateAsync()`, and the API waits for it to finish | Most teams. Automatic, explicit, and easy to debug |
| **C. `Aspire.Hosting.EntityFrameworkCore`** | `AddEFMigrations(...)` with `RunDatabaseUpdateOnStart()` in the AppHost, plus dashboard commands such as Update Database | Trying the newest tooling. Check the package's current status first, because its earlier releases were previews |

I recommend **B**. Here's how.

### Create the worker

```bash
dotnet new worker -n MyApp.MigrationService
dotnet sln add MyApp.MigrationService
dotnet add MyApp.MigrationService reference MyApp.Data/MyApp.Data.csproj
dotnet add MyApp.MigrationService reference MyApp.ServiceDefaults/MyApp.ServiceDefaults.csproj
dotnet add MyApp.MigrationService package Aspire.Microsoft.EntityFrameworkCore.SqlServer
dotnet add MyApp.AppHost reference MyApp.MigrationService/MyApp.MigrationService.csproj
```

`MyApp.MigrationService/Program.cs`:

```csharp
using MyApp.Data;
using MyApp.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddHostedService<Worker>();
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Worker.ActivitySourceName));

builder.AddSqlServerDbContext<ApplicationDbContext>("appdb");

builder.Build().Run();
```

`MyApp.MigrationService/Worker.cs`:

```csharp
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;

namespace MyApp.MigrationService;

public class Worker(
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostApplicationLifetime) : BackgroundService
{
    public const string ActivitySourceName = "Migrations";
    private static readonly ActivitySource s_activitySource = new(ActivitySourceName);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var activity = s_activitySource.StartActivity("Migrating database", ActivityKind.Client);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Run inside the execution strategy so transient SQL errors are retried.
            var strategy = dbContext.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(() => dbContext.Database.MigrateAsync(stoppingToken));
        }
        catch (Exception ex)
        {
            activity?.AddException(ex);
            throw;
        }

        // Done: stop the worker so the AppHost sees it as "finished".
        hostApplicationLifetime.StopApplication();
    }
}
```

### Wire it in the AppHost

```csharp
var migrations = builder.AddProject<Projects.MyApp_MigrationService>("migrations")
    .WithReference(db)
    .WaitFor(db);

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db)
    .WaitFor(db)
    .WaitForCompletion(migrations);   // don't start the API until migrations have finished
```

Now every `aspire run` starts SQL Server (Option A), applies any pending migrations, and only then starts the API. The migration also shows up as a span in the dashboard's Traces page.

This works unchanged with Option B. The worker receives the same `ConnectionStrings:appdb`, and `MigrateAsync()` creates the `appdb` database on LocalDB or your dev server if it doesn't exist yet, then applies the migrations. The only difference is that nobody has to start SQL Server first, because it's already running.

### Creating new migrations (`dotnet ef migrations add`)

Adding a migration doesn't connect to a database, but the EF tools still need to **build** your `ApplicationDbContext`. Outside the AppHost, there's no injected connection string. The most reliable fix is a design-time factory in `MyApp.Data` (add the `Microsoft.EntityFrameworkCore.Design` package to `MyApp.Data` if it isn't there):

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MyApp.Data;

// Used only by the dotnet-ef tools at design time. Never at runtime.
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=localhost;Database=DesignTimeOnly;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;

        return new ApplicationDbContext(options);
    }
}
```

The connection string here is a placeholder: `migrations add` never opens it. Then:

```bash
dotnet ef migrations add AddPriorityToTodo --project MyApp.Data
```

Then run `aspire run`, and the worker applies the new migration.

---

## 11. Step 8: Secrets and Parameters

Your API probably needs other secrets too, such as an email API key or a payment key. Instead of putting them in every project's user secrets, declare them **once** in the AppHost as parameters:

```csharp
var emailApiKey = builder.AddParameter("email-api-key", secret: true);

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db)
    .WaitFor(db)
    .WithEnvironment("Email__ApiKey", emailApiKey);   // becomes Email:ApiKey in the API's config
```

Where the value comes from:

- **Local:** the AppHost's configuration under `Parameters`, ideally its user secrets:
  ```bash
  dotnet user-secrets set "Parameters:email-api-key" "<YOUR_API_KEY>" --project MyApp.AppHost
  ```
- **CI:** an environment variable `Parameters__email-api-key`.
- **Missing value:** the dashboard shows **Unresolved parameters** with an **Enter values** button, and can save what you type to user secrets. That's very convenient for a new teammate.

Your API code doesn't change. It still reads `builder.Configuration["Email:ApiKey"]` or binds an options class.

---

## 12. Everyday Tips

- **Commit the AppHost, ServiceDefaults, MigrationService, and `aspire.config.json`.** They're part of your dev environment, so the whole team gets the same setup.
- **Never commit secrets.** Parameters and generated passwords live in user secrets, outside the repo.
- **Use resource names consistently.** `api`, `web`, `sql`, `appdb`. The connection-string key and the service-discovery host both come from these names, and a typo here causes most "not found" errors.
- **Keep projects runnable on their own** with fallback values in `appsettings.Development.json`. It helps when you need to debug one project in isolation.
- **Add one resource at a time.** Get the dashboard working first, then service discovery, then SQL Server, then migrations. Each step is easy to verify on its own.
- **Want Redis, RabbitMQ, or a local email server next?** Same pattern: `aspire add <integration>`, one `Add...` line in the AppHost, and `WithReference` on the consumer.
- **Test against the real thing.** The `Aspire.Hosting.Testing` package lets an integration test start your *whole* AppHost (including SQL Server) with `DistributedApplicationTestingBuilder.CreateAsync<Projects.MyApp_AppHost>()`. See the testing docs linked below.

---

## 13. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| SQL Server resource stuck or failing to start (Option A) | Docker isn't running | Start Docker Desktop (or Podman), then run again |
| Container resource fails and you can't install Docker | The AppHost still calls `AddSqlServer` | Switch to `AddConnectionString` (Step 5, Option B), or use the `UseSqlContainer` switch so it defaults to off |
| `A network-related or instance-specific error` with `(localdb)\MSSQLLocalDB` (Option B) | LocalDB isn't installed, or the instance is stopped | Run `sqllocaldb info`, then `sqllocaldb start MSSQLLocalDB`. If `sqllocaldb` isn't found, install LocalDB from the SQL Server Express installer or the Visual Studio installer |
| `Login failed for user` against a shared dev server (Option B) | Wrong credentials, or the string in the AppHost's config isn't being picked up | Check `dotnet user-secrets list --project MyApp.AppHost`, and confirm the key is `ConnectionStrings:appdb` |
| `Connection string 'appdb' not found` | Name mismatch, or the project is missing `WithReference(db)` | Make `AddDatabase("appdb")`, `AddSqlServerDbContext(..., "appdb")`, and `GetConnectionString("appdb")` all match |
| Blazor gets `No such host` / can't resolve `https+http://api` | Running Web outside the AppHost, the resource name doesn't match, or the call runs in WebAssembly | Run through the AppHost, check the resource name, and see the WebAssembly section |
| Login failures after changing the SQL password (Option A) | The old password is stored in the data volume | Delete the volume (Docker Desktop → Volumes) and run again |
| The first run is very slow | Pulling the SQL Server image | Wait it out once; the persistent lifetime makes later runs fast |
| HTTPS certificate warnings | The development certificate isn't trusted | Run `dotnet dev-certs https --trust` |
| API never starts, waits forever | The migration worker failed | Open the `migrations` resource's console logs in the dashboard; the exception is there |
| Port already in use | Another copy is running, or `launchSettings.json` uses a busy port | `aspire ps` / `aspire stop`, or `aspire run --isolated` |

---

## 14. Recap

- **AppHost** describes your solution as code. Only *runnable* projects (Web, Api, workers) go in it. `Data` and `Models` stay plain class libraries.
- **ServiceDefaults** gives every service telemetry, health checks, service discovery, and resilience with two lines in `Program.cs`.
- **`WithReference` + `WaitFor`** replace hardcoded URLs, copied connection strings, and "start this first" instructions.
- **The AppHost owns the database connection.** Either it runs SQL Server in a container with a generated password (Option A), or it hands out a connection string for a server you already have, with no Docker involved (Option B). Your `ApplicationDbContext` connects by name (`appdb`) either way.
- **A migration worker** with `WaitForCompletion` makes sure the database schema is ready before the API starts.
- **The WebAssembly caveat:** code running in the browser can't use service discovery directly, so call the API from the server or through a BFF endpoint.

If you want to see Aspire in a real project, I wrote about how I used it in my Personal Finance app in [Part 4: .NET Aspire and Observability]({% post_url 2026-10-4-pf-04-dotnet-aspire-and-observability %}), including a few mistakes I made along the way.

---

## 15. References and Further Reading

**Getting started**
- [Aspire documentation home](https://aspire.dev)
- [Prerequisites](https://aspire.dev/get-started/prerequisites/)
- [Install the Aspire CLI](https://aspire.dev/get-started/install-cli/)
- [Add Aspire to an existing app](https://aspire.dev/get-started/add-aspire-existing-app/)
- [The AppHost](https://aspire.dev/get-started/app-host/)
- [Service defaults](https://aspire.dev/get-started/csharp-service-defaults/)

**Core concepts**
- [Service discovery](https://aspire.dev/fundamentals/service-discovery/)
- [External parameters and secrets](https://aspire.dev/fundamentals/external-parameters/)
- [Health checks](https://aspire.dev/fundamentals/health-checks/)
- [Health check security guidance](https://aka.ms/dotnet/aspire/healthchecks)
- [Dashboard overview](https://aspire.dev/dashboard/overview/)

**CLI reference**
- [`aspire run`](https://aspire.dev/reference/cli/commands/aspire-run/)
- [`aspire start`](https://aspire.dev/reference/cli/commands/aspire-start/)
- [`aspire add`](https://aspire.dev/reference/cli/commands/aspire-add/)

**Databases and EF Core**
- [Set up SQL Server in the AppHost](https://aspire.dev/integrations/databases/sql-server/sql-server-host/) (includes *Connect to an existing SQL Server instance*)
- [SQL Server Express LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb)
- [Connect to SQL Server with EF Core](https://aspire.dev/integrations/databases/efcore/sql-server/sql-server-connect/)
- [Apply EF Core migrations in Aspire](https://aspire.dev/integrations/databases/efcore/migrations/)
- [Database migrations sample](https://aspire.dev/reference/samples/database-migrations/)

**Blazor**
- [Connect Blazor apps and APIs](https://aspire.dev/integrations/dotnet/blazor-connect/)
- [Set up Blazor hosting in the AppHost (prerelease)](https://aspire.dev/integrations/dotnet/blazor-hosting/)

**Testing and deployment (next steps)**
- [Testing overview](https://aspire.dev/testing/overview/)
- [Deployment overview](https://aspire.dev/deployment/overview/)

**Source and samples**
- [Aspire on GitHub](https://github.com/microsoft/aspire)
- [Aspire samples](https://github.com/microsoft/aspire-samples)

Questions, or stuck on a step? Leave a comment below and I'll do my best to help.
