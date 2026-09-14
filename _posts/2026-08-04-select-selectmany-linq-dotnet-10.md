---
layout: single
title: "Select and SelectMany in C# LINQ with .NET 10"
date: 2026-08-04
show_date: true
toc: true
toc_label: "Select and SelectMany"
classes: wide
tags:
  - .NET
  - C#
  - LINQ
  - .NET 10
  - Data Processing
---

`Select` and `SelectMany` are two of the most useful LINQ operators. Both transform data, but they produce different shapes:

- `Select` transforms each source item into exactly one result. It preserves nesting.
- `SelectMany` transforms each source item into a sequence and combines those sequences into one flat sequence.

This post uses C# with .NET 10. The operators themselves are not new to .NET 10; the important skill is choosing the operator that matches the shape of your data.

## 1. Sample model and data

Imagine a store with products and customer orders. Each order contains a collection of line items.

```csharp
public sealed record Product(int Id, string Name, decimal Price);

public sealed record OrderLine(Product Product, int Quantity);

public sealed record Order(int Id, string Customer, OrderLine[] Lines);

var orders = new[]
{
    new Order(1001, "Ava", new[]
    {
        new OrderLine(new Product(1, "Keyboard", 79.99m), 1),
        new OrderLine(new Product(2, "Mouse", 29.99m), 2)
    }),
    new Order(1002, "Noah", new[]
    {
        new OrderLine(new Product(3, "Monitor", 249.99m), 1)
    })
};
```

The source is an `Order[]`. Each `Order` has an `OrderLine[]`, so working with all line items involves a nested sequence.

## 2. Use `Select` for one-to-one projection

Use `Select` when you want to map every element to one value. For example, project orders into display strings:

```csharp
var orderLabels = orders
    .Select(order => $"#{order.Id} - {order.Customer}");

foreach (var label in orderLabels)
{
    Console.WriteLine(label);
}
```

Output:

```text
#1001 - Ava
#1002 - Noah
```

`Select` changes the element type from `Order` to `string`, but the sequence still has two elements. In general:

```text
IEnumerable<TSource> -> IEnumerable<TResult>
```

### Project into a DTO or record

Projection is often preferable to returning database entities or exposing more fields than a caller needs.

```csharp
public sealed record OrderSummary(int Id, string Customer, int LineCount);

var summaries = orders.Select(order => new OrderSummary(
    order.Id,
    order.Customer,
    order.Lines.Length));
```

The selector runs once for each order. It is a good place to shape data for a UI, API response, or report.

### Select a property: the result can still be nested

This is a common point of confusion:

```csharp
var linesByOrder = orders.Select(order => order.Lines);
```

The type is effectively:

```csharp
IEnumerable<OrderLine[]> // one array for each order
```

`Select` returns one `Lines` array for each `Order`, so the result remains nested. Use this when the order boundaries matter.

## 3. Use `SelectMany` to flatten nested sequences

Use `SelectMany` when each source item contains zero or more child items and you need one sequence containing all children:

```csharp
var allLines = orders
    .SelectMany(order => order.Lines);

foreach (var line in allLines)
{
    Console.WriteLine($"{line.Product.Name}: {line.Quantity}");
}
```

Output:

```text
Keyboard: 1
Mouse: 2
Monitor: 1
```

The shape changes from:

```text
Order[] -> OrderLine[][]
```

to:

```text
Order[] -> OrderLine[]
```

`SelectMany` preserves the source order. An order with no lines contributes no elements to the flattened result.

### Keep parent information with the child

The simplest overload returns only the child. Use the result-selector overload when the parent is also needed:

```csharp
var lineDetails = orders.SelectMany(
    order => order.Lines,
    (order, line) => new
    {
        OrderId = order.Id,
        order.Customer,
        Product = line.Product.Name,
        line.Quantity
    });
```

This is useful for invoices, audit records, exports, and API responses where each flattened row must retain its parent key.

## 4. Use `DefaultIfEmpty` for empty child collections

`SelectMany` normally removes an empty child collection from the flattened result. `DefaultIfEmpty` changes that behavior: it returns the original sequence when it has elements, or a sequence containing one default value when it is empty.

```csharp
var noLines = Array.Empty<OrderLine>();

var result = noLines.DefaultIfEmpty();

Console.WriteLine(result.Count()); // 1
Console.WriteLine(result.Single() is null); // True
```

For reference types, the default value is `null`. For value types, it is the type's default value, such as `0` for `int`. Prefer the overload that supplies an explicit fallback when a null value would be ambiguous:

```csharp
var placeholder = new OrderLine(
    new Product(0, "(no product)", 0m),
    0);

var result = noLines.DefaultIfEmpty(placeholder);

Console.WriteLine(result.Single().Product.Name); // (no product)
```

### Keep a parent when it has no children

Combine `DefaultIfEmpty` with `SelectMany` when every parent must appear in the output, including parents with no children. This is the in-memory LINQ equivalent of a left outer join:

```csharp
var ordersIncludingEmpty = orders.Append(
    new Order(1003, "Mia", Array.Empty<OrderLine>()));

var lineDetails = ordersIncludingEmpty.SelectMany(
    order => order.Lines.DefaultIfEmpty(),
    (order, line) => new
    {
        OrderId = order.Id,
        order.Customer,
        Product = line is null ? "(no lines)" : line.Product.Name,
        Quantity = line?.Quantity ?? 0
    });

foreach (var detail in lineDetails)
{
    Console.WriteLine(
        $"{detail.OrderId} {detail.Customer}: " +
        $"{detail.Product} ({detail.Quantity})");
}
```

The final row is retained even though order `1003` has no lines:

