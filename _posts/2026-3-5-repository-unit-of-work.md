---
layout: single
title: "Repository and Unit of Work Patterns: Implementation and Benefits"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - .NET
  - Architecture
  - C#
  - Repository Pattern
  - Unit of Work
  - EF Core
---

The **Repository** and **Unit of Work** patterns are two of the most widely discussed architectural patterns in the .NET ecosystem. When used together, they help decouple your business logic from the database and ensure data integrity. This post explains these concepts, how to implement them, and when you should (or shouldn't) use them.

---

## 1. The Repository Pattern

### What is it?
A Repository acts as an abstraction between the Domain (Business Logic) and the Data Mapping layers (EF Core, Dapper). It mediates between the domain and data mapping layers using a collection-like interface for accessing domain objects.

In simpler terms: **A Repository makes your database look like an in-memory collection (like a `List`).**

### Why use it?
*   **Decoupling:** Your business logic doesn't need to know if you're using EF Core, ADO.NET, or an external API.
*   **Centralized Logic:** Query logic for a specific entity is in one place, preventing duplication.
*   **Testability:** You can easily mock a repository interface (`IUserRepository`) to write unit tests for your services without a real database.

---

## 2. The Unit of Work Pattern

### What is it?
The Unit of Work pattern maintains a list of objects affected by a business transaction and coordinates the writing out of changes and the resolution of concurrency problems.

In .NET, a Unit of Work ensures that **multiple repository operations are treated as a single transaction.**

### Why use it?
*   **Atomic Transactions:** It ensures that either all changes are saved to the database, or none are (ACID properties).
*   **Efficiency:** It reduces database roundtrips by batching multiple commands into a single `SaveChanges()` call.
*   **Consistency:** It provides a single point of entry for saving changes across different repositories.

---

## 3. Visual Representation (ASCII Diagram)

```text
    +-----------------------+
    |   Service (Business)  |
    +-----------|-----------+
                |
                v
    +-----------|-----------+
    |     Unit of Work      | <--- Manages Transaction
    +-----------|-----------+
         /      |      \
        v       v       v
    +-------+-------+-------+
    | RepoA | RepoB | RepoC | <--- Abstractions over DB
    +-------+-------+-------+
         \      |      /
          v     v     v
    +-----------------------+
    |   Database Context    | <--- Actual Data Access (EF)
    +-----------------------+
```

---

## 4. Simple Implementation Example

### 1. The Repository
```csharp
// The Interface (lives in Core/Application layer)
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task AddAsync(User user);
}

// The Implementation (lives in Infrastructure layer)
public class UserRepository : IUserRepository
{
    private readonly MyDbContext _context;
    public UserRepository(MyDbContext context) => _context = context;

    public async Task<User> GetByIdAsync(int id) => await _context.Users.FindAsync(id);
    public async Task AddAsync(User user) => await _context.Users.AddAsync(user);
}
```

### 2. The Unit of Work
```csharp
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IOrderRepository Orders { get; }
    Task<int> CompleteAsync(); // Effectively SaveChanges()
}

public class UnitOfWork : IUnitOfWork
{
    private readonly MyDbContext _context;
    public IUserRepository Users { get; private set; }
    public IOrderRepository Orders { get; private set; }

    public UnitOfWork(MyDbContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Orders = new OrderRepository(_context);
    }

    public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();
    public void Dispose() => _context.Dispose();
}
```

### 3. Usage in a Service
```csharp
public class OrderService
{
    private readonly IUnitOfWork _unitOfWork;
    public OrderService(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task CreateOrderAsync(int userId, Order order)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) throw new Exception("User not found");

        await _unitOfWork.Orders.AddAsync(order);
        
        // Both the user check and order creation are part of one transaction
        await _unitOfWork.CompleteAsync(); 
    }
}
```

---

## 5. Repository vs. DbContext (The Big Debate)

In modern EF Core, many developers argue that the Repository and Unit of Work patterns are **redundant**.

*   **`DbSet<T>`** is already a Repository.
*   **`DbContext`** is already a Unit of Work.

### When to use Repository/UoW?
*   **Large, Complex Systems:** When you need a strict separation between domain logic and infrastructure.
*   **Multi-Provider Support:** If you plan to switch between EF Core and Dapper for different queries.
*   **Unit Testing Purists:** If you want to test business logic without even a dependency on `Microsoft.EntityFrameworkCore`.

### When to skip them (Direct DbContext)?
*   **Standard Web APIs:** EF Core's `DbContext` is highly optimized and easy to mock with `InMemory` or `Sqlite` providers for testing.
*   **Simple CRUD:** It adds significant boilerplate ("Mapping Hell") for little gain.

---

## 6. Pros and Cons

### Pros
*   **Separation of Concerns:** Keeps your domain "clean" of data access logic.
*   **Consistency:** Every database call follows the same pattern.
*   **Mocking:** Easier to unit test services using simple interface mocks.

### Cons
*   **Boilerplate:** You have to create an interface and a class for every entity.
*   **Indirection:** Harder to trace the actual SQL being executed through multiple layers.
*   **Leakage:** Sometimes EF Core features (like `IQueryable`) leak into the repository interface, defeating the purpose of abstraction.

---

## 7. Summary: Should you use it?

If you are a **beginner**, start by using `DbContext` directly in your services. It's the standard way in modern .NET and reduces complexity.

As your application grows and you find yourself repeating complex LINQ queries or struggling with unit tests, consider introducing a **Repository** for those specific cases. Only add a **Unit of Work** if you have complex business transactions that span across multiple entities.

---

## 8. References & Further Reading
*   **Microsoft Learn:** [Design the infrastructure persistence layer (eShopOnContainers)](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
*   **Martin Fowler:** [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
*   **Martin Fowler:** [Unit of Work Pattern](https://martinfowler.com/eaaCatalog/unitOfWork.html)
*   **Blog:** [To Repository or Not to Repository? (Ardalis)](https://ardalis.com/repository-pattern/)
*   **Blog:** [Unit of Work and Repository Pattern with EF Core](https://code-maze.com/net-core-web-development-part-4/)

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
