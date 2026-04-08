---
layout: single
title: "Modern Repository and Unit of Work Patterns in .NET 10"
date: 2026-04-07
show_date: true
toc: true
toc_label: "Patterns in .NET 10"
toc_sticky: true
classes: wide
tags:
  - .NET
  - .NET 10
  - C#
  - C# 14
  - Architecture
  - Repository Pattern
  - Unit of Work
  - EF Core
  - Entity Framework Core
---

As applications grow in complexity, maintaining a clean separation between business logic and data access becomes crucial. In **.NET 10**, the **Repository** and **Unit of Work** patterns remain essential tools for building maintainable, testable, and robust systems.

This post will guide you through a simple and modern implementation of these patterns using **C# 14** and **EF Core**.

---

## 1. The Repository Pattern

The **Repository Pattern** acts as an abstraction layer between your application's business logic and the data access layer (like EF Core). It mediates between the domain and data mapping layers, acting like an in-memory collection of domain objects.

### Why use it?
*   **Decoupling:** Your services don't need to know about the specifics of the database or ORM.
*   **Testability:** You can easily swap the real database with a mock repository during unit testing.
*   **Centralization:** Query logic is kept in one place, avoiding duplication across the codebase.

---

## 2. The Unit of Work Pattern

The **Unit of Work Pattern** coordinates the work of multiple repositories by creating a single database context shared by all of them. It ensures that all changes within a single transaction are committed together.

### Why use it?
*   **Atomic Transactions:** Ensures that if one operation fails, all related operations are rolled back (ACID).
*   **Consistency:** Maintains data integrity across multiple entities during a single business process.
*   **Efficiency:** Minimizes database round-trips by batching changes.

---

## 3. The "Redundancy" Debate: Is it really needed?

You might wonder: **"Doesn't EF Core's `DbContext` already implement Unit of Work and `DbSet` already act as a Repository?"**

The answer is **Yes**. For simple CRUD applications, adding another abstraction layer can indeed feel redundant. However, in larger, complex enterprise systems, these patterns provide:

1.  **Strict Decoupling:** Your services never see `SaveChangesAsync()`. This prevents "leaky abstractions" where database-specific logic creeps into your business layer.
2.  **Testability:** Mocking an `IUnitOfWork` is trivial compared to mocking a `DbContext`.
3.  **Transaction Management:** It ensures that multiple repositories share the same transaction without passing the context around.
4.  **Domain Events:** You can easily implement a system that dispatches events (e.g., "Send Welcome Email") only *after* the database transaction successfully commits.

---

## 4. Real-World Case Study: E-Commerce Checkout

Imagine a **Checkout Process** where three things must happen:
1.  **Decrement Stock** (Product Inventory)
2.  **Create Order Record** (Order Management)
3.  **Add Loyalty Points** (User Profile)

Without a **Unit of Work**, you might call `SaveChangesAsync()` inside each repository or service separately. If the third step (adding points) fails, you’ve already decreased stock and created an order—leaving your database in an inconsistent state.

With **Unit of Work**, all three repositories share one context. You call `CompleteAsync()` once at the very end of the service method. If anything fails, **nothing is saved**.

---

## 5. Implementation in .NET 10

Let's look at a simple implementation for an **E-Commerce System**.

### The Entities
```csharp
namespace MyProject.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Stock { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Points { get; set; }
}
```

### 1. The Repository Interface
```csharp
namespace MyProject.Domain.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Delete(T entity);
}
```

### 2. The Unit of Work Interface
```csharp
namespace MyProject.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Product> Products { get; }
    IRepository<Order> Orders { get; }
    IRepository<User> Users { get; }
    Task<int> CompleteAsync(CancellationToken ct = default);
}
```

### 3. Concrete Implementation
```csharp
using Microsoft.EntityFrameworkCore;
using MyProject.Domain.Interfaces;
using MyProject.Infrastructure.Data;

namespace MyProject.Infrastructure.Repositories;

// 1. Generic Repository
public class Repository<T>(AppDbContext context) : IRepository<T> where T : class
{
    protected readonly AppDbContext _context = context;

    public async Task<T?> GetByIdAsync(int id, CancellationToken ct = default) 
        => await _context.Set<T>().FindAsync([id], ct);

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default) 
        => await _context.Set<T>().ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct = default) 
        => await _context.Set<T>().AddAsync(entity, ct);

    public void Update(T entity) => _context.Set<T>().Update(entity);

    public void Delete(T entity) => _context.Set<T>().Remove(entity);
}

// 2. Unit of Work
public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    private IRepository<Product>? _products;
    private IRepository<Order>? _orders;
    private IRepository<User>? _users;

    public IRepository<Product> Products => _products ??= new Repository<Product>(context);
    public IRepository<Order> Orders => _orders ??= new Repository<Order>(context);
    public IRepository<User> Users => _users ??= new Repository<User>(context);

    public async Task<int> CompleteAsync(CancellationToken ct = default) 
        => await context.SaveChangesAsync(ct);

    public void Dispose()
    {
        context.Dispose();
        GC.SuppressFinalize(this);
    }
}
```

