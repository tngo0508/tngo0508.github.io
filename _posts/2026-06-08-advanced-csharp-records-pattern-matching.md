---
title: "Advanced C#: Mastering Records and Pattern Matching"
excerpt: "Explore how Records and Pattern Matching can simplify your code, improve readability, and ensure data integrity in modern .NET applications."
date: 2026-06-08
categories:
  - .NET
  - C#
tags:
  - C# 9.0
  - C# 10.0
  - C# 11.0
  - C# 12.0
  - Pattern Matching
  - Records
toc: true
---

### 1. Introduction

C# has introduced powerful features in recent versions that shift the language toward a more functional style while maintaining its object-oriented roots. Two of the most impactful features are **Records** and **Pattern Matching**. This post explores how to leverage these tools to write cleaner, safer, and more expressive code.

---

### 2. Records: Immutable by Design

Records are a reference type that provides built-in functionality for encapsulating data. They are ideal for Data Transfer Objects (DTOs), configuration objects, and Value Objects.

#### The Positional Record
The most common way to define a record is using positional parameters:

```csharp
public record User(int Id, string Name, string Email);
```

This single line provides:
- Read-only properties (`Id`, `Name`, `Email`).
- A constructor that assigns these properties.
- **Value-based equality:** Two record instances are equal if their values match, not just their memory address.
- A concise `ToString()` output.
- Deconstruction support.

#### Non-Destructive Mutation with `with`
Since records are typically immutable, you "change" them by creating a new copy with modified values:

```csharp
var user = new User(1, "Alice", "alice@example.com");
var updatedUser = user with { Email = "alice.new@example.com" };
```

---

### 3. Pattern Matching: Beyond the 'if' Statement

Pattern matching allows you to test expressions and take action based on their shape and data.

#### Switch Expressions
The modern switch expression is more concise and returns a value:

```csharp
public string GetUserRole(User user) => user switch
{
    { Id: 1 } => "Admin",
    { Name: "Guest" } => "Visitor",
    _ => "Standard User" // Discard pattern (default)
};
```

#### Property Patterns
You can match against specific properties of an object:

```csharp
if (user is { Name: "Admin", Id: > 0 })
{
    // Logic for valid admin
}
```

#### Relational and Logical Patterns
Introduced in C# 9, these allow for powerful range checks:

```csharp
public string GetGrade(int score) => score switch
{
    >= 90 => "A",
    >= 80 and < 90 => "B",
    >= 70 => "C",
    _ => "F"
};
```

---

### 4. Combining Records and Pattern Matching

When used together, these features become a powerhouse for handling complex domain logic. For example, handling different types of payment methods:

```csharp
public abstract record PaymentMethod;
public record CreditCard(string Number, string Expiry) : PaymentMethod;
public record PayPal(string Email) : PaymentMethod;
public record Crypto(string WalletAddress) : PaymentMethod;

public string ProcessPayment(PaymentMethod method) => method switch
{
    CreditCard { Number: var num } => $"Processing card ending in {num[^4..]}",
    PayPal { Email: var email } => $"Redirecting to PayPal for {email}",
    Crypto => "Awaiting blockchain confirmation",
    _ => throw new ArgumentException("Unknown payment method")
};
```

---

### 5. Conclusion

Records and Pattern Matching represent a significant evolution in C#. By using Records for data containers and Pattern Matching for control flow, you reduce boilerplate and make your intent clear to other developers.

Start replacing your heavy DTO classes with `record` and your nested `if-else` blocks with `switch` expressions today!
