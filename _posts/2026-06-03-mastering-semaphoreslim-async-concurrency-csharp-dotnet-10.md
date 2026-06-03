---
title: "Mastering SemaphoreSlim for Async Concurrency in C# .NET 10"
excerpt: "Learn how to use SemaphoreSlim to throttle parallel asynchronous operations in C# .NET 10, preventing resource exhaustion and improving application stability."
date: 2026-06-03
categories:
  - C#
  - Programming
tags:
  - C#
  - .NET 10
  - Concurrency
  - Async
  - SemaphoreSlim
toc: true
toc_label: "In this post"
---

### 1. Introduction to SemaphoreSlim

When working with asynchronous programming in C#, you often want to run multiple tasks at the same time (in parallel) to improve performance. However, starting 1,000 API calls or database queries at once can overwhelm the system. This can lead to errors or trigger rate limits.

This is where `SemaphoreSlim` comes in. It is a tool that limits how many tasks can access a resource at the same time.

#### Vocabulary & Key Terms
If English is not your first language, here are some important words used in this post:
- **Throttling:** Controlling the speed or number of operations to prevent a system from becoming too busy.
- **Concurrent:** Happening at the same time.
- **Resource Exhaustion:** When a computer runs out of memory, CPU, or connections because it is doing too much at once.
- **Bouncer:** A security guard at a nightclub entrance who controls how many people go inside.
- **Primitive:** In programming, a basic building block or a simple tool.

### 2. Why use SemaphoreSlim with Async?

Unlike the `lock` statement, which stops you from using `await`, `SemaphoreSlim` provides a `WaitAsync()` method. This makes it the perfect tool for "throttling" (limiting) asynchronous operations.

#### Visualization: The Nightclub Analogy

Think of it as a nightclub with a maximum capacity:

```text
       QUEUE (WaitAsync)             INSIDE (Capacity: 3)         LEAVING (Release)
    -----------------------       -----------------------       -----------------------
    [Task 5] -> [Task 4] -> | BOUNCER | [Task 1] [Task 2] | ->  [Task 0] (Just Left)
                            | (SSlim) | [Task 3]          |
    -----------------------  ---------  -----------------------       -----------------------
                                 ^
                                 |
                          Only 3 slots!
```

- **The Semaphore (Bouncer):** Controls the entrance.
- **Initial Count (Capacity):** How many tasks are allowed inside simultaneously.
- **WaitAsync (The Line):** Tasks wait here until the bouncer lets them in.
- **Release (The Exit):** When a task finishes and leaves, it notifies the bouncer to let the next one in.

### 3. Basic Usage Pattern

The most critical part of using `SemaphoreSlim` is ensuring that the semaphore is always released, even if an exception occurs. This is why we always use a `try...finally` block.

```csharp
// Allow only 3 concurrent operations
private static SemaphoreSlim _semaphore = new SemaphoreSlim(3);

public async Task AccessResourceAsync(int id)
{
    Console.WriteLine($"Task {id} is waiting to enter...");
    
    // Asynchronously wait to enter the semaphore
    await _semaphore.WaitAsync();

    try
    {
        Console.WriteLine($"Task {id} has entered. Working...");
        // Simulate async work (e.g., API call)
        await Task.Delay(1000); 
    }
    finally
    {
        Console.WriteLine($"Task {id} is leaving.");
        // Always release the semaphore in finally
        _semaphore.Release();
    }
}
```

### 4. Real-World Example: Throttling Parallel API Calls

