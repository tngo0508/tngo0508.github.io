---
layout: single
title: "CQRS in .NET 10: Separating Concerns for Scalable Applications"
date: 2026-03-17
show_date: true
toc: true
toc_label: "CQRS Guide"
classes: wide
tags:
  - .NET 10
  - C#
  - Architecture
  - CQRS
  - Design Patterns
---

As applications grow in complexity, the traditional "one-size-fits-all" approach to data handling often starts to show its cracks. You might find your database models becoming bloated with logic that serves both complex reports and simple updates. This is where **CQRS (Command Query Responsibility Segregation)** comes in.

In this post, we'll explore how to implement CQRS in **.NET 10** using the latest **C#** features to build clean, maintainable, and scalable systems.

---

## 1. What is CQRS?

**CQRS** stands for **Command Query Responsibility Segregation**. The core principle is simple: **Every method should either be a Command that performs an action, or a Query that returns data to the caller, but not both.**

### The Analogy: The Restaurant
Think of a busy restaurant:
- **The Waiter (Query):** When you ask for the menu or check the status of your order, the waiter provides information. They don't change anything in the kitchen; they just "read" the state.
- **The Chef (Command):** When you place an order, the chef changes the state of the kitchen (uses ingredients, creates a dish). They are "writing" to the state.

By separating these roles, the restaurant can handle more customers efficiently. The waiters can focus on serving information quickly, while the chefs focus on high-quality preparation.

---

## 2. Why use CQRS in .NET 10?

With .NET 10 and modern C#, CQRS has become even more elegant to implement. Here are a few reasons to consider it:

1.  **Independent Scaling:** You can scale your read operations (queries) differently from your write operations (commands).
2.  **Simplified Models:** You no longer need a single "God Model" that handles everything. You can have optimized models for reading and different ones for writing.
3.  **Security & Validation:** It's easier to apply different security rules and validation logic to commands versus queries.
4.  **Optimized Performance:** You can use different data storage strategies (e.g., a relational DB for commands and a cache or NoSQL DB for queries).

---

## 3. Implementing CQRS with C# 14

Let's look at a modern implementation of CQRS in a .NET 10 Web API. We'll use **Records** for our messages and **Primary Constructors** for our handlers—features that make our code incredibly concise.

### The Domain: A Simple Task Manager

#### 1. The Command (The "Write")
Commands represent an intent to change the state. In C#, `records` are perfect for this as they are immutable by default.

```csharp
// Define the command to create a new task
public record CreateTaskCommand(string Title, string Description, DateTime DueDate) : IRequest<Guid>;
```

