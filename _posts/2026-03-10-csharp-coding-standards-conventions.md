---
layout: single
title: "Part 15: C# Coding Standards and Conventions: A Step-by-Step Refactoring Guide"
date: 2026-03-10
show_date: true
toc: true
toc_label: "Coding Standards"
classes: wide
tags:
  - .NET
  - C#
  - Clean Code
  - Coding Standards
  - Best Practices
---

Maintaining a high standard of code quality is essential for professional .NET development. Following established C# coding standards and conventions ensures that your codebase is consistent, readable, and easy for team members to navigate.

In this guide, we will review core C# conventions and perform a step-by-step refactor of a messy code sample to demonstrate how to apply these standards effectively.

---

## 1. Core C# Naming Conventions

The most fundamental part of coding standards is naming. Microsoft provides a set of guidelines that are widely adopted in the .NET ecosystem.

| Element | Convention | Example |
| :--- | :--- | :--- |
| **Class, Struct, Interface** | PascalCase | `UserProfile`, `IShoppingCart` |
| **Method** | PascalCase | `GetOrderDetails()` |
| **Property** | PascalCase | `CreatedAt` |
| **Private Field** | camelCase with `_` prefix | `_userService` |
| **Local Variable** | camelCase | `totalAmount` |
| **Parameter** | camelCase | `userId` |
| **Constant** | PascalCase | `MaxRetryCount` |

---

## 2. General Coding Guidelines

### Braces and Layout
- Always use braces (`{ }`) even for single-line statements to prevent errors during future edits.
- Use one blank line between method definitions and property groups to improve visual separation.
- Keep classes and methods focused on a single responsibility.

### Modern C# Syntax
- **Use `var`** when the type is obvious from the right-hand side of the assignment (e.g., `var list = new List<string>();`).
- **String Interpolation:** Use `$"Value: {variable}"` instead of `string.Format()` or string concatenation for better readability.
- **Expression-bodied members:** Use `=>` for simple one-line methods or properties to reduce boilerplate.

---

## 3. The Before Code (Non-Standard)

Here is an example of code that works but violates multiple C# standards and conventions.

```csharp
using System;
using System.Collections.Generic;

namespace MyProject.Logic
{
public class order_processor
{
    private List<string> Items = new List<string>();
    public double total_price;

    public void add_item(string Name, double p)
    {
        if (Name != null) {
            Items.Add(Name);
            total_price += p;
        }
    }

    public void PrintOrder()
    {
        Console.WriteLine("Order contains " + Items.Count + " items.");
        foreach(var i in Items)
        {
            Console.WriteLine("Item: " + i);
        }
        Console.WriteLine("Total: " + total_price.ToString());
    }
}
}
```

### Issues identified:
1.  **Class Name:** `order_processor` violates PascalCase.
2.  **Private Field:** `Items` should be `_items` and use camelCase.
3.  **Public Field:** `total_price` should be a property (`TotalPrice`) and use PascalCase.
4.  **Method Name:** `add_item` violates PascalCase.
5.  **Parameter Name:** `Name` violates camelCase.
6.  **Code Style:** Inconsistent indentation, string concatenation, and lack of file-scoped namespace.

---

## 4. Step-by-Step Refactoring

### Step 1: Apply Naming Conventions
First, we update the class, methods, fields, and parameters to follow the standard casing rules.

```csharp
public class OrderProcessor
{
    private List<string> _items = new List<string>();
    public double TotalPrice { get; private set; }

    public void AddItem(string name, double price)
    {
        // ...
    }
}
```

### Step 2: Modernize Syntax and Layout
Next, we use file-scoped namespaces, string interpolation, and target-typed `new()`.

```csharp
namespace MyProject.Logic;

public class OrderProcessor
{
    private readonly List<string> _items = new();
    
    public void PrintOrder()
    {
        Console.WriteLine($"Order contains {_items.Count} items.");
        // ...
    }
}
```

### Step 3: Final Polishing (The After Code)

Here is the fully refactored, standard-compliant version:

```csharp
using System;
using System.Collections.Generic;

namespace MyProject.Logic;

public class OrderProcessor
{
    private readonly List<string> _items = new();
    
    public double TotalPrice { get; private set; }

    public void AddItem(string name, double price)
    {
        ArgumentNullException.ThrowIfNull(name);

        _items.Add(name);
        TotalPrice += price;
    }

    public void PrintOrder()
    {
        Console.WriteLine($"Order contains {_items.Count} items.");

        foreach (var item in _items)
        {
            Console.WriteLine($"Item: {item}");
        }

        Console.WriteLine($"Total: {TotalPrice:C}");
    }
}
```

---

## 5. Summary of Key Improvements

1.  **File-Scoped Namespace:** Simplified the file structure.
2.  **Encapsulation:** Used a property with a private setter instead of a public field.
3.  **Readonly Intent:** Marked the internal list as `readonly` to prevent accidental reassignment.
4.  **Guard Clauses:** Used `ArgumentNullException.ThrowIfNull` for cleaner validation.
5.  **String Interpolation:** Improved readability of the output logic.

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 10: TDD and Unit Testing in .NET]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
* [Part 11: xUnit Testing: Facts and Theories]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})
* [Part 12: FluentAssertions: Write More Readable Unit Tests]({{ site.baseurl }}{% post_url 2026-3-7-fluent-assertions %})
* [Part 13: UI Testing with Playwright]({{ site.baseurl }}{% post_url 2026-03-08-playwright-xunit-ui-testing %})
* [Part 14: C# Refactoring Best Practices]({{ site.baseurl }}{% post_url 2026-03-09-csharp-refactoring-best-practices %})
* [Part 15: C# Coding Standards and Conventions]({{ site.baseurl }}{% post_url 2026-03-10-csharp-coding-standards-conventions %})