### 4. The DbContext
```csharp
using Microsoft.EntityFrameworkCore;
using MyProject.Domain.Entities;

namespace MyProject.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<User> Users => Set<User>();
}
```

---

## 6. Using Patterns in a Service

Here is the **Checkout Service** demonstrating how multiple repositories work together atomically. Notice how we pass the `CancellationToken` from the top level down to the database.

```csharp
using MyProject.Domain.Entities;
using MyProject.Domain.Interfaces;

namespace MyProject.Application.Services;

public class CheckoutService(IUnitOfWork unitOfWork)
{
    public async Task ProcessOrderAsync(int userId, int productId, int quantity, CancellationToken ct = default)
    {
        // 1. Get Product and Decrease Stock
        var product = await unitOfWork.Products.GetByIdAsync(productId, ct);
        if (product == null || product.Stock < quantity) 
            throw new Exception("Insufficient stock");

        product.Stock -= quantity;

        // 2. Create Order
        var order = new Order { UserId = userId, ProductId = productId, Quantity = quantity };
        await unitOfWork.Orders.AddAsync(order, ct);

        // 3. Update User Points
        var user = await unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user != null) user.Points += 10;

        // COMMIT: If any of the above fails, this line is never reached,
        // and the database remains unchanged (Rollback).
        await unitOfWork.CompleteAsync(ct);
    }
}
```

---

## 7. Why the CancellationToken?

In our production-ready implementation, you'll notice we pass a `CancellationToken ct = default` to almost every asynchronous method. 

### What is it?
A `CancellationToken` is a standard way in .NET to signal that an operation should be stopped. In a web context, this usually happens if a user cancels their request (e.g., closes the browser tab) or if a predefined timeout is reached.

### Why use it?
1.  **Resource Efficiency:** If a user cancels a long-running request (like a large report generation or a complex search), we don't want the database to continue working on that query and wasting precious resources (CPU, Memory, Connections).
2.  **Scalability:** By canceling unnecessary work, your application can free up threads and database connections much faster, allowing it to handle more concurrent users.
3.  **Better User Experience:** It allows your application to stop work early and return a clear signal (usually a `TaskCanceledException`) rather than continuing to process a result that no one is waiting for.

### How it works with our Patterns:

The token is typically created at the top level (e.g., by the ASP.NET Core framework) and **propagated down** the chain:
`Controller -> Service -> Unit of Work -> Repository -> EF Core`.

#### 1. Where does it come from?
In a Minimal API or Controller, the framework automatically provides a `CancellationToken` that is linked to the user's HTTP request.

```csharp
// In your Program.cs or Controller
app.MapPost("/checkout", async (CheckoutRequest req, CheckoutService service, CancellationToken ct) =>
{
    // The 'ct' here is automatically managed by ASP.NET Core.
    // If the user cancels the request, this token signals cancellation.
    await service.ProcessOrderAsync(req.UserId, req.ProductId, req.Quantity, ct);
    return Results.Ok();
});
```

#### 2. How is it "used"?
You might be wondering: *"I see the token being passed, but where is the 'if' statement that stops the code?"*

In modern .NET, **usage is propagation**. Most asynchronous methods in EF Core (like `SaveChangesAsync`, `ToListAsync`, or `FindAsync`) take a `CancellationToken`. Inside those methods, the framework constantly checks:

```csharp
// This is what happens INSIDE EF Core methods:
if (ct.IsCancellationRequested) 
{
    throw new OperationCanceledException(ct);
}
```

By passing `ct` to `unitOfWork.CompleteAsync(ct)`, you are telling EF Core to watch that token and stop the database transaction immediately if it's signaled.

#### 3. Manual Usage
If you have a very long-running loop or heavy computation *between* database calls, you can manually check it:

```csharp
public async Task DoHeavyWorkAsync(CancellationToken ct)
{
    foreach (var item in largeCollection)
    {
        // Check manually if we should stop
        ct.ThrowIfCancellationRequested();
        
        // Process item...
    }
}
```

---

## 8. Dependency Injection Setup

Finally, register your patterns in `Program.cs`.

```csharp
using Microsoft.EntityFrameworkCore;
using MyProject.Application.Services;
using MyProject.Domain.Interfaces;
using MyProject.Infrastructure.Data;
using MyProject.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Register DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register Services
builder.Services.AddScoped<CheckoutService>();

var app = builder.Build();
```

---

## 9. Unit Testing with xUnit: Mocking the Data Layer

One of the biggest advantages of these patterns is how easy they make testing. By abstracting the data layer, you can test your business logic without needing a real database. In the following examples, we will use **xUnit**, the most popular and modern testing framework for .NET.

### Step-by-Step: How to Mock the Data Layer

#### Option 1: Mocking the Repository Interface (Recommended for Services)
This is the fastest way to test your **Application Services** (like `CheckoutService`). You don't need a `DbContext` at all; you just mock the `IUnitOfWork` and `IRepository` interfaces.

