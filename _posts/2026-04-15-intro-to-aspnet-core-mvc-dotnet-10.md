---
layout: single
title: "Part 24: ASP.NET Core MVC & EF Core: A Complete Walkthrough for Beginners"
date: 2026-04-15
show_date: true
toc: true
toc_label: "ASP.NET Core MVC"
classes: wide
tags:
  - .NET
  - C#
  - MVC
  - ASP.NET Core
  - EF Core
  - .NET 10
---

Today, we're diving into the fundamental building blocks of **ASP.NET Core MVC** in **.NET 10**. Whether you're an absolute beginner or just looking for a quick review, this guide will walk you through the core concepts of Model-View-Controller (MVC), View Components, and how to interact with a database using **Entity Framework (EF) Core**.

## 1. The MVC Pattern

The Model-View-Controller (MVC) pattern is a design principle that separates an application into three main components:

- **Model:** Represents the data and business logic.
- **View:** Handles the presentation and user interface (HTML/Razor).
- **Controller:** Acts as an intermediary, handling user requests, updating the Model, and selecting the View.

### Why use MVC?
- **Separation of Concerns:** Each component has a specific responsibility.
- **Testability:** It's easier to unit test individual parts (especially Controllers and Models).
- **Flexibility:** You can swap the UI (View) without changing the business logic (Model).

---

## 2. Models: Defining Your Data

In .NET 10, Models are simple C# classes. Using **Data Annotations**, we can define validation rules directly on the properties:

```csharp
using System.ComponentModel.DataAnnotations;

public class Book
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Author { get; set; } = string.Empty;

    [Range(0.01, 999.99)]
    public decimal Price { get; set; }
}
```

---

## 3. Controllers: The Orchestrators

Controllers handle incoming HTTP requests. They use Dependency Injection to access services like the `DbContext`.

```csharp
public class BooksController : Controller
{
    private readonly ApplicationDbContext _context;

    public BooksController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        var books = await _context.Books.ToListAsync();
        return View(books);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Book book)
    {
        if (ModelState.IsValid)
        {
            _context.Add(book);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(book);
    }
}
```

---

## 4. Views: The User Interface

Views in ASP.NET Core use **Razor**, a markup syntax that lets you embed C# code into HTML.

`Views/Books/Index.cshtml`:
```razor
@model IEnumerable<Book>

<h1>Books List</h1>
<table class="table">
    <thead>
        <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Price</th>
        </tr>
    </thead>
    <tbody>
        @foreach (var item in Model) {
            <tr>
                <td>@item.Title</td>
                <td>@item.Author</td>
                <td>@item.Price.ToString("C")</td>
            </tr>
        }
    </tbody>
</table>
```

---

## 5. View Components: Reusable UI Blocks

**View Components** are more powerful than partial views. They have their own logic and can perform database queries independently of the Controller.

### Creating a View Component
`Components/RecommendedBooksViewComponent.cs`:
```csharp
public class RecommendedBooksViewComponent : ViewComponent
{
    private readonly ApplicationDbContext _context;

    public RecommendedBooksViewComponent(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IViewComponentResult> InvokeAsync(int count)
    {
        var items = await _context.Books.Take(count).ToListAsync();
        return View(items);
    }
}
```

### Invoking it in a View
```razor
@await Component.InvokeAsync("RecommendedBooks", new { count = 3 })
```

---

## 6. Interacting with Database: EF Core in .NET 10

Entity Framework Core is the official ORM for .NET. In .NET 10, it continues to provide a seamless way to map your C# objects to database tables.

### DbContext Configuration
```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Book> Books { get; set; }
}
```

### Registering the Service (Program.cs)
```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllersWithViews();

var app = builder.Build();
```

---

## 7. Dependency Injection (DI)

ASP.NET Core has built-in support for Dependency Injection. This allows you to register services and "inject" them where they are needed (e.g., in Controllers or View Components).

- **Transient:** Created every time they are requested.
- **Scoped:** Created once per client request.
- **Singleton:** Created once and shared throughout the app's lifetime.

---

## 8. Scaffolding: Reverse Engineering an Existing Database

If you have an existing database and want to generate Models and a `DbContext` automatically, you can use **Scaffolding**.

### A. Using the Command Line (CLI)

The `dotnet ef` tool allows you to scaffold your database from the terminal.

