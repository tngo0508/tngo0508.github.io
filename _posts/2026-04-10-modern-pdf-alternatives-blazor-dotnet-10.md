---
layout: single
title: "Modern PDF Generation Alternatives for Blazor in .NET 10"
excerpt: "Beyond Rotativa: Explore modern, high-performance alternatives for generating PDFs in Blazor, including QuestPDF, PuppeteerSharp, and the built-in HtmlRenderer."
date: 2026-04-10
show_date: true
classes: wide
categories:
  - .NET C#
  - Programming
tags:
  - .NET 10
  - Blazor
  - PDF
  - QuestPDF
  - PuppeteerSharp
  - HtmlRenderer
toc: true
toc_label: "Modern PDF Guide"
---

In our previous post, we looked at using Rotativa. While Rotativa is a classic, many modern .NET 10 projects are moving toward alternatives that offer better performance, modern CSS support, and native integration with Blazor.

If you are building a Blazor application in 2026, here are the top three alternatives you should consider.

---

### 1. QuestPDF: The "Code-First" Powerhouse

QuestPDF is widely considered the gold standard for .NET PDF generation today. Unlike other libraries, it doesn't use HTML. Instead, it uses a **fluent C# API** to build layouts.

**Why choose QuestPDF?**
*   **Performance:** Significantly faster and uses less memory than HTML-based engines.
*   **Type Safety:** No more debugging CSS in a PDF; your layout is compiled C# code.
*   **Previewer:** Includes a hot-reloading preview tool that makes designing reports a breeze.

**Example Code:**

```csharp
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

// Define your document
Document.Create(container =>
{
    container.Page(page =>
    {
        page.Size(PageSizes.A4);
        page.Header().Text("Monthly Report").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
        
        page.Content().PaddingVertical(10).Column(column =>
        {
            column.Spacing(5);
            column.Item().Text("Hello from QuestPDF in .NET 10!");
            column.Item().Table(table => { /* ... table logic ... */ });
        });
        
        page.Footer().AlignCenter().Text(x =>
        {
            x.Span("Page ");
            x.CurrentPageNumber();
        });
    });
})
.GeneratePdf("report.pdf");
```

---

### 2. PuppeteerSharp: Pixel-Perfect HTML

If you MUST use HTML and CSS (perhaps you're reusing dashboard styles), **PuppeteerSharp** is the way to go. It uses a headless Chromium browser, meaning it supports **Flexbox, CSS Grid, and JavaScript**.

**Why choose PuppeteerSharp?**
*   **Full CSS Support:** If it looks good in Chrome, it will look good in the PDF.
*   **JavaScript Execution:** Can wait for charts or maps to finish rendering before printing.

**Example Code:**

```csharp
using PuppeteerSharp;

var browserFetcher = new BrowserFetcher();
await browserFetcher.DownloadAsync();

await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
await using var page = await browser.NewPageAsync();

await page.SetContentAsync("<h1>Hello World</h1><p>Generated via Chromium</p>");
await page.PdfAsync("output.pdf", new PdfOptions { Format = PaperFormat.A4 });
```

---

### 3. The Secret Weapon: .NET 10 `HtmlRenderer`

One of the biggest hurdles in Blazor is that most PDF libraries can't "see" your `.razor` components. In .NET 10, you can use the built-in `HtmlRenderer` to convert any Blazor component into a static HTML string.

You can then feed this string into PuppeteerSharp or any other HTML-to-PDF tool!

**How to render a component to string:**

```csharp
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.Logging;

// 1. Setup the renderer
using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
var renderer = new HtmlRenderer(serviceProvider, loggerFactory);

// 2. Render the component
var html = await renderer.Dispatcher.InvokeAsync(async () =>
{
    var parameters = ParameterView.FromDictionary(new Dictionary<string, object?>
    {
        { "Title", "My PDF Title" }
    });
    
    var output = await renderer.RenderComponentAsync<MyRazorComponent>(parameters);
    return output.ToHtmlString();
});

// 3. Now pass 'html' to PuppeteerSharp or your choice of tool!
```

---

### Comparison: Which one should you use?

| Feature | QuestPDF | PuppeteerSharp | Rotativa (Legacy) |
| :--- | :--- | :--- | :--- |
| **Engine** | Native .NET | Chromium | wkhtmltopdf |
| **Input** | C# Fluent API | HTML/CSS | MVC View (.cshtml) |
| **CSS Support** | N/A | Full (Flex/Grid) | Limited (Partial) |
| **Performance** | Extremely High | Moderate/Low | Moderate |
| **Blazor Native** | Yes | Via HtmlRenderer | No (Bridge needed) |

### Summary for Blazor Developers

*   If you are building **data-heavy reports** (Invoices, Logs, Tables): Use **QuestPDF**.
*   If you need **complex designs** or reuse existing Web UI: Use **HtmlRenderer + PuppeteerSharp**.
*   Avoid **Rotativa** for new Blazor projects unless you are maintaining a legacy codebase.

---

### Further Reading & References

*   **QuestPDF Official Documentation:** [questpdf.com](https://www.questpdf.com/)
*   **PuppeteerSharp Official Website:** [puppeteersharp.com](https://www.puppeteersharp.com/)
*   **Microsoft Docs:** [Render Blazor components outside of ASP.NET Core (HtmlRenderer)](https://learn.microsoft.com/en-us/aspnet/core/blazor/components/render-components-outside-of-aspnet-core)
*   **QuestPDF GitHub:** [QuestPDF/QuestPDF](https://github.com/QuestPDF/QuestPDF)
*   **PuppeteerSharp GitHub:** [hardkoded/puppeteer-sharp](https://github.com/hardkoded/puppeteer-sharp)

