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

### Step 2: Configure Standard Resilience (with IHttpClientFactory)

The .NET 10 resilience extensions are built directly on top of `IHttpClientFactory`. This is the recommended way to manage `HttpClient` instances because it handles handler rotation and prevents socket exhaustion.

For most applications, the **Standard Resilience Handler** is the best starting point. It provides a pre-configured pipeline of five core strategies: **Rate Limiter**, **Total Request Timeout**, **Retry**, **Circuit Breaker**, and **Attempt Timeout**.

In `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Register a Named Client with Resilience
builder.Services.AddHttpClient("ExternalService", client =>
{
    client.BaseAddress = new Uri("http://external-api:8080");
})
.AddStandardResilienceHandler(); // Adds the 5 core strategies with sensible defaults

// 2. Register a Typed Client with Resilience (Recommended)
builder.Services.AddHttpClient<WeatherApiClient>(client =>
{
    client.BaseAddress = new Uri("http://weather-api:8080");
})
.AddStandardResilienceHandler();

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();
```

### Why use `IHttpClientFactory`?

When you use `AddHttpClient`, you are using the `IHttpClientFactory` pattern. Adding `.AddStandardResilienceHandler()` to that registration ensures that every time the factory creates a client, it is already wrapped with your Polly strategies. 

Benefits include:
*   **Centralized Configuration:** Define your resilience logic once in `Program.cs`.
*   **Automatic Lifecycle Management:** The factory manages the underlying `HttpMessageHandler` chain, including the resilience handlers.
*   **Named or Typed Clients:** Use strings or specific classes to inject your resilient clients.

### What does `AddStandardResilienceHandler` do?

When you call this method, Polly (via Microsoft's extensions) wraps your `HttpClient` in a resilience pipeline. The order of these strategies is critical as it determines how they interact:

1.  **Rate Limiter (Outermost)**: This is the first line of defense. It controls how many concurrent requests are allowed to pass through the pipeline.
2.  **Total Request Timeout**: This sets a hard limit on the *entire* duration of the request, encompassing all retries and any delays between them.
3.  **Retry**: If a request fails (e.g., a 503 Service Unavailable or a network error), this strategy will attempt to re-send the request. By default, it uses **exponential backoff with jitter** to avoid slamming the downstream service.
4.  **Circuit Breaker**: If the retry strategy still can't get a successful response and failures reach a certain threshold, the circuit breaker "opens." While open, all requests fail immediately without even trying to call the downstream service, giving it time to recover.
5.  **Attempt Timeout (Innermost)**: This limits the time allowed for a *single* HTTP request attempt. If one attempt is slow, it times out so that the **Retry** strategy can try again sooner.

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

Once configured, you can inject the client into your Blazor components. Whether you use **Named Clients** or **Typed Clients**, the resilience strategies are applied automatically.

### Option A: Using a Named Client

```razor
@page "/weather-named"
@inject IHttpClientFactory ClientFactory

<h3>Weather Forecast (Named Client)</h3>

@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        // The factory creates a client already wrapped with Polly!
        var client = ClientFactory.CreateClient("ExternalService");
        
        try 
        {
            forecasts = await client.GetFromJsonAsync<WeatherForecast[]>("weatherforecast");
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"API failed: {ex.Message}");
        }
    }
}
```

### Option B: Using a Typed Client (Cleaner)

Typed clients are often preferred in Blazor as they encapsulate the API logic and provide a cleaner injection experience.

```csharp
// The Typed Client class
public class WeatherApiClient(HttpClient httpClient)
{
    public async Task<WeatherForecast[]> GetWeatherAsync() 
        => await httpClient.GetFromJsonAsync<WeatherForecast[]>("weatherforecast") ?? [];
}
```

```razor
@page "/weather-typed"
@inject WeatherApiClient WeatherApi

<h3>Weather Forecast (Typed Client)</h3>

@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        try 
        {
            // The injected WeatherApiClient already has the resilience pipeline!
            forecasts = await WeatherApi.GetWeatherAsync();
        }
        catch (HttpRequestException)
        {
            // Handle error
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
*   [**Implementing ASP.NET Core Identity in Blazor Web Apps**](/2026/03/29/identity-blazor-web-app-dotnet-10/)
*   [**Backend-for-Frontends (BFF) Pattern with .NET 10 and Docker**](/2026/03/29/bff-pattern-dotnet-10-docker/)