1. **Prerequisites:**
   Ensure you have the EF Core tools installed:
   ```bash
   dotnet tool install --global dotnet-ef
   ```
   And add the Design package to your project:
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore.Design
   ```

2. **The Scaffold Command:**
   Run the following command to generate models from a SQL Server database:
   ```bash
   dotnet ef dbcontext scaffold "Server=YOUR_SERVER;Database=YOUR_DB;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer --output-dir Models
   ```

**Key Parameters:**
- `--output-dir` (or `-o`): The folder where models will be generated.
- `--context` (or `-c`): The name of the generated `DbContext` class.
- `--force` (or `-f`): Overwrite existing files.
- `--table`: Scaffold only specific tables.

### B. EF Core Power Tools

For a more "powerful" and visual experience, the **EF Core Power Tools** extension for Visual Studio is highly recommended. It provides a GUI to:
- Select specific tables, views, and stored procedures.
- Customize namespaces and file naming.
- Preview the generated code before applying changes.

To use it, right-click your project in Visual Studio and select **EF Core Power Tools** > **Reverse Engineer**.

---

## 9. Working with Forms: Creating Data

To add a new book to the database, we need a View that contains a form. In ASP.NET Core, we use **Tag Helpers** (`asp-for`, `asp-action`) to simplify the binding between the HTML form and our C# Model.

### A. The Create View
`Views/Books/Create.cshtml`:
```razor
@model Book

<h1>Add New Book</h1>
<form asp-action="Create">
    <div asp-validation-summary="ModelOnly" class="text-danger"></div>
    <div class="form-group">
        <label asp-for="Title"></label>
        <input asp-for="Title" class="form-control" />
        <span asp-validation-for="Title" class="text-danger"></span>
    </div>
    <div class="form-group">
        <label asp-for="Author"></label>
        <input asp-for="Author" class="form-control" />
        <span asp-validation-for="Author" class="text-danger"></span>
    </div>
    <div class="form-group">
        <label asp-for="Price"></label>
        <input asp-for="Price" class="form-control" />
        <span asp-validation-for="Price" class="text-danger"></span>
    </div>
    <button type="submit" class="btn btn-primary">Save</button>
</form>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
}
```

### B. The CRUD Workflow
1. **Request Form:** The user navigates to `/Books/Create`, which triggers the `GET` Create action in the controller.
2. **Post Data:** When the user clicks "Save," the form data is sent back to the server via an `HTTP POST` request.
3. **Model Binding:** ASP.NET Core automatically maps the form fields to the `Book` object's properties.
4. **Data Persistence:** 
   - `_context.Add(book)` tracks the new object in EF Core.
   - `_context.SaveChangesAsync()` generates and executes the `INSERT INTO SQL Server` command.
5. **Redirect:** If successful, the user is redirected to the `Index` page to see the new record.

---

## 10. Tag Helpers: Simplifying Your HTML

Tag Helpers enable server-side code to participate in creating and rendering HTML elements in Razor files. They make your views cleaner and more intuitive.

### Common Tag Helpers

- **`asp-for`**: Binds an element (like `<label>` or `<input>`) to a model property. It automatically handles names, IDs, and validation.
  ```razor
  <input asp-for="Title" class="form-control" />
  ```
- **`asp-controller`**: Specifies the controller to target. If omitted, it defaults to the current controller.
  ```razor
  <a asp-controller="Books" asp-action="Index">Back to List</a>
  ```
- **`asp-action`**: Specifies the action method to target (e.g., `Index`, `Create`, `Edit`).
  ```razor
  <form asp-action="Create"> ... </form>
  ```
- **`asp-route-{value}`**: Adds route parameters to the URL. For example, `asp-route-id` passes an `id`.
  ```razor
  <a asp-action="Details" asp-route-id="@item.Id">View Details</a>
  ```

---

## 11. Form Validation: Ensuring Data Quality

Validation ensures the user provides correct information before it reaches the database. In ASP.NET Core MVC, validation happens in three places:

1.  **Model (Data Annotations):** As shown in Section 2, attributes like `[Required]` define the rules.
2.  **View (Client-Side):** By including `_ValidationScriptsPartial` in the View, jQuery Validation runs instantly on the client side, providing a faster user experience.
3.  **Controller (Server-Side):** The `ModelState.IsValid` check in the `[HttpPost] Create` method (see Section 3) is the final gatekeeper. If validation fails, the Controller returns the View with the error messages.

### Key Validation Tag Helpers:
- **`asp-validation-summary`**: Displays a list of all validation errors at the top of the form.
- **`asp-validation-for`**: Displays the validation error message for a specific property (e.g., right under an input field).

---

## 12. References
- [Official ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
- [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/)