Imagine you have 100 items to process, but the external API only allows 5 concurrent connections.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class ThrottlingExample
{
    private readonly SemaphoreSlim _throttle = new SemaphoreSlim(5);

    public async Task ProcessAllItems(IEnumerable<int> items)
    {
        var tasks = items.Select(async item =>
        {
            await _throttle.WaitAsync();
            try
            {
                await ProcessItemAsync(item);
            }
            finally
            {
                _throttle.Release();
            }
        });

        await Task.WhenAll(tasks);
        Console.WriteLine("All items processed.");
    }

    private async Task ProcessItemAsync(int item)
    {
        // Simulate work
        await Task.Delay(500);
        Console.WriteLine($"Processed item: {item}");
    }
}
```

### 5. How to Run This Code

If you want to try this code on your computer, follow these simple steps:

1.  **Install .NET:** Make sure you have the [.NET SDK](https://dotnet.microsoft.com/download) installed.
2.  **Create a Project:** Open your terminal (or Command Prompt) and type:
    ```bash
    dotnet new console -n SemaphoreDemo
    cd SemaphoreDemo
    ```
3.  **Copy the Code:** Open `Program.cs` and replace everything inside with this complete example:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// Create the demo class
var example = new ThrottlingExample();
var items = Enumerable.Range(1, 20); // 20 items to process

Console.WriteLine("Starting process...");
await example.ProcessAllItems(items);
Console.WriteLine("Done!");

public class ThrottlingExample
{
    // Allow only 5 tasks at a time
    private readonly SemaphoreSlim _throttle = new SemaphoreSlim(5);

    public async Task ProcessAllItems(IEnumerable<int> items)
    {
        var tasks = items.Select(async item =>
        {
            // Wait for a spot to open
            await _throttle.WaitAsync();
            try
            {
                await ProcessItemAsync(item);
            }
            finally
            {
                // Leave the spot so someone else can enter
                _throttle.Release();
            }
        });

        await Task.WhenAll(tasks);
        Console.WriteLine("All items processed.");
    }

    private async Task ProcessItemAsync(int item)
    {
        Console.WriteLine($"[Started] Item {item}");
        // Simulate work (half a second)
        await Task.Delay(500);
        Console.WriteLine($"[Finished] Item {item}");
    }
}
```

4.  **Run it:** In your terminal, type:
    ```bash
    dotnet run
    ```

You will see that even though we have 20 items, only 5 start at the same time!

#### Using a Traditional Program.cs (with Main)

If your project uses a traditional style (with `class Program` and `static void Main`), your code will look like this:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SemaphoreDemo
{
    class Program
    {
        // The "async Task Main" allows you to use "await" inside Main
        static async Task Main(string[] args)
        {
            var example = new ThrottlingExample();
            var items = Enumerable.Range(1, 20);

            Console.WriteLine("Starting process...");
            await example.ProcessAllItems(items);
            Console.WriteLine("Done!");
        }
    }

    public class ThrottlingExample
    {
        private readonly SemaphoreSlim _throttle = new SemaphoreSlim(5);

        public async Task ProcessAllItems(IEnumerable<int> items)
        {
            var tasks = items.Select(async item =>
            {
                await _throttle.WaitAsync();
                try
                {
                    await ProcessItemAsync(item);
                }
                finally
                {
                    _throttle.Release();
                }
            });

            await Task.WhenAll(tasks);
            Console.WriteLine("All items processed.");
        }

        private async Task ProcessItemAsync(int item)
        {
            Console.WriteLine($"[Started] Item {item}");
            await Task.Delay(500);
            Console.WriteLine($"[Finished] Item {item}");
        }
    }
}
```

### 6. Important Tips for .NET 10

1.  **Dispose:** Always dispose of your `SemaphoreSlim` when you are finished with it. This frees up system resources.
2.  **Initial vs. Max Count:** When you create a `new SemaphoreSlim(initialCount, maxCount)`:
    - `initialCount`: How many "slots" are available right now.
    - `maxCount`: The maximum number of "slots" allowed.
3.  **Cancellation:** `WaitAsync` can take a `CancellationToken`. This allows you to stop waiting if the operation takes too long.

### 7. Summary

`SemaphoreSlim` is your go-to tool for managing concurrency in the `async/await` world. It prevents your application from crashing under heavy load by ensuring that only a manageable number of tasks are active at any given time.

### 8. References

- [SemaphoreSlim Class (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim)
- [SemaphoreSlim.WaitAsync Method (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/api/system.threading.semaphoreslim.waitasync)
- [Async/Await Best Practices (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/async-await-best-practices)
- [SemaphoreSlim Practical Guide (DEV Community)](https://dev.to/stevsharp/semaphoreslim-in-net-a-practical-guide-with-the-rest-of-the-toolbox-1mh7)
