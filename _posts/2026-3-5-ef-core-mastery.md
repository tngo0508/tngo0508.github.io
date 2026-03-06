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
// Basic CRUD Example
using (var context = new MyDbContext())
{
    // CREATE
    var newUser = new User { Name = "John Doe", Email = "john@example.com" };
    context.Users.Add(newUser);
    await context.SaveChangesAsync();

    // READ
    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == "john@example.com");

    // UPDATE
    user.Name = "John Updated";
    await context.SaveChangesAsync();

    // DELETE
    context.Users.Remove(user);
    await context.SaveChangesAsync();
}
```

---

## 3. Advanced LINQ & Loading Strategies

### Eager, Lazy, and Explicit Loading
*   **Eager Loading:** Use `.Include()` and `.ThenInclude()` to load related data in a single query.
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

## 7. Summary Checklist for Performance
1. Use `AsNoTracking()` for read-only queries.
2. Use `Project To` (Select) to only fetch required columns.
3. Use `AsSplitQuery()` when fetching multiple large collections.
4. Leverage `ExecuteUpdate`/`ExecuteDelete` for bulk operations.
5. Avoid N+1 queries by properly using `Include`.

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
