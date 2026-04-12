---
layout: single
title: "Part 23: Advanced OpenTelemetry: Distributed Tracing with HttpClient and SQL Client"
date: 2026-04-12
show_date: true
toc: true
toc_label: "Advanced OpenTelemetry"
classes: wide
tags:
  - .NET
  - OpenTelemetry
  - HttpClient
  - SQL Server
  - Distributed Tracing
  - .NET 10
---

In previous posts, we've seen how to instrument ASP.NET Core to track incoming requests and how to visualize those traces in Jaeger. However, a real-world application doesn't live in a vacuum. It talks to other APIs via `HttpClient` and databases via `SqlClient`.

To get a complete picture of your system's performance, you need to bridge these gaps. In this post, we'll explore how to automatically instrument outgoing HTTP calls and SQL queries to achieve true **Distributed Tracing**.

---

## 1. Why Instrument External Calls?

If you only instrument your web API, you'll know *that* a request was slow, but you won't know *why*. Was it because a downstream microservice took 2 seconds to respond? Or was it a complex SQL query that blocked the thread?

By adding `HttpClient` and `SqlClient` instrumentation, you gain:
- **Dependency Tracking:** See exactly which external services your app calls.
- **Latency Attribution:** Break down request time into "local processing" vs. "waiting for dependencies."
- **SQL Query Insights:** Automatically capture SQL command text (optional) and database server details.
- **Distributed Context Propagation:** Link traces across multiple microservices.

---

## 2. Installation

You'll need to add the following NuGet packages to your project:

```bash
dotnet add package OpenTelemetry.Instrumentation.Http
dotnet add package OpenTelemetry.Instrumentation.SqlClient
```

---

## 3. Configuration in .NET 10

Just like with ASP.NET Core, the configuration is handled in `Program.cs` during service registration.

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation() // <-- Instrument outgoing HTTP calls
        .AddSqlClientInstrumentation(options => // <-- Instrument SQL queries
        {
            options.SetDbStatementForText = true; // Capture the SQL command text
            options.RecordException = true;       // Record SQL exceptions as events
        })
        .AddOtlpExporter());
```

### Important: SQL Statement Capture
By default, `SetDbStatementForText` is `false` for security reasons (to avoid logging sensitive data in queries). Enable it only if you're sure your queries don't contain PII, or use it primarily in development/staging environments.

---

## 4. How Distributed Tracing Works

The magic of `HttpClient` instrumentation lies in **Context Propagation**. When your app makes an outgoing call using an instrumented `HttpClient`, OpenTelemetry automatically injects a `traceparent` header into the request.

If the downstream service is also instrumented with OpenTelemetry, it will:
1.  Read the `traceparent` header.
2.  Start its own spans as children of the incoming trace.
3.  Report those spans back to the same collector (like Jaeger).

The result is a single, unified trace that spans multiple processes and even different servers.

---

## 5. Advanced: Customizing HttpClient Instrumentation

You can filter outgoing requests or enrich them with custom tags.

```csharp
.AddHttpClientInstrumentation(options =>
{
    // Filter out calls to specific domains (e.g., telemetry endpoints)
    options.FilterHttpRequestMessage = (req) =>
    {
        return !req.RequestUri!.Host.Contains("telemetry.example.com");
    };

    // Enrich the span with custom data from the request
    options.EnrichWithHttpRequestMessage = (activity, req) =>
    {
        activity.SetTag("custom.header", req.Headers.Contains("X-Custom") ? "Present" : "Missing");
    };
})
```

---

## 6. Visualizing the Full Trace

Once configured, a single request in Jaeger might look like this:

1.  **Span 1 (api-gateway):** `GET /orders/123` (Start)
2.  **Span 2 (api-gateway):** `GET http://inventory-service/items/123` (Child of Span 1)
3.  **Span 3 (inventory-service):** `GET /items/123` (Child of Span 2 - Linked via Header)
4.  **Span 4 (inventory-service):** `SELECT * FROM Items WHERE Id = 123` (Child of Span 3 - SQL Client)

This "waterfall" view makes it instantly obvious if the bottleneck is the network call or the database query.

---

## 7. Summary

Instrumenting `HttpClient` and `SqlClient` is non-negotiable for any distributed system. It transforms "blind" logging into a surgical tool for performance optimization and debugging.

| Instrumentor | Purpose | Key Metadata Captured |
| :--- | :--- | :--- |
| **Http** | Outgoing API calls | URL, Method, Status Code, Duration |
| **SqlClient** | Database queries | SQL Text, Server, Instance, Errors |

---

## 8. Conclusion

By combining ASP.NET Core, HttpClient, and SQL Client instrumentation, you have completed the "Big Three" of .NET observability. You now have the power to track a request from the moment it hits your server until it returns a response, no matter how many services or databases it touches along the way.

---

## 9. References & Further Reading
* [OpenTelemetry HTTP Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Instrumentation.Http)
* [OpenTelemetry SQL Client Instrumentation](https://github.com/open-telemetry/opentelemetry-dotnet/tree/main/src/OpenTelemetry.Instrumentation.SqlClient)
* [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