```text
1001 Ava: Keyboard (1)
1001 Ava: Mouse (2)
1002 Noah: Monitor (1)
1003 Mia: (no lines) (0)
```

Without `DefaultIfEmpty`, order `1003` would produce zero rows because `SelectMany` has no child element to flatten. With it, the selector receives one `null` child, so the example checks for null before reading child properties.

Use this pattern for reports that must show customers with no orders, categories with no products, or any other parent-child relationship where empty children should still be visible. In an `IQueryable<T>` query, confirm that your provider translates the pattern as expected and inspect the generated SQL for large datasets.

## 5. A practical comparison

Suppose an order has two lines and the second order has one line:

```csharp
var nested = orders.Select(order => order.Lines);
var flat = orders.SelectMany(order => order.Lines);
```

Their shapes are different:

```text
nested: [ [Keyboard, Mouse], [Monitor] ]
flat:   [ Keyboard, Mouse, Monitor ]
```

Choose `Select` when the inner collections should remain associated with their parent. Choose `SelectMany` when downstream code should process every child uniformly.

## 6. Filter before or after flattening

Put a filter as early as possible when it does not change the required result. This avoids projecting or flattening values that will be discarded:

```csharp
var expensiveLines = orders
    .SelectMany(order => order.Lines)
    .Where(line => line.Product.Price >= 100m);
```

If the condition depends on the parent, filter the parent first:

```csharp
var avaLines = orders
    .Where(order => order.Customer == "Ava")
    .SelectMany(order => order.Lines);
```

When working with `IQueryable<T>` (for example, Entity Framework Core), keep filtering and projection in the query before materializing it. That gives the provider a chance to translate the work to SQL and return fewer rows:

```csharp
var summaries = dbContext.Orders
    .Where(order => order.Customer == "Ava")
    .SelectMany(order => order.Lines)
    .Where(line => line.Product.Price >= 100m)
    .Select(line => new
    {
        line.Product.Name,
        line.Quantity
    })
    .ToListAsync(cancellationToken);
```

Use only expressions your LINQ provider can translate. For provider-specific behavior, inspect the generated query and test against the actual database.

## 7. Deferred execution and materialization

For `IEnumerable<T>`, `Select` and `SelectMany` are deferred. They do not execute the selector until the result is enumerated:

```csharp
var names = orders.Select(order => order.Customer); // No iteration yet

foreach (var name in names) // The query runs here
{
    Console.WriteLine(name);
}
```

Materialize deliberately at a boundary when you need a snapshot, multiple enumeration, or an API such as indexing:

```csharp
var nameList = orders
    .Select(order => order.Customer)
    .ToList();

var firstName = nameList[0];
```

Avoid calling `ToList()` after every operator. Each materialization allocates a collection and may cause another database round trip when the source is `IQueryable<T>`.

## 8. Efficient and safe practices

### Keep selectors simple

Selectors should normally be side-effect free. Avoid modifying shared state inside `Select` or `SelectMany`; deferred execution and multiple enumeration can make side effects surprising.

### Avoid repeated enumeration

If a flattened result will be consumed more than once, materialize it once:

```csharp
var lineList = orders
    .SelectMany(order => order.Lines)
    .ToList();

var count = lineList.Count;
var monitorLines = lineList.Count(line => line.Product.Name == "Monitor");
```

If it is consumed only once, leave it deferred to avoid an unnecessary allocation.

### Do not use `Select` as a `foreach`

This is misleading because the query is intended for projection, not side effects:

```csharp
// Avoid
orders.Select(order => Console.WriteLine(order.Customer));
```

Use a `foreach` when the purpose is an action:

```csharp
foreach (var order in orders)
{
    Console.WriteLine(order.Customer);
}
```

### Handle nullable child collections explicitly

Prefer initializing collection properties to an empty collection so flattening is safe:

```csharp
public sealed class Customer
{
    public IReadOnlyList<Order> Orders { get; init; } = [];
}
```

If a nullable collection is unavoidable, decide what null means and normalize it at the boundary:

```csharp
var allCustomerOrders = customers
    .SelectMany(customer => customer.Orders ?? []);
```

### Be careful with the index overload

LINQ provides an index overload:

```csharp
var numbered = orders.Select((order, index) => new { index, order.Id });
```

The index is the position in the current enumeration, not a stable database identifier. Do not use it as an ID, especially when a query can be filtered, reordered, or re-enumerated.

## 9. Query syntax equivalent

Query syntax uses a second `from` clause for the same flattening behavior as `SelectMany`:

```csharp
var lineDetails =
    from order in orders
    from line in order.Lines
    select new
    {
        order.Id,
        order.Customer,
        Product = line.Product.Name
    };
```

Method syntax is often easier to compose dynamically, while query syntax can read naturally for joins and multiple ranges. Both compile to equivalent LINQ operators for this example.

## 10. Quick decision guide

Ask what one source element should produce:

```text
one value                  -> Select
one object/DTO              -> Select
one collection, kept nested -> Select
many child values, flattened -> SelectMany
empty children must still appear -> DefaultIfEmpty with SelectMany
child values plus parent     -> SelectMany with a result selector
```

The main performance rule is simple: shape the smallest result you need, filter early, keep provider-backed queries deferred until the final projection, and materialize only when you need a concrete snapshot.

## Summary

`Select` is a one-to-one transformation. `SelectMany` is a one-to-many transformation followed by flattening. Once you identify whether your result should preserve or remove nesting, the choice is straightforward:

```csharp
var labels = orders.Select(order => order.Customer);
var lines = orders.SelectMany(order => order.Lines);
```

Use projections to return only needed fields, retain parent context with the `SelectMany` result selector, and avoid unnecessary enumeration and materialization. These habits produce LINQ code that is both easier to read and more efficient in .NET 10 applications.
