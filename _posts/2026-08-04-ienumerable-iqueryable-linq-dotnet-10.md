---
layout: single
title: "IEnumerable<T> and IQueryable<T> in C# LINQ"
date: 2026-08-04
show_date: true
toc: true
toc_label: "IEnumerable and IQueryable"
classes: wide
tags:
  - .NET
  - C#
  - LINQ
  - .NET 10
  - Entity Framework Core
---

`IEnumerable<T>` and `IQueryable<T>` both let you write LINQ queries, but they represent different execution models. Understanding the difference helps you avoid loading too much data, calling methods that cannot be translated to SQL, or accidentally moving work from the database to application memory.

The short version is:

```text
IEnumerable<T>  -> LINQ-to-Objects; the application executes the query
IQueryable<T>   -> provider-backed LINQ; a provider builds and executes the query
```

The examples use these simple models:

```csharp
public sealed record Product(int Id, string Name, decimal Price);

public sealed record ProductListItem(string Name, decimal Price);
```

The operators look similar because `IQueryable<T>` also implements `IEnumerable<T>`. Their overloads, however, accept different kinds of code.

## 1. The two interfaces

`IEnumerable<T>` represents a sequence that can be enumerated in application code:

```csharp
public interface IEnumerable<out T>
{
    IEnumerator<T> GetEnumerator();
}
```

`IQueryable<T>` represents a queryable data source. It extends `IEnumerable<T>` and adds an expression tree describing the query:

```csharp
public interface IQueryable<out T> : IEnumerable<T>, IQueryable
{
    // The full interface also exposes the query's element type,
    // provider, and expression tree.
}
```

You usually do not implement either interface yourself. Arrays, lists, and many collection APIs provide `IEnumerable<T>`. Entity Framework Core's `DbSet<TEntity>` provides `IQueryable<TEntity>`.

## 2. `IEnumerable<T>`: execute in .NET memory

With `IEnumerable<T>`, LINQ operators use delegates such as `Func<T, bool>`:

```csharp
var products = new[]
{
    new Product(1, "Keyboard", 79.99m),
    new Product(2, "Mouse", 29.99m),
    new Product(3, "Monitor", 249.99m)
};

IEnumerable<Product> affordableProducts = products
    .Where(product => product.Price < 100m)
    .OrderBy(product => product.Name);
```

The lambda is compiled as .NET code and runs when the sequence is enumerated:

```csharp
foreach (var product in affordableProducts)
{
    Console.WriteLine(product.Name);
}
```

The source is already in memory, so filtering does not reduce the cost of obtaining the source data. It can still reduce the work performed by later operators and the amount of data returned to the caller.

Common `IEnumerable<T>` sources include:

```csharp
IEnumerable<int> fromArray = new[] { 1, 2, 3 };
IEnumerable<int> fromList = new List<int> { 1, 2, 3 };
IEnumerable<int> generated = Enumerable.Range(1, 3);
```

## 3. `IQueryable<T>`: let a provider build the query

An `IQueryable<T>` stores a query expression instead of immediately running each LINQ operation. For example, an EF Core query might look like this:

```csharp
IQueryable<Product> query = dbContext.Products
    .Where(product => product.Price < 100m)
    .OrderBy(product => product.Name)
    .Select(product => new ProductListItem(
        product.Name,
        product.Price));
```

The lambda passed to `Where` and `Select` is represented as an expression tree. EF Core can inspect that tree and translate supported operations into SQL. The query normally executes at a terminal operation:

```csharp
var items = await query.ToListAsync(cancellationToken);
```

A relational provider may produce SQL conceptually similar to:

```sql
SELECT Name, Price
FROM Products
WHERE Price < 100
ORDER BY Name;
```

The exact SQL depends on the provider and model configuration. Inspect generated SQL when query performance matters.

## 4. The important overload difference

LINQ has overloads that accept either a delegate or an expression tree:

```csharp
// LINQ-to-Objects
IEnumerable<T> Where<T>(
    this IEnumerable<T> source,
    Func<T, bool> predicate);

// Provider-backed LINQ
IQueryable<T> Where<T>(
    this IQueryable<T> source,
    Expression<Func<T, bool>> predicate);
```

The same-looking lambda has a different destination:

```csharp
IEnumerable<Product> inMemory = products;
IQueryable<Product> database = dbContext.Products;

// Runs as C# code over an in-memory collection.
var memoryResult = inMemory.Where(product => product.Name.StartsWith("K"));

// Can be translated by the database provider.
var databaseResult = database.Where(product => product.Name.StartsWith("K"));
```

An expression tree is data that a provider can inspect. A compiled delegate is executable .NET code that a remote provider generally cannot translate.

## 5. Deferred execution applies to both

Both interfaces commonly use deferred execution. Building a query does not necessarily read the source:

```csharp
var query = dbContext.Products
    .Where(product => product.Price < 100m);

// The database query is usually sent here.
var products = await query.ToListAsync(cancellationToken);
```

Typical terminal operations include:

```csharp
await query.ToListAsync(cancellationToken);
await query.FirstOrDefaultAsync(cancellationToken);
await query.CountAsync(cancellationToken);
await query.AnyAsync(cancellationToken);
```

For in-memory sequences, use the corresponding synchronous methods such as `ToList`, `FirstOrDefault`, `Count`, and `Any`.

Do not enumerate a database query repeatedly when one materialized result is enough:

```csharp
var productList = await query.ToListAsync(cancellationToken);
var count = productList.Count;
var first = productList.FirstOrDefault();
```

