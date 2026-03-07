---
layout: single
title: "Entity Framework Core: From Setup to Senior-Level Patterns"
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
  - EF Core
  - Performance
---

Entity Framework Core (EF Core) is the standard ORM for .NET applications. While easy to start with, mastering its advanced configurations and performance optimizations is key for senior-level development.

## 1. Setup and Configuration

### DbContext and Fluent API
The `DbContext` is the heart of EF Core. For clean architecture, avoid polluting your entity classes with Data Annotations; use the **Fluent API** instead.

```csharp
public class MyDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Separate configuration classes for better maintainability
        modelBuilder.ApplyConfiguration(new UserConfiguration());
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Email).IsUnique();
        
        // Shadow Property (exists in DB but not in C# class)
        builder.Property<DateTime>("LastUpdated");
    }
}
```

---

## 2. CRUD Operations with SQL Server

To use SQL Server, install `Microsoft.EntityFrameworkCore.SqlServer` and configure it in `OnConfiguring` or via Dependency Injection.

```csharp
// Basic CRUD Example (Production Style)
using var context = new MyDbContext();

// CREATE
var newUser = new User { Name = "John Doe", Email = "john@example.com" };
await context.Users.AddAsync(newUser);
await context.SaveChangesAsync();

// READ (AsNoTracking is faster for read-only operations)
var user = await context.Users
    .AsNoTracking()
    .FirstOrDefaultAsync(u => u.Email == "john@example.com");

// UPDATE
if (user != null)
{
    // Re-attaching for update if we used AsNoTracking
    context.Users.Update(user); 
    user.Name = "John Updated";
    await context.SaveChangesAsync();
}

// DELETE
if (user != null)
{
    context.Users.Remove(user);
    await context.SaveChangesAsync();
}
```

### 2.1. Practical Implementation: The Repository Pattern
While `DbContext` is technically a combination of the **Unit of Work** and **Repository** patterns, many developers prefer to abstract it into a concrete Repository to make the application more testable and easier to manage.

#### Visualizing the Repository Layer
The Repository acts as a mediator between your Business Logic (Services) and the Data Access Layer (EF Core/DbContext).

```text
+-----------------------+      +-----------------------+      +-----------------------+
|    Service Layer      | ---> |   Repository Layer    | ---> |    EF Core Context    |
| (Business Logic)      |      | (IUserRepository)     |      |    (MyDbContext)      |
+-----------------------+      +-----------------------+      +-----------------------+
                                          |                              |
                                          V                              V
                                +-----------------------+      +-----------------------+
                                |      Data Model       |      |    SQL Server / DB    |
                                |     (User Entity)     |      |                       |
                                +-----------------------+      +-----------------------+
```

#### Concrete Example: `IUserRepository` & `UserRepository`

Here’s how you’d implement CRUD in a specific repository:

```csharp
// 1. The Interface (Standard Async Pattern)
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(User user, CancellationToken cancellationToken = default);
    void Update(User user);
    void Delete(User user);
    Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default);
}

// 2. The Implementation (Production-Ready)
public class UserRepository : IUserRepository
{
    private readonly MyDbContext _context;

    public UserRepository(MyDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // FindAsync is efficient and handles primary keys directly
        return await _context.Users.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        // Use AsNoTracking() for read-only lists to improve performance & reduce memory
        return await _context.Users
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(user);
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public void Update(User user)
    {
        ArgumentNullException.ThrowIfNull(user);
        _context.Users.Update(user); 
    }

    public void Delete(User user)
    {
        ArgumentNullException.ThrowIfNull(user);
        _context.Users.Remove(user);
    }

    public async Task<bool> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Returns true if one or more rows were affected
        return await _context.SaveChangesAsync(cancellationToken) > 0;
    }
}
```

#### Why use this concrete repository?
1.  **Simplification:** Your Service doesn't need to know about `DbSet<User>`. It just calls `_userRepo.GetByIdAsync(id)`.
2.  **Mockability:** You can easily mock `IUserRepository` for unit tests without setting up an actual database.
3.  **Encapsulation:** You can hide complex queries (like custom `.Include()` or filtering) inside the repository methods.

---

## 3. Advanced LINQ & Loading Strategies

