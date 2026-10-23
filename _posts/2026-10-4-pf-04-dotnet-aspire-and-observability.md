---
layout: single
title: "Building a Personal Finance App, Part 4: .NET Aspire and Observability"
date: 2026-10-4
show_date: true
toc: true
toc_label: "Aspire and Observability"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - .NET Aspire
  - OpenTelemetry
  - Observability
  - Serilog
  - ASP.NET Core
---

By the end of Part 3 the app had two processes: `PersonalFinance.Web` (the MVC front end) and `PersonalFinance.ApiService` (the REST API it calls). Running them, wiring them together, and figuring out *why* a request failed was all manual. In this part I add .NET Aspire to orchestrate both apps locally, and a shared "service defaults" library that gives both of them telemetry, health checks, and HTTP resilience in one line of code. I also cover how secrets and logging were set up, and follow the thread forward through two Aspire upgrades.

**In this post you'll learn:**

- What an Aspire **AppHost** and **ServiceDefaults** project are, and what each one is for
- How to add OpenTelemetry traces, metrics, and logs to two ASP.NET Core apps with one extension method
- The difference between the `/health` and `/alive` endpoints, and why the template only maps them in Development
- How to keep API keys out of Git with .NET User Secrets, and the precedence trap I hit
- How non-blocking logging with `Serilog.Sinks.Async` works, and a "double resilience" bug I shipped

---

## The Problem

Before Aspire, the setup looked like this:

- I had to start two projects by hand, in the right order.
- `PersonalFinance.Web` called the API through a [Refit](https://github.com/reactiveui/refit) client with a hard-coded base URL (`https://localhost:7100`).
- Each project mapped its own `/health` endpoint and configured its own HTTP retry policy, copied by hand.
- Logs were the only window into what happened. When the Web app showed "something went wrong", I had to match timestamps across two consoles to find the API error behind it.
- API keys for Brevo (email) and Google Drive needed a home that wasn't `appsettings.json`.

What I wanted: one command to start everything, one place to define cross-cutting behavior, and a dashboard where I could click on a failed request and see both sides of it.

---

## Step 1: The AppHost

**.NET Aspire** is a set of tools and libraries for building apps made of several services. The piece you run is the **AppHost**: a small console project that describes your services and how they depend on each other. When you run it, Aspire starts every project, injects the URLs they need to find each other, and opens a dashboard.

This was the whole AppHost in commit `a3b4935`, and it is still the whole AppHost today (`PersonalFinance/src/PersonalFinance.AppHost/AppHost.cs`):

```csharp
var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.PersonalFinance_ApiService>("apiservice");

builder.AddProject<Projects.PersonalFinance_Web>("web")
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
```

Two things to notice:

- `WithReference(apiService)` tells Aspire to give the Web project the API's address, under the name `apiservice`.
- `WaitFor(apiService)` makes Web start only after the API is up.

```text
dotnet run --project PersonalFinance/src/PersonalFinance.AppHost
              |
              v
     +------------------+        starts + injects config
     |     AppHost      |-------------------------------+
     |  (orchestrator)  |                               |
     +--------+---------+                               |
              | starts first                            v
              v                                +--------------+
     +------------------+   https+http://      |     Web      |
     |    ApiService    |<---- apiservice -----|  (MVC + UI)  |
     +--------+---------+                      +------+-------+
              |                                       |
              +---------- OTLP telemetry -------------+
                               |
                               v
                     +--------------------+
                     |  Aspire dashboard  |
                     | traces/metrics/logs|
                     +--------------------+
```

On the Web side, the Refit client's base URL changed from a localhost port to a **service discovery** name:

```csharp
// PersonalFinance.Web/Program.cs (a3b4935)
var apiBaseUrl = builder.Configuration["ApiSettings:BaseUrl"] ?? "https+http://apiservice";
```

`https+http://apiservice` means "look up the service called `apiservice`, and prefer HTTPS if it has an HTTPS endpoint, otherwise use HTTP." The AppHost supplies the real address at runtime. I kept an `ApiSettings:BaseUrl` override so the app can still run without Aspire (more on that in the gotchas).

The AppHost is **local only**. In Azure, the Bicep templates from [Part 5]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %}) set the same configuration keys instead.

