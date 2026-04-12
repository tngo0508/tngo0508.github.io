---
layout: single
title: "Part 22: Visualizing Distributed Tracing: A Guide to Jaeger"
date: 2026-04-12
show_date: true
toc: true
toc_label: "Mastering Jaeger"
classes: wide
tags:
  - .NET
  - OpenTelemetry
  - Jaeger
  - Distributed Tracing
  - Monitoring
---

In the previous post, we explored how to use `OpenTelemetry.Instrumentation.AspNetCore` to automatically capture telemetry data in .NET. While seeing traces in the console is useful for development, it's not practical for understanding complex, distributed systems.

This is where **Jaeger** comes in. In this post, we'll dive into what Jaeger is, why it's the preferred choice for many developers, and how to get it running locally to visualize your traces.

---

## 1. What is Jaeger?

**Jaeger** is an open-source, end-to-end distributed tracing system originally developed by **Uber**. It was built to monitor and troubleshoot complex microservice architectures, and it is now a graduated project under the **Cloud Native Computing Foundation (CNCF)**.

Think of OpenTelemetry as the "collector" and "shipper" of your data, and Jaeger as the "storage" and "viewer."

### Key Features:
- **Distributed Context Propagation:** Tracks a request as it moves through multiple services.
- **Distributed Transaction Monitoring:** Visualizes the entire path and timing of a request.
- **Root Cause Analysis:** Quickly identifies which service is causing a delay or error.
- **Service Dependency Analysis:** Automatically builds a map of how your services interact.
- **Performance / Latency Optimization:** Pinpoints bottlenecks in your request flow.

---

## 2. Why Jaeger and OpenTelemetry?

OpenTelemetry (OTel) and Jaeger are a match made in heaven. OTel provides a standardized way to instrument your code, while Jaeger provides a standardized way to store and query those traces.

In modern OTel architectures, your application sends data via the **OTLP (OpenTelemetry Protocol)**. Jaeger has built-in support for OTLP, making integration seamless.

---

## 3. Core Components of Jaeger

To understand how Jaeger works, it's helpful to know its architecture (though for local development, you'll use the "all-in-one" version):

1.  **Jaeger Agent:** A network daemon that listens for spans sent over UDP and routes them to the collector.
2.  **Jaeger Collector:** Receives spans from agents or directly from applications (via OTLP), runs them through a processing pipeline, and stores them in a backend.
3.  **Storage Backend:** Where the data lives (e.g., Elasticsearch, Cassandra, or Badger).
4.  **Jaeger Query (UI):** The web interface used to search and visualize traces.

---

## 4. Running Jaeger Locally

The easiest way to get started is by using the **Jaeger All-In-One** Docker image. This image includes the collector, query UI, and an in-memory storage backend in a single container.

Run the following command in your terminal:

```bash
docker run --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

- **Port 16686:** The Jaeger UI (open this in your browser: `http://localhost:16686`).
- **Port 4317:** OTLP gRPC receiver (where your .NET app will send data).
- **Port 4318:** OTLP HTTP receiver.

---

## 5. Connecting Your .NET Application

Recalling our configuration from Part 21, we can easily point our ASP.NET Core application to our local Jaeger instance using the OTLP exporter.

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter(opt =>
        {
            // Point to the Jaeger OTLP gRPC endpoint
            opt.Endpoint = new Uri("http://localhost:4317");
        }));
```

Once you run your app and hit a few endpoints, you'll be able to see those traces in the Jaeger UI.

---

## 6. Exploring the Jaeger UI

Open `http://localhost:16686` and you'll see a powerful dashboard:

### Search
You can search for traces by service name, operation, tags (like `http.status_code=500`), and duration.

### Trace Timeline
When you click on a trace, you see a "Gantt chart" style view. Each bar is a **Span**, representing a specific unit of work. You can see:
- Exactly how long each part of the request took.
- Where errors occurred (highlighted in red).
- Metadata and custom tags you added during enrichment.

### Service Graph (Dependencies)
Jaeger can generate a map showing how your services call each other. This is invaluable for understanding the topology of a large microservice system.

---

## 7. Conclusion

Jaeger is the "eyes" of your distributed system. By combining it with OpenTelemetry, you gain deep visibility into your application's behavior, making it significantly easier to debug performance issues and understand complex interactions.

---

## 8. References & Further Reading
* [Jaeger Official Documentation](https://www.jaegertracing.io/docs/latest/)
* [OpenTelemetry OTLP Exporter](https://opentelemetry.io/docs/instrumentation/net/exporters/#otlp)
* [GitHub: Jaeger Tracing](https://github.com/jaegertracing/jaeger)