### Eager, Lazy, and Explicit Loading
*   **Eager Loading:** Use `.Include()` and `.ThenInclude()` to load related data in a single query.
*   **Lazy Loading:** Related data is transparently loaded from the database when the navigation property is first accessed (requires `Microsoft.EntityFrameworkCore.Proxies` and `virtual` properties). **Can lead to the N+1 problem.**
*   **Explicit Loading:** Explicitly load a navigation property later using `context.Entry(user).Collection(u => u.Posts).Load()`.
*   **Split Queries (`AsSplitQuery`):** For complex includes that cause "Cartesian Explosion," EF Core 5+ allows splitting the SQL into multiple statements.
*   **Global Query Filters:** Perfect for Multi-tenancy or Soft Delete logic.

```csharp
// Global Filter for Soft Delete
modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

// Usage with Split Query for performance
var users = await context.Users
    .Include(u => u.Posts)
    .AsSplitQuery()
    .ToListAsync();
```

### The N+1 Query Problem

The N+1 problem occurs when an application executes **1** query to fetch a list of entities (e.g., Users) and then executes **N** additional queries (one for each entity) to fetch related data (e.g., their Posts).

#### Why it happens (The "Bad" Way)
When using **Lazy Loading** or manual querying inside a loop:

```csharp
// 1 Query to fetch all users
var users = await context.Users.ToListAsync();

foreach (var user in users)
{
    // For EACH user (N), a separate query is executed to fetch their posts
    foreach (var post in user.Posts) 
    {
        Console.WriteLine($"{user.Name}: {post.Title}");
    }
}
```
If you have 100 users, this results in **101 database roundtrips** (1 + 100).

**Generated SQL (N+1 queries):**
```sql
-- 1 query for all users
SELECT [u].[Id], [u].[Name] FROM [Users] AS [u]

-- N queries (one for each user's posts)
SELECT [p].[Id], [p].[Title], [p].[UserId] FROM [Posts] AS [p] WHERE [p].[UserId] = 1
SELECT [p].[Id], [p].[Title], [p].[UserId] FROM [Posts] AS [p] WHERE [p].[UserId] = 2
-- ... (continues for all users)
```

#### How to fix it (The "Good" Way)
Use **Eager Loading** with `.Include()` to fetch all necessary data in a single SQL query (using a `JOIN`). For read-only displays, always add `.AsNoTracking()`.

```csharp
// Only 1 Query is executed using a SQL JOIN
// AsNoTracking() makes it even faster by skipping the change tracker
var users = await context.Users
    .AsNoTracking()
    .Include(u => u.Posts)
    .ToListAsync(cancellationToken);
```

**Generated SQL (Single query):**
```sql
SELECT [u].[Id], [u].[Name], [p].[Id], [p].[Title], [p].[UserId]
FROM [Users] AS [u]
LEFT JOIN [Posts] AS [p] ON [u].[Id] = [p].[UserId]
ORDER BY [u].[Id]
```

```csharp
foreach (var user in users)
{
    foreach (var post in user.Posts)
    {
        Console.WriteLine($"{user.Name}: {post.Title}");
    }
}
```

---

## 4. Performance Optimization

### AsNoTracking
For read-only operations, always use `.AsNoTracking()`. It bypasses the Change Tracker, significantly reducing memory usage and CPU cycles.

```csharp
var readOnlyUsers = await context.Users
    .AsNoTracking()
    .Where(u => u.IsActive)
    .ToListAsync();
```

### Batching & Bulk Operations
*   **Batching:** EF Core automatically batches `SaveChanges()` calls to reduce database roundtrips.
*   **Bulk Insert:** For high-performance insertion of thousands of rows, use `AddRange()` for automatic batching. For even better performance, consider libraries like `EFCore.BulkExtensions` which leverage `SqlBulkCopy`.
*   **Bulk Updates/Deletes (EF Core 7+):** Perform operations directly on the database without loading entities into memory.

```csharp
// Bulk Insert (Batched SaveChanges)
context.Users.AddRange(listOfUsers);
await context.SaveChangesAsync();

// Bulk Update (EF Core 7+)
await context.Users
    .Where(u => u.LastLogin < oldDate)
    .ExecuteUpdateAsync(s => s.SetProperty(u => u.IsActive, false));
```

