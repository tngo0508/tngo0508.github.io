---
layout: single
title: "Part 16: Creating Custom Project and Item Templates in .NET"
date: 2026-03-11
show_date: true
toc: true
toc_label: ".NET Custom Templates"
classes: wide
tags:
  - .NET
  - C#
  - Templates
  - DevOps
  - CLI
---

Creating custom templates in .NET is a powerful way to standardize your development workflow. As I recently learned from Mark J. Price's book **"Tools and Skills .NET 10"**, the most efficient way to get started is by using the official template authoring tools.

In this guide, we'll cover how to create both **Item Templates** (for single files or classes) and **Project Templates** (for entire projects) using these specialized tools.

---

## 1. Setting Up the Authoring Environment

Before you create your own templates, you should install the `Microsoft.TemplateEngine.Authoring.Templates` package. This package provides specialized templates to help you bootstrap the creation of your own custom templates.

Run the following command in your terminal:

```bash
dotnet new install Microsoft.TemplateEngine.Authoring.Templates
```

This will add several new templates to your CLI, including:
- `itemtemplate`: For creating item templates.
- `projecttemplate`: For creating project templates.
- `templatejson`: For creating the `template.json` configuration file.

---

## 2. What Are .NET Templates?

At its core, a .NET template is simply a folder containing files and a special configuration file named `template.json`. This file tells the .NET CLI how to treat the folder and what parameters can be passed to it.

Templates can be:
- **Project Templates**: Create a new project structure (e.g., a custom Web API with pre-configured logging and auth).
- **Item Templates**: Add a specific file or set of files to an existing project (e.g., a custom Repository class with an interface).

---

## 3. Creating an Item Template

An item template is the simplest form. Let's create a custom "Result" class template that we can add to any project.

### Step 1: Bootstrap the Template
Instead of creating folders manually, use the `itemtemplate` you just installed:

```bash
mkdir ResultTemplate
cd ResultTemplate
dotnet new itemtemplate -n MyTemplate.ResultClass
```

This creates the basic structure, including the `.template.config/template.json` file.

### Step 2: Create the Template Files
Add a file named `Result.cs` to your folder:

```csharp
namespace MyTemplate.Models;

public class Result<T>
{
    public bool IsSuccess { get; set; }
    public T? Value { get; set; }
    public string? Error { get; set; }

    public static Result<T> Success(T value) => new() { IsSuccess = true, Value = value };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
}
```

### Step 2: Add `template.json`
Inside the `ResultTemplate` folder, create a subfolder named `.template.config` and add a file named `template.json`:

```json
{
  "$schema": "http://json.schemastore.org/template",
  "author": "Thomas",
  "classifications": [ "Common", "Code" ],
  "name": "Custom Result Class",
  "identity": "MyTemplate.ResultClass",
  "shortName": "result-class",
  "tags": {
    "language": "C#",
    "type": "item"
  },
  "sourceName": "MyTemplate.Models"
}
```

- **shortName**: The command you'll use (e.g., `dotnet new result-class`).
- **sourceName**: This is important. When you run the template, the .NET CLI will replace "MyTemplate.Models" with the actual namespace of the folder where you're running it.

---

## 4. Creating a Project Template

Project templates are for entire project structures. Let's create a template for a **Windows Background Service** that includes a **File Watcher**.

### Step 1: Bootstrap the Project Template
Again, we can use the authoring tools to get started quickly:

```bash
mkdir MyBackgroundServiceTemplate
cd MyBackgroundServiceTemplate
dotnet new projecttemplate -n MyTemplate.BackgroundService
```

### Step 2: Add Your Base Project
The best way to create a project template is to build a working project first. Let's say we have a `MyBackgroundService.Worker` project. You would place your project files inside the template folder.

Example `Worker.cs` with a File Watcher:

```csharp
namespace MyBackgroundService.Worker;

public class FileWatcherWorker(ILogger<FileWatcherWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var watcher = new FileSystemWatcher(@"C:\temp");
        watcher.NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite;
        watcher.Created += (s, e) => logger.LogInformation("File created: {name}", e.Name);
        watcher.EnableRaisingEvents = true;

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }
}
```

