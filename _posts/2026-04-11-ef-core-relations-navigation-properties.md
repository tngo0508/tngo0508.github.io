---
layout: single
title: "Part 18: Mastering Entity Framework Core: Table Relations and Navigation Properties"
date: 2026-04-11
show_date: true
toc: true
toc_label: "EF Core Relations"
classes: wide
tags:
  - .NET
  - C#
  - Entity Framework
  - Database
  - Relationships
---

## 1. What are Navigation Properties?

In EF Core, a **Navigation Property** is a property on one entity that points to another related entity (or a collection of entities). They allow you to "navigate" from one end of a relationship to the other in your code without manually joining tables.

There are two types of navigation properties:
1.  **Reference Navigation Property:** Points to a single related entity (e.g., `public Blog Blog { get; set; }`).
2.  **Collection Navigation Property:** Points to many related entities (e.g., `public ICollection<Post> Posts { get; set; }`).

```csharp
public class Blog
{
    public int BlogId { get; set; }
    public string Url { get; set; }

    // Collection Navigation Property (One Blog has Many Posts)
    public ICollection<Post> Posts { get; set; }
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public int BlogId { get; set; } // Foreign Key

    // Reference Navigation Property (Each Post belongs to one Blog)
    public Blog Blog { get; set; }
}
```

---

## 2. Types of Relationships

EF Core supports three main types of relationships:

### A. One-to-Many
This is the most common relationship. One "Principal" entity (the Blog) is related to many "Dependent" entities (the Posts).

*   **Principal Entity:** The entity that contains the primary key.
*   **Dependent Entity:** The entity that contains the foreign key.

### B. One-to-One
A single entity relates to exactly one other entity. For example, a `User` and their `UserProfile`.

```csharp
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public UserProfile Profile { get; set; } // Reference Navigation
}

public class UserProfile
{
    public int Id { get; set; }
    public string Bio { get; set; }
    public int UserId { get; set; } // Foreign Key
    public User User { get; set; } // Reference Navigation
}
```

### C. Many-to-Many
Multiple entities on one side relate to multiple entities on the other. For example, `Students` and `Courses`.
In modern EF Core (5.0+), you can define many-to-many relationships without an explicit join entity in your code; EF Core manages the join table in the background.

---

## 3. Configuring Relationships with Fluent API

While EF Core can often infer relationships by looking at your navigation properties and foreign keys (Conventions), the **Fluent API** provides explicit control.

### One-to-Many Configuration
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>()
        .HasOne(p => p.Blog)          // Post has one Blog
        .WithMany(b => b.Posts)      // Blog has many Posts
        .HasForeignKey(p => p.BlogId) // Foreign Key on Post
        .OnDelete(DeleteBehavior.Cascade);
}
```

### One-to-One Configuration
```csharp
modelBuilder.Entity<User>()
    .HasOne(u => u.Profile)
    .WithOne(p => p.User)
    .HasForeignKey<UserProfile>(p => p.UserId); // FK must be on the Dependent side
```

---

## 4. Loading Related Data

One of the most important aspects of navigation properties is how you load the related data. By default, EF Core does **not** load related entities (this is called "Lazy Loading by default is off").

### Eager Loading
Load related data as part of the initial query using `.Include()`.

```csharp
var blogs = context.Blogs
    .Include(b => b.Posts)
    .ToList();
```

### Explicit Loading
Load related data for an entity that has already been retrieved.

```csharp
var blog = context.Blogs.First();
context.Entry(blog).Collection(b => b.Posts).Load();
```

### Lazy Loading
Related data is transparently loaded from the database the first time the navigation property is accessed. This requires additional setup (like `UseLazyLoadingProxies()`) and making navigation properties `virtual`.

---

## 5. Advanced Querying & Performance: What to Know?

When querying with navigation properties, your choices have a direct impact on performance. Here's what every developer should know:

### A. The N+1 Problem (Avoid it!)
This occurs when you load a collection (e.g., `Blogs`) but forget to include their related data (e.g., `Posts`). If you then access `blog.Posts` in a loop, EF Core will fire a **separate database query** for every single blog.

*   **Result:** Slow performance and database overload.
*   **Fix:** Use Eager Loading (`.Include()`) or Projections.

### B. Projections: Fetch Only What You Need
Instead of loading the entire `Blog` and all its `Posts` with `.Include()`, use `.Select()` to project exactly what you need into a DTO (Data Transfer Object) or Anonymous Type.

```csharp
var data = context.Blogs
    .Select(b => new 
    {
        BlogUrl = b.Url,
        PostCount = b.Posts.Count // EF Core converts this to a single SQL JOIN
    }).ToList();
```

### C. Split Queries (EF Core 5.0+)
If you use multiple `.Include()` calls on a single query, EF Core may generate a massive JOIN (Cartesian Explosion). **Split Queries** allow you to load related data in multiple smaller SQL queries, which is often faster for large datasets.

```csharp
var blogs = context.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Authors)
    .AsSplitQuery() // Tells EF Core to run separate SQL queries for each include
    .ToList();
```

### D. Filtered Includes (EF Core 5.0+)
You can now apply filters to your `.Include()` calls, which is perfect for fetching only a subset of related data.

```csharp
var blogs = context.Blogs
    .Include(b => b.Posts.Where(p => p.Title.Contains(".NET")))
    .ToList();
```

---

## 6. Shadow Properties and Foreign Keys

Sometimes, you might not want a Foreign Key property (like `BlogId`) in your C# class, but you still need it in the database. These are called **Shadow Properties**.

```csharp
// Post class with no BlogId property
public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; }
    public Blog Blog { get; set; }
}

// Fluent API configuration
modelBuilder.Entity<Post>()
    .HasOne(p => p.Blog)
    .WithMany(b => b.Posts); 
    // EF Core will automatically create a "BlogId" column in the DB
```

---

## 7. Summary: Relationship Cheat Sheet

| Relationship | Principal | Dependent | Fluent API Methods |
| :--- | :--- | :--- | :--- |
| **One-to-Many** | Blog | Post | `HasOne().WithMany()` |
| **One-to-One** | User | Profile | `HasOne().WithOne()` |
| **Many-to-Many** | Student | Course | `HasMany().WithMany()` |

---

## 8. Next in the Series
Now that you have a solid grasp on how to relate and query your data, it's time to ensure that data is valid before it ever reaches your database. 

Check out [Part 19: Mastering FluentValidation in .NET 10]({{ site.baseurl }}{% post_url 2026-04-12-fluent-validation-dotnet-10 %}) to learn how to build robust, readable validation logic for your applications.

---

## 9. References & Further Reading
*   [Microsoft Docs: Relationships in EF Core](https://learn.microsoft.com/en-us/ef/core/modeling/relationships)
*   [Loading Related Data](https://learn.microsoft.com/en-us/ef/core/querying/related-data/)
*   [Split Queries in EF Core](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries)
*   [Shadow Properties](https://learn.microsoft.com/en-us/ef/core/modeling/shadow-properties)
