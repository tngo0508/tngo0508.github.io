---
layout: single
title: "How to use CsvHelper to generate a CSV file in .NET 10 MVC"
date: 2026-04-17
show_date: true
toc: true
toc_label: "CsvHelper in .NET 10"
classes: wide
tags:
  - .NET
  - C#
  - MVC
  - CsvHelper
  - .NET 10
---

Generating CSV files is a common requirement in web applications for data export. **CsvHelper** is the industry-standard library for reading and writing CSV files in .NET. In this post, we'll walk through a simple example of how to use CsvHelper in a **.NET 10 MVC** project to generate and download a spreadsheet.

---

## 1. Install CsvHelper

First, you need to add the `CsvHelper` NuGet package to your project. You can do this via the .NET CLI:

```bash
dotnet add package CsvHelper
```

---

## 2. Define Your Model

Create a simple class that represents the data you want to export.

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## 3. Create the MVC Controller

In your controller, you'll create an action that generates the CSV data and returns it as a file. We'll use a `MemoryStream` so that we don't have to save a temporary file on the server.

```csharp
using CsvHelper;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.IO;
using System.Text;

public class ExportController : Controller
{
    public IActionResult DownloadProducts()
    {
        // 1. Mock data (in a real app, this comes from a database)
        var products = new List<Product>
        {
            new Product { Id = 1, Name = "Laptop", Price = 999.99m, CreatedAt = DateTime.Now },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m, CreatedAt = DateTime.Now },
            new Product { Id = 3, Name = "Keyboard", Price = 75.00m, CreatedAt = DateTime.Now }
        };

        // 2. Setup the stream and writers
        using (var memoryStream = new MemoryStream())
        {
            using (var writer = new StreamWriter(memoryStream, Encoding.UTF8))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                // 3. Write records to the CSV
                csv.WriteRecords(products);
                
                // 4. Ensure all data is flushed to the stream
                writer.Flush();
            }
            
            // 5. Return the file to the browser
            // ToArray() is safe for simple exports; the browser will prompt for download
            return File(memoryStream.ToArray(), "text/csv", "products_export.csv");
        }
    }
}
```

## 4. Create the View

Finally, add a button to your Razor view (e.g., `Index.cshtml`) using ASP.NET Core Tag Helpers to trigger the download action.

```html
<div class="text-center">
    <h3>Data Export</h3>
    <p>Click the button below to download the product list as a CSV file.</p>
    
    <a asp-controller="Export" 
       asp-action="DownloadProducts" 
       class="btn btn-primary">
        <i class="fas fa-file-csv"></i> Download CSV Report
    </a>
</div>
```

---

## 5. How it Works

- **`MemoryStream`**: We use a memory stream to avoid writing a physical file to the server's disk.
- **`StreamWriter`**: Bridges the gap between the `CsvWriter` and the `MemoryStream`.
- **`CsvWriter`**: The core component of CsvHelper that handles the formatting and data serialization.
- **`File()`**: A built-in MVC method that returns a `FileContentResult`, prompting the browser to download the data as a file with the specified MIME type (`text/csv`).

---

## 6. Advanced: Customizing the Output

If you need to change column headers or ignore certain properties, you can use a **ClassMap**.

```csharp
public sealed class ProductMap : ClassMap<Product>
{
    public ProductMap()
    {
        Map(m => m.Id).Name("Product ID");
        Map(m => m.Name).Name("Product Name");
        Map(m => m.Price).Format("C"); // Format as currency
        Map(m => m.CreatedAt).Ignore(); // Don't include this in the CSV
    }
}
```

Then register it in your controller before writing records:

```csharp
csv.Context.RegisterClassMap<ProductMap>();
csv.WriteRecords(products);
```

---

## 7. Conclusion

Using CsvHelper in .NET 10 MVC is straightforward and highly efficient. By combining `MemoryStream` with CsvHelper's `CsvWriter`, you can provide seamless data export functionality to your users with minimal code.

---

## References
* [CsvHelper Documentation](https://joshclose.github.io/CsvHelper/)
* [NuGet: CsvHelper](https://www.nuget.org/packages/CsvHelper/)
