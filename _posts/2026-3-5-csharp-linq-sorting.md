---
layout: single
title: "C# Interview Preparation: LINQ and Sorting"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - .NET
  - C#
  - Interview Preparation
  - LINQ
  - Sorting
---

This post covers essential C# syntax for sorting and common LINQ methods often used in technical interviews and coding challenges.

## 1. LINQ Sorting

LINQ (Language Integrated Query) provides a clean way to sort any `IEnumerable<T>`. Note that LINQ methods are **non-destructive** (they return a new sequence).

### OrderBy & OrderByDescending
*   `OrderBy(x => key)`: Sorts in ascending order.
*   `OrderByDescending(x => key)`: Sorts in descending order.

```csharp
var numbers = new List<int> { 5, 2, 8, 1 };
var sorted = numbers.OrderBy(n => n).ToList(); // { 1, 2, 5, 8 }
var desc = numbers.OrderByDescending(n => n).ToList(); // { 8, 5, 2, 1 }
```

### ThenBy & ThenByDescending
Used for secondary sorting criteria.

```csharp
var users = new List<User> { ... };
var sortedUsers = users.OrderBy(u => u.LastName)
                       .ThenBy(u => u.FirstName)
                       .ToList();
```

### Reverse
Inverts the order of elements in a sequence.

```csharp
var reversed = numbers.AsEnumerable().Reverse();
```

---

## 2. In-Place Sorting (Array and List)

Unlike LINQ, these methods modify the original collection. This is more memory-efficient as it avoids creating a new collection.

### Array.Sort()
*   `Array.Sort(arr)`: Sorts the array in-place (ascending).
*   `Array.Reverse(arr)`: Reverses the array in-place.

```csharp
int[] arr = { 5, 2, 8, 1 };
Array.Sort(arr); // { 1, 2, 5, 8 }
```

### List.Sort()
*   `list.Sort()`: Sorts the list in-place using the default comparer.

```csharp
var list = new List<int> { 5, 2, 8, 1 };
list.Sort(); // { 1, 2, 5, 8 }
```

---

## 3. Custom Sorting

When sorting complex objects or using non-default criteria, you need custom logic.

### Lambda Expression (Comparison<T>)
The most common way for `List.Sort()`.

```csharp
// Sort list by string length
list.Sort((a, b) => a.Length.CompareTo(b.Length));

// Reverse sort (descending)
list.Sort((a, b) => b.CompareTo(a));
```

### IComparer<T>
Useful for reusable or complex sorting logic that you want to encapsulate in a class.

```csharp
public class LengthComparer : IComparer<string>
{
    public int Compare(string x, string y) => x.Length.CompareTo(y.Length);
}

// Usage
Array.Sort(strArr, new LengthComparer());
list.Sort(new LengthComparer());
```

### IComparable<T>
Defines the "default" sorting behavior for a class.

```csharp
public class User : IComparable<User>
{
    public string Name { get; set; }
    public int Age { get; set; }

    public int CompareTo(User other)
    {
        if (other == null) return 1;
        // Primary sort by Age, secondary by Name
        int result = this.Age.CompareTo(other.Age);
        if (result == 0) result = this.Name.CompareTo(other.Name);
        return result;
    }
}
```

---

## 4. Common LINQ Methods

Essential methods for data manipulation and queries.

### Filtering & Projection
*   `Where(x => condition)`: Filters elements based on a predicate.
*   `Select(x => transformation)`: Projects each element into a new form.
*   `SelectMany(x => x.Collection)`: Flattens a sequence of collections.

### Quantifiers (Returns bool)
*   `Any(condition)`: Returns `true` if at least one element matches.
*   `All(condition)`: Returns `true` if all elements match.
*   `Contains(value)`: Returns `true` if the sequence contains a specific value.

### Element Operators
*   `First()` / `FirstOrDefault()`: Returns the first element (throws exception if empty vs returns `default`).
*   `Single()` / `SingleOrDefault()`: Returns the only element (throws if sequence has 0 or >1 elements).
*   `Last()` / `LastOrDefault()`: Returns the last element.

### Aggregation
*   `Count()`: Returns the number of elements.
*   `Sum()`, `Min()`, `Max()`, `Average()`: Standard numeric aggregations.
*   `Aggregate((acc, x) => nextAcc)`: Performs a custom accumulation.

### Set Operations & Conversions
*   `Distinct()`: Removes duplicate values.
*   `Intersect()`, `Union()`, `Except()`: Standard set logic.
*   `ToList()`, `ToArray()`, `ToDictionary(x => x.Key)`: Converts to a concrete collection.
*   `GroupBy(x => x.Category)`: Groups elements by a key.

---

## 5. Summary Table: LINQ vs. In-Place

| Feature | LINQ (`OrderBy`) | `Array.Sort` / `List.Sort` |
| :--- | :--- | :--- |
| **Modification** | Returns **NEW** sequence (Non-destructive) | Modifies **ORIGINAL** (Destructive) |
| **Type** | Works on any `IEnumerable<T>` | Works on Arrays/Lists only |
| **Performance** | Allocates extra memory for new object | Memory efficient (In-place) |
| **Syntax** | Fluent / Declarative (better for complex queries) | Imperative (better for performance) |

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
