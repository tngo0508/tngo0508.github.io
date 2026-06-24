---
title: "Using JavaScript in ASP.NET Core MVC .NET 10: A Complete Guide"
excerpt: "Master the art of integrating JavaScript into your ASP.NET Core MVC projects. From script placement to AJAX calls with Antiforgery tokens, learn everything you need to build interactive web apps."
date: 2026-06-24
categories:
  - .NET
  - Web Development
tags:
  - ASP.NET Core
  - MVC
  - JavaScript
  - .NET 10
  - AJAX
  - Web Development
toc: true
---

### 1. Introduction

While ASP.NET Core MVC handles the server-side logic, JavaScript is essential for creating dynamic and interactive user experiences. Whether you're doing simple DOM manipulation or complex asynchronous updates, knowing how to properly integrate JavaScript in the MVC ecosystem is crucial for any .NET developer.

In this post, we'll explore how to manage and use JavaScript "behind the scenes" in **.NET 10** MVC projects.

---

### 2. Where to Put Your Scripts?

In a standard ASP.NET Core MVC project, static files like JavaScript reside in the `wwwroot/js` folder.

#### A. Global Scripts
Scripts that are needed on every page (like jQuery, Bootstrap, or your main site logic) should be included in the `Views/Shared/_Layout.cshtml` file, typically at the bottom of the `<body>` tag.

```html
<script src="~/lib/jquery/dist/jquery.min.js"></script>
<script src="~/js/site.js" asp-append-version="true"></script>
```
*Tip: `asp-append-version="true"` adds a hash to the URL to prevent caching issues when you update the file.*

#### B. Page-Specific Scripts
For scripts that are only needed on a specific view, use **Sections**.

In `_Layout.cshtml`:
```html
@await RenderSectionAsync("Scripts", required: false)
```

In your `Index.cshtml` view:
```razor
@section Scripts {
    <script src="~/js/page-specific.js"></script>
    <script>
        console.log("This script only runs on this page!");
    </script>
}
```

---

### 3. Passing Data from C# to JavaScript

Often, you need to pass data from your server-side C# model to your client-side JavaScript.

#### A. Data Attributes (Recommended)
The cleanest way is to use HTML5 `data-*` attributes.

```html
<div id="product-container" 
     data-product-id="@Model.Id" 
     data-product-name="@Model.Name">
</div>

<script>
    const container = document.getElementById('product-container');
    const productId = container.dataset.productId;
    console.log(`Working with product: ${productId}`);
</script>
```

#### B. Direct Serialization
For complex objects, you can serialize the model to JSON directly into a script block.

```razor
<script>
    const myModel = @Html.Raw(Json.Serialize(Model));
    console.log(myModel);
</script>
```

---

### 4. AJAX and the Fetch API with MVC

Modern web apps use AJAX to update parts of a page without a full reload. In .NET 10, the **Fetch API** is the standard way to do this.

#### A. The Controller Action
```csharp
[HttpPost]
public IActionResult UpdateStatus([FromBody] StatusUpdateDto data)
{
    // Process data
    return Json(new { success = true, message = "Status updated!" });
}
```

#### B. The JavaScript (with Antiforgery Token)
MVC requires a Request Verification Token for POST requests to prevent CSRF attacks.

```javascript
async function updateStatus(id, newStatus) {
    // Get the token from a hidden input or the form
    const token = document.querySelector('input[name="__RequestVerificationToken"]').value;

    const response = await fetch('/Products/UpdateStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': token
        },
        body: JSON.stringify({ id: id, status: newStatus })
    });

    const result = await response.json();
    alert(result.message);
}
```

---

### 5. Managing Dependencies with LibMan

ASP.NET Core uses **Library Manager (LibMan)** to fetch client-side libraries (like jQuery or Alpine.js) from CDNs. It's a lightweight alternative to npm for simple MVC projects.

Right-click your project in Visual Studio/Rider and select "Add > Client-Side Library" to manage your JS dependencies easily.

---

### 6. Best Practices for JS in MVC

1.  **Avoid Inline JS:** Keep your logic in `.js` files in `wwwroot/js`.
2.  **Unobtrusive JavaScript:** Use event listeners (`addEventListener`) instead of `onclick` attributes.
3.  **Minification:** Use the built-in bundling and minification features (or external tools like Webpack/Vite for complex needs) to reduce file sizes.
4.  **Security:** Always use Antiforgery tokens for state-changing requests (POST/PUT/DELETE).

---

### 7. Conclusion

JavaScript in ASP.NET Core MVC .NET 10 is all about balance. By using `wwwroot` for organization, Razor Sections for scoping, and the Fetch API for interactivity, you can build powerful, modern web applications that leverage the best of both server-side and client-side worlds.

---

### 8. Future Reference Links

- [Official Docs: Use JavaScript in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/client-side/using-utils)
- [Handle Antiforgery Tokens in AJAX](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery#javascript-jquery-and-antiforgery)
- [Library Manager (LibMan) Overview](https://learn.microsoft.com/en-us/aspnet/core/client-side/libman/)
- [Bundling and Minification in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/client-side/bundling-and-minification)