---

## Step 2: ServiceDefaults, One Line for Cross-Cutting Concerns

The second project, `PersonalFinance.ServiceDefaults`, is a class library that both apps reference. It exposes one extension method, `AddServiceDefaults()`, that turns on everything a well-behaved service should have. This is the core of `PersonalFinance/src/PersonalFinance.ServiceDefaults/Extensions.cs`:

```csharp
public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
{
    builder.ConfigureOpenTelemetry();

    builder.AddDefaultHealthChecks();

    builder.Services.AddServiceDiscovery();

    builder.Services.ConfigureHttpClientDefaults(http =>
    {
        // Turn on resilience by default
        http.AddStandardResilienceHandler();

        // Turn on service discovery by default
        http.AddServiceDiscovery();
    });

    return builder;
}
```

Each app then needs just two lines in `Program.cs`:

```csharp
builder.AddServiceDefaults();   // before building the app
// ...
app.MapDefaultEndpoints();      // maps /health and /alive
```

Here is what each piece gives you:

| Piece | What it does |
|---|---|
| `ConfigureOpenTelemetry()` | Collects traces, metrics, and logs and exports them over OTLP |
| `AddDefaultHealthChecks()` | Registers a basic "I am running" check tagged `live` |
| `AddServiceDiscovery()` | Resolves names like `https+http://apiservice` to real addresses |
| `ConfigureHttpClientDefaults(...)` | Applies retry, timeout, and circuit breaker to **every** `HttpClient` the app creates |
| `MapDefaultEndpoints()` | Exposes `/health` and `/alive` |

The point of `ConfigureHttpClientDefaults` is that you don't add resilience per client. Every `HttpClient` from `IHttpClientFactory` (including Refit clients) gets it automatically. Remember that sentence; I forgot it a week later.

---

## Step 3: OpenTelemetry

**OpenTelemetry** (OTel) is a vendor-neutral standard for telemetry. It has three signals:

- **Traces**: the path of one request through your services, made of timed "spans"
- **Metrics**: numbers over time (request rate, duration, GC, thread pool)
- **Logs**: your normal log messages, linked to the trace they happened in

Here is the trimmed `ConfigureOpenTelemetry()` method. Look at the tracing filter at the bottom:

```csharp
builder.Logging.AddOpenTelemetry(logging =>
{
    logging.IncludeFormattedMessage = true;
    logging.IncludeScopes = true;
});

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation();
    })
    .WithTracing(tracing =>
    {
        tracing.AddSource(builder.Environment.ApplicationName)
            .AddAspNetCoreInstrumentation(tracing =>
                // Exclude health check requests from tracing
                tracing.Filter = context =>
                    !context.Request.Path.StartsWithSegments(HealthEndpointPath)
                    && !context.Request.Path.StartsWithSegments(AlivenessEndpointPath)
            )
            .AddHttpClientInstrumentation();
    });
```

The filter matters. Health probes hit the app every few seconds. Without the filter, the trace list fills up with `/alive` requests and the real ones are hard to find.

Exporting is conditional:

```csharp
var useOtlpExporter = !string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

if (useOtlpExporter)
{
    builder.Services.AddOpenTelemetry().UseOtlpExporter();
}
```

The AppHost sets `OTEL_EXPORTER_OTLP_ENDPOINT` for each project it starts, so telemetry flows to the dashboard. When I run a project on its own, the variable is missing and nothing is exported. No config switch needed.

The payoff: when Web calls the API, `AddHttpClientInstrumentation()` on the Web side and `AddAspNetCoreInstrumentation()` on the API side produce spans that share one trace ID. In the dashboard, one click shows the Web request, the outgoing Refit call, and the API handler as a single timeline.

---

## Step 4: Health Checks, `/health` vs `/alive`

