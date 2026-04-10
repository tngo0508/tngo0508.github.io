---
layout: single
title: "Part 20: Mastering FluentValidation in .NET 10: Building Robust Validation Logic"
date: 2026-4-12
show_date: true
toc: true
toc_label: "FluentValidation Guide"
classes: wide
tags:
  - .NET
  - C#
  - Validation
  - FluentValidation
  - ASP.NET Core
---

Validation is a critical part of any application. While .NET comes with **Data Annotations** (like `[Required]` or `[StringLength]`), they often fall short when dealing with complex business rules.

In this post, we'll explore **FluentValidation**, a popular library for .NET that allows you to build strongly-typed, readable, and highly maintainable validation logic.

---

## 1. Why FluentValidation?

Data Annotations are simple, but they have several limitations:
1.  **Model Pollution:** Your domain models or DTOs become cluttered with validation attributes.
2.  **Limited Complexity:** It's hard to express complex rules (e.g., "Field A is required only if Field B is 'X'").
3.  **Hard to Test:** Testing attribute-based validation is more cumbersome than testing a separate class.

**FluentValidation** solves these by separating validation logic from your models, using a **Fluent API** (which we discussed in Part 18).

---

## 2. Backend vs. Frontend Validation: Where does it fit?

One common question is: **"Is FluentValidation for the frontend or the backend?"**

The answer is: **It is primarily a Backend validation library.**

### Why Backend?
In web development, you should **never trust the client**. Even if you have perfect JavaScript validation in your React or Angular app, a malicious user can bypass it by calling your API directly (using tools like Postman or `curl`). 
*   **Backend Validation (FluentValidation):** Protects your data integrity and security. It is **mandatory**.
*   **Frontend Validation (JS/HTML5):** Provides immediate feedback to the user for a better experience (UX). It is **optional but recommended**.

### Can it be used for Frontend?
While it's a .NET library, it can be used on the "frontend" in specific scenarios:
1.  **Blazor WebAssembly:** Since Blazor runs .NET in the browser, you can use FluentValidation directly in your client-side forms!
2.  **Shared Logic:** You can put your DTOs and Validators in a **Shared Class Library** used by both your ASP.NET Core API (Backend) and your Blazor App (Frontend).

---

## 3. Getting Started with .NET 10

To use FluentValidation in an ASP.NET Core project, you'll need the following NuGet packages:

```bash
dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
```

---

## 4. Creating Your First Validator

Let's say you have a `UserRegistrationDto`:

```csharp
public class UserRegistrationDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    public int Age { get; set; }
}
```

To validate this, you create a class that inherits from `AbstractValidator<T>`:

```csharp
using FluentValidation;

public class UserRegistrationValidator : AbstractValidator<UserRegistrationDto>
{
    public UserRegistrationValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email is required.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.");

        // Cross-property validation
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match.");

        RuleFor(x => x.Age)
            .InclusiveBetween(18, 99).WithMessage("You must be between 18 and 99 years old.");
    }
}
```

---

## 5. Registering Validators (Dependency Injection)

In .NET 10, you can register all validators in an assembly with a single line in `Program.cs`:

```csharp
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Register all validators from the assembly containing UserRegistrationValidator
builder.Services.AddValidatorsFromAssemblyContaining<UserRegistrationValidator>();

var app = builder.Build();
```

---

## 6. Using Validators in Your API

You can inject the validator directly into your Minimal API or Controller:

### Minimal API Example
```csharp
app.MapPost("/register", async (UserRegistrationDto dto, IValidator<UserRegistrationDto> validator) =>
{
    var validationResult = await validator.ValidateAsync(dto);

    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    // Proceed with registration...
    return Results.Ok("User registered successfully!");
});
```

---

## 7. Custom Validation Logic

Sometimes built-in rules aren't enough. You can use `.Must()` or `.Custom()` for complex checks:

```csharp
RuleFor(x => x.Email)
    .MustAsync(async (email, cancellation) => 
    {
        var exists = await _userService.EmailExistsAsync(email);
        return !exists;
    })
    .WithMessage("This email is already registered.");
```

---

## 8. Production-Ready Example: Advanced Validation Scenario

In a real-world application, you often need to validate more than just strings and integers. Here's a comprehensive example using complex rules, regex, and collection validation.

### The Product Request (DTO)
```csharp
public record CreateProductRequest(
    string Name,
    string Sku,
    decimal Price,
    List<string> Tags,
    ProductCategory Category // Enum
);
```

### The Advanced Validator
```csharp
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .WithMessage("Product name is required and must not exceed 100 characters.");

        RuleFor(x => x.Sku)
            .NotEmpty()
            .Matches(@"^[A-Z]{3}-\d{4}$")
            .WithMessage("SKU must be in the format 'AAA-0000' (e.g., LAP-1010).");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be a positive value.");

        // Validating Collections
        RuleFor(x => x.Tags)
            .NotNull()
            .Must(t => t.Count > 0).WithMessage("At least one tag is required.")
            .ForEach(tag => tag.NotEmpty().MaximumLength(20));

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Please select a valid product category.");
    }
}
```

### Clean API Response (Standardized Error Format)
In production, returning a standardized `ProblemDetails` (RFC 7807) is best practice. FluentValidation integrates perfectly with Minimal APIs:

```csharp
app.MapPost("/products", async (CreateProductRequest request, IValidator<CreateProductRequest> validator) =>
{
    var validationResult = await validator.ValidateAsync(request);

    if (!validationResult.IsValid)
    {
        // Automatically returns 400 Bad Request with RFC 7807 format
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    // Proceed to save product...
    return Results.Created($"/products/{request.Sku}", request);
});
```

---

## 9. Comparison Table

| Feature | Data Annotations | FluentValidation |
| :--- | :--- | :--- |
| **Separation of Concerns** | No (Mixed with model) | Yes (Separate class) |
| **Complex Rules** | Difficult | Very Easy |
| **Async Validation** | No | Yes |
| **Localization** | Supported | Better Support |
| **Unit Testing** | Harder | Extremely Easy |

---

## 10. Summary

FluentValidation is the go-to choice for validation in professional .NET applications. It keeps your models clean, makes your validation logic expressive, and integrates seamlessly with the ASP.NET Core Dependency Injection system.

### Next in the Series
Now that you know how to validate your data, check out Part 19: Mastering EF Core: Table Relations to see how to store it efficiently!

---
## References
- [FluentValidation Documentation](https://docs.fluentvalidation.net/)
- [GitHub: FluentValidation](https://github.com/FluentValidation/FluentValidation)