This avoids issuing separate database queries for each operation.

## 6. How to switch from `IQueryable<T>` to `IEnumerable<T>`

There are two common approaches, and they have different meanings.

### Use `AsEnumerable` to change the remaining operators

`AsEnumerable` changes the static view of the query to `IEnumerable<T>` without materializing it immediately:

```csharp
var query = dbContext.Products
    .Where(product => product.Price >= 50m); // Provider-side

var result = query
    .AsEnumerable()
    .Where(product => HasSpecialLabel(product)); // Application-side
```

The first `Where` can be translated to SQL. The second `Where` runs in .NET after rows have been read. `AsEnumerable` is useful when a small, provider-translatable query must be followed by a local method that the provider cannot translate.

```csharp
static bool HasSpecialLabel(Product product) =>
    product.Name.Contains("Pro", StringComparison.OrdinalIgnoreCase);
```

Use it carefully: if the first query returns one million rows, all of those rows may cross the database boundary before the local filter runs.

### Use `ToList` or `ToArray` to materialize

Materialization executes the query and stores the results in memory:

```csharp
var productsInMemory = await dbContext.Products
    .Where(product => product.Price >= 50m)
    .Select(product => new ProductListItem(product.Name, product.Price))
    .ToListAsync(cancellationToken);

IEnumerable<ProductListItem> result = productsInMemory
    .Where(item => item.Name.Length > 5);
```

Everything after `ToListAsync` is LINQ-to-Objects. Materialize when you need a stable snapshot, need to enumerate repeatedly, or are crossing an application boundary. Project and filter before materializing whenever possible.

## 7. How to switch from `IEnumerable<T>` to `IQueryable<T>`

`AsQueryable` can wrap an in-memory sequence:

```csharp
IEnumerable<Product> source = products;
IQueryable<Product> queryable = source.AsQueryable();

var result = queryable.Where(product => product.Price < 100m);
```

This does not turn the array into a database query. The default provider is LINQ-to-Objects, so the query still runs in application memory. It mainly enables the `IQueryable<T>` API and expression-tree representation for a local source.

If you materialize a database query first and then call `AsQueryable`, the database has already been queried:

```csharp
var list = await dbContext.Products.ToListAsync(cancellationToken);
var localQuery = list.AsQueryable(); // Still only an in-memory query
```

Use `AsQueryable` for local dynamic-query scenarios only when its behavior is clear to the reader. It is not a performance upgrade and cannot push an in-memory collection back to the database.

## 8. A safe query boundary pattern

A repository or service can keep provider work before the boundary and return a materialized result:

```csharp
public async Task<IReadOnlyList<ProductListItem>> GetAffordableProductsAsync(
    decimal maximumPrice,
    CancellationToken cancellationToken)
{
    return await dbContext.Products
        .Where(product => product.Price <= maximumPrice)
        .OrderBy(product => product.Name)
        .Select(product => new ProductListItem(
            product.Name,
            product.Price))
        .ToListAsync(cancellationToken);
}
```

The database performs filtering, sorting, and projection. The caller receives a concrete in-memory list and does not need to know which provider was used.

## 9. Common mistakes

### Calling `AsEnumerable` too early

```csharp
// The database may return every product before filtering locally.
var result = dbContext.Products
    .AsEnumerable()
    .Where(product => product.Price < 100m)
    .ToList();
```

Prefer keeping translatable operations provider-side:

```csharp
var result = await dbContext.Products
    .Where(product => product.Price < 100m)
    .ToListAsync(cancellationToken);
```

### Calling `ToList` before filtering

```csharp
// Loads all products unnecessarily.
var result = (await dbContext.Products.ToListAsync(cancellationToken))
    .Where(product => product.Price < 100m)
    .ToList();
```

### Assuming every .NET method translates to SQL

Provider translation is limited to operations supported by the provider. If a method cannot be translated, keep the query provider-side with a translatable equivalent, or intentionally materialize after a selective filter:

```csharp
var candidates = await dbContext.Products
    .Where(product => product.Price < 100m)
    .ToListAsync(cancellationToken);

var result = candidates
    .Where(product => HasSpecialLabel(product))
    .ToList();
```

Test translation and query size against the real database rather than assuming that an `IQueryable<T>` query is automatically efficient.

## 10. Quick decision guide

```text
Data is already in memory             -> IEnumerable<T>
Data is managed by a query provider   -> IQueryable<T>
Need database filtering/projection     -> Keep IQueryable<T>
Need local .NET-only logic            -> AsEnumerable or materialize
Need a reusable in-memory snapshot     -> ToList/ToArray
Need AsQueryable on local data         -> It stays in memory
```

The practical rule is to keep a provider-backed query as `IQueryable<T>` while applying filters, ordering, joins, and projections that the provider can translate. Call `ToListAsync` or another terminal operation at the boundary where the application needs actual objects. Then use `IEnumerable<T>` for ordinary in-memory processing.

## Summary

`IEnumerable<T>` executes LINQ operators as .NET code over an enumerable sequence. `IQueryable<T>` builds an expression tree that a provider, such as EF Core, can translate and execute elsewhere.

Use these conversions intentionally:

```csharp
query.AsEnumerable(); // Continue the rest of the query in .NET
await query.ToListAsync(); // Execute and materialize
list.AsQueryable(); // Wrap local data; does not create a database query
```

The interface conversion is not just a type change. It determines where subsequent work runs, how much data crosses the boundary, and whether a provider can optimize the query.
