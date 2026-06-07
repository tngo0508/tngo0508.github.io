---
title: "Modern Testing in .NET: TDD, Mocking, and Integration Tests"
excerpt: "Level up your testing strategy. Explore Test-Driven Development (TDD), efficient mocking with NSubstitute, and high-confidence integration testing with WebApplicationFactory."
date: 2026-06-08
categories:
  - .NET
  - Testing
tags:
  - TDD
  - NSubstitute
  - Integration Testing
  - WebApplicationFactory
  - xUnit
toc: true
---

### 1. Introduction

For many developers, testing is a chore—something done at the end of a project if time permits. But for senior developers and architects, tests are the foundation of a "robust and solid product." They provide the confidence to refactor and the documentation for how the system should behave.

---

### 2. Test-Driven Development (TDD)

TDD is a workflow: **Red, Green, Refactor.**
1.  **Red:** Write a failing test for a small piece of functionality.
2.  **Green:** Write just enough code to make the test pass.
3.  **Refactor:** Clean up the code while keeping the test green.

**Why do it?** It forces you to think about the **design** and **API** of your code before you get bogged down in implementation details.

---

### 3. Isolation with Mocking (NSubstitute)

Unit tests should test one thing in isolation. If your `OrderService` depends on an `IEmailService`, you don't want to actually send an email during a test.

**NSubstitute** is a modern, friendly mocking library for .NET.

```csharp
// 1. Create a substitute
var emailService = Substitute.For<IEmailService>();

// 2. Setup behavior (if needed)
emailService.SendAsync(Arg.Any<string>()).Returns(true);

// 3. Act
var service = new OrderService(emailService);
await service.PlaceOrderAsync(order);

// 4. Assert
await emailService.Received().SendAsync("customer@example.com");
```

---

### 4. High-Confidence Integration Testing

Unit tests prove that your logic works in isolation. **Integration tests** prove that your components work together, including the database and the web server.

#### WebApplicationFactory
ASP.NET Core provides `WebApplicationFactory<T>`, which allows you to run your entire API in memory for testing.

```csharp
public class MyApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public MyApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Get_Endpoints_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/api/weather");
        response.EnsureSuccessStatusCode();
    }
}
```

---

### 5. The Testing Pyramid

1.  **Unit Tests (70%):** Fast, isolated, cover edge cases.
2.  **Integration Tests (20%):** Slower, test database/external service interactions.
3.  **End-to-End Tests (10%):** Slowest, test the entire user flow (e.g., using Playwright or Selenium).

---

### 6. Conclusion

Testing is an investment that pays dividends every time you hit "Deploy." By mastering TDD for design, NSubstitute for isolation, and `WebApplicationFactory` for integration, you ensure that your code remains maintainable and bug-free.

Start by writing a unit test for one small helper method in your current project today!