### Compiled Queries
For frequently executed queries with high performance requirements, use `EF.CompileAsyncQuery`.

---

## 5. Senior-Level Patterns

### Interceptors
Interceptors allow you to hook into EF Core operations (e.g., before saving changes or executing SQL). They are ideal for automated auditing.

```csharp
public class AuditInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        var entries = eventData.Context.ChangeTracker.Entries<IAuditable>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = DateTime.UtcNow;
        }
        return base.SavingChangesAsync(eventData, result, ct);
    }
}
```

### Clean Architecture: Repository vs. DbContext
In modern .NET, `DbContext` itself implements the **Unit of Work** and **Repository** patterns.
*   **Thin Layer:** Only wrap `DbContext` in a Repository if you need to abstract away EF Core for unit testing or to enforce specific query constraints.
*   **Direct Usage:** For many projects, using `DbContext` directly in Service layers is acceptable and reduces boilerplate, provided you keep business logic out of the data layer.

---

## 6. Tooling: Visual Studio vs. Rider

Both IDEs provide excellent support for EF Core, but the workflow differs slightly.

### Visual Studio
*   **Package Manager Console (PMC):** Use commands like `Add-Migration` and `Update-Database`.
*   **SQL Server Object Explorer:** Built-in tool to browse your SQL Server databases and view data directly.
*   **EF Core Power Tools:** A popular extension for reverse engineering and visualizing DbContexts.

### JetBrains Rider
*   **Terminal / Entity Framework Core UI:** Rider has a dedicated tool window for EF Core migrations (requires a plugin or using the `dotnet ef` CLI).
*   **Database Tool Window:** Powerful integrated database management to inspect SQL Server, run queries, and modify schemas.
*   **Integrated CLI:** `dotnet ef migrations add Initial` works seamlessly in the built-in terminal.

---

## 7. Resiliency and Robustness

To make your EF Core application production-ready, you must handle common distributed system issues like transient failures and concurrency conflicts.

### 1. Connection Resiliency (Retry Logic)
SQL Server connections can sometimes fail due to transient network issues. EF Core provides a built-in way to automatically retry failed commands.

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseSqlServer(
        "your_connection_string",
        sqlOptions =>
        {
            // Automatic retries for transient failures
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
}
```

### 2. Concurrency Control (Optimistic)
In a multi-user system, two people might try to update the same record at once. Using a **RowVersion** (Timestamp) prevents one user from accidentally overwriting another's changes.

```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    // Concurrency Token (handled automatically by EF Core)
    [Timestamp]
    public byte[] RowVersion { get; set; }
}
```

### 3. Query Tags (Better Debugging)
Adding tags to your queries makes it much easier to identify them in SQL Server Profiler or logs.

```csharp
var users = await context.Users
    .TagWith("Fetching all active users for the Dashboard")
    .Where(u => u.IsActive)
    .ToListAsync();
```

---

## 8. Summary Checklist for Performance and Robustness
1. Use `AsNoTracking()` for read-only queries.
2. Use `Project To` (Select) to only fetch required columns.
3. Use `AsSplitQuery()` when fetching multiple large collections.
4. Leverage `ExecuteUpdate`/`ExecuteDelete` for bulk operations.
5. Avoid N+1 queries by properly using `Include`.
6. **Enable Connection Resiliency** for production environments.
7. **Handle Concurrency** using RowVersion or explicit tokens.
8. **Use CancellationTokens** for all async database operations.

---

## 9. References & Further Reading
*   **Microsoft Learn:** [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
*   **Microsoft Learn:** [Connection Resiliency](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency)
*   **Microsoft Learn:** [Handling Concurrency Conflicts](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)
*   **Microsoft Learn:** [Loading Related Data (Eager, Explicit, and Lazy Loading)](https://learn.microsoft.com/en-us/ef/core/querying/related-data/)
*   **Microsoft Learn:** [Performance Diagnosis and Optimization in EF Core](https://learn.microsoft.com/en-us/ef/core/performance/)
*   **Blog:** [EF Core 7: Bulk Updates and Deletes](https://devblogs.microsoft.com/dotnet/announcing-ef7/#bulk-update-and-delete)
*   **Blog:** [Best Practices for Entity Framework Core](https://code-maze.com/efcore-best-practices/)

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
