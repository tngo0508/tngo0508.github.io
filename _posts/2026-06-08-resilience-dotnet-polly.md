---
title: "Resilience in .NET: Mastering Polly for Fault Tolerance"
excerpt: "Learn how to build resilient .NET applications using Polly. Explore strategies like Retries, Circuit Breakers, and Timeouts to handle transient failures gracefully."
date: 2026-06-08
categories:
  - .NET
  - Architecture
tags:
  - Polly
  - Resilience
  - Fault Tolerance
  - Microservices
toc: true
---

### 1. Introduction

In a distributed system, failures are inevitable. A database might be momentarily busy, or an external API might be down for a few seconds. If your application isn't prepared for these "transient failures," it will crash or provide a poor user experience. 

**Polly** is a .NET resilience and transient-fault-handling library that allows developers to express strategies such as Retry, Circuit Breaker, Timeout, and Fallback in a fluent and thread-safe manner.

---

### 2. Core Resilience Strategies

Polly provides several "policies" to handle failures.

#### 1. Retry
The most basic strategy. If an operation fails, try again.
```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
    
await retryPolicy.ExecuteAsync(() => _httpClient.GetAsync("https://api.example.com"));
```
*Note: Using "Exponential Backoff" (increasing the wait time) prevents overwhelming the failing service.*

#### 2. Circuit Breaker
If a service fails repeatedly, the "circuit opens," and all subsequent calls fail immediately for a set period. This gives the failing service time to recover.
```csharp
var circuitBreaker = Policy
    .Handle<HttpRequestException>()
    .CircuitBreakerAsync(5, TimeSpan.FromMinutes(1)); // Break after 5 failures
```

#### 3. Fallback
Provide a "plan B" if the operation fails even after retries.
```csharp
var fallback = Policy<string>
    .Handle<Exception>()
    .FallbackAsync("Default Value");
```

---

### 3. Policy Wrapping

You can combine multiple policies using `Policy.Wrap`. For example: "Retry 3 times, but only if the operation finishes within 2 seconds (Timeout)."

```csharp
var wrap = Policy.WrapAsync(retryPolicy, timeoutPolicy);
```

---

### 4. Integration with HttpClientFactory

In modern .NET apps, you don't manually wrap every call. You register Polly policies directly in your `Program.cs` using the `Microsoft.Extensions.Http.Polly` package.

```csharp
builder.Services.AddHttpClient("ExternalApi")
    .AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(3, _ => TimeSpan.FromSeconds(2)));
```

---

### 5. .NET 8 Resilience Pipelines

With .NET 8, Microsoft introduced a new way to handle resilience using the `Microsoft.Extensions.Resilience` library, which is built on top of Polly v8 but offers a more integrated experience.

```csharp
builder.Services.AddResiliencePipeline("my-pipeline", builder =>
{
    builder.AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        BackoffType = DelayBackoffType.Exponential
    });
});
```

---

### 6. Conclusion

Resilience is not an afterthought; it's a core requirement for "solid and robust products." By implementing Polly strategies, you ensure that your application doesn't just "fail hard" but instead handles the chaos of the network gracefully. 

Pick one external API in your current project and add a Retry policy today—your users (and your logs) will thank you!
