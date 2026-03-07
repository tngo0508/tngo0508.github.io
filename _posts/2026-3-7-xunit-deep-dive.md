---
layout: single
title: "Part 11: xUnit Testing: Facts, Theories, and Data-Driven Tests"
date: 2026-03-07
show_date: true
toc: true
toc_label: "xUnit Deep Dive"
toc_icon: "microscope"
classes: wide
tags:
  - .NET
  - C#
  - xUnit
  - Unit Testing
  - Interview Preparation
---

Building on our [TDD and Unit Testing Intro]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %}), this post dives deeper into **xUnit**, the most popular testing framework for .NET. We'll explore how to write efficient, data-driven tests using `[Fact]`, `[Theory]`, and various data-providing attributes.

---

## 1. [Fact]: The Simple Unit Test

The `[Fact]` attribute is used for tests that are always true. They don't take any parameters and represent a single, specific scenario.

```csharp
[Fact]
public void Add_SimpleValues_ShouldReturnSum()
{
    // Arrange
    var calculator = new Calculator();

    // Act
    var result = calculator.Add(2, 2);

    // Assert
    Assert.Equal(4, result);
}
```

**When to use:** Use `[Fact]` when you have a specific test case that doesn't need to be repeated with different inputs.

---

## 2. [Theory]: Data-Driven Tests

The `[Theory]` attribute is used when you want to run the same test logic multiple times with different input values. A `[Theory]` **must** be accompanied by at least one data-providing attribute (like `[InlineData]`).

```csharp
[Theory]
[InlineData(1, 1, 2)]
[InlineData(10, 5, 15)]
[InlineData(-1, 1, 0)]
public void Add_MultipleValues_ShouldReturnCorrectSum(int a, int b, int expected)
{
    var calculator = new Calculator();
    var result = calculator.Add(a, b);
    Assert.Equal(expected, result);
}
```

xUnit will run this method **three times**, once for each `[InlineData]` attribute.

---

## 3. [InlineData]: Simple Parameterized Data

`[InlineData]` is the simplest way to provide values to a `[Theory]`. You pass the values directly as arguments to the attribute.

```csharp
[Theory]
[InlineData("hello", false)]
[InlineData("", true)]
[InlineData(null, true)]
public void IsNullOrEmpty_ShouldWork(string value, bool expected)
{
    bool result = string.IsNullOrEmpty(value);
    Assert.Equal(expected, result);
}
```

*   **Pros:** Very readable, keeps data close to the test.
*   **Cons:** Limited to constant values (no complex objects, no logic).

---

## 4. [MemberData]: Reusable or Complex Data

`[MemberData]` allows you to pull test data from a static property or method within the same class (or another class). This is useful when:
1.  The data is too large for `[InlineData]`.
2.  You need to share the same data across multiple test classes.
3.  You need to instantiate complex objects.

```csharp
public class CalculatorTests
{
    public static IEnumerable<object[]> GetCalculatorData()
    {
        yield return new object[] { 10, 20, 30 };
        yield return new object[] { -5, -5, -10 };
        yield return new object[] { 0, 0, 0 };
    }

    [Theory]
    [MemberData(nameof(GetCalculatorData))]
    public void Add_UsingMemberData_ShouldWork(int a, int b, int expected)
    {
        var calculator = new Calculator();
        Assert.Equal(expected, calculator.Add(a, b));
    }
}
```

---

## 5. [ClassData]: Encapsulated Data Logic

`[ClassData]` takes it a step further by moving the data generation into its own dedicated class. This class must implement `IEnumerable<object[]>`.

### The Data Class
```csharp
public class CalculatorTestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[] { 1, 2, 3 };
        yield return new object[] { 5, 5, 10 };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
```

### The Test
```csharp
[Theory]
[ClassData(typeof(CalculatorTestData))]
public void Add_UsingClassData_ShouldWork(int a, int b, int expected)
{
    var calculator = new Calculator();
    Assert.Equal(expected, calculator.Add(a, b));
}
```

**When to use:** Use `[ClassData]` to keep your test files clean when you have massive amounts of test data or complex setup logic.

---

## 6. [BeforeAfterTestAttribute]: Custom Execution Logic

While xUnit recommends using constructors and `IDisposable` for setup and teardown, sometimes you need to run code before and after **every single test method** using attributes. This is where `BeforeAfterTestAttribute` comes in.

It's particularly useful for cross-cutting concerns like:
- Logging the start and end of a test.
- Managing database transactions.
- Resetting shared resources or mocks.

### Implementing the Attribute

To use it, you must create a custom class that inherits from `BeforeAfterTestAttribute`.

```csharp
using System.Reflection;
using Xunit.Sdk;

public class TestLoggerAttribute : BeforeAfterTestAttribute
{
    public override void Before(MethodInfo methodUnderTest)
    {
        Console.WriteLine($"[LOG] Starting test: {methodUnderTest.Name}");
    }

    public override void After(MethodInfo methodUnderTest)
    {
        Console.WriteLine($"[LOG] Finished test: {methodUnderTest.Name}");
    }
}
```

### Applying the Attribute

You can apply it at the **class level** (all tests in that class) or the **method level**.

```csharp
public class CalculatorTests
{
    [Fact]
    [TestLogger] // This will run Before() and After() for this test
    public void Add_SimpleValues_ShouldWork()
    {
        // ... test logic ...
    }
}
```

**Crucial Note:** `BeforeAfterTestAttribute` is from the `Xunit.Sdk` namespace. Use it sparingly, as constructor/Dispose is the standard for most setup needs.

---

## 7. Summary Comparison

| Attribute | Best For... | Source |
| :--- | :--- | :--- |
| **[Fact]** | Single scenarios | None |
| **[Theory]** | Multiple scenarios | Required |
| **[InlineData]** | Simple, constant values | Attribute args |
| **[MemberData]** | Complex objects or shared data | Static property/method |
| **[ClassData]** | Clean tests, very large data sets | Separate class |
| **[BeforeAfter]**| Custom setup/teardown logic | Custom Attribute |

---

## 8. References & Further Reading
*   **xUnit.net:** [BeforeAfterTestAttribute Documentation](https://xunit.net/docs/comparisons#before-after-test-attribute)
*   **xUnit.net:** [Getting Started](https://xunit.net/docs/getting-started/netcore/cmdline)
*   **Microsoft Learn:** [Unit testing C# with xUnit](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-dotnet-test)
*   **Blog:** [Parameterized tests with xUnit](https://andrewlock.net/creating-parameterised-tests-in-xunit-with-inlinedata-classdata-and-memberdata/)

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
* [Part 7: Clean Architecture: Principles, Layers, and Best Practices]({{ site.baseurl }}{% post_url 2026-3-5-clean-architecture %})
* [Part 8: N-Tier Architecture: Structure, Layers, and Beginner Guide]({{ site.baseurl }}{% post_url 2026-3-5-n-tier-architecture %})
* [Part 9: Repository and Unit of Work Patterns: Implementation and Benefits]({{ site.baseurl }}{% post_url 2026-3-5-repository-unit-of-work %})
* [Part 10: TDD and Unit Testing in .NET: Production-Ready Strategies]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
* [Part 11: xUnit Testing: Facts, Theories, and Data-Driven Tests]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})
* [Part 12: FluentAssertions: Write More Readable Unit Tests]({{ site.baseurl }}{% post_url 2026-3-7-fluent-assertions %})
