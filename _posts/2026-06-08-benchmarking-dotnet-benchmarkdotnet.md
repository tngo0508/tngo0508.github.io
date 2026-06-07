---
title: "Data-Driven Performance: Benchmarking in .NET with BenchmarkDotNet"
excerpt: "Stop guessing which code is faster. Learn how to use BenchmarkDotNet to get scientific, reproducible performance metrics for your .NET applications."
date: 2026-06-08
categories:
  - .NET
  - Performance
tags:
  - BenchmarkDotNet
  - Performance
  - Optimization
  - C#
toc: true
---

### 1. Introduction

When it comes to performance optimization, the first rule is: **Don't Guess. Measure.** 

Many developers try to measure code speed using `Stopwatch`, but this approach is prone to errors caused by JIT (Just-In-Time) compilation, background noise, and Garbage Collection cycles. 

**BenchmarkDotNet** is the industry-standard library for benchmarking .NET code. It handles the complexity of "warming up" the code and providing statistically significant results.

---

### 2. Setting Up Your First Benchmark

BenchmarkDotNet works best in a dedicated **Console Application** targeting **Release** mode.

#### 1. Install the NuGet Package
```bash
dotnet add package BenchmarkDotNet
```

#### 2. Create the Benchmark Class
```csharp
[MemoryDiagnoser] // Tracks memory allocations
public class StringBenchmark
{
    private const string Text = "Hello, World!";

    [Benchmark]
    public string UseStringConcat() => Text + " " + Text;

    [Benchmark]
    public string UseStringBuilder()
    {
        var sb = new StringBuilder();
        sb.Append(Text);
        sb.Append(" ");
        sb.Append(Text);
        return sb.ToString();
    }
}
```

#### 3. Run the Benchmark
In `Program.cs`:
```csharp
BenchmarkRunner.Run<StringBenchmark>();
```

**CRITICAL:** You must run your console app in **Release** mode:
```bash
dotnet run -c Release
```

---

### 3. Understanding the Results

BenchmarkDotNet generates a clean table in your console and also saves results in Markdown, CSV, and HTML formats.

Key columns to watch:
- **Mean:** The average time taken for one execution.
- **Allocated:** How much memory was allocated on the managed heap. This is often more important than speed, as high allocations trigger more frequent Garbage Collections.

---

### 4. Advanced Features

#### Parameters
You can test your code against different input sizes using the `[Params]` attribute:
```csharp
[Params(10, 100, 1000)]
public int N { get; set; }
```

#### Multiple Runtimes
You can compare how your code performs on .NET 6 vs .NET 8 vs .NET Framework:
```csharp
[SimpleJob(RuntimeMoniker.Net80)]
[SimpleJob(RuntimeMoniker.Net60)]
public class MyBenchmark { ... }
```

---

### 5. Best Practices

1.  **Run in Release mode:** Debug mode contains extra overhead that makes measurements useless.
2.  **Close background apps:** Slack, Chrome, and Teams can cause spikes that jitter your results.
3.  **Keep it isolated:** A benchmark should test a small, specific unit of logic. Avoid benchmarking external database calls or network requests.
4.  **Use `[MemoryDiagnoser]`:** Always track allocations. Often, a "slower" method that allocates 0 bytes is better for your app's overall health than a "fast" one that allocates megabytes.

---

### 6. Conclusion

BenchmarkDotNet turns performance tuning from a "gut feeling" into a scientific process. By incorporating benchmarks into your workflow, you can confidently prove that your optimizations actually work.

Before your next refactor for performance, write a benchmark—you might be surprised by the results!
