---
title: "Staying Free: Throttling Google Geocoding API with C# .NET 10"
excerpt: "Learn how to control your API usage and stay within the Google Geocoding free tier using SemaphoreSlim in C# .NET 10."
date: 2026-06-03
categories:
  - C#
  - API
tags:
  - C#
  - .NET 10
  - Google Maps
  - Geocoding
  - SemaphoreSlim
  - Throttling
toc: true
toc_label: "In this post"
---

### 1. Introduction: The Cost of Speed

Google Geocoding API is a powerful tool that turns addresses (like "1600 Amphitheatre Parkway, Mountain View, CA") into geographic coordinates (Latitude: 37.423021, Longitude: -122.083739).

Google offers a **Free Tier** (often through monthly credits), but if your program runs too fast and makes thousands of requests in a few seconds, you might:
1.  **Get Charged:** Exceed your free credits and owe money.
2.  **Get Blocked:** Receive "429 Too Many Requests" errors.

In this post, we will learn how to use `SemaphoreSlim` to act as a "Bouncer" for your API calls, ensuring you stay within your limits.

#### Vocabulary & Key Terms
- **Geocoding:** Converting an address into map coordinates.
- **Rate Limit:** The maximum number of requests allowed in a specific time (e.g., 50 requests per second).
- **Free Tier:** A level of service that costs $0 as long as you stay below a certain limit.
- **Overbilling:** When you are charged more than you expected because you used too much of a service.
- **Quota:** The total amount of something you are allowed to use.

### 2. Understanding the Google Geocoding Free Tier

Google usually provides a $200 monthly credit for Google Maps Platform. This covers approximately 40,000 geocoding requests per month for free.

To stay safe, you want to:
- **Limit Concurrency:** Don't start 100 requests at the exact same time.
- **Limit Total Speed:** Ensure your app doesn't burn through the 40,000 requests in one day.

### 3. The Solution: Using SemaphoreSlim as a Speed Controller

As we learned in our previous post, `SemaphoreSlim` is perfect for limiting how many tasks run at once. For Google API, we can set a small limit (like 2 or 3) to make sure we don't look like a "bot" attacking their servers.

#### The "Bouncer" Analogy for APIs
Imagine the Google API is a small office with only **one** clerk. 
- If 100 people (Tasks) rush in at once, the clerk gets angry and closes the office (Error 429).
- The `SemaphoreSlim` (Bouncer) makes people wait in a line and only lets **one or two** people in at a time.

### 4. Practical Code Example

Here is how you can wrap your Google API calls to keep them under control.

```csharp
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

public class GoogleGeocodingService
{
    // Use a Semaphore to allow only 2 concurrent API calls.
    private static readonly SemaphoreSlim _bouncer = new SemaphoreSlim(2);
    private readonly HttpClient _httpClient;

    public GoogleGeocodingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> GetCoordinatesAsync(string address, string apiKey)
    {
        // 1. Wait for your turn in line
        await _bouncer.WaitAsync();

        try
        {
            Console.WriteLine($"[Requesting] {address}...");
            
            // 2. Make the actual API call
            string url = $"https://maps.googleapis.com/maps/api/geocode/json?address={Uri.EscapeDataString(address)}&key={apiKey}";
            
            // This is the real call to the internet
            var response = await _httpClient.GetStringAsync(url);
            
            return "Data for " + address;
        }
        finally
        {
            // 3. Always leave the spot so the next task can start
            _bouncer.Release();
        }
    }
}
```

### 5. How to Run This and Stay Safe

To test this without getting charged, follow these steps:

1.  **Set a Budget Alert:** Go to your [Google Cloud Console](https://console.cloud.google.com/) and set a budget alert at $1. Google will email you if you start spending money.
2.  **API Key Restrictions:** Restrict your API key to only "Geocoding API" and only your IP address.
3.  **Run the Demo:**

Create a new console app and add the required package:
```bash
dotnet new console -n GoogleApiDemo
cd GoogleApiDemo
dotnet add package Microsoft.Extensions.Http
```

Replace `Program.cs` with this full example:
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

// 1. Setup Dependency Injection and HttpClientFactory
// In modern .NET, we use this to manage our HttpClients safely
var serviceProvider = new ServiceCollection()
    .AddHttpClient()
    .BuildServiceProvider();

var httpClientFactory = serviceProvider.GetRequiredService<IHttpClientFactory>();
var httpClient = httpClientFactory.CreateClient();

// 2. Create the service
var service = new GoogleGeocodingService(httpClient);
string myApiKey = "YOUR_API_KEY_HERE"; 
var addresses = new List<string> { "London", "Paris", "Tokyo", "New York", "Sydney" };

Console.WriteLine("Starting controlled API calls...");

// 3. Run all tasks in parallel, but the Bouncer will slow them down
var tasks = addresses.Select(addr => service.GetCoordinatesAsync(addr, myApiKey)).ToList();
await Task.WhenAll(tasks);

Console.WriteLine("All requests finished safely.");

public class GoogleGeocodingService
{
    // Limit to 1 call at a time to be very safe on the free tier
    private static readonly SemaphoreSlim _bouncer = new SemaphoreSlim(1);
    private readonly HttpClient _httpClient;

    public GoogleGeocodingService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task GetCoordinatesAsync(string address, string apiKey)
    {
        await _bouncer.WaitAsync();
        try
        {
            Console.WriteLine($"[Bouncer] Letting {address} through...");
            
            // In a real app, you would use the real URL. 
            // We use a delay here to show how the bouncer works.
            await Task.Delay(1000); 
            
            Console.WriteLine($"[Done] Received data for {address}");
        }
        finally
        {
            _bouncer.Release();
        }
    }
}
```

### 6. Advantages and Disadvantages of this Approach

While this "Bouncer" method is great for staying free, here are some things to keep in mind:

**Advantages:**
- **Safety:** You won't accidentally spend $500 in one hour because of a bug in your code.
- **Reliability:** Google won't block your IP for "spamming" requests.

**Disadvantages:**
- **Speed:** Your program will take longer to finish. For example, processing 1,000 addresses at 1 per second will take 16 minutes.
- **Local Only:** If you run this program on **two different computers**, each one will have its own bouncer. Together, they might go over the limit!

### 7. Summary
- **Don't Rush:** Parallelism is great, but external APIs have limits.
- **Use the Bouncer:** Use `SemaphoreSlim(1)` or `SemaphoreSlim(2)` to keep your request rate low.
- **Protect your Wallet:** Throttling is the best way to ensure a "free" service stays free.

### 8. References
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [Google Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding/overview)
- [Managing API Quotas (Google Cloud)](https://cloud.google.com/docs/quota)
