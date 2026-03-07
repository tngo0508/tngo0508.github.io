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
  - .NET
  - C#
  - Interview Preparation
---

This post covers essential C# concepts and knowledge to help you prepare for your technical interviews. We will dive into memory management, OOP principles, language-specific features, and advanced concepts.

## 1. Memory & Type System

### Value Types vs. Reference Types
*   **Value Types (`struct`, `enum`, primitives like `int`, `bool`):** Stored directly where they are declared. If declared as a local variable, they live on the **Stack**. If they are part of a class, they live on the **Heap**. Copying a value type creates a new, independent copy of the data.
*   **Reference Types (`class`, `interface`, `delegate`, `string`, `object`):** The actual data (object) lives on the **Heap**, while the variable itself holds a reference (memory address) to that data. Copying a reference type only copies the reference, not the actual object.

### Pass by Value vs. Pass by Reference

By default, everything in C# is passed **by value**. However, what "value" is being passed depends on the type:

*   **Pass by Value (Default):**
    *   **Value Types:** A **copy of the data** is passed. Changes made inside the method do not affect the original variable.
    *   **Reference Types:** A **copy of the reference** (the memory address) is passed. You can modify the object's properties (because you're pointing to the same data on the heap), but you cannot reassign the original variable to a new object.
*   **Pass by Reference (`ref`, `out`, `in`):**
    *   **`ref`:** Passes the **variable itself**, not just its value. The variable must be initialized before passing. Both the caller and the method can read and write to it.
    *   **`out`:** Similar to `ref`, but the variable does not need to be initialized before passing. However, the method **must** assign a value to it before returning. Useful for returning multiple values.
    *   **`in`:** (C# 7.2+) Passes by reference for performance (avoids copying large structs) but makes the variable **read-only** inside the method.

#### Common Confusion: Passing a Reference Type
*   **Passing a class instance by value:** You pass a copy of the reference. `obj.Name = "New"` changes the original. `obj = new MyClass()` does NOT change the original.
*   **Passing a class instance by `ref`:** You pass the reference to the variable that holds the reference. `obj = new MyClass()` WILL change the original variable to point to the new object.

### Class vs. Struct vs. Record

| Feature | `class` | `struct` | `record` |
| :--- | :--- | :--- | :--- |
| **Type System** | Reference Type | Value Type | Reference Type (usually*) |
| **Equality** | **Reference-based** (Identity) | **Value-based** (State) | **Value-based** (State) |
| **Memory** | Heap | Stack (usually) | Heap |
| **Inheritance** | Supported | Not supported | Supported (between records) |
| **Mutability** | Mutable by default | Mutable (not recommended) | **Immutable** (by default) |
| **Best For** | Complex logic, stateful objects | Small, high-perf data containers | DTOs, Immutable data, POCOs |

\* *C# 10 introduced `record struct`, which is a value-type version of a record.*

*   **Class:** The standard choice for most scenarios. Use when you need objects with **unique identities** (e.g., a `User` entity), complex behavior, or inheritance. Classes are preferred for long-lived objects and when you need to manage state that changes over time.
*   **Struct:** Optimized for performance in specific cases. Use for **small, simple data types** (typically < 16 bytes) that are frequently created and destroyed. They are ideal for mathematical primitives (like `Point` or `Vector`) where stack allocation helps avoid Garbage Collection (GC) pressure. *Avoid structs if they will be passed around frequently as they are copied by value.*
*   **Record:** The best choice for **data-centric objects** and **immutability**. Use for DTOs (Data Transfer Objects), API responses, and configuration settings where "equality" means having the same values rather than the same memory address. Records simplify code with `with` expressions for non-destructive mutation.

#### Choosing the Right Type
*   **Identity Matters?** Use a `class`.
*   **Value Matters?** Use a `record`.
*   **Performance on Small Data Matters?** Use a `struct`.
*   **Need Inheritance?** Use a `class` or `record`.
*   **Need Immutability?** Use a `record`.

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
*   **The N+1 Problem:** A performance trap in ORMs where fetching a list (1 query) leads to N additional queries for related data.
    *   **Bad (N+1):** `var users = context.Users.ToList(); foreach(var u in users) { var posts = u.Posts; }` (1 query for users, then 1 query *per* user for posts).
    *   **Good (Eager):** `var users = context.Users.Include(u => u.Posts).ToList();` (1 single query with a `JOIN`).

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

### String vs. StringBuilder
*   **String (Immutable):** Once created, its value cannot be changed. Any operation that appears to modify it (like `+` or `Concat`) actually creates a **new** string object on the heap.
*   **StringBuilder (Mutable):** Located in `System.Text`, it represents a dynamic, mutable string. It uses an internal buffer to perform modifications (like `Append`, `Insert`, `Replace`) without creating new objects.

| Feature | `string` | `StringBuilder` |
| :--- | :--- | :--- |
| **Mutability** | **Immutable** | **Mutable** |
| **Performance** | Expensive for multiple concatenations. | Highly efficient for many modifications. |
| **Memory** | Increases GC pressure (many temporary objects). | Lower overhead (uses a resizable buffer). |
| **Thread Safety** | **Thread-safe** (due to immutability). | **Not thread-safe**. |
| **Namespace** | `System` | `System.Text` |

*   **String Interning:** C# maintains a "String Intern Pool" for literal strings to save memory. Since strings are immutable, multiple variables can safely point to the same memory location for identical literal values.
*   **When to use each:** Use `string` for small numbers of concatenations or when thread safety is needed. Use `StringBuilder` when modifying strings inside a loop or when dealing with a high frequency of changes to avoid O(N^2) complexity.

---

## 4. Advanced Concepts

### Async/Await
*   **How it works:** `Task` and `Task<T>` represent asynchronous operations. `await` yields control back to the caller until the task completes, preventing the main thread from blocking (crucial for UI or high-throughput servers).
*   **Avoid `async void`:** Except for event handlers, always return `Task` or `Task<T>`. `async void` methods cannot be awaited, and exceptions thrown within them can crash the process because they can't be caught by the caller.
*   **CancellationToken:** Always pass a `CancellationToken` to asynchronous methods that support it. This allows for clean cancellation of long-running or redundant tasks (e.g., when a user cancels a request or navigates away from a page).
*   **ConfigureAwait(false):** In library code, use `ConfigureAwait(false)` to avoid capturing the synchronization context, which improves performance and helps prevent deadlocks.

### IDisposable & using blocks
*   **Unmanaged Resources:** These are resources not managed by the GC (e.g., file handles, database connections, network sockets).
*   **IDisposable:** An interface with a `Dispose()` method to manually release these resources.
*   **Using Statement:** Ensures that `Dispose()` is called automatically, even if an exception occurs, providing a clean way to manage resource lifetimes.

### Properties vs. Fields
*   **Fields:** Variables declared directly in a class (usually private).
*   **Properties:** Provide a flexible mechanism to read, write, or compute the value of a private field (Encapsulation).
*   **Auto-implemented properties:** `public int Age { get; set; }` allows you to define properties without explicitly writing the backing field when no additional logic is required.

---

## 5. Dependency Injection & Service Lifetimes

Dependency Injection (DI) is a fundamental part of modern .NET development. It allows for better testability and looser coupling by injecting dependencies into a class rather than the class creating them itself. A crucial aspect of DI is managing the **lifetime** of these services.

### Service Lifetimes

| Lifetime | New Instance Created... | Shared Within Request? | Typical Usage |
| :--- | :--- | :--- | :--- |
| **Transient** | Every time requested | No | Lightweight, stateless services |
| **Scoped** | Once per scope (on first request) | Yes | `DbContext`, request-specific data |
| **Singleton** | Once per app lifetime | Yes (Global) | Caching, Config, Loggers |

#### 1. Transient
*   **Registration:** `builder.Services.AddTransient<IMyService, MyService>();`
*   **Behavior:** A new instance is created every time the service is requested from the container.
*   **When to use:** Use for lightweight, stateless services where each consumer should have its own private copy.

#### 2. Scoped
*   **Registration:** `builder.Services.AddScoped<IMyService, MyService>();`
*   **Behavior:** A single instance is created per client request (e.g., within the scope of a single HTTP request). 
    *   **Scope boundary:** It starts when the server receives the HTTP request and ends when the response is sent.
    *   **Sharing:** All components (Controller, Services, Repositories) that request the service during that specific request will share the same instance.
    *   **Crucial Distinction:** 
        *   **Separate Requests:** If you hit the same endpoint/controller twice (e.g., refreshing your browser), those are **two separate HTTP requests**. They each get their own instance of the Scoped service.
        *   **Inside One Request:** If your Controller, a Service, and a Repository all need `MyService` during the **same** request, they all receive the **exact same instance**. The first component to request it triggers the creation; subsequent requests within that same scope **reuse** that instance rather than creating a new one.
    *   **Sharing Example:** A `DbContext` is typically registered as Scoped. This ensures that a single HTTP request uses one database connection and one transaction context, even if multiple repositories are used during that request.
    *   **The Lifecycle of a Scoped Service (Step-by-Step):**
        1.  **Scope Creation:** The HTTP server receives an incoming HTTP request. It automatically creates a new DI scope (`IServiceScope`). No service instances are created yet.
        2.  **First Access (Creation):** Your `HomeController` is instantiated to handle the request. Its constructor requires `IMyScopedService`. The DI container checks the current scope, finds no instance, and **creates a new one** (`MyService`).
        3.  **Subsequent Access (Reuse):** Inside the controller, you call a `ProductService` which also needs `IMyScopedService`. The DI container checks the current scope, finds the instance already created in Step 2, and **reuses that exact same instance**.
        4.  **Scope Disposal:** The HTTP response is sent back to the client. The server disposes of the scope. The DI container calls `Dispose()` on the `MyService` instance.
    *   **Manual Scopes (Non-Web):** In a Background Service, you can manually create a scope to process a batch of items:
        ```csharp
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            var service = scope.ServiceProvider.GetRequiredService<IMyScopedService>();
            // The first 'GetRequiredService' creates the instance; 
            // any later calls on 'scope.ServiceProvider' return the SAME instance.
        }
        ```
*   **When to use:** Ideal for services that need to maintain state across multiple components within a single request, such as a database context (`DbContext`) or a unit of work.

#### 3. Singleton
*   **Registration:** `builder.Services.AddSingleton<IMyService, MyService>();`
*   **Behavior:** A single instance is created the first time it's requested (or when the app starts) and is reused throughout the entire application lifetime.
*   **When to use:** Use for services that need to maintain global state, like a cache, configuration settings, or a logging service. **Note:** Singletons must be thread-safe.

### The "Captive Dependency" Problem
A "Captive Dependency" occurs when a service with a **longer lifetime** depends on a service with a **shorter lifetime**.
*   **Example:** Injecting a **Scoped** service into a **Singleton**.
*   **The Issue:** Because the Singleton lives for the entire application, the Scoped service it "captured" also lives for the entire application, effectively bypassing its intended Scoped lifetime. This can lead to subtle bugs, memory leaks, or stale database connections.

---

## 6. SOLID Principles

*   **S - Single Responsibility:** A class should have only one reason to change.
*   **O - Open/Closed:** Software entities should be open for extension but closed for modification.
*   **L - Liskov Substitution:** Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.
*   **I - Interface Segregation:** Clients should not be forced to depend on methods they do not use.
*   **D - Dependency Inversion:** Depend on abstractions, not concretions.
    *   **Dependency Injection (DI):** A technique to achieve Dependency Inversion, widely used in .NET Core to inject services into constructors, making the code more testable and maintainable. (See Section 5 for Service Lifetimes).

---

## 7. References & Further Reading
*   **Microsoft Learn:** [C# Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/)
*   **Microsoft Learn:** [Memory Management and Garbage Collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)
*   **Microsoft Learn:** [Async/Await Best Practices](https://learn.microsoft.com/en-us/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming)
*   **Blog:** [SOLID Principles with C# Examples](https://www.freecodecamp.org/news/solid-principles-explained-in-plain-english/)
*   **Microsoft Learn:** [Dependency injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)

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