### Step 3: Add `template.json`
Configure the `template.json` to handle the project-level replacement:

```json
{
  "$schema": "http://json.schemastore.org/template",
  "author": "Thomas",
  "classifications": [ "Service", "Worker", "Windows" ],
  "name": "Windows Background Service with File Watcher",
  "identity": "MyTemplate.BackgroundService",
  "shortName": "bg-file-watcher",
  "tags": {
    "language": "C#",
    "type": "project"
  },
  "sourceName": "MyBackgroundService.Worker",
  "preferNameDirectory": true
}
```

- **type**: Set to "project".
- **sourceName**: The CLI will replace `MyBackgroundService.Worker` with your new project name.
- **preferNameDirectory**: If true, it creates a new folder for the project if one isn't already there.

---

## 5. Advanced Configuration: Parameters

You can make your templates dynamic using parameters. For example, if you want to let users choose whether to include a database:

In `template.json`:
```json
"symbols": {
  "EnableDb": {
    "type": "parameter",
    "datatype": "bool",
    "defaultValue": "true",
    "description": "Whether to include Entity Framework Core setup."
  }
}
```

In your code (using preprocessor-like syntax):
```csharp
#if (EnableDb)
builder.Services.AddDbContext<AppDbContext>();
#endif
```

The .NET CLI will automatically handle these if you configure the `sources` section in `template.json` to process these files.

---

## 6. Installing and Using Your Templates

### Installing Locally
To test your template, use the following command from the folder containing the `.template.config` directory:

```bash
dotnet new install .
```

### Listing Your Templates
```bash
dotnet new list
```

### Using Your Template
```bash
# Item template
dotnet new result-class -n MyResponse

# Project template
dotnet new bg-file-watcher -n MyCompany.FileSystemMonitor
```

### Uninstalling
```bash
dotnet new uninstall [path-or-package-id]
```

---

## 7. Packaging Your Template as a NuGet Package

To share your template with others, you should package it as a `.nupkg` file.

1. Create a `.csproj` file for the template:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <PackageType>Template</PackageType>
    <PackageId>MyTemplates.Collection</PackageId>
    <PackageVersion>1.0.0</PackageVersion>
    <Authors>Thomas</Authors>
    <Description>A collection of my custom .NET templates.</Description>
    <TargetFramework>netstandard2.0</TargetFramework>
    <IncludeContentInPack>true</IncludeContentInPack>
    <IncludeBuildOutput>false</IncludeBuildOutput>
    <ContentTargetFolders>content</ContentTargetFolders>
  </PropertyGroup>

  <ItemGroup>
    <Content Include="**\*" Exclude="**\bin\**;**\obj\**;**\.git\**;**\.vs\**;**\*.user" />
  </ItemGroup>
</Project>
```

2. Run `dotnet pack`.
3. Install from the NuGet package: `dotnet new install MyTemplates.Collection.1.0.0.nupkg`.

---

## Conclusion

Custom templates are a game-changer for consistency and developer productivity. By standardizing your project structures and common code patterns, you reduce "decision fatigue" and ensure that best practices are followed across your team from day one.

**Key Takeaways:**
1. Use `template.json` in a `.template.config` folder.
2. Use `sourceName` for automatic namespace replacement.
3. Use `symbols` for optional features and configurations.
4. Package as a NuGet for easy distribution and versioning.

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 10: TDD and Unit Testing in .NET]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
* [Part 11: xUnit Testing: Facts and Theories]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})
* [Part 12: FluentAssertions: Write More Readable Unit Tests]({{ site.baseurl }}{% post_url 2026-3-7-fluent-assertions %})
* [Part 13: UI Testing with Playwright]({{ site.baseurl }}{% post_url 2026-03-08-playwright-xunit-ui-testing %})
* [Part 14: C# Refactoring Best Practices]({{ site.baseurl }}{% post_url 2026-03-09-csharp-refactoring-best-practices %})
* [Part 15: C# Coding Standards and Conventions]({{ site.baseurl }}{% post_url 2026-03-10-csharp-coding-standards-conventions %})
* [Part 16: Creating Custom .NET Templates]({{ site.baseurl }}{% post_url 2026-03-11-dotnet-custom-templates %})

Happy templating!
