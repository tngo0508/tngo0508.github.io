---
layout: single
title: "Mastering PDF Generation in .NET 10: Using Rotativa.AspNetCore in Blazor and MVC"
excerpt: "Learn how to use Rotativa.AspNetCore to generate PDF files in .NET 10 for both traditional MVC applications and modern Blazor apps."
date: 2026-04-10
show_date: true
classes: wide
categories:
  - .NET C#
  - Programming
tags:
  - .NET 10
  - ASP.NET Core
  - PDF
  - Rotativa
  - Blazor
toc: true
toc_label: "PDF Guide"
---

`Rotativa.AspNetCore` is a popular wrapper around the `wkhtmltopdf` engine. While it is a "classic" choice, it remains functional in **.NET 10**. However, because it relies on the MVC rendering engine, its implementation differs slightly between **MVC** and **Blazor**.

In this guide, we'll walk through setting up and using Rotativa in a modern .NET 10 project.

---

### 1. Prerequisites: The Binaries
Rotativa is not a standalone library; it requires the `wkhtmltopdf` executable to perform the actual HTML-to-PDF conversion.

1.  **Download:** Get the `wkhtmltopdf` binaries for your operating system.
2.  **Organize:** Create a folder named `Rotativa` inside your `wwwroot` directory.
3.  **Deploy:** Place `wkhtmltopdf.exe` (and `wkhtmltoimage.exe` if needed) in that folder.

> **Pro Tip:** For Linux deployments, ensure the Linux version of `wkhtmltopdf` is installed on the server and has execution permissions (`chmod +x`).

---

### 2. Installation & Configuration

First, install the NuGet package:

```bash
dotnet add package Rotativa.AspNetCore
```

In .NET 10, configuration is typically done in your `Program.cs`. Even if you are building a Blazor app, you'll need the MVC services.

```csharp
using Rotativa.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add MVC services (required for Rotativa)
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Setup Rotativa with the path to your binaries
// This tells Rotativa to look in wwwroot/Rotativa
RotativaConfiguration.Setup(app.Environment.WebRootPath, "Rotativa");

app.UseStaticFiles();
app.MapControllers();

app.Run();
```

---

### 3. Usage in ASP.NET Core MVC

In a traditional MVC controller, using Rotativa is straightforward because it returns a `ViewAsPdf` result, which inherits from `ActionResult`.

**Controller Example:**

```csharp
public class InvoiceController : Controller
{
    public IActionResult DownloadInvoice(int id)
    {
        var model = _service.GetInvoice(id);
        
        // This renders 'Views/Invoice/DownloadInvoice.cshtml' as a PDF
        return new ViewAsPdf("DownloadInvoice", model)
        {
            FileName = $"Invoice_{id}.pdf",
            PageSize = Rotativa.AspNetCore.Options.Size.A4,
            PageMargins = new Rotativa.AspNetCore.Options.Margins(15, 15, 15, 15),
            CustomSwitches = "--footer-center \"Page [page] of [toPage]\""
        };
    }
}
```

---

### 4. Usage in Blazor (.NET 10 Web App)

Rotativa **cannot** render Blazor components (`.razor` files) directly. Instead, you must use an MVC Controller as a "bridge" and a `.cshtml` file as your PDF template.

#### Step A: Create the PDF Template
Create a classic Razor View at `Views/Pdf/ReportTemplate.cshtml`:

```html
@model MyProject.Models.ReportModel
@{ Layout = null; }
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="~/css/bootstrap.min.css" />
</head>
<body>
    <h1>@Model.Title</h1>
    <p>Generated on @DateTime.Now</p>
    <div class="content">
        @Html.Raw(Model.HtmlBody)
    </div>
</body>
</html>
```

#### Step B: Create the Bridge Controller
Create a controller to handle the PDF generation request:

```csharp
[Route("api/[controller]")]
public class ExportController : Controller
{
    [HttpGet("pdf/{reportId}")]
    public IActionResult GetPdf(int reportId)
    {
        var data = FetchData(reportId);
        // Path to the .cshtml file relative to the Views folder
        return new ViewAsPdf("../Pdf/ReportTemplate", data);
    }
}
```

#### Step C: Trigger from Blazor Component
In your `.razor` file, use the `NavigationManager` to trigger a download:

```razor
@inject NavigationManager Navigation

<button class="btn btn-primary" @onclick="Download">Download PDF</button>

@code {
    private void Download()
    {
        // Navigate to the controller action (forceLoad: true is essential)
        Navigation.NavigateTo("/api/export/pdf/123", forceLoad: true);
    }
}
```

---

### 5. Common Pitfalls & Best Practices

*   **Asset Paths:** Inside your `.cshtml` view, use absolute paths or the `~` symbol. `wkhtmltopdf` struggles with relative paths during conversion because it runs as a separate process.
*   **Authentication:** If your controller requires authentication, ensure your Blazor app passes the necessary cookies/tokens when navigating to the PDF endpoint.
*   **CSS Support:** `wkhtmltopdf` uses an older rendering engine. It does **not** support modern CSS features like Flexbox or CSS Grid very well. Use standard HTML tables or older float-based CSS for layout.
*   **Asynchronous Generation:** For large reports, consider generating the PDF asynchronously and notifying the user when it's ready, as `wkhtmltopdf` can be resource-intensive.

---

### 6. Modern Alternatives (Looking Ahead)

While Rotativa is battle-tested, many .NET 10 developers are moving toward more modern, native .NET libraries. For a deep dive into these, check out our **Modern PDF Generation Guide for Blazor**.

1.  **QuestPDF:** A high-performance library that uses a fluent C# code-based layout (no HTML required). It's extremely fast and thread-safe.
2.  **Playwright / PuppeteerSharp:** These use a headless Chromium browser to "print" HTML to PDF. They support all modern CSS/JS features but are more resource-heavy than Rotativa.

---

### 7. Further Reading & References

*   **Rotativa.AspNetCore GitHub Repository:** [webgio/Rotativa.AspNetCore](https://github.com/webgio/Rotativa.AspNetCore)
*   **Official wkhtmltopdf Website:** [wkhtmltopdf.org](https://wkhtmltopdf.org/)
*   **NuGet Package:** [Rotativa.AspNetCore on NuGet](https://www.nuget.org/packages/Rotativa.AspNetCore/)
*   **Microsoft Documentation:** [ASP.NET Core MVC Controllers](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/actions)

