---
layout: single
title: "C# Interview Preparation: Key Concepts and Knowledge"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - C#
  - Interview Preparation
  - .NET
---

This post covers essential C# concepts and knowledge to help you prepare for your technical interviews. We will dive into memory management, OOP principles, language-specific features, and advanced concepts.

## 1. Memory & Type System

### Value Types vs. Reference Types
*   **Value Types (`struct`, `enum`, primitives like `int`, `bool`):** Stored directly where they are declared. If declared as a local variable, they live on the **Stack**. If they are part of a class, they live on the **Heap**. Copying a value type creates a new, independent copy of the data.
*   **Reference Types (`class`, `interface`, `delegate`, `string`, `object`):** The actual data (object) lives on the **Heap**, while the variable itself holds a reference (memory address) to that data. Copying a reference type only copies the reference, not the actual object.

### Boxing and Unboxing
*   **Boxing:** The process of converting a value type to the type `object` or to any interface type implemented by this value type. This involves allocating an object on the heap and copying the value into it.
*   **Unboxing:** The process of extracting the value type from the object.
*   **Performance Cost:** Boxing is expensive because it requires heap allocation and memory copying. Frequent boxing/unboxing can lead to performance degradation and increased GC pressure.

### Stack vs. Heap
*   **Stack:** Used for static memory allocation and execution of threads. It's fast, but has a small size. Memory is managed automatically (LIFO).
*   **Heap:** Used for dynamic memory allocation. It's larger but slower than the stack. Objects on the heap are managed by the **Garbage Collector (GC)**, which periodically reclaims memory from objects that are no longer reachable.

---

## 2. Object-Oriented Programming (OOP)

### Abstract Class vs. Interface

| Feature | Abstract Class | Interface |
| :--- | :--- | :--- |
| **Inheritance** | A class can inherit from only **one** abstract class. | A class can implement **multiple** interfaces. |
| **Implementation** | Can have fully implemented methods and abstract methods. | Traditionally only signatures; C# 8.0+ allows **Default Interface Methods**. |
| **Fields/State** | Can have instance fields (state). | Cannot have instance fields. |
| **Access Modifiers** | Can have any access modifier (public, private, etc.). | All members are **public** by default (C# 8.0+ allows private/protected). |
| **Constructor** | Can have constructors and destructors. | Cannot have constructors or destructors. |
| **Relationship** | Defines an **"is-a"** relationship. | Defines a **"can-do"** (contract) relationship. |

*   **When to use Abstract Class:** Use when you want to share code among several closely related classes (base implementation) and when you need to provide common state.
*   **When to use Interface:** Use when you want to define a contract for disparate classes that might not be related by inheritance, or when you need multiple inheritance.

### Access Modifiers
*   **public:** Accessible from anywhere.
*   **private:** Accessible only within the same class or struct.
*   **protected:** Accessible within the same class or in derived classes.
*   **internal:** Accessible only within the same assembly (.dll or .exe).
*   **protected internal:** Accessible within the same assembly OR from derived classes in other assemblies.
*   **private protected:** Accessible within the same class or derived classes within the same assembly.

### Virtual vs. Abstract
*   **Virtual Method:** Has an implementation in the base class. Derived classes *can* override it using the `override` keyword, but it's not mandatory.
*   **Abstract Method:** Has no implementation in the base class (it's only a signature). It *must* be overridden in any non-abstract derived class.

---

## 3. Language-Specific Features

### LINQ (Language Integrated Query)
*   **Deferred Execution:** LINQ queries are not executed when they are defined. They are executed only when you iterate over the result (e.g., using `foreach`, `.ToList()`, or `.Count()`).
*   **IEnumerable vs. IQueryable:**
    *   `IEnumerable<T>`: Best for in-memory collections (LINQ to Objects). Filtering happens on the client-side.
    *   `IQueryable<T>`: Best for out-of-memory data sources (LINQ to SQL/Entity Framework). It translates the query into the provider's language (e.g., SQL) and executes it on the server-side.

### Generics
*   **Type Safety:** Generics allow you to write code that works with any type while maintaining type safety at compile time.
*   **Performance:** `List<T>` is superior to `ArrayList` because it avoids boxing/unboxing when dealing with value types and eliminates the need for explicit casting.

### Delegates and Events
*   **Delegates:** Type-safe function pointers.
*   **Action, Func, and Predicate:** Predefined generic delegates that simplify code:
    *   `Action<T>`: Returns `void`.
    *   `Func<T, TResult>`: Returns a value.
    *   `Predicate<T>`: Returns a `bool`.
*   **Events:** A way for a class to notify other classes when something happens. They are built on top of delegates but provide encapsulation (only the owner can invoke the event).

---

## 4. Advanced Concepts

### Async/Await
*   **How it works:** `Task` and `Task<T>` represent asynchronous operations. `await` yields control back to the caller until the task completes, preventing the main thread from blocking (crucial for UI or high-throughput servers).
*   **Avoid `async void`:** Except for event handlers, always return `Task` or `Task<T>`. `async void` methods cannot be awaited, and exceptions thrown within them can crash the process because they can't be caught by the caller.

### IDisposable & using blocks
*   **Unmanaged Resources:** These are resources not managed by the GC (e.g., file handles, database connections, network sockets).
*   **IDisposable:** An interface with a `Dispose()` method to manually release these resources.
*   **Using Statement:** Ensures that `Dispose()` is called automatically, even if an exception occurs, providing a clean way to manage resource lifetimes.

### Properties vs. Fields
*   **Fields:** Variables declared directly in a class (usually private).
*   **Properties:** Provide a flexible mechanism to read, write, or compute the value of a private field (Encapsulation).
*   **Auto-implemented properties:** `public int Age { get; set; }` allows you to define properties without explicitly writing the backing field when no additional logic is required.

---

## 5. SOLID Principles

*   **S - Single Responsibility:** A class should have only one reason to change.
*   **O - Open/Closed:** Software entities should be open for extension but closed for modification.
*   **L - Liskov Substitution:** Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
*   **I - Interface Segregation:** Clients should not be forced to depend on methods they do not use.
*   **D - Dependency Inversion:** Depend on abstractions, not concretions.
    *   **Dependency Injection (DI):** A technique to achieve Dependency Inversion, widely used in .NET Core to inject services into constructors, making the code more testable and maintainable.

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})

