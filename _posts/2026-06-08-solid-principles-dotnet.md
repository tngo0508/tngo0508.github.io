---
title: "SOLID Principles in Modern .NET: Beyond the Theory"
excerpt: "Revisit the SOLID principles with practical C# examples. Learn how to apply these foundational patterns to build maintainable and flexible .NET systems."
date: 2026-06-08
categories:
  - Architecture
  - .NET
tags:
  - SOLID
  - Design Patterns
  - Best Practices
  - Clean Code
toc: true
---

### 1. Introduction

Every developer has heard of **SOLID**, but many struggle to apply it beyond the most basic scenarios. These five principles aren't just academic rules; they are practical tools for preventing "Software Rot." This post revisits SOLID with a focus on modern .NET development.

---

### 2. S: Single Responsibility Principle (SRP)
*A class should have one, and only one, reason to change.*

**The Anti-Pattern:** A `UserService` that validates the user, saves them to the database, and sends a welcome email.
**The Fix:** Split these into `UserValidator`, `UserRepository`, and `NotificationService`.

---

### 3. O: Open/Closed Principle (OCP)
*Software entities should be open for extension, but closed for modification.*

**The Anti-Pattern:** A switch statement inside a `PaymentProcessor` that you have to modify every time you add a new payment method (e.g., "Visa", "PayPal").
**The Fix:** Use interfaces (`IPaymentStrategy`) and Dependency Injection. Adding a new payment method becomes a matter of adding a new class, not changing existing code.

---

### 4. L: Liskov Substitution Principle (LSP)
*Subtypes must be substitutable for their base types.*

**The Anti-Pattern:** A `Square` class inheriting from `Rectangle`, where setting the `Width` also changes the `Height`. This breaks the caller's expectation of how a `Rectangle` behaves.
**The Fix:** Use composition or ensure that inheritance truly represents an "is-a" relationship that preserves the behavior of the base type.

---

### 5. I: Interface Segregation Principle (ISP)
*Clients should not be forced to depend on methods they do not use.*

**The Anti-Pattern:** A "God Interface" like `IMachine` that has methods for `Print()`, `Scan()`, and `Fax()`. A simple `Printer` class is now forced to implement `Scan()` and `Fax()`, often with a `NotImplementedException`.
**The Fix:** Split into `IPrinter`, `IScanner`, and `IFax`. A multi-function device can then implement all three.

---

### 6. D: Dependency Inversion Principle (DIP)
*High-level modules should not depend on low-level modules. Both should depend on abstractions.*

**Modern .NET Context:** This is the principle behind the built-in Dependency Injection container.
**The Anti-Pattern:** `public class OrderService { private SqlRepository _repo = new SqlRepository(); }`
**The Fix:** `public class OrderService(IOrderRepository repo) { ... }`

---

### 7. Why SOLID Matters for Seniors

While juniors focus on "making it work," seniors focus on **"making it easy to change."** 
- **SRP** makes code easier to test.
- **OCP** allows for feature additions without regression bugs.
- **ISP** reduces coupling between different parts of the system.

---

### 8. Conclusion

SOLID isn't about perfection; it's about trade-offs. Over-applying these principles can lead to "Interface-itis" (too many interfaces). The goal is to find the right balance that keeps your codebase healthy and your team productive.

Try to identify one "God Class" in your current project and see if you can split it following the SRP today!