`AddDefaultHealthChecks()` registers one check, `self`, which always returns healthy and is tagged `live`:

```csharp
builder.Services.AddHealthChecks()
    // Add a default liveness check to ensure app is responsive
    .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);
```

`MapDefaultEndpoints()` exposes it in two ways:

```csharp
// All health checks must pass for app to be considered ready to accept traffic after starting
app.MapHealthChecks(HealthEndpointPath);

// Only health checks tagged with the "live" tag must pass for app to be considered alive
app.MapHealthChecks(AlivenessEndpointPath, new HealthCheckOptions
{
    Predicate = r => r.Tags.Contains("live")
});
```

| Endpoint | Runs | Question it answers | Used for |
|---|---|---|---|
| `/alive` | Only checks tagged `live` | "Is the process running and responsive?" | Liveness and startup probes |
| `/health` | Every registered check | "Is the app ready for traffic?" | Readiness probe, smoke tests |

If you later add a database check without the `live` tag, it affects `/health` but not `/alive`. That way a slow database makes the app "not ready" (stop sending traffic) instead of "dead" (restart the container). Both apps replaced their hand-written `app.MapHealthChecks("/health")` with this.

---

## Step 5: ProblemDetails for Errors

On the same day I enabled `ProblemDetails` (commit `2b7fc65`). **ProblemDetails** is the standard JSON shape for HTTP errors from RFC 7807. Instead of an HTML error page or an empty 500, clients get a JSON body with `type`, `title`, `status`, and `traceId`.

```csharp
// PersonalFinance.Web/Program.cs
builder.Services.AddProblemDetails();
// ...
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();   // was: app.UseExceptionHandler("/Home/Error")
    app.UseHsts();
}
```

The ApiService has the same `AddProblemDetails()` plus `app.UseExceptionHandler()`. With telemetry in place, the `traceId` in an error response is the same ID you can search for in the dashboard.

---

## Step 6: Secrets with .NET User Secrets

The same commit moved the Brevo and Google keys out of config files and into **.NET User Secrets**: a per-project JSON file stored in your user profile, outside the repository. It is for development only; production secrets come from environment variables (see Part 5).

Setting up a new machine is a handful of commands (from `docs/DEVELOPMENT.md`, with placeholders):

```bash
dotnet user-secrets set "Brevo:ApiKey" "<YOUR_BREVO_API_KEY>" --project PersonalFinance/src/PersonalFinance.Web
dotnet user-secrets set "Authentication:Google:ClientId" "<YOUR_GOOGLE_CLIENT_ID>" --project PersonalFinance/src/PersonalFinance.Web
dotnet user-secrets set "Authentication:Google:ClientSecret" "<YOUR_GOOGLE_CLIENT_SECRET>" --project PersonalFinance/src/PersonalFinance.Web
dotnet user-secrets set "GoogleDrive:ApiKey" "<YOUR_GOOGLE_DRIVE_API_KEY>" --project PersonalFinance/src/PersonalFinance.ApiService

# Check what is set
dotnet user-secrets list --project PersonalFinance/src/PersonalFinance.ApiService
```

The key names use `:` for nesting, so `Brevo:ApiKey` binds to the `ApiKey` property of the `Brevo` section, exactly as if it were in `appsettings.json`. In a container the same key is the environment variable `Brevo__ApiKey` (double underscore). The code reads configuration the same way everywhere.

On 2026-10-17 I added an explicit `AddUserSecrets<Program>()` call (`e112be8`) and a much longer secrets section in the docs (`4cba001`). The explicit call turned out to be a mistake; see the gotchas.

---

## Step 7: Non-Blocking Logging with Serilog.Async

Both apps log with **Serilog**. On 2026-10-10 (`c8aa286`) I wrapped the console sink in `Serilog.Sinks.Async`. By default, a log call writes to the console on the request thread. The async sink puts log events on a background queue instead, so a slow console (common in containers) doesn't slow down requests.

The diff was small. Look at `WriteTo.Async(...)` and `writeToProviders: true`:

```csharp
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Async(a => a.Console(
        theme: AnsiConsoleTheme.Code,
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")),
    writeToProviders: true);
```

`writeToProviders: true` matters more than it looks. When Serilog replaces the default logging pipeline, other `ILoggerProvider`s (like the OpenTelemetry one from `AddServiceDefaults()`) stop getting log events. This flag forwards Serilog's events to them too, so logs show up in the Aspire dashboard next to their traces.

The same commit:

- Raised `Microsoft.EntityFrameworkCore.Database.Command` from `Information` to `Warning` in `appsettings.json`, so every SQL statement no longer hits the log.
- Added a `logRetentionInDays` parameter (default 30) to the Bicep templates for the Azure Log Analytics workspace.

Later (`b9d5591`, 2026-10-21) the duplicated setup in both `Program.cs` files moved into `PersonalFinance.ServiceDefaults/LoggingExtensions.cs`. It now also writes a daily rolling file with a 30-file limit:

```csharp
.WriteTo.Async(a => a.File(
    path: Path.Combine("logs", $"{logFilePrefix}-.log"),
    rollingInterval: RollingInterval.Day,
    retainedFileCountLimit: 30,
    outputTemplate: FileTemplate,
    formatProvider: CultureInfo.CurrentCulture)),
```

`Program.cs` now just calls `builder.AddAppLogging(logFilePrefix: "apiservice")`.

---

## Step 8: Resilience for Google Drive Calls

On 2026-10-11 (`40c8768`) I improved what happens when the Web app loads a user's Google Drive connections and the API is slow, down, or returns an error. Before, every failure ended in one generic message. The change had two parts. First, `GoogleDriveController` now tells the two kinds of failure apart and shows a friendly message for each:

```csharp
catch (Refit.ApiException apiEx)
{
    _logger.LogError(apiEx, "ApiService returned HTTP {StatusCode} while loading Google Drive connections for user {UserId}", apiEx.StatusCode, userId);
    model.ErrorMessage = "Unable to load your Google Drive connections. Please try again in a moment.";
}
catch (HttpRequestException httpEx)
{
    _logger.LogWarning(httpEx, "Unable to reach ApiService while loading Google Drive connections for user {UserId}", userId);
    model.ErrorMessage = "The service is temporarily unavailable. Please try again in a moment.";
}
```

- `Refit.ApiException`: the API answered, but with an error status code.
- `HttpRequestException`: the API could not be reached at all.

Second, it added `.AddStandardResilienceHandler()` to the Google Drive Refit client. The catch blocks were a good change. The resilience handler was not, and I explain why below.

---

## Step 9: Keeping Aspire Up to Date

Two upgrades are worth recording:

| Commit | Date | Change | Why |
|---|---|---|---|
| `c4f6d14` | 2026-10-12 | Aspire AppHost SDK and `Aspire.Hosting.AppHost` 9.1.0 -> 13.6.1 | Catch up to the current major version |
| `068dc35` | 2026-10-22 | 13.6.1 -> 13.6.3 | Remove a vulnerable transitive `MessagePack` |

The version lives in two places, and both must move together: the `<Sdk>` element in the AppHost `.csproj`, and the package version in `Directory.Packages.props` (central package management).

```xml
<!-- PersonalFinance.AppHost.csproj -->
<Sdk Name="Aspire.AppHost.Sdk" Version="13.6.3" />

<!-- Directory.Packages.props -->
<PackageVersion Include="Aspire.Hosting.AppHost" Version="13.6.3" />
```

The 13.6.3 bump came from a NuGet audit warning (`NU1902`) for advisory `GHSA-qhrr-8q5h-9q3h` in `MessagePack`, which Aspire pulls in indirectly. After the patch upgrade, `MessagePack` resolved to 2.5.307 and the warning cleared. No manual pin was needed. Separately, `db7ff0d` suppressed the `ASPIRE010` warning in the AppHost project with `<NoWarn>`.

---

## Gotchas and Lessons Learned