#### 2. The Command Handler
This is where the logic for the command lives. Thanks to **Primary Constructors** (refined in recent C# versions), we can inject dependencies directly into the class header.

```csharp
public class CreateTaskHandler(IApplicationDbContext context, ILogger<CreateTaskHandler> logger) 
    : IRequestHandler<CreateTaskCommand, Guid>
{
    public async Task<Guid> Handle(CreateTaskCommand command, CancellationToken ct)
    {
        var task = new ProjectTask 
        { 
            Id = Guid.NewGuid(),
            Title = command.Title, 
            Description = command.Description,
            DueDate = command.DueDate
        };

        context.Tasks.Add(task);
        await context.SaveChangesAsync(ct);
        
        logger.LogInformation("Task {TaskId} created successfully", task.Id);
        return task.Id;
    }
}
```

#### 3. The Query (The "Read")
Queries are used to fetch data. They should never modify the database.

```csharp
// Define the query to get task details
public record GetTaskByIdQuery(Guid Id) : IRequest<TaskDto?>;

public record TaskDto(Guid Id, string Title, string Description, bool IsCompleted);
```

#### 4. The Query Handler
Queries can be optimized for speed. For example, you might use Dapper or raw SQL for queries to bypass the overhead of a full ORM like Entity Framework if needed.

```csharp
public class GetTaskByIdHandler(IApplicationDbContext context) 
    : IRequestHandler<GetTaskByIdQuery, TaskDto?>
{
    public async Task<TaskDto?> Handle(GetTaskByIdQuery query, CancellationToken ct)
    {
        return await context.Tasks
            .Where(t => t.Id == query.Id)
            .Select(t => new TaskDto(t.Id, t.Title, t.Description, t.IsCompleted))
            .FirstOrDefaultAsync(ct);
    }
}
```

---

## 4. MediatR: The Engine of CQRS

In the book *Microservices Design Patterns in .NET*, MediatR is highlighted as a key tool for implementing CQRS because it provides a clean way to decouple the **Request** (the Command or Query) from the **Handler**.

### 4.1 Pipeline Behaviors (The "Russian Doll" Pattern)
One of the most powerful features of MediatR is **Pipeline Behaviors**. These allow you to inject logic *before* or *after* a handler runs, perfect for cross-cutting concerns like logging, performance monitoring, or validation.

For example, a **Validation Behavior** can automatically check your commands using **FluentValidation** before they even reach the handler:

```csharp
public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) 
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var context = new ValidationContext<TRequest>(request);
        var validationResults = await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct)));
        var failures = validationResults.SelectMany(r => r.Errors).Where(f => f != null).ToList();

        if (failures.Count != 0)
            throw new ValidationException(failures);

        return await next();
    }
}
```

### 4.2 Notifications (Handling Side Effects)
While Commands are one-to-one (one command, one handler), MediatR **Notifications** are one-to-many. This is useful for "Fire and Forget" tasks that should happen after a command succeeds, such as sending an email or updating a cache.

```csharp
// 1. Define the notification
public record TaskCreatedNotification(Guid TaskId) : INotification;

// 2. Define multiple handlers
public class EmailNotificationHandler : INotificationHandler<TaskCreatedNotification>
{
    public Task Handle(TaskCreatedNotification n, CancellationToken ct) 
    {
        // Logic to send email
        return Task.CompletedTask;
    }
}
```

---

## 5. Recommended Project Structure (Feature-Slicing)

In modern .NET applications, especially when using MediatR for CQRS, we often move away from traditional "Folders-by-Type" (where all Commands are in one folder, all Handlers in another) and toward **Vertical Slice Architecture** or **Feature-Slicing**. This keeps everything related to a single feature in one place.

Here is an example ASCII diagram for a task-management project:

```text
📁 TaskManagement.Api
├── 📁 Features
│   └── 📁 Tasks
│       ├── 📁 Commands
│       │   ├── 📁 CreateTask
│       │   │   ├── CreateTaskCommand.cs
│       │   │   ├── CreateTaskHandler.cs
│       │   │   └── CreateTaskValidator.cs
│       │   └── 📁 CompleteTask
│       │       ├── CompleteTaskCommand.cs
│       │       └── CompleteTaskHandler.cs
│       ├── 📁 Queries
│       │   ├── 📁 GetTaskById
│       │   │   ├── GetTaskByIdQuery.cs
│       │   │   └── GetTaskByIdHandler.cs
│       │   └── 📁 GetTaskList
│       │       ├── GetTaskListQuery.cs
│       │       └── GetTaskListHandler.cs
│       ├── 📁 Common
│       │   └── TaskDto.cs
│       └── Endpoints.cs
├── 📁 Infrastructure
│   ├── 📁 Persistence
│   │   ├── ApplicationDbContext.cs
│   │   └── 📁 Configurations
│   └── 📁 Services
├── 📁 Domain
│   ├── 📁 Entities
│   │   └── ProjectTask.cs
│   ├── 📁 Events
│   │   └── TaskCreatedEvent.cs
├── Program.cs
└── appsettings.json
```

---

### 5.1 Anatomy of a Feature Slice: CreateTask

In **Vertical Slice Architecture**, we group everything needed for a single "action" together. This makes the logic incredibly easy to find and modify. Let's look inside the `📁 CreateTask` folder from the diagram above.

#### 1. The Command (`CreateTaskCommand.cs`)
This defines **what** we want to do. It's just data.
```csharp
public record CreateTaskCommand(string Title, string Description, DateTime DueDate) : IRequest<Guid>;
```

#### 2. The Validator (`CreateTaskValidator.cs`)
This defines **the rules** that must be met before we even start. By using `FluentValidation`, we keep the handler clean.
```csharp
public class CreateTaskValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.DueDate).GreaterThan(DateTime.UtcNow);
    }
}
```

#### 3. The Logic (`CreateTaskHandler.cs`)
This is **how** we do it. It receives the validated command and performs the work.
```csharp
public class CreateTaskHandler(IApplicationDbContext context) 
    : IRequestHandler<CreateTaskCommand, Guid>
{
    public async Task<Guid> Handle(CreateTaskCommand cmd, CancellationToken ct)
    {
        var task = new ProjectTask { Title = cmd.Title, Description = cmd.Description };
        context.Tasks.Add(task);
        await context.SaveChangesAsync(ct);
        return task.Id;
    }
}
```

#### 4. The Entry Point (`Endpoints.cs`)
Instead of a giant Controller, each feature area registers its own routes.
```csharp
public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/tasks");
        group.MapPost("/", async (CreateTaskCommand cmd, ISender mediator) => Results.Created($"/tasks/{await mediator.Send(cmd)}", null));
        group.MapGet("/{id:guid}", async (Guid id, ISender mediator) => await mediator.Send(new GetTaskByIdQuery(id)) is TaskDto dto ? Results.Ok(dto) : Results.NotFound());
    }
}
```

---

## 6. Deep Dive: FluentValidation & AbstractValidator

As you saw in the `CreateTaskValidator` example, we used a class that inherits from `AbstractValidator<T>`. This is the core of **FluentValidation**, a popular library in the .NET ecosystem that allows you to define validation rules in a clean, readable, and strongly-typed way.

### 6.1 What is `AbstractValidator<T>`?

When you inherit from `AbstractValidator<T>`, you are creating a "Validator" for a specific type `T` (in our case, `CreateTaskCommand`).

-   **Type Safety:** Because it's generic, the library knows exactly which properties are available on your command.
-   **Separation of Concerns:** Your `CreateTaskCommand` stays as a simple data record, and your `CreateTaskHandler` stays focused on business logic. The "Rules" are kept in their own dedicated file.

### 6.2 Common Validation Rules

Inside the constructor of your validator, you use `RuleFor()` to define what makes a request valid:

-   **`NotEmpty()` / `NotNull()`:** Ensures the field isn't blank or null.
-   **`MaximumLength(n)` / `MinimumLength(n)`:** Controls string sizes.
-   **`GreaterThan(value)` / `LessThan(value)`:** Great for numbers or dates.
-   **`EmailAddress()`:** Automatically validates email formats.
-   **`Must(predicate)`:** Allows you to write custom C# logic (e.g., `.Must(x => x.StartsWith("Task-"))`).

### 6.3 Why use it with CQRS?

In a CQRS architecture, we want to ensure that a **Command** is valid *before* it ever reaches the handler. By using FluentValidation with a **MediatR Pipeline Behavior** (as seen in Section 4.1), we can:

1.  **Stop Invalid Data Early:** The handler never runs if the rules aren't met.
2.  **Keep Handlers Clean:** You don't need `if (string.IsNullOrEmpty(command.Title))` at the top of every handler.
3.  **Consistent Error Messages:** It automatically generates helpful error messages that can be sent directly back to the API user.

---

## 7. Wiring it up in the API

In .NET 10, Minimal APIs continue to be the preferred way to build lightweight endpoints. Integrating CQRS with a library like **MediatR** makes your controllers or endpoints extremely clean.

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add MediatR
builder.Services.AddMediatR(cfg => 
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    
    // Register the validation behavior
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

var app = builder.Build();

// Register our feature-specific endpoints (one line per feature!)
app.MapTaskEndpoints();

app.Run();
```

---

## 8. When to use CQRS (and when NOT to)

While CQRS is powerful, it's not a silver bullet.

### Use CQRS when:
- **Complexity is high:** Your business logic is complicated and hard to manage in a single model.
- **High Traffic:** You need to scale reads and writes independently.
- **Event Sourcing:** You are planning to implement Event Sourcing (CQRS is almost a prerequisite for this).

### Avoid CQRS when:
- **Simple CRUD:** If you're just moving data in and out of a database with very little logic, CQRS is overkill.
- **Small Projects:** The extra boilerplate of commands, queries, and handlers can slow down development in simple apps.

---

## 9. Summary

CQRS is a powerful pattern that, when combined with the modern features of **.NET 10** and **C#**, allows you to build systems that are easy to test, maintain, and scale. By separating the "how we change data" from "how we read data," you gain the flexibility to optimize each path independently.

Have you tried CQRS in your latest .NET projects? Let me know in the comments!

---

## 10. Further Reading
*   **Book Recommendation:** [Microservices Design Patterns in .NET - Second Edition](https://www.packtpub.com/en-us/product/microservices-design-patterns-in-net-9781803243122) (Chapter 6 covers CQRS and MediatR in depth).
*   **Microsoft Architecture Guides:** [CQRS Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
*   **MediatR Documentation:** [Getting Started](https://github.com/jbogard/MediatR)
*   **Martin Fowler:** [CQRS](https://martinfowler.com/bliki/CQRS.html)
*   **FluentValidation Documentation:** [Getting Started](https://docs.fluentvalidation.net/en/latest/installation.html)
