---
title: "High-Performance .NET: Mastering Span<T> and Memory<T>"
excerpt: "Learn how to optimize memory usage and reduce garbage collection overhead using Span<T> and Memory<T> for high-performance .NET applications."
date: 2026-06-08
categories:
  - .NET
  - Performance
tags:
  - Memory Management
  - Span<T>
  - Memory<T>
  - C#
  - Performance Tuning
toc: true
---

### 1. Introduction

In modern .NET development, performance is often synonymous with efficient memory management. Every time you create a substring or a copy of an array, you allocate memory on the managed heap, increasing the pressure on the Garbage Collector (GC).

**`Span<T>`** and **`Memory<T>`** are types introduced to solve this problem by providing a uniform way to work with contiguous regions of memory without unnecessary allocations.

---

### 2. What is Span<T>?

`Span<T>` is a "ref struct" that points to a specific section of memory. That memory can be on the:
- **Managed Heap** (like an array)
- **Stack** (using `stackalloc`)
- **Native Memory** (via unmanaged pointers)

#### Example: Slicing without Allocation
Instead of using `Substring()`, which creates a new string object, you can use `AsSpan()` and `Slice()`:

```csharp
string text = "Hello, World!";
ReadOnlySpan<char> worldSpan = text.AsSpan().Slice(7, 5); // Points to "World"

// No new string is created in the heap!
```

---

### 3. Span vs. Memory

While they look similar, they have very different use cases:

#### Span<T>
- **Type:** `ref struct`
- **Location:** Can only live on the **Stack**.
- **Constraint:** Cannot be a field in a class, cannot be used in `async` methods, and cannot be captured in a lambda.
- **Speed:** Extremely fast (as fast as a pointer).

#### Memory<T>
- **Type:** `struct`
- **Location:** Can live on the **Heap**.
- **Usage:** Use this when you need to store the reference in a class or use it across `await` boundaries in asynchronous methods.
- **Conversion:** You can call `.Span` on a `Memory<T>` object to get a `Span<T>` for local processing.

---

### 4. Real-World Use Case: Parsing a CSV Line

Imagine parsing a large CSV file. Traditionally, you might use `string.Split(',')`, which creates an array and multiple string objects for each column.

**Optimized approach with Span:**

```csharp
public void ParseLine(string line)
{
    ReadOnlySpan<char> span = line.AsSpan();
    int index = span.IndexOf(',');
    
    if (index != -1)
    {
        ReadOnlySpan<char> firstColumn = span.Slice(0, index);
        // Process firstColumn without creating a new string object
    }
}
```

---

### 5. Best Practices

1.  **Prefer `ReadOnlySpan<T>`** for data you don't intend to modify (like strings).
2.  **Use `stackalloc`** for small, short-lived buffers to avoid the heap entirely:
    ```csharp
    Span<byte> buffer = stackalloc byte[256];
    ```
3.  **Use `Memory<T>` for Async:** If your method has `await`, use `Memory<T>` as the parameter type.
4.  **Avoid over-optimization:** Don't replace every string with a Span. Use it in "hot paths"—code that is executed frequently and handles large amounts of data.

---

### 6. Conclusion

`Span<T>` and `Memory<T>` are the "magic wands" of .NET performance. They allow you to write code that is as fast as C++ while maintaining the safety and productivity of C#. By mastering these types, you can significantly reduce the GC overhead of your applications.