**1. The dashboard wouldn't start because of misnamed environment variables.** The first AppHost `launchSettings.json` used non-standard names (the docs mention `ASPIRE_DASHBOARD_OTLP_ENDPOINT_URL` as an example). Startup failed with:

```text
System.AggregateException: Failed to configure dashboard resource because DOTNET_DASHBOARD_OTLP_ENDPOINT_URL and DOTNET_DASHBOARD_OTLP_HTTP_ENDPOINT_URL environment variables are not set.
```

The fix, in the same commit, was to use `DOTNET_DASHBOARD_OTLP_ENDPOINT_URL` and `DOTNET_RESOURCE_SERVICE_ENDPOINT_URL`. Lesson: copy launch settings from a fresh `dotnet new aspire` template instead of typing them.

**2. The template only maps health endpoints in Development.** The generated `MapDefaultEndpoints()` wraps both `MapHealthChecks` calls in `if (app.Environment.IsDevelopment())`, with a comment about security. That's a fine default, but Azure Container Apps probes need `/health` and `/alive` in Production. The deployment commit (`34a6077`) removed the `if`, and a test (`MapDefaultEndpoints_MapsHealthEndpoints_InAllEnvironments`) now guards it. These endpoints only report "Healthy"/"Unhealthy", so exposing them was an acceptable trade-off here. Decide this on purpose, not by accident.

**3. I added resilience twice.** `40c8768` put `.AddStandardResilienceHandler()` on the Google Drive client, and the pattern got copied to every new Refit client. But `ConfigureHttpClientDefaults` in ServiceDefaults had already added one to every `HttpClient`. Each client ended up with two stacked pipelines: retries inside retries, and two sets of timeouts. The refactor in `b9d5591` removed them, and the commit message says it plainly: *"Refit clients no longer add a second standard resilience handler on top of the one AddServiceDefaults() applies to every HttpClient."* Lesson: when a library applies something globally, write that down where the next person (or AI agent) adding a client will see it. The new `InternalApiClientExtensions` has a doc comment saying exactly that.

**4. An explicit `AddUserSecrets` call broke configuration precedence.** `e112be8` added `builder.Configuration.AddUserSecrets<Program>(...)` in Development. `WebApplication.CreateBuilder` already loads user secrets in Development, *before* environment variables. Adding them again put them *after* environment variables, so a secret silently won over an env var like `ConnectionStrings__DefaultConnection=InMemory:Dev`. `b9d5591` dropped the call. The intended order, lowest to highest priority, is:

```text
appsettings.json
  -> appsettings.{Environment}.json
    -> user secrets (Development only)
      -> environment variables
        -> command-line arguments   (wins)
```

**5. `https+http://apiservice` only resolves under the AppHost.** If you run the Web project on its own, nothing provides the `apiservice` address and every API call fails. The fix is to set `ApiSettings__BaseUrl=http://localhost:5100` on the Web app. It's documented, but it surprised me more than once.

**6. Transitive vulnerabilities come from packages you never referenced.** The `MessagePack` warning came from Aspire's own dependencies. Upgrading the parent package (a patch release) was cleaner than pinning the transitive one.

---

## Recap

- An Aspire **AppHost** starts both apps with one command, wires service discovery, and gives you a dashboard. It is local-only; Bicep replaces it in Azure.
- A **ServiceDefaults** library adds OpenTelemetry, health checks, service discovery, and HTTP resilience to every service through `AddServiceDefaults()` and `MapDefaultEndpoints()`.
- `/alive` answers "is the process running?" and `/health` answers "is it ready?". Container probes need both in Production.
- **User Secrets** keep keys out of Git locally. Let `CreateBuilder` load them, so environment variables still win.
- `Serilog.Sinks.Async` keeps logging off the request path, and `writeToProviders: true` keeps logs flowing to OpenTelemetry.
- Resilience applied globally should not be applied again per client.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 3: Identity, Email Confirmation, and Google Sign-In]({% post_url 2026-10-3-pf-03-identity-email-and-google-sign-in %}) · Next: [Part 5: Deploying to Azure Container Apps]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
