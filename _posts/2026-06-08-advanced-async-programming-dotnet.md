---
title: "Advanced Asynchronous Programming: Beyond Task and Await"
excerpt: "Master advanced async patterns in .NET, including ValueTask for performance, IAsyncEnumerable for streaming, and the critical importance of CancellationToken."
date: 2026-06-08
categories:
  - .NET
  - C#
tags:
  - Async
  - ValueTask
  - IAsyncEnumerable
  - CancellationToken
  - Performance
toc: true
---

### 1. Introduction

Almost every .NET developer knows how to use `async` and `await`. However, writing truly robust and high-performance asynchronous code requires understanding the deeper tools provided by the framework. This post covers three essential advanced async topics: `ValueTask`, `IAsyncEnumerable`, and `CancellationToken`.

---

### 2. ValueTask: Reducing Heap Allocations

A standard `Task` is a class, meaning every time you return a `Task`, an object is allocated on the heap. While this is fine for most cases, it can be wasteful in high-frequency methods where the result is often available synchronously.

#### When to use ValueTask<T>?
Use `ValueTask<T>` if:
1.  The method is likely to complete **synchronously** most of the time.
2.  The method is called **very frequently** (e.g., in a tight loop).

```csharp
public ValueTask<int> GetDataAsync(int id)
{
    if (_cache.TryGetValue(id, out int value))
    {
        return new ValueTask<int>(value); // Synchronous - No heap allocation
    }
    
    return new ValueTask<int>(FetchFromDbAsync(id)); // Asynchronous - Allocates Task
}
```

**Warning:** You should only `await` a `ValueTask` once. If you need to await it multiple times or store it, convert it to a `Task` using `.AsTask()`.

---

### 3. IAsyncEnumerable: Streaming Data

Before C# 8, returning a collection asynchronously meant waiting for the *entire* list to be populated before returning it:

```csharp
// Old way: All or nothing
public async Task<List<string>> GetAllItemsAsync() { ... }
```

With `IAsyncEnumerable<T>`, you can stream items one by one as they become available:

```csharp
public async IAsyncEnumerable<string> StreamItemsAsync()
{
    for (int i = 0; i < 100; i++)
    {
        await Task.Delay(100); // Simulate work
        yield return $"Item {i}";
    }
}

// Consuming
await foreach (var item in StreamItemsAsync())
{
    Console.WriteLine(item);
}
```

This is ideal for fetching large datasets from a database or streaming responses from an API.

---

### 4. CancellationToken: The Art of Stopping

In a production environment, requests get cancelled (e.g., a user closes their browser). If your backend keeps processing the request, you are wasting CPU and memory.

#### Best Practices:
1.  **Always** accept a `CancellationToken` in async methods.
2.  **Pass it down** the entire call stack to the final `HttpClient` or `DbCommand`.
3.  **Check for cancellation** in long loops using `token.ThrowIfCancellationRequested()`.

```csharp
public async Task ProcessDataAsync(CancellationToken ct)
{
    var data = await _repository.GetLargeDatasetAsync(ct);
    
    foreach (var item in data)
    {
        ct.ThrowIfCancellationRequested(); // Stop if user cancelled
        await ProcessItemAsync(item, ct);
    }
}
```

---

### 5. Conclusion

Moving beyond `Task` and `await` is what separates a mid-level developer from a senior. By using `ValueTask` for performance, `IAsyncEnumerable` for memory efficiency, and `CancellationToken` for resource management, you ensure your .NET applications are ready for high-load production environments.