1.  **Setup your Test Project:** Ensure you have the **xUnit** NuGet packages installed (`xunit`, `xunit.runner.visualstudio`).
2.  **Install a Mocking Library:** Use `NSubstitute` (used in the example below) or `Moq`.
3.  **Setup the Mock Behavior:** Tell the mock what to return when a method is called.
4.  **Execute & Assert:** Run your service method and verify the results using xUnit's `Assert` class.

```csharp
[Fact]
public async Task ProcessOrder_ShouldDecreaseStock_WhenProductExists()
{
    // 1. Arrange: Create mocks using NSubstitute
    var uow = Substitute.For<IUnitOfWork>();
    var product = new Product { Id = 1, Stock = 10 };
    
    uow.Products.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(product);
    uow.Users.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(new User());

    var service = new CheckoutService(uow);

    // 2. Act: Execute the service logic
    await service.ProcessOrderAsync(userId: 1, productId: 1, quantity: 2);

    // 3. Assert: Verify stock was updated using xUnit's Assert
    Assert.Equal(8, product.Stock); 
    await uow.Received(1).CompleteAsync(Arg.Any<CancellationToken>()); 
}
```

#### Option 2: Mocking the DbContext with Data (In-Memory)
If you need to test the **Repository implementation** itself or complex LINQ queries, you should use the EF Core **In-Memory** provider. This acts as a "mock" database that holds actual data in memory.

1.  **Install Packages:** `Microsoft.EntityFrameworkCore.InMemory` and `xunit`.
2.  **Configure Options:** Use `UseInMemoryDatabase` with a unique name for each test.
3.  **Seed & Test:** Add data to the context, then run your repository methods.
4.  **Verify:** Use xUnit's `Assert` to check the results.

```csharp
[Fact]
public async Task Repository_AddAsync_ShouldPersistToDatabase()
{
    // 1. Setup In-Memory Context
    var options = new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(databaseName: "TestDb_" + Guid.NewGuid())
        .Options;

    // 2. Seed Data & Execute
    using (var context = new AppDbContext(options))
    {
        var repo = new Repository<Product>(context);
        await repo.AddAsync(new Product { Name = "Laptop", Stock = 5 });
        await context.SaveChangesAsync();
    }

    // 3. Verify: Use a fresh context to ensure data was truly persisted
    using (var context = new AppDbContext(options))
    {
        var count = await context.Products.CountAsync();
        Assert.Equal(1, count);
    }
}
```

---

## 10. Recommended Project Structure

When implementing these patterns in a real application, a common and recommended project structure follows the principles of Clean Architecture. This ensures that your business logic remains decoupled from the data access layer.

```text
MyProject/
├── MyProject.sln
├── src/
│   ├── MyProject.Domain/ (Class Library)
│   │   ├── Entities/
│   │   │   ├── Product.cs
│   │   │   ├── Order.cs
│   │   │   └── User.cs
│   │   └── Interfaces/
│   │       ├── IRepository.cs
│   │       └── IUnitOfWork.cs
│   ├── MyProject.Application/ (Class Library)
│   │   └── Services/
│   │       └── CheckoutService.cs
│   ├── MyProject.Infrastructure/ (Class Library)
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   └── Repositories/
│   │       ├── Repository.cs
│   │       └── UnitOfWork.cs
│   └── MyProject.Api/ (ASP.NET Core Web API)
│       ├── Program.cs
│       └── appsettings.json
└── tests/
    └── MyProject.UnitTests/
```

This structure clearly separates the **Domain** (Business Rules and Interfaces), the **Infrastructure** (Implementation of Interfaces and Data Access), and the **API/Application** (Services and Endpoints).

---

## 11. Further Reading & References

If you want to delve deeper into these patterns and their implementation in modern .NET, here are some essential resources:

*   **[Repository Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html):** The original definition of the Repository pattern from the "Patterns of Enterprise Application Architecture" catalog.
*   **[Unit of Work Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/unitOfWork.html):** Martin Fowler's classic explanation of the Unit of Work pattern.
*   **[Microsoft Docs: Infrastructure Persistence Layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-implementation-entity-framework-core):** A comprehensive guide by Microsoft on implementing these patterns in microservices and enterprise applications.
*   **[EF Core: DbContext Configuration](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/):** Official documentation on how EF Core's `DbContext` acts as the engine behind these patterns.
*   **[Async Programming in .NET](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/):** Learn more about `Task`, `await`, and `CancellationToken` for high-performance data access.

---

## Conclusion

The **Repository** and **Unit of Work** patterns are not just about "more files." They are about **intent** and **reliability**.

While EF Core provides its own implementation, wrapping it in your own abstraction creates a **Domain-Driven** boundary. It makes your services easier to test and your business processes more robust. For simple projects, you might skip them, but for enterprise-level .NET 10 applications, they are a powerful standard for maintaining a clean architecture.

