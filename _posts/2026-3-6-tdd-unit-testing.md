---
layout: single
title: "Part 10: TDD and Unit Testing in .NET: Production-Ready Strategies"
date: 2026-3-06 00:00:00 +0000
categories: .NET C#
tags: [unit-testing, tdd, xunit, moq, best-practices]
toc: true
toc_label: "TDD & Unit Testing"
toc_icon: "vials"
---

Welcome to **Part 10** of our .NET Interview Series! Today, we're diving into the world of **Test-Driven Development (TDD)** and **Unit Testing**. In modern software engineering, writing code is only half the battle—ensuring it works as expected and is maintainable over time is just as important.

---

## 1. What is Test-Driven Development (TDD)?

TDD is a software development process where you write tests **before** you write the actual code. It follows a simple, repetitive cycle known as the **Red-Green-Refactor** cycle.

### The Red-Green-Refactor Cycle
1.  **🔴 RED (Fail):** Write a small test for a specific requirement that doesn't exist yet. Run it, and watch it fail (because the implementation isn't there).
2.  **🟢 GREEN (Pass):** Write the *minimal* amount of code necessary to make the test pass.
3.  **🔵 REFACTOR (Improve):** Clean up the code while keeping the tests passing. This ensures your design stays clean without breaking functionality.

---

## 2. Core Principles of Unit Testing

To write effective unit tests, we follow the **FIRST** principles:

*   **Fast:** Tests should run in milliseconds, so developers can run them frequently.
*   **Independent:** Tests should not depend on each other or a specific execution order.
*   **Repeatable:** You should get the same result every time you run the test, regardless of the environment.
*   **Self-validating:** The test should either pass or fail; no manual inspection of logs or output is required.
*   **Timely:** Ideally, tests are written before or alongside the production code.

---

## 3. The AAA Pattern: Arrange, Act, Assert

Almost every unit test follows this structure:

1.  **Arrange:** Set up the objects, mocks, and data needed for the test.
2.  **Act:** Execute the specific method or function you are testing.
3.  **Assert:** Verify that the result matches your expectations.

---

## 4. Setting Up the Testing Environment

In a professional .NET project, we typically use the following "Power Trio":

*   **xUnit:** The industry-standard testing framework for .NET.
*   **Moq (or NSubstitute):** A library used to create "Mocks"—fake versions of your dependencies (like Repositories or Services).
*   **FluentAssertions:** A library that makes your assertions much more readable and "natural-sounding."

### NuGet Packages Needed (`.csproj`)
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
  <PackageReference Include="xunit" Version="2.6.2" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  <PackageReference Include="Moq" Version="4.20.70" />
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
</ItemGroup>
```

---

## 5. Practical Example: Testing `OrderService`

Let's write a unit test for the `OrderService` we implemented in [Part 9]({{ site.baseurl }}{% post_url 2026-3-5-repository-unit-of-work %}).

### The Production Code (Recap)
The `CreateOrderAsync` method depends on `IUnitOfWork` and `ILogger`. It checks if a user exists before adding an order.

### The Unit Test (Production-Ready)
```csharp
using Moq;
using Xunit;
using FluentAssertions;
using Microsoft.Extensions.Logging;

public class OrderServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<ILogger<OrderService>> _mockLogger;
    private readonly OrderService _sut; // System Under Test

    public OrderServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockLogger = new Mock<ILogger<OrderService>>();
        
        // Inject the mocks into our service
        _sut = new OrderService(_mockUow.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task CreateOrderAsync_WhenUserExists_ShouldAddOrderAndCommit()
    {
        // 1. Arrange
        int userId = 1;
        var order = new Order { Id = 101, Product = "Laptop" };
        var user = new User { Id = userId, Name = "John Doe" };

        _mockUow.Setup(u => u.Users.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

        // 2. Act
        await _sut.CreateOrderAsync(userId, order);

        // 3. Assert
        _mockUow.Verify(u => u.Orders.AddAsync(order, It.IsAny<CancellationToken>()), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateOrderAsync_WhenUserDoesNotExist_ShouldThrowKeyNotFoundException()
    {
        // 1. Arrange
        int userId = 99;
        var order = new Order { Id = 101 };

        _mockUow.Setup(u => u.Users.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User)null!);

        // 2. Act
        Func<Task> act = async () => await _sut.CreateOrderAsync(userId, order);

        // 3. Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
                 .WithMessage($"User with ID {userId} not found.");

        _mockUow.Verify(u => u.Orders.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockUow.Verify(u => u.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

---

## 6. Visualizing the Test Interaction

In unit testing, we isolate the logic of our service by replacing real dependencies with mocks.

```text
       +-----------------------+
       |   OrderServiceTests   | (The Tester)
       +-----------+-----------+
                   |
         [ Calls ] |
                   v
       +-----------------------+      +-----------------------+
       |     OrderService      | ---> |  Mock <IUnitOfWork>   |
       |  (System Under Test)  |      |   (Fake Database)     |
       +-----------------------+      +-----------------------+
                   |
                   |                  +-----------------------+
                   +----------------> |   Mock <ILogger>      |
                                      |   (Fake Logging)      |
                                      +-----------------------+
```

---

## 7. Why Mocking is Essential

If we didn't use a mock for `IUnitOfWork`, our test would need:
1.  A real database connection.
2.  Pre-seeded data in that database.
3.  A cleanup script after every test.

This would make the tests **slow**, **brittle**, and **unreliable**. Mocks allow us to simulate any scenario (success, failure, network error) in memory, instantly.

---

## 8. Summary: Senior Tips for Testing

1.  **Test Behavior, Not Implementation:** Don't test private methods. Test what the public method *does* and what its *outcome* is.
2.  **Naming Matters:** Use descriptive names like `MethodName_StateUnderTest_ExpectedBehavior`.
3.  **Don't Over-Mock:** If a class is a simple data container (like a DTO or Model), don't mock it—just create an instance. Only mock complex dependencies like Repositories or External APIs.
4.  **100% Coverage is a Trap:** Focus on testing business logic and edge cases. Don't waste time testing auto-properties or simple constructors.

---

## 9. References & Further Reading
*   **Microsoft Learn:** [Unit testing C# in .NET using dotnet test and xUnit](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-dotnet-test)
*   **Martin Fowler:** [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
*   **Moq Documentation:** [Quickstart](https://github.com/devlooped/moq/wiki/Quickstart)
*   **FluentAssertions:** [Introduction](https://fluentassertions.com/introduction/)
*   **Book:** *Unit Testing Principles, Practices, and Patterns* by Vladimir Khorikov (Highly recommended)

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
