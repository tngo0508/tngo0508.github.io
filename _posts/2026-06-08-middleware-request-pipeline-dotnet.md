---
title: "Custom Middleware and the Request Pipeline in ASP.NET Core"
excerpt: "Learn how to build and orchestrate custom middleware to handle cross-cutting concerns like logging, exception handling, and security in your .NET applications."
date: 2026-06-08
categories:
  - .NET
  - Web API
tags:
  - Middleware
  - ASP.NET Core
  - Request Pipeline
  - Best Practices
toc: true
---

### 1. Introduction

The ASP.NET Core request pipeline consists of a sequence of delegates, called **Middleware**, that are invoked one after another to handle HTTP requests and responses. Understanding how to create and order these components is essential for building efficient and maintainable web applications.

---

### 2. How the Pipeline Works

Each middleware component:
1.  Receives an `HttpContext`.
2.  Can perform logic before the next middleware is called.
3.  Decides whether to pass the request to the next component in the chain (`next()`) or "short-circuit" the pipeline (e.g., if a user is unauthorized).
4.  Can perform logic after the next middleware has finished.

---

### 3. Creating Custom Middleware

There are two primary ways to create middleware: **Inline** (using `app.Use`) and **Class-based**.

#### Class-Based Middleware
This is the preferred approach for complex logic and reusability.

```csharp
public class RequestLoggingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Logic before the next middleware
        Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");

        // 2. Call the next middleware
        await next(context);

        // 3. Logic after the next middleware
        Console.WriteLine($"Response Status: {context.Response.StatusCode}");
    }
}
```

#### Registering the Middleware
In `Program.cs`:
```csharp
app.UseMiddleware<RequestLoggingMiddleware>();
```

---

### 4. Important Considerations: Ordering

The order in which you register middleware matters immensely. Middleware registered first is executed first on the way in, and last on the way out.

**Typical Order:**
1.  **ExceptionHandler:** Should be first to catch errors from everything that follows.
2.  **HSTS / HTTPS Redirection.**
3.  **Static Files.**
4.  **Routing.**
5.  **CORS.**
6.  **Authentication.**
7.  **Authorization.**
8.  **Custom Business Middleware.**
9.  **Endpoints (Controllers/Minimal APIs).**

---

### 5. Middleware vs. Action Filters

A common question is: "Should I use Middleware or an Action Filter?"

-   **Use Middleware** for cross-cutting concerns that don't need access to MVC-specific features (like `ModelState` or specific Controller actions). Examples: Logging, Image resizing, Global error handling.
-   **Use Action Filters** when you need access to the execution context of a specific controller action. Examples: Validation, specific caching for one endpoint.

---

### 6. Best Practices

1.  **Use Extension Methods:** Wrap your middleware registration in an extension method for a cleaner `Program.cs`.
    ```csharp
    public static class MiddlewareExtensions {
        public static IApplicationBuilder UseRequestLogger(this IApplicationBuilder builder) => 
            builder.UseMiddleware<RequestLoggingMiddleware>();
    }
    ```
2.  **Avoid Business Logic:** Middleware should focus on infrastructure and cross-cutting concerns. Keep business logic in Services.
3.  **Watch for Performance:** Since middleware runs on every request, keep it lightweight. Avoid heavy database calls inside `InvokeAsync`.

---

### 7. Conclusion

Custom middleware is a powerful tool for decorating your request pipeline with necessary features without cluttering your controllers. By mastering the request pipeline, you gain full control over how your .NET web applications process data and respond to clients.
