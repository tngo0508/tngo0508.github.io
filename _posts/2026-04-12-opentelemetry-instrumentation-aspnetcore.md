---
layout: single
title: "Part 21: Unlocking Insights: Mastering OpenTelemetry.Instrumentation.AspNetCore in .NET"
date: 2026-04-12
show_date: true
toc: true
toc_label: "OpenTelemetry in ASP.NET Core"
classes: wide
tags:
  - .NET
  - OpenTelemetry
  - ASP.NET Core
  - Distributed Tracing
  - Monitoring
  - .NET 10
---

OpenTelemetry (OTel) has become the industry standard for observability, and if you're building applications with ASP.NET Core, `OpenTelemetry.Instrumentation.AspNetCore` is your gateway to understanding how your services behave in production.

This instrumentation library automatically collects telemetry data from incoming HTTP requests, giving you deep visibility into performance, errors, and request flows without requiring you to manually wrap every controller action in a "try-catch-log" block.

---

## 1. Why Use OpenTelemetry?

Before we dive into the "how," let's talk about the "why." Traditional logging tells you *what* happened, but **Distributed Tracing** (powered by OpenTelemetry) tells you *where* it happened across your entire system.

By using `OpenTelemetry.Instrumentation.AspNetCore`, you get:
- **Automatic Request Tracking:** Every incoming HTTP request is automatically timed and recorded.
- **Standardized Metadata:** Captures HTTP methods, status codes, and target URLs out of the box.
- **Context Propagation:** Seamlessly connects traces across microservices.

---

## 2. Getting Started: Installation

To begin, you'll need to install the core OpenTelemetry packages and the ASP.NET Core instrumentation library.

```bash
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
dotnet add package OpenTelemetry.Exporter.Console
```

- **OpenTelemetry.Extensions.Hosting**: Provides the integration with the .NET Dependency Injection (DI) system.
- **OpenTelemetry.Instrumentation.AspNetCore**: The "magic" that hooks into the ASP.NET Core pipeline.
- **OpenTelemetry.Exporter.Console**: A simple exporter to see your traces in the terminal during development.

---

## 3. Basic Configuration

In your `Program.cs`, you can set up OpenTelemetry in just a few lines of code.

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("MyAwesomeApi"))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation() // <-- The magic happens here
        .AddConsoleExporter());

var app = builder.Build();

app.MapGet("/", () => "Hello, OpenTelemetry!");

app.Run();
```

With this setup, every time someone hits your API, a **Span** (a single operation in a trace) will be printed to your console, containing details like the duration, HTTP method, and status code.

---

## 4. Customizing Instrumentation

The default settings are great, but real-world apps often need more control. You can configure the instrumentation using `AspNetCoreInstrumentationOptions`.

### Filtering Requests
You probably don't want to trace every single health check or heartbeat request. You can filter them out easily:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation(options =>
        {
            options.Filter = (httpContext) =>
            {
                // Exclude health checks from being traced
                return !httpContext.Request.Path.Value!.Contains("/health");
            };
        }));
```

### Enriching Traces with Custom Data
Want to include the user's ID or a specific header in your trace? Use the `EnrichWithHttpRequest` callback:

```csharp
options.EnrichWithHttpRequest = (activity, request) =>
{
    activity.SetTag("http.client_ip", request.HttpContext.Connection.RemoteIpAddress);
    
    if (request.Headers.ContainsKey("X-Correlation-ID"))
    {
        activity.SetTag("correlation.id", request.Headers["X-Correlation-ID"].ToString());
    }
};
```

---

## 5. Capturing Errors and Exceptions

By default, OpenTelemetry captures the HTTP status code. If you want to include the full exception details (including stack traces) in your spans, enable `RecordException`:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation(options =>
        {
            options.RecordException = true;
        }));
```

When an unhandled exception occurs, the span will be marked as **Error**, and the exception details will be attached as "Events" to the activity, making it much easier to debug production issues.

---

## 6. Advanced: Changing Span Names

Sometimes the default span name (which is usually the Route Template) isn't descriptive enough. You can modify the activity name as it begins:

```csharp
options.EnrichWithHttpRequest = (activity, request) =>
{
    // Example: Rename the span to include the host
    activity.DisplayName = $"{request.Method} {request.Host}{request.Path}";
};
```

---

## 7. Where Does the Data Go? (Exporters)

The Console Exporter is great for testing, but in production, you'll want to send this data to a visualization tool like **Jaeger**, **Honeycomb**, or **Azure Monitor**.

The most common way to do this is via the **OTLP (OpenTelemetry Protocol)**:

```bash
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

Then update your configuration:

```csharp
.WithTracing(tracing => tracing
    .AddAspNetCoreInstrumentation()
    .AddOtlpExporter(opt =>
    {
        opt.Endpoint = new Uri("http://localhost:4317");
    }));
```

---

## 8. Summary of Options

| Option | Purpose | Default |
| :--- | :--- | :--- |
| **Filter** | Decide which requests to ignore | Trace everything |
| **EnrichWithHttpRequest** | Add custom tags from the Request | - |
| **EnrichWithHttpResponse** | Add custom tags from the Response | - |
| **RecordException** | Include stack traces on failure | `false` |

---

## 9. Conclusion

`OpenTelemetry.Instrumentation.AspNetCore` is an essential component for any modern .NET application. It takes care of the "heavy lifting" of observability, allowing you to focus on building features while ensuring you have the data you need when things go wrong.

---

## 10. References & Further Reading
* [OpenTelemetry .NET Documentation](https://opentelemetry.io/docs/instrumentation/net/getting-started/)
* [GitHub: OpenTelemetry .NET](https://github.com/open-telemetry/opentelemetry-dotnet)
* [NuGet: OpenTelemetry.Instrumentation.AspNetCore](https://www.nuget.org/packages/OpenTelemetry.Instrumentation.AspNetCore)
