---
title: "Dependency Injection in .NET: From Lifecycles to Keyed Services"
excerpt: "A deep dive into Dependency Injection in .NET. Learn about service lifecycles, the 'Captive Dependency' problem, and how to use the new Keyed Services in .NET 8."
date: 2026-06-08
categories:
  - .NET
tags:
  - Dependency Injection
  - .NET 8
  - Architecture
  - Best Practices
toc: true
---

### 1. Introduction

Dependency Injection (DI) is the backbone of modern .NET applications. While registering services with `AddScoped` or `AddSingleton` might seem simple, misunderstanding how DI works can lead to memory leaks, thread-safety issues, and hard-to-track bugs. This post explores the nuances of DI lifecycles and advanced features like Keyed Services.

---

### 2. Service Lifecycles Explained

In .NET, the built-in DI container manages the lifetime of a service based on how it is registered:

- **Transient (`AddTransient`):** A new instance is created every time the service is requested. Use this for lightweight, stateless services.
- **Scoped (`AddScoped`):** A new instance is created once per client request (within a single scope). Ideal for database contexts (`DbContext`).
- **Singleton (`AddSingleton`):** A single instance is created the first time it is requested and remains for the application's lifetime. Use this for configuration or stateful shared caches.

---

### 3. The "Captive Dependency" Problem

This is a common pitfall that senior developers must recognize. A **Captive Dependency** occurs when a service with a **longer lifetime** holds a reference to a service with a **shorter lifetime**.

#### Example:
If you inject a `Scoped` service (like a database repository) into a `Singleton` service (like a background worker):
- The `Scoped` service will live as long as the `Singleton` (the entire app life).
- This can lead to database connection leaks or stale data because the `Scoped` service is never disposed of.

**Solution:** Use `IServiceScopeFactory` to create a manual scope inside the Singleton service when you need to access Scoped dependencies.

---

### 4. Keyed Services (.NET 8+)

Before .NET 8, if you had multiple implementations of the same interface, resolving a specific one was cumbersome. Now, we have **Keyed Services**.

#### Registration:
```csharp
builder.Services.AddKeyedSingleton<INotificationService, EmailService>("email");
builder.Services.AddKeyedSingleton<INotificationService, SmsService>("sms");
```

#### Usage:
You can use the `[FromKeyedServices]` attribute in your constructor:

```csharp
public class OrderProcessor([FromKeyedServices("email")] INotificationService mailService)
{
    // Uses EmailService automatically
}
```

---

### 5. Best Practices

1.  **Register by Interface:** Always prefer `AddScoped<IMyService, MyService>()` over concrete types to ensure testability.
2.  **Avoid Service Locator Pattern:** Don't inject `IServiceProvider` everywhere. Let the constructor do the work.
3.  **Keep Constructors Simple:** A constructor should only assign dependencies to fields. Avoid heavy logic or database calls in the constructor.
4.  **Use `ValidateOnBuild`:** In your `Program.cs`, you can enable DI validation to catch lifecycle errors (like Captive Dependencies) during startup:
    ```csharp
    builder.Host.UseDefaultServiceProvider(options => 
    {
        options.ValidateScopes = true;
        options.ValidateOnBuild = true;
    });
    ```

---

### 6. Conclusion

Mastering Dependency Injection is about understanding **control**. By choosing the right lifecycles and avoiding captive dependencies, you build applications that are stable and memory-efficient. Keyed Services provide the final piece of the puzzle for handling complex architectural requirements cleanly.
