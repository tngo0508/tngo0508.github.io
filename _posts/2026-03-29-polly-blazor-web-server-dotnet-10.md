---
layout: single
title: "Resilient Blazor Web Server Apps with Polly and .NET 10"
date: 2026-03-29
show_date: true
toc: true
toc_label: "Polly & Blazor"
classes: wide
tags:
  - .NET
  - C#
  - Blazor
  - Polly
  - Resilience
  - Microservices
---

Building reliable web applications means preparing for the inevitable: networks fail, services go down, and systems become overloaded. In **Blazor Web Server**, since all code runs on the server, handling these failures gracefully is crucial. 

In this post, we'll explore how to use **Polly** (via the modern .NET 10 Resilience API) to build resilient Blazor applications.

---

## 1. Why Resilience in Blazor Web Server?

Since **Blazor Web Server** applications run on the server, they often communicate with downstream microservices, databases, or third-party APIs. If one of these dependencies is slow or unavailable, it can lead to:
*   Slow UI responsiveness.
*   Server resource exhaustion (hanging threads).
*   Poor user experience (unhandled exceptions).

**Polly** provides a way to define strategies like **Retry**, **Circuit Breaker**, and **Timeout** to handle these transient errors automatically.

---

## 2. Getting Started in .NET 10

In .NET 10, Polly is deeply integrated into the standard library through `Microsoft.Extensions.Resilience`. You no longer need to manually manage complex Polly `Policy` objects; instead, you use a builder pattern that is much more intuitive.

### Step 1: Install the Resilience NuGet Package

To get started, add the standard resilience extension for `HttpClient`:

```bash
dotnet add package Microsoft.Extensions.Http.Resilience
```

### Step 2: Configure Standard Resilience

For most applications, the **Standard Resilience Handler** is the best starting point. It combines five common strategies: **Retry**, **Circuit Breaker**, **Timeout**, **Rate Limiter**, and **Hedging**.

In `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add HttpClient with standard resilience
builder.Services.AddHttpClient("ExternalService", client =>
{
    client.BaseAddress = new Uri("http://external-api:8080");
})
.AddStandardResilienceHandler(); // Adds the 5 core strategies with sensible defaults

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();
```

---

## 3. Customizing Your Resilience Strategy

Sometimes the defaults aren't enough. You can customize the individual strategies using `AddResilienceHandler`.

### Example: Custom Retry and Circuit Breaker

```csharp
builder.Services.AddHttpClient("CustomService")
    .AddResilienceHandler("MyCustomPipeline", pipelineBuilder =>
    {
        // 1. Configure Retry
        pipelineBuilder.AddRetry(new RetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,
            Delay = TimeSpan.FromSeconds(2)
        });

        // 2. Configure Circuit Breaker
        pipelineBuilder.AddCircuitBreaker(new CircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5, // Break if 50% of requests fail
            SamplingDuration = TimeSpan.FromSeconds(10),
            MinimumThroughput = 10,
            BreakDuration = TimeSpan.FromSeconds(30)
        });

        // 3. Configure Timeout
        pipelineBuilder.AddTimeout(TimeSpan.FromSeconds(5));
    });
```

---

## 4. Using the Resilient Client in Blazor Components

Once configured, you use the `IHttpClientFactory` as usual. The resilience strategies are applied automatically.

### `Pages/Weather.razor`

```razor
@page "/weather"
@inject IHttpClientFactory ClientFactory

<h3>Weather Forecast</h3>

@if (forecasts == null)
{
    <p><em>Loading...</em></p>
}
else
{
    <!-- Display data -->
}

@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        var client = ClientFactory.CreateClient("ExternalService");
        
        try 
        {
            // This call is now protected by Retry and Circuit Breaker!
            forecasts = await client.GetFromJsonAsync<WeatherForecast[]>("weatherforecast");
        }
        catch (HttpRequestException ex)
        {
            // Handle final failure after retries
            Console.WriteLine($"API failed: {ex.Message}");
        }
    }
}
```

---

## 5. Beyond HttpClient: General Resilience Pipelines

If you need to protect code that *doesn't* use `HttpClient` (e.g., a database call), you can define a general resilience pipeline.

### Step 1: Install the Core Resilience Package

```bash
dotnet add package Microsoft.Extensions.Resilience
```

### Step 2: Register the Pipeline

```csharp
builder.Services.AddResiliencePipeline("DatabasePipeline", pipelineBuilder =>
{
    pipelineBuilder.AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 2
    });
});
```

### Step 3: Use the Pipeline in a Service

```csharp
public class DataService(ResiliencePipelineProvider<string> pipelineProvider)
{
    public async Task SaveData(string data)
    {
        var pipeline = pipelineProvider.GetPipeline("DatabasePipeline");

        await pipeline.ExecuteAsync(async token =>
        {
            // Your database logic here
            await MyDbCall(data, token);
        });
    }
}
```

---

## Summary

In .NET 10, **Polly** is the definitive way to handle transient errors and build robust systems. By using the `AddStandardResilienceHandler` for your HTTP clients and defining custom `ResiliencePipelines` for other critical logic, you ensure your **Blazor Web Server** application remains stable even when the services it depends on are not.

---

## Further Reading

*   [**Polly Official Documentation**](https://www.pollyjs.org/) (Note: Use the .NET 8/10 V8 API)
*   [**Microsoft: Resilience Strategies in .NET**](https://learn.microsoft.com/en-us/dotnet/core/resilience/)
*   [**Building an API Gateway with Ocelot and Polly**](/2026/03/29/ocelot-api-gateway-dotnet-10/)
*   [**Backend-for-Frontends (BFF) Pattern with .NET 10 and Docker**](/2026/03/29/bff-pattern-dotnet-10-docker/)
