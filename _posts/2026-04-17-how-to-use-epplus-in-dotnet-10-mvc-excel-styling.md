---
layout: single
title: "How to use EPPlus to generate styled Excel spreadsheets in .NET 10 MVC"
date: 2026-04-17
show_date: true
toc: true
toc_label: "EPPlus in .NET 10"
classes: wide
tags:
  - .NET
  - C#
  - MVC
  - EPPlus
  - .NET 10
  - Excel
---

In many business applications, simply exporting data to a CSV is not enough. You often need to generate formatted Excel spreadsheets with colors, styles, and formulas to make the data more readable for users. **EPPlus** is the most popular and powerful library for working with Excel files (`.xlsx`) in the .NET ecosystem.

In this tutorial, we will learn how to use EPPlus in a **.NET 10 MVC** project to create a styled spreadsheet with custom colors, fonts, and cell formatting.

---

## 1. Install EPPlus

Add the `EPPlus` NuGet package to your project via the .NET CLI:

```bash
dotnet add package EPPlus
```

> **Important Note:** Starting from version 5, EPPlus is licensed under the **Polyform Noncommercial** license. For commercial use, you must purchase a license.

---

## 2. Configure License (via appsettings.json)

Instead of setting the license in code, you can configure it globally in your `appsettings.json` file. This is the recommended approach for production applications.

```json
{
  "EPPlus": {
    "ExcelPackage": {
      "LicenseContext": "NonCommercial" // Or "Commercial"
    }
  }
}
```

---

## 3. Define Your Model

We'll use a simple `Product` class for our example data.

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

## 4. Create the MVC Controller

In your controller, create an action that uses `ExcelPackage` to generate the file. If you haven't set the license in `appsettings.json`, you must set it in code.

```csharp
using OfficeOpenXml;
using OfficeOpenXml.Style;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.IO;

public class ExportController : Controller
{
    public IActionResult DownloadExcel()
    {
        // 1. Set the license context (Optional if set in appsettings.json)
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

        // 2. Mock data
        var products = new List<Product>
        {
            new Product { Id = 1, Name = "Laptop", Price = 999.99m, CreatedAt = DateTime.Now },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m, CreatedAt = DateTime.Now },
            new Product { Id = 3, Name = "Keyboard", Price = 75.00m, CreatedAt = DateTime.Now }
        };

        // 3. Generate the Excel package
        using (var package = new ExcelPackage())
        {
            var worksheet = package.Workbook.Worksheets.Add("ProductList");

            // 4. Style the Header Row (Row 1)
            worksheet.Cells[1, 1].Value = "ID";
            worksheet.Cells[1, 2].Value = "Product Name";
            worksheet.Cells[1, 3].Value = "Price";
            worksheet.Cells[1, 4].Value = "Date Created";

            using (var headerRange = worksheet.Cells[1, 1, 1, 4])
            {
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Font.Color.SetColor(Color.White);
                headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                headerRange.Style.Fill.BackgroundColor.SetColor(Color.DodgerBlue);
                headerRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }

            // 5. Add Data
            int row = 2;
            foreach (var p in products)
            {
                worksheet.Cells[row, 1].Value = p.Id;
                worksheet.Cells[row, 2].Value = p.Name;
                worksheet.Cells[row, 3].Value = p.Price;
                worksheet.Cells[row, 4].Value = p.CreatedAt;

                // Format Price as Currency
                worksheet.Cells[row, 3].Style.Numberformat.Format = "$#,##0.00";
                
                // Format Date
                worksheet.Cells[row, 4].Style.Numberformat.Format = "yyyy-mm-dd";

                // Example: Alternate row colors
                if (row % 2 == 0)
                {
                    worksheet.Cells[row, 1, row, 4].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[row, 1, row, 4].Style.Fill.BackgroundColor.SetColor(Color.AliceBlue);
                }

                row++;
            }

            // 6. Final Polish
            worksheet.Cells.AutoFitColumns();

            // 7. Return the file as a stream
            var memoryStream = new MemoryStream();
            package.SaveAs(memoryStream);
            memoryStream.Position = 0;

            return File(
                memoryStream, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                "products_report.xlsx"
            );
        }
    }
}
```

## 5. Create the View

To trigger the export, you can use a button in your Razor view (e.g., `Index.cshtml`). The ASP.NET Core Tag Helpers make it easy to link to the controller action.

```html
<div class="mt-4">
    <h3>Reports</h3>
    <p>Generate and download our custom-styled Excel report.</p>
    
    <a asp-controller="Export" 
       asp-action="DownloadExcel" 
       class="btn btn-success">
        <i class="fas fa-file-excel"></i> Download Excel Report
    </a>
</div>
```

---

## 6. Key Features Explained

- **`ExcelPackage.LicenseContext`**: Essential for EPPlus to run. Set this to `LicenseContext.NonCommercial` if you are using it for free/personal projects.
- **`worksheet.Cells[range]`**: You can target specific cells or a range of cells using `[row, col]` or `[startRow, startCol, endRow, endCol]`.
- **`Style.Fill.BackgroundColor`**: Uses `System.Drawing.Color` to set the cell background. Note that `PatternType` must be set to `Solid` for colors to show.
- **`Style.Numberformat`**: Allows you to apply standard Excel formatting strings for currencies, percentages, and dates.
- **`AutoFitColumns()`**: Automatically calculates the width needed for each column based on its content.

---

## 7. Conclusion

EPPlus provides a rich API that gives you full control over your Excel exports. From simple data dumps to complex financial reports with conditional formatting and charts, it remains the go-to choice for .NET developers.

---

## References
* [EPPlus Documentation](https://epplussoftware.com/docs/7.0/api/OfficeOpenXml.ExcelPackage.html)
* [EPPlus GitHub Repository](https://github.com/EPPlusSoftware/EPPlus)
* [License Information](https://epplussoftware.com/en/License)
