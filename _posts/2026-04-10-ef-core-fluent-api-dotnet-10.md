---
layout: single
title: "Part 13: Mastering Entity Framework Core Fluent API in .NET 10"
date: 2026-04-10
show_date: true
toc: true
toc_label: "EF Core Fluent API"
classes: wide
tags:
  - .NET
  - C#
  - Entity Framework
  - Database
  - .NET 10
---

In Entity Framework (EF) Core, you have two primary ways to configure your domain models: **Data Annotations** (using attributes like `[Key]` or `[Required]`) and the **Fluent API**. While Data Annotations are convenient for simple scenarios, the Fluent API is the true power-user tool for complex configurations.

In this post, we'll dive deep into using the Fluent API in **.NET 10**, focusing on its flexibility, readability, and some of the latest improvements.

---

## 1. What is a Fluent API?

A **Fluent API** is a software engineering design pattern based on **method chaining**. Its goal is to make code more readable, discoverable, and expressive. In .NET, it's a dominant pattern used for configuration, unit testing, and building complex objects.

The core idea is that each method call returns an object (often a builder), allowing you to "chain" calls together so the code reads like a natural sentence. This makes the intent of the code clear and leverages the IDE's IntelliSense to guide you through only the valid "next steps" in a configuration.

---

## 2. Why Fluent API?

While Data Annotations are easy to read, they have limitations:
- **Clean Domain Models:** Keep your domain classes free from database-specific attributes.
- **Advanced Configuration:** Many features (like many-to-many relationships or complex keys) can *only* be configured via the Fluent API.
- **Centralized Logic:** All configuration is in one place (`DbContext`), making it easier to manage.
- **Greater Control:** It overrides Data Annotations, giving you the final word on how your database is structured.

---

## 3. Basic Configuration

All Fluent API configuration happens inside the `OnModelCreating` method of your `DbContext`.

```csharp
public class MyDbContext : DbContext
{
    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            // Set the table name
            entity.ToTable("AppProducts");

            // Define the primary key
            entity.HasKey(p => p.ProductId);

            // Configure properties
            entity.Property(p => p.Name)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(p => p.Price)
                  .HasPrecision(18, 2);
        });
    }
}
```

---

## 4. Relationships: The Heart of the Fluent API

Defining how entities relate to one another is where the Fluent API shines.

### One-to-Many
A `Category` has many `Products`.

```csharp
modelBuilder.Entity<Product>()
    .HasOne(p => p.Category)
    .WithMany(c => c.Products)
    .HasForeignKey(p => p.CategoryId)
    .OnDelete(DeleteBehavior.Cascade);
```

### Many-to-Many
A `Student` can have many `Courses`, and a `Course` can have many `Students`. In .NET 10, EF Core handles the "Join Table" automatically, but you can still configure it manually.

```csharp
modelBuilder.Entity<Student>()
    .HasMany(s => s.Courses)
    .WithMany(c => c.Students)
    .UsingEntity(j => j.ToTable("Enrollments"));
```

---

## 5. New in .NET 10: Simplified JSON Mapping

.NET 10 introduces even more streamlined ways to handle JSON columns, allowing you to treat complex objects as simple properties while maintaining full queryability.

```csharp
modelBuilder.Entity<User>()
    .Property(u => u.Preferences)
    .HasJsonConversion() // New simplified syntax in .NET 10
    .HasColumnType("nvarchar(max)");
```

*Note: In earlier versions, this required more verbose `OwnsOne` configurations.*

---

## 6. Global Query Filters

Global query filters are applied to all queries for a given entity. This is perfect for implementing "Soft Delete."

```csharp
modelBuilder.Entity<Product>()
    .HasQueryFilter(p => !p.IsDeleted);
```

When you query `Products`, EF Core will automatically append `WHERE IsDeleted = 0` to your SQL.

---

## 7. Seeding Data

You can also use the Fluent API to seed your database with initial data.

```csharp
modelBuilder.Entity<Category>().HasData(
    new Category { CategoryId = 1, Name = "Electronics" },
    new Category { CategoryId = 2, Name = "Books" }
);
```

---

## 8. Organizing Your Configuration

As your application grows, `OnModelCreating` can become cluttered. The best practice is to move configurations into separate classes using `IEntityTypeConfiguration<T>`.

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.ProductId);
        builder.Property(p => p.Name).IsRequired();
    }
}

// In your DbContext:
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfiguration(new ProductConfiguration());
    // Or apply all configurations in an assembly:
    // modelBuilder.ApplyConfigurationsFromAssembly(typeof(MyDbContext).Assembly);
}
```

---

## 9. Summary

The Fluent API is an essential tool for any .NET developer working with EF Core. It provides the flexibility needed for real-world database schemas while keeping your domain models clean.

| Feature | Data Annotations | Fluent API |
| :--- | :--- | :--- |
| **Simplicity** | High | Medium |
| **Separation of Concerns** | Low | High |
| **Capability** | Limited | Full |
| **Precedence** | Lower | Higher |

---

## 10. References & Further Reading
*   [Microsoft Docs: Fluent API](https://learn.microsoft.com/en-us/ef/core/modeling/)
*   [Entity Framework Core GitHub](https://github.com/dotnet/efcore)
