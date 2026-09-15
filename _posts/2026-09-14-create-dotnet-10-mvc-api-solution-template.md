---
layout: single
title: "How to Create a Custom Solution Template in .NET 10: MVC Web, API Service, Data Layer, Shared Library (Central Semantic Versioning), Authentication Options, Client-Side Libraries (Chart.js, Select2, Leaflet.js & DataTables), Central Package Management, EF Core, Serilog, Scalar UI, and Refit"
date: 2026-09-14
show_date: true
toc: true
toc_label: "Solution Template Guide"
toc_sticky: true
classes: wide
categories:
  - .NET
  - ASP.NET Core
  - Architecture
tags:
  - .NET
  - .NET 10
  - C#
  - ASP.NET Core
  - MVC
  - Web API
  - Semantic Versioning
  - Versioning
  - Authentication
  - Identity
  - Windows Auth
  - Client-Side Libraries
  - DataTables
  - DataTables.net
  - Chart.js
  - Select2
  - Leaflet.js
  - Maps
  - LibMan
  - JavaScript
  - Resilience
  - Polly
  - Health Checks
  - Clean Architecture
  - Entity Framework Core
  - EF Core
  - Serilog
  - Logging
  - Scalar
  - Scalar UI
  - OpenAPI
  - Refit
  - HTTP Client
  - dotnet CLI
  - Custom Templates
  - Template Engine
  - Central Package Management
  - NuGet
---

When starting a new project or onboarding team members, setting up the same repetitive multi-project architecture by hand (creating a solution file, adding an MVC web app, creating a backing Web API, splitting out a dedicated Data access layer with EF Core, establishing a Shared class library for reusable DTOs and contracts, bundling essential client-side libraries like DataTables, Chart.js, Select2, and Leaflet.js without relying on unstable CDNs, configuring authentication options like Individual Accounts or Windows Auth, wiring up Serilog, configuring Scalar UI for OpenAPI documentation, and creating type-safe Refit HTTP clients) is tedious, error-prone, and inefficient.

When using Microsoft's built-in templates (like `dotnet new mvc`), you have probably noticed the `--auth` flag that lets you choose between `None`, `Individual`, or `Windows` authentication. **Can we do the exact same thing in a custom multi-project solution template, while also pre-bundling essential client JavaScript libraries like DataTables, Chart.js, Select2, and Leaflet.js? Absolutely!**

With the **.NET Template Engine**, you can package your standard production-ready architecture into a reusable **Solution Template** with custom CLI switches. With a single command like `dotnet new mvc-api -n MyApp --auth Individual`, you can automatically scaffold a complete solution containing:
- `MyApp.sln`
- `Directory.Packages.props` (Central Package Management)
- `MyApp.Shared` (.NET 10 Class Library for shared DTOs, models, and Refit API contracts)
- `MyApp.Data` (.NET 10 Class Library for EF Core `AppDbContext`, ASP.NET Core Identity, entities, and database migrations)
- `MyApp.ApiService` (ASP.NET Core Web API Backend with Serilog, EF Core, OpenAPI & Scalar API Reference UI)
- `MyApp.Web` (ASP.NET Core MVC Frontend with Serilog, Refit typed HTTP API client, LibMan client-side libraries [DataTables, Chart.js, Select2, Leaflet.js, jQuery, Bootstrap], and optional Identity/Windows Auth)

In this comprehensive guide, we will build, configure, test, and package a production-ready **.NET 10 Multi-Project Solution Template with Data Layer, Shared Library, Authentication Options (None / Individual / Windows), Pre-bundled Client Libraries (DataTables, Chart.js, Select2, Leaflet.js), CPM, EF Core, Serilog, Scalar UI, and Refit** from scratch.

---

## 1. What We Are Building

We want a solution template named `mvc-api` (or `mvc-api-sln`). When a developer executes:

```bash
# Default: No authentication
dotnet new mvc-api -n MyApp -o MyApp

# Individual Accounts (ASP.NET Core Identity + EF Core)
dotnet new mvc-api -n MyApp -o MyApp --auth Individual

# Windows Authentication (Intranet / Active Directory / Kerberos)
dotnet new mvc-api -n MyApp -o MyApp --auth Windows
```

The template engine will generate the following modular directory structure:

```text
MyApp/
├── MyApp.sln
├── Directory.Packages.props
└── src/
    ├── MyApp.Shared/
    │   ├── Constants/
    │   │   └── AppVersion.cs
    │   ├── DTOs/
    │   │   └── ItemDto.cs
    │   ├── Contracts/
    │   │   └── IItemsApi.cs
    │   └── MyApp.Shared.csproj
    ├── MyApp.Data/
    │   ├── Entities/
    │   │   └── Item.cs
    │   ├── AppDbContext.cs
    │   └── MyApp.Data.csproj
    ├── MyApp.ApiService/
    │   ├── Controllers/
    │   │   └── ItemsController.cs
    │   ├── appsettings.json
    │   ├── Program.cs
    │   └── MyApp.ApiService.csproj
    └── MyApp.Web/
        ├── Controllers/
        │   ├── HomeController.cs
        │   └── ItemsController.cs
        ├── Models/
        │   └── ErrorViewModel.cs
        ├── Views/
        │   ├── Home/
        │   ├── Items/
        │   │   └── Index.cshtml
        │   └── Shared/
        │       ├── _Layout.cshtml
        │       └── _LoginPartial.cshtml (Generated when --auth Individual)
        ├── wwwroot/
        │   ├── css/
        │   │   └── site.css
        │   ├── js/
        │   │   └── site.js
        │   └── lib/
        │       ├── bootstrap/
        │       ├── chartjs/
        │       │   └── chart.umd.min.js
        │       ├── datatables/
        │       │   └── dataTables.min.js
        │       ├── datatables-bs5/
        │       │   ├── dataTables.bootstrap5.min.css
        │       │   └── dataTables.bootstrap5.min.js
        │       ├── jquery/
        │       ├── leaflet/
        │       │   ├── leaflet.js
        │       │   ├── leaflet.css
        │       │   └── images/
        │       ├── select2/
        │       │   ├── css/select2.min.css
        │       │   └── js/select2.min.js
        │       └── select2-bootstrap-5-theme/
        │           └── select2-bootstrap-5-theme.min.css
        ├── libman.json
        ├── appsettings.json
        ├── Program.cs
        └── MyApp.Web.csproj
```

### Key Architectural Highlights:
1. **Separation of Concerns:** Database entities and `AppDbContext` are isolated in `MyApp.Data`, preventing Web and API presentation layers from mixing raw data access concerns.
2. **Central Semantic Versioning (`AppVersion`):** Centralizes the application's version identifier in `MyApp.Shared/Constants/AppVersion.cs` using strict **Semantic Versioning (SemVer 2.0.0: `MAJOR.MINOR.PATCH`)**. Updating this single constant immediately updates the version rendered across the MVC Web footer and navbar brand, API service root (`GET /`) endpoint, OpenAPI metadata, Scalar Reference UI headers, and Serilog startup banners.
3. **Reusable Shared Library:** Common data transfer objects (`ItemDto`), version metadata, and Refit API contracts (`IItemsApi`) live in `MyApp.Shared`, allowing both the API and MVC Web projects to share type definitions without code duplication.
4. **Pluggable Authentication Options (`--auth`):** Supports `None` (default), `Individual` (ASP.NET Core Identity with EF Core), and `Windows` authentication via template parameters and preprocessor conditions.
5. **Pre-Bundled Client-Side Libraries:** Includes **DataTables** (with Bootstrap 5 integration for interactive sorting, search, pagination, and responsive tables), **Chart.js** (for rich interactive charts), **Select2** (with Bootstrap 5 theme for enhanced searchable dropdowns), **Leaflet.js** (for interactive mapping and geographic visualization), **jQuery**, and **Bootstrap 5** directly in `wwwroot/lib/` alongside a configured `libman.json` and MSBuild LibMan build tasks. Developers can immediately build dashboards, tables, forms, and maps offline without configuring CDN links or dealing with network CDN downtime.
6. **Production-Ready Resilience & Fault Tolerance:** Configured with `Microsoft.Extensions.Http.Resilience` (`AddStandardResilienceHandler`) for intelligent retries, circuit breaking, rate limiting, and timeouts on external API calls, paired with EF Core SQL connection resiliency (`EnableRetryOnFailure`) for transient database fault recovery.
7. **Built-In Health Checks & ProblemDetails:** Pre-wires `/health` probes on both Web and API projects for container orchestrators (Kubernetes / Docker) and RFC 7807 `ProblemDetails` exception handling.
8. **Cancellation Token Propagation:** Full support for `CancellationToken` throughout Refit API contracts, MVC controllers, API endpoints, and EF Core asynchronous queries to safeguard database resources when requests are aborted.
9. **Central Package Management (CPM):** All NuGet dependency versions across the solution are managed centrally in `Directory.Packages.props`.
10. **Entity Framework Core (EF Core):** Pre-configured in `MyApp.Data` with `AppDbContext` (inheriting from `IdentityDbContext` when `Individual` auth is chosen) and entity configurations, ready for SQL Server / LocalDB / SQLite.
11. **Serilog Structured Logging:** Both Web and API projects are pre-configured with Serilog for rich, structured JSON/console logging and HTTP request logging.
12. **Scalar API Reference UI:** The Web API utilizes **Scalar** (`Scalar.AspNetCore`) for modern, interactive OpenAPI documentation (replacing Swagger UI).
13. **Refit Type-Safe HTTP Client:** The MVC Web frontend uses **Refit** (`Refit.HttpClientFactory`) to consume API contracts declaratively without manual `HttpClient` boilerplate.
14. **Automated Name Replacement:** All namespaces, solution references, and project files automatically replace the template placeholder (`Company.App`) with the user-provided project name (`MyApp`).

---

## 2. Understanding Template Replacement and Parameter Conditions

The .NET Template Engine provides two key features that make custom solution templates powerful:

### 2.1 Text Replacement (`sourceName`)
The `sourceName` configuration in `template.json` replaces occurrences of a base placeholder string (e.g. `Company.App`) across all directory names, file names, namespaces, and file contents:

```
Template Source:  "Company.App"
User Input:       "-n MyApp"

Replacement Flow:
  Company.App.sln                     ──▶  MyApp.sln
  Company.App.Shared.csproj           ──▶  MyApp.Shared.csproj
  Company.App.Data.csproj             ──▶  MyApp.Data.csproj
  Company.App.ApiService.csproj       ──▶  MyApp.ApiService.csproj
  Company.App.Web.csproj              ──▶  MyApp.Web.csproj
  namespace Company.App.Shared;       ──▶  namespace MyApp.Shared;
  namespace Company.App.Shared.Constants; ──▶ namespace MyApp.Shared.Constants;
  namespace Company.App.Shared.DTOs;  ──▶  namespace MyApp.Shared.DTOs;
  namespace Company.App.Data;         ──▶  namespace MyApp.Data;
  namespace Company.App.ApiService;   ──▶  namespace MyApp.ApiService;
  namespace Company.App.Web;          ──▶  namespace MyApp.Web;
```

### 2.2 Template Symbols & Conditional Code (`#if`)
To support `--auth None|Individual|Windows`, we define a **choice parameter symbol** in `template.json`:

```json
"symbols": {
  "auth": {
    "type": "parameter",
    "datatype": "choice",
    "choices": [
      { "choice": "None", "description": "No authentication" },
      { "choice": "Individual", "description": "Individual Authentication (ASP.NET Core Identity)" },
      { "choice": "Windows", "description": "Windows Authentication" }
    ],
    "defaultValue": "None",
    "description": "The type of authentication to configure for the solution."
  },
  "IndividualAuth": {
    "type": "computed",
    "value": "(auth == \"Individual\")"
  },
  "WindowsAuth": {
    "type": "computed",
    "value": "(auth == \"Windows\")"
  }
}
```

The template engine exposes `IndividualAuth` and `WindowsAuth` as preprocessor variables during generation:
- **In C# files (`.cs`):** Standard `#if (IndividualAuth)` or `#if (WindowsAuth)` directives dynamically include or exclude code blocks.
- **In XML/Project files (`.csproj`):** `<!--#if (IndividualAuth) -->` blocks dynamically include NuGet package references.
- **In File System (`sources.modifiers`):** Entire files (e.g., `_LoginPartial.cshtml`) can be excluded when `IndividualAuth` is false.

---

## 3. Step-by-Step Template Construction

Let's create a workspace folder for authoring our template:

```bash
mkdir MvcApiTemplate
cd MvcApiTemplate
```

Inside this directory, we will construct our baseline solution using a canonical placeholder name: `Company.App`.

### Step 3.1: Create the Baseline Solution and Projects

Run the following commands in your terminal:

```bash
# 1. Create the template root folder
mkdir Company.App
cd Company.App

# 2. Create the solution file
dotnet new sln -n Company.App

# 3. Create the src directory
mkdir src
cd src

# 4. Create the Shared Class Library (DTOs and Refit API contracts)
dotnet new classlib -n Company.App.Shared -f net10.0

# 5. Create the Data Layer Class Library (EF Core DbContext & Entities)
dotnet new classlib -n Company.App.Data -f net10.0

# 6. Create the Web API project (Company.App.ApiService)
dotnet new webapi -n Company.App.ApiService -f net10.0

# 7. Create the MVC Web project (Company.App.Web)
dotnet new mvc -n Company.App.Web -f net10.0

# 8. Return to the solution directory
cd ..

# 9. Add all projects to the solution
dotnet sln Company.App.sln add src/Company.App.Shared/Company.App.Shared.csproj
dotnet sln Company.App.sln add src/Company.App.Data/Company.App.Data.csproj
dotnet sln Company.App.sln add src/Company.App.ApiService/Company.App.ApiService.csproj
dotnet sln Company.App.sln add src/Company.App.Web/Company.App.Web.csproj

# 10. Wire up project references
dotnet add src/Company.App.Data/Company.App.Data.csproj reference src/Company.App.Shared/Company.App.Shared.csproj
dotnet add src/Company.App.ApiService/Company.App.ApiService.csproj reference src/Company.App.Data/Company.App.Data.csproj
dotnet add src/Company.App.ApiService/Company.App.ApiService.csproj reference src/Company.App.Shared/Company.App.Shared.csproj
dotnet add src/Company.App.Web/Company.App.Web.csproj reference src/Company.App.Shared/Company.App.Shared.csproj
```

---

### Step 3.2: Configure Central Package Management (`Directory.Packages.props`)

**Central Package Management (CPM)** lets you define and manage all package versions in a single solution-level file rather than scattering versions across individual `.csproj` files.

In the solution root (`Company.App/`), create a file named `Directory.Packages.props`:

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <!-- ASP.NET Core & OpenAPI -->
    <PackageVersion Include="Microsoft.AspNetCore.OpenApi" Version="10.0.0" />

    <!-- Scalar API Reference UI -->
    <PackageVersion Include="Scalar.AspNetCore" Version="2.0.18" />

    <!-- Refit Type-Safe HTTP Client & Resilience -->
    <PackageVersion Include="Refit" Version="8.0.0" />
    <PackageVersion Include="Refit.HttpClientFactory" Version="8.0.0" />
    <PackageVersion Include="Microsoft.Extensions.Http.Resilience" Version="10.0.0" />

    <!-- Serilog Logging -->
    <PackageVersion Include="Serilog.AspNetCore" Version="9.0.0" />
    <PackageVersion Include="Serilog.Sinks.Console" Version="6.0.0" />
    <PackageVersion Include="Serilog.Sinks.File" Version="6.0.0" />

    <!-- Entity Framework Core -->
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="10.0.0" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.0" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.0" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Tools" Version="10.0.0" />

    <!-- Authentication & Identity -->
    <PackageVersion Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="10.0.0" />
    <PackageVersion Include="Microsoft.AspNetCore.Identity.UI" Version="10.0.0" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.Negotiate" Version="10.0.0" />

    <!-- Client-Side Library Manager (LibMan Build Tool) -->
    <PackageVersion Include="Microsoft.Web.LibraryManager.Build" Version="2.1.175" />
  </ItemGroup>
</Project>
```

#### Why CPM is Essential in Solution Templates:
1. **Single Source of Truth:** Upgrading Serilog, EF Core, Refit, Identity, or Scalar across projects only requires editing this one file.
2. **Eliminates Version Drift:** Prevents Web, API, and Data projects from accidentally referencing conflicting transitive versions.
3. **Cleaner Project Files:** Individual project `.csproj` files only declare *which* package they need, not *which version*.

---

### Step 3.3: Configure Project Dependencies (`.csproj`)

Because Central Package Management is enabled, notice that `<PackageReference>` entries **do not declare a `Version` attribute**. Notice also how we use XML comments `<!--#if (IndividualAuth) -->` so the template engine only includes Identity packages when needed!

#### 1. `src/Company.App.Shared/Company.App.Shared.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Refit core attributes for shared interface definitions -->
    <PackageReference Include="Refit" />
  </ItemGroup>

</Project>
```

#### 2. `src/Company.App.Data/Company.App.Data.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Project References -->
    <ProjectReference Include="..\Company.App.Shared\Company.App.Shared.csproj" />
  </ItemGroup>

  <ItemGroup>
    <!-- EF Core Database Engine -->
    <PackageReference Include="Microsoft.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

<!--#if (IndividualAuth) -->
  <ItemGroup>
    <!-- ASP.NET Core Identity EF Core Store -->
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
  </ItemGroup>
<!--#endif -->

</Project>
```

#### 3. `src/Company.App.ApiService/Company.App.ApiService.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Project References -->
    <ProjectReference Include="..\Company.App.Shared\Company.App.Shared.csproj" />
    <ProjectReference Include="..\Company.App.Data\Company.App.Data.csproj" />
  </ItemGroup>

  <ItemGroup>
    <!-- OpenAPI & Scalar UI -->
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
    <PackageReference Include="Scalar.AspNetCore" />

    <!-- Serilog Logging -->
    <PackageReference Include="Serilog.AspNetCore" />
    <PackageReference Include="Serilog.Sinks.Console" />
    <PackageReference Include="Serilog.Sinks.File" />

    <!-- EF Core Tools for Migrations -->
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

</Project>
```

#### 4. `src/Company.App.Web/Company.App.Web.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- Project References -->
    <ProjectReference Include="..\Company.App.Shared\Company.App.Shared.csproj" />
<!--#if (IndividualAuth) -->
    <ProjectReference Include="..\Company.App.Data\Company.App.Data.csproj" />
<!--#endif -->
  </ItemGroup>

  <ItemGroup>
    <!-- Refit HTTP Client with HttpClientFactory integration -->
    <PackageReference Include="Refit.HttpClientFactory" />

    <!-- HTTP Client Resilience Pipeline (Retries, Circuit Breaker, Rate Limiter) -->
    <PackageReference Include="Microsoft.Extensions.Http.Resilience" />

    <!-- Serilog Logging -->
    <PackageReference Include="Serilog.AspNetCore" />
    <PackageReference Include="Serilog.Sinks.Console" />
    <PackageReference Include="Serilog.Sinks.File" />

    <!-- LibMan Client-Side Library Manager Build Tool -->
    <PackageReference Include="Microsoft.Web.LibraryManager.Build" />
  </ItemGroup>

<!--#if (IndividualAuth) -->
  <ItemGroup>
    <!-- ASP.NET Core Identity UI -->
    <PackageReference Include="Microsoft.AspNetCore.Identity.UI" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
  </ItemGroup>
<!--#elif (WindowsAuth) -->
  <ItemGroup>
    <!-- Windows Authentication / Negotiate -->
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Negotiate" />
  </ItemGroup>
<!--#endif -->

</Project>
```

---

### Step 3.4: Configure Shared Versioning, Models & Refit Contracts in `Company.App.Shared`

The `Shared` library holds centralized application constants (such as versioning following Semantic Versioning rules), reusable DTOs, and API client interfaces consumed by both the Web frontend and the API backend.

#### 1. Define Central Semantic Versioning: `src/Company.App.Shared/Constants/AppVersion.cs`

According to **Semantic Versioning (SemVer 2.0.0)**, version numbers follow the standard format `MAJOR.MINOR.PATCH[-PRERELEASE]`:
- **MAJOR (`1.x.x`):** Incremented when introducing incompatible API breaking changes or major system overhauls.
- **MINOR (`x.1.x`):** Incremented when adding new functionality in a backward-compatible manner (e.g., adding new API endpoints, models, or UI features).
- **PATCH (`x.x.1`):** Incremented when making backward-compatible bug fixes, performance optimizations, or security patches.
- **Suffix / PreRelease (`-preview.1`, `-rc.1`):** Optional identifiers appended for pre-release builds.

By placing this single version key-value pair and semantic properties inside `Company.App.Shared`, any version update is automatically reflected across API OpenAPI documents, Scalar UI headers, Serilog startup banners, Web application footers, and Refit client headers:

```csharp
namespace Company.App.Shared.Constants;

/// <summary>
/// Centralized application version metadata adhering strictly to Semantic Versioning (SemVer 2.0.0).
/// Update these values to bump the version across all projects (Shared, Data, ApiService, Web) in the solution.
/// Format: MAJOR.MINOR.PATCH[-PRERELEASE]
/// </summary>
public static class AppVersion
{
    /// <summary>
    /// Current semantic version string (e.g. "1.0.0").
    /// </summary>
    public const string Current = "1.0.0";

    /// <summary>
    /// Application canonical name used in logging, OpenAPI titles, and UI banners.
    /// </summary>
    public const string ApplicationName = "Company.App";

    // --- Semantic Version Components (SemVer 2.0.0) ---
    public const int Major = 1;         // Breaking changes
    public const int Minor = 0;         // New features (backwards-compatible)
    public const int Patch = 0;         // Bug fixes (backwards-compatible)
    public const string? Suffix = null; // Optional: "preview.1", "alpha", "beta", "rc.1"

    /// <summary>
    /// Evaluates the full semantic version including optional pre-release tag (e.g. "1.0.0" or "1.0.0-rc.1").
    /// </summary>
    public static string FullVersion => string.IsNullOrWhiteSpace(Suffix)
        ? $"{Major}.{Minor}.{Patch}"
        : $"{Major}.{Minor}.{Patch}-{Suffix}";

    /// <summary>
    /// Formatted application title and version banner.
    /// </summary>
    public static string InformationalVersion => $"{ApplicationName} v{FullVersion}";
}
```

#### 2. Create DTO: `src/Company.App.Shared/DTOs/ItemDto.cs`
```csharp
using System.ComponentModel.DataAnnotations;

namespace Company.App.Shared.DTOs;

public class ItemDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Item name is required.")]
    [StringLength(200, ErrorMessage = "Name cannot exceed 200 characters.")]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
```

#### 3. Create Refit API Contract: `src/Company.App.Shared/Contracts/IItemsApi.cs`
```csharp
using Refit;
using Company.App.Shared.DTOs;

namespace Company.App.Shared.Contracts;

/// <summary>
/// Type-safe Refit API contract shared between the backend ApiService and frontend Web project.
/// Refit automatically generates the HTTP client implementation at compile/runtime.
/// </summary>
public interface IItemsApi
{
    /// <summary>
    /// Retrieves all items from the ApiService backend.
    /// Accepts a CancellationToken to gracefully abort in-flight requests when the caller disconnects.
    /// </summary>
    [Get("/api/items")]
    Task<IEnumerable<ItemDto>> GetItemsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a single item by its unique identifier.
    /// </summary>
    [Get("/api/items/{id}")]
    Task<ItemDto> GetItemAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new item on the backend database.
    /// </summary>
    [Post("/api/items")]
    Task<ItemDto> CreateItemAsync([Body] ItemDto item, CancellationToken cancellationToken = default);
}
```

---

### Step 3.5: Configure Data Access Layer in `Company.App.Data`

The `Data` project isolates Entity Framework Core models, configuration, and the database context from the Web and API layers.

#### 1. Create Entity Model: `src/Company.App.Data/Entities/Item.cs`
```csharp
namespace Company.App.Data.Entities;

/// <summary>
/// Database persistence entity representing an item record.
/// Isolated inside Company.App.Data to preserve separation of concerns.
/// </summary>
public class Item
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public bool IsCompleted { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
```

#### 2. Create DbContext: `src/Company.App.Data/AppDbContext.cs`
```csharp
#if (IndividualAuth)
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
#endif
using Microsoft.EntityFrameworkCore;
using Company.App.Data.Entities;

namespace Company.App.Data;

#if (IndividualAuth)
/// <summary>
/// Database context inheriting from IdentityDbContext for ASP.NET Core Identity authentication tables.
/// </summary>
public class AppDbContext : IdentityDbContext<IdentityUser>
#else
/// <summary>
/// Standard application database context.
/// </summary>
public class AppDbContext : DbContext
#endif
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Items table set.
    /// </summary>
    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Item entity schema constraints
        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.HasIndex(e => e.CreatedAtUtc);
        });
    }
}
```

---

### Step 3.6: Configure EF Core & Scalar UI in `Company.App.ApiService`

Let's set up the CRUD endpoints, database connection, and **Scalar API Reference UI** in the API service.

#### 1. Update `src/Company.App.ApiService/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CompanyAppDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "Microsoft.EntityFrameworkCore.Database.Command": "Information"
      }
    }
  },
  "AllowedHosts": "*"
}
```

#### 2. Create CRUD Controller: `src/Company.App.ApiService/Controllers/ItemsController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Company.App.Data;
using Company.App.Data.Entities;
using Company.App.Shared.DTOs;

namespace Company.App.ApiService.Controllers;

/// <summary>
/// RESTful API controller providing CRUD operations for catalog items.
/// Demonstrates async EF Core operations, AsNoTracking for query performance, and CancellationToken propagation.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(AppDbContext context, ILogger<ItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all catalog items from the database.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Retrieving all items from database.");
        
        // Use AsNoTracking() for read-only queries to eliminate EF Core change tracking overhead
        var items = await _context.Items
            .AsNoTracking()
            .OrderByDescending(i => i.Id)
            .ToListAsync(cancellationToken);

        return Ok(items.Select(i => new ItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Description = i.Description,
            IsCompleted = i.IsCompleted,
            CreatedAtUtc = i.CreatedAtUtc
        }));
    }

    /// <summary>
    /// Retrieves a specific item by its unique ID.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> GetItem(int id, CancellationToken cancellationToken = default)
    {
        var item = await _context.Items.FindAsync([id], cancellationToken);
        if (item == null)
        {
            _logger.LogWarning("Item with ID {ItemId} not found.", id);
            return NotFound();
        }

        return Ok(new ItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            IsCompleted = item.IsCompleted,
            CreatedAtUtc = item.CreatedAtUtc
        });
    }

    /// <summary>
    /// Creates a new catalog item.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] ItemDto dto, CancellationToken cancellationToken = default)
    {
        var item = new Item
        {
            Name = dto.Name,
            Description = dto.Description,
            IsCompleted = dto.IsCompleted,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        
        _logger.LogInformation("Created new item with ID {ItemId}", item.Id);

        dto.Id = item.Id;
        dto.CreatedAtUtc = item.CreatedAtUtc;
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, dto);
    }
}
```

#### 3. Configure Serilog, EF Core, and Scalar UI in `src/Company.App.ApiService/Program.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Serilog;
using Company.App.Data;
using Company.App.Shared.Constants;

// 1. Bootstrap early logging to capture any startup or DI registration failures
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting {AppName} (v{Version})...", AppVersion.ApplicationName, AppVersion.Current);

    var builder = WebApplication.CreateBuilder(args);

    // 2. Configure Serilog full logging pipeline from appsettings.json
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

    // 3. Register EF Core DbContext with Connection Resiliency (automatic retry on transient network failures)
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            // Transient fault handling: retries SQL queries up to 5 times with exponential backoff
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

    // 4. Standard RFC 7807 ProblemDetails for standardized error responses
    builder.Services.AddProblemDetails();

    // 5. Health Checks for container orchestrators (Kubernetes / Docker) and load balancers
    builder.Services.AddHealthChecks();

    builder.Services.AddControllers();
    
    // 6. OpenAPI generator in .NET 10 with synchronized application metadata
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, cancellationToken) =>
        {
            document.Info.Title = $"{AppVersion.ApplicationName} API Service";
            document.Info.Version = AppVersion.Current;
            document.Info.Description = $"REST API backend for {AppVersion.ApplicationName} (SemVer: {AppVersion.FullVersion}).";
            return Task.CompletedTask;
        });
    });

    var app = builder.Build();

    // 7. Global Exception Handling via ProblemDetails
    app.UseExceptionHandler();

    // 8. Enable Serilog HTTP request logging with request duration & status codes
    app.UseSerilogRequestLogging();

    // 9. Root Info & Version Endpoint (Instant Runtime Verification)
    app.MapGet("/", () => Results.Ok(new
    {
        Application = AppVersion.ApplicationName,
        Version = AppVersion.Current,
        FullVersion = AppVersion.FullVersion,
        Environment = app.Environment.EnvironmentName,
        Status = "Online",
        TimestampUtc = DateTime.UtcNow
    }))
    .WithName("GetVersionInfo")
    .WithSummary("Returns current API service version and runtime status")
    .WithTags("System");

    // 10. Health check endpoint
    app.MapHealthChecks("/health")
       .WithName("HealthCheck")
       .WithTags("System");

    // 11. Development tooling (OpenAPI spec & Scalar UI)
    if (app.Environment.IsDevelopment())
    {
        // Generates the OpenAPI spec endpoint at /openapi/v1.json
        app.MapOpenApi();

        // Generates the interactive Scalar API Reference UI at /scalar/v1
        app.MapScalarApiReference(options =>
        {
            options.WithTitle($"{AppVersion.ApplicationName} API Reference (v{AppVersion.Current})")
                   .WithTheme(ScalarTheme.Moon);
        });
    }

    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
```

> **Why Scalar?** Scalar provides a modern, high-performance UI for exploring and testing OpenAPI specifications with built-in dark/light modes, customizable themes, and client code generation in multiple languages out of the box.

---

### Step 3.7: Configure MVC Web Application in `Company.App.Web`

The MVC Web project consumes the typed Refit client contract `IItemsApi` from `Company.App.Shared` and hosts client-side assets for user interactions.

#### 1. Configure Client-Side Library Manager: `src/Company.App.Web/libman.json`
To ensure developers never need to manually download JS/CSS files or rely on brittle external CDNs in production or offline enterprise environments, we configure ASP.NET Core **Library Manager (LibMan)** to acquire **DataTables**, **Chart.js**, **Select2**, **Select2 Bootstrap 5 Theme**, **Leaflet.js**, **jQuery**, and **Bootstrap 5**:

```json
{
  "version": "1.0",
  "defaultProvider": "cdnjs",
  "libraries": [
    {
      "library": "bootstrap@5.3.3",
      "destination": "wwwroot/lib/bootstrap/dist",
      "files": [
        "css/bootstrap.min.css",
        "js/bootstrap.bundle.min.js"
      ]
    },
    {
      "library": "jquery@3.7.1",
      "destination": "wwwroot/lib/jquery/dist",
      "files": [
        "jquery.min.js"
      ]
    },
    {
      "library": "datatables.net@2.1.8",
      "destination": "wwwroot/lib/datatables",
      "files": [
        "dataTables.min.js"
      ]
    },
    {
      "library": "datatables.net-bs5@2.1.8",
      "destination": "wwwroot/lib/datatables-bs5",
      "files": [
        "dataTables.bootstrap5.min.css",
        "dataTables.bootstrap5.min.js"
      ]
    },
    {
      "library": "Chart.js@4.4.7",
      "destination": "wwwroot/lib/chartjs",
      "files": [
        "chart.umd.min.js"
      ]
    },
    {
      "library": "select2@4.1.0-rc.0",
      "destination": "wwwroot/lib/select2",
      "files": [
        "css/select2.min.css",
        "js/select2.min.js"
      ]
    },
    {
      "library": "select2-bootstrap-5-theme@1.3.0",
      "destination": "wwwroot/lib/select2-bootstrap-5-theme",
      "files": [
        "select2-bootstrap-5-theme.min.css"
      ]
    },
    {
      "library": "leaflet@1.9.4",
      "destination": "wwwroot/lib/leaflet",
      "files": [
        "leaflet.js",
        "leaflet.css",
        "images/marker-icon.png",
        "images/marker-icon-2x.png",
        "images/marker-shadow.png"
      ]
    }
  ]
}
```

> **Offline-Ready:** The solution template pre-bundles the physical `.min.js` and `.min.css` files directly in `wwwroot/lib/` so the template works immediately offline. Because `Microsoft.Web.LibraryManager.Build` is referenced in the project file, running `dotnet build` will automatically verify and restore any missing client libraries!

#### 2. Update `src/Company.App.Web/appsettings.json`
Add the `ApiSettings` section:

```json
{
  "ApiSettings": {
    "BaseUrl": "https://localhost:7100"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information"
      }
    }
  },
  "AllowedHosts": "*"
}
```

#### 3. Create MVC Controller Consuming Refit: `src/Company.App.Web/Controllers/ItemsController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Refit;
using Company.App.Shared.Contracts;
using Company.App.Shared.DTOs;

namespace Company.App.Web.Controllers;

/// <summary>
/// MVC Controller orchestrating client requests and communicating with ApiService via typed Refit client.
/// Demonstrates CancellationToken cancellation propagation and structured exception handling.
/// </summary>
public class ItemsController : Controller
{
    private readonly IItemsApi _itemsApi;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(IItemsApi itemsApi, ILogger<ItemsController> logger)
    {
        _itemsApi = itemsApi;
        _logger = logger;
    }

    /// <summary>
    /// Displays items dashboard with interactive DataTables, Chart.js, Select2, and Leaflet.js components.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching items via Refit API client...");
        try
        {
            var items = await _itemsApi.GetItemsAsync(cancellationToken);
            return View(items);
        }
        catch (ApiException apiEx)
        {
            // Handles HTTP error status responses from ApiService (e.g. 404, 500)
            _logger.LogError(apiEx, "ApiService returned HTTP {StatusCode}: {Message}", apiEx.StatusCode, apiEx.Message);
            ViewBag.ErrorMessage = $"Backend service returned error: {apiEx.StatusCode}";
            return View(Enumerable.Empty<ItemDto>());
        }
        catch (HttpRequestException httpEx)
        {
            // Handles network failure / unreachable backend (handled gracefully by resilience pipeline retries first)
            _logger.LogError(httpEx, "Unable to reach ApiService backend at configured endpoint.");
            ViewBag.ErrorMessage = "Unable to connect to the ApiService backend. Please verify that the API service is running.";
            return View(Enumerable.Empty<ItemDto>());
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Items fetch request was canceled by the client.");
            return View(Enumerable.Empty<ItemDto>());
        }
    }

    /// <summary>
    /// Handles new item submission from dashboard modal form.
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ItemDto model, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            var items = await _itemsApi.GetItemsAsync(cancellationToken);
            return View("Index", items);
        }

        try
        {
            await _itemsApi.CreateItemAsync(model, cancellationToken);
            _logger.LogInformation("Item '{ItemName}' created successfully via Refit client.", model.Name);
            return RedirectToAction(nameof(Index));
        }
        catch (ApiException apiEx)
        {
            _logger.LogError(apiEx, "Backend rejected item creation with status {StatusCode}.", apiEx.StatusCode);
            ModelState.AddModelError(string.Empty, $"Backend error ({apiEx.StatusCode}): Could not save item.");
            var items = await _itemsApi.GetItemsAsync(cancellationToken);
            return View("Index", items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create item via ApiService.");
            ModelState.AddModelError(string.Empty, "An unexpected error occurred while communicating with the backend.");
            var items = await _itemsApi.GetItemsAsync(cancellationToken);
            return View("Index", items);
        }
    }
}
```

#### 4. Create Razor View with DataTables, Chart.js, Select2 & Leaflet: `src/Company.App.Web/Views/Items/Index.cshtml`
This view showcases **DataTables** (for client-side sorting, instant full-text filtering, and pagination with Bootstrap 5 styling), **Select2** (for searchable dropdowns), **Chart.js** (for client-side metrics visualization), and **Leaflet.js** (for interactive geographic mapping):

```html
@model IEnumerable<Company.App.Shared.DTOs.ItemDto>

@{
    ViewData["Title"] = "Items Dashboard (Refit, DataTables, Chart.js, Select2 & Leaflet)";
    var itemsList = Model?.ToList() ?? new List<Company.App.Shared.DTOs.ItemDto>();
    var completedCount = itemsList.Count(i => i.IsCompleted);
    var pendingCount = itemsList.Count(i => !i.IsCompleted);
}

<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Items Dashboard <span class="badge bg-secondary fs-6">v@(Company.App.Shared.Constants.AppVersion.Current)</span></h2>
        <span class="badge bg-primary fs-6">Refit + Web API + DataTables + Chart.js + Select2 + Leaflet</span>
    </div>

    @if (ViewBag.ErrorMessage != null)
    {
        <div class="alert alert-danger" role="alert">
            @ViewBag.ErrorMessage
        </div>
    }

    <!-- Analytics & Controls Cards -->
    <div class="row mb-4">
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0">Status Breakdown (Chart.js)</h5>
                </div>
                <div class="card-body d-flex justify-content-center align-items-center" style="max-height: 260px;">
                    <canvas id="itemsStatusChart" style="max-height: 220px;"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Quick Filter (Select2 Demo)</h5>
                </div>
                <div class="card-body">
                    <label for="itemFilterSelect" class="form-label">Search &amp; Jump to Item:</label>
                    <select id="itemFilterSelect" class="form-select select2-enable" style="width: 100%;">
                        <option value="">-- Select an Item --</option>
                        @foreach (var item in itemsList)
                        {
                            <option value="@item.Id">@item.Name (@(item.IsCompleted ? "Completed" : "Pending"))</option>
                        }
                    </select>
                    <div id="selectedItemDetails" class="mt-3 p-3 bg-light rounded border d-none">
                        <strong>Selected:</strong> <span id="selectedItemText"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Geographic Distribution Map (Leaflet.js) -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow-sm">
                <div class="card-header bg-info text-dark d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Distribution Hubs &amp; Fulfillment Centers (Leaflet.js)</h5>
                    <span class="badge bg-dark text-white">Interactive Map</span>
                </div>
                <div class="card-body p-0">
                    <div id="itemsMap" style="height: 280px; width: 100%;"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Create Item Form -->
        <div class="col-md-5">
            <div class="card shadow-sm">
                <div class="card-header bg-success text-white">
                    <h5 class="mb-0">Create New Item</h5>
                </div>
                <div class="card-body">
                    <form asp-action="Create" method="post">
                        <div class="mb-3">
                            <label class="form-label">Item Name</label>
                            <input name="Name" class="form-control" placeholder="Enter item name..." required />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea name="Description" class="form-control" rows="2" placeholder="Optional description..."></textarea>
                        </div>
                        <div class="form-check mb-3">
                            <input name="IsCompleted" type="checkbox" value="true" class="form-check-input" id="isCompletedCheck" />
                            <label class="form-check-label" for="isCompletedCheck">Mark as Completed</label>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Add Item via Refit</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Items Table (DataTables Demo) -->
        <div class="col-md-7">
            <div class="card shadow-sm">
                <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Items Catalog (DataTables Integration)</h5>
                    <span class="badge bg-light text-dark">Live Filter &amp; Pagination</span>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="itemsDataTable" class="table table-striped table-hover align-middle w-100">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if (itemsList.Any())
                                {
                                    @foreach (var item in itemsList)
                                    {
                                        <tr id="row-item-@item.Id">
                                            <td>@item.Id</td>
                                            <td>
                                                <strong>@item.Name</strong>
                                                @if (!string.IsNullOrEmpty(item.Description))
                                                {
                                                    <div class="text-muted small">@item.Description</div>
                                                }
                                            </td>
                                            <td>
                                                @if (item.IsCompleted)
                                                {
                                                    <span class="badge bg-success">Completed</span>
                                                }
                                                else
                                                {
                                                    <span class="badge bg-warning text-dark">Pending</span>
                                                }
                                            </td>
                                            <td>@item.CreatedAtUtc.ToLocalTime().ToString("g")</td>
                                        </tr>
                                    }
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    <script>
        $(document).ready(function () {
            // 1. Initialize Select2 with Bootstrap 5 theme
            $('.select2-enable').select2({
                theme: 'bootstrap-5',
                placeholder: 'Type to search items...'
            }).on('change', function () {
                var selectedText = $(this).find('option:selected').text();
                var selectedId = $(this).val();
                if (selectedId) {
                    $('#selectedItemText').text(selectedText);
                    $('#selectedItemDetails').removeClass('d-none');
                } else {
                    $('#selectedItemDetails').addClass('d-none');
                }
            });

            // 2. Initialize Chart.js Doughnut Chart
            var completedCount = @completedCount;
            var pendingCount = @pendingCount;

            var ctx = document.getElementById('itemsStatusChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [completedCount, pendingCount],
                        backgroundColor: ['#198754', '#ffc107'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // 3. Initialize Leaflet Map
            var map = L.map('itemsMap').setView([37.7749, -122.4194], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add sample fulfillment center markers
            L.marker([37.7749, -122.4194]).addTo(map)
                .bindPopup('<b>Main Fulfillment Hub</b><br>Active Items: ' + @itemsList.Count)
                .openPopup();

            L.marker([37.7833, -122.4167]).addTo(map)
                .bindPopup('<b>Downtown Express Hub</b><br>Status: Operational');

            L.marker([37.7600, -122.4400]).addTo(map)
                .bindPopup('<b>Westside Dispatch Facility</b><br>Pending Items: ' + @pendingCount);

            // 4. Initialize DataTables with Bootstrap 5 Integration
            $('#itemsDataTable').DataTable({
                responsive: true,
                pageLength: 5,
                lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
                order: [[0, 'desc']], // Sort by ID descending
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search catalog records..."
                }
            });
        });
    </script>
}
```

#### 5. Configure Layout with Client Libraries: `src/Company.App.Web/Views/Shared/_Layout.cshtml`
The shared layout includes all pre-bundled client CSS files in the `<head>` and JS scripts before `@await RenderSectionAsync("Scripts", required: false)`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - Company.App.Web</title>
    <!-- Bootstrap 5 CSS -->
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <!-- DataTables Bootstrap 5 CSS -->
    <link rel="stylesheet" href="~/lib/datatables-bs5/dataTables.bootstrap5.min.css" />
    <!-- Select2 CSS & Bootstrap 5 Theme -->
    <link rel="stylesheet" href="~/lib/select2/css/select2.min.css" />
    <link rel="stylesheet" href="~/lib/select2-bootstrap-5-theme/select2-bootstrap-5-theme.min.css" />
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="~/lib/leaflet/leaflet.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-sm navbar-toggleable-sm navbar-light bg-white border-bottom box-shadow mb-3">
            <div class="container-fluid">
                <a class="navbar-brand" asp-area="" asp-controller="Home" asp-action="Index">
                    Company.App.Web <span class="badge bg-secondary fs-6">v@(Company.App.Shared.Constants.AppVersion.Current)</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse d-sm-inline-flex justify-content-between">
                    <ul class="navbar-nav flex-grow-1">
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-controller="Home" asp-action="Index">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-dark" asp-area="" asp-controller="Items" asp-action="Index">Items Dashboard</a>
                        </li>
                    </ul>
<!--#if (IndividualAuth) -->
                    <partial name="_LoginPartial" />
<!--#endif -->
                </div>
            </div>
        </nav>
    </header>
    <div class="container">
        <main role="main" class="pb-3">
            @RenderBody()
        </main>
    </div>

    <footer class="border-top footer text-muted">
        <div class="container d-flex flex-wrap justify-content-between align-items-center py-2">
            <div>
                &copy; @DateTime.Now.Year - Company.App.Web - <a asp-area="" asp-controller="Home" asp-action="Privacy">Privacy</a>
            </div>
            <div>
                <span class="badge bg-light text-dark border">
                    Application Version: <strong>v@(Company.App.Shared.Constants.AppVersion.Current)</strong>
                </span>
            </div>
        </div>
    </footer>

    <!-- jQuery & Bootstrap Bundle -->
    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables JS & Bootstrap 5 Integration -->
    <script src="~/lib/datatables/dataTables.min.js"></script>
    <script src="~/lib/datatables-bs5/dataTables.bootstrap5.min.js"></script>
    <!-- Select2 JS -->
    <script src="~/lib/select2/js/select2.min.js"></script>
    <!-- Chart.js UMD -->
    <script src="~/lib/chartjs/chart.umd.min.js"></script>
    <!-- Leaflet JS -->
    <script src="~/lib/leaflet/leaflet.js"></script>
    <script src="~/js/site.js" asp-append-version="true"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>
```

#### 6. Create Login Partial: `src/Company.App.Web/Views/Shared/_LoginPartial.cshtml`
When Individual Authentication is enabled, this partial renders the user's login status, registration links, and logout button:

```html
@using Microsoft.AspNetCore.Identity
@inject SignInManager<IdentityUser> SignInManager
@inject UserManager<IdentityUser> UserManager

<ul class="navbar-nav">
@if (SignInManager.IsSignedIn(User))
{
    <li class="nav-item">
        <a class="nav-link text-dark" asp-area="Identity" asp-page="/Account/Manage/Index" title="Manage">Hello @User.Identity?.Name!</a>
    </li>
    <li class="nav-item">
        <form class="form-inline" asp-area="Identity" asp-page="/Account/Logout" asp-route-returnUrl="@Url.Action("Index", "Home", new { area = "" })">
            <button type="submit" class="nav-link btn btn-link text-dark">Logout</button>
        </form>
    </li>
}
else
{
    <li class="nav-item">
        <a class="nav-link text-dark" asp-area="Identity" asp-page="/Account/Register">Register</a>
    </li>
    <li class="nav-item">
        <a class="nav-link text-dark" asp-area="Identity" asp-page="/Account/Login">Login</a>
    </li>
}
</ul>
```

#### 7. Configure Serilog, Refit & Authentication in `src/Company.App.Web/Program.cs`
```csharp
using Refit;
using Serilog;
using Company.App.Shared.Constants;
using Company.App.Shared.Contracts;
#if (IndividualAuth)
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Company.App.Data;
#elif (WindowsAuth)
using Microsoft.AspNetCore.Authentication.Negotiate;
#endif

// 1. Bootstrap early logging to catch startup errors
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting {AppName} (v{Version})...", AppVersion.ApplicationName, AppVersion.Current);

    var builder = WebApplication.CreateBuilder(args);

    // 2. Wire up Serilog from appsettings.json
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

#if (IndividualAuth)
    // 3a. Register EF Core DbContext & ASP.NET Core Identity (when --auth Individual is selected)
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        }));

    builder.Services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = false)
        .AddEntityFrameworkStores<AppDbContext>();

    builder.Services.AddRazorPages();
#elif (WindowsAuth)
    // 3b. Register Windows Authentication (when --auth Windows is selected)
    builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
        .AddNegotiate();

    builder.Services.AddAuthorization(options =>
    {
        // Require authenticated Windows users across all endpoints by default
        options.FallbackPolicy = options.DefaultPolicy;
    });
#endif

    // 4. Add MVC Controllers and Views
    builder.Services.AddControllersWithViews();

    // 5. Register Health Checks
    builder.Services.AddHealthChecks();

    // 6. Register Refit Client with Standard HTTP Resilience Pipeline
    var apiBaseUrl = builder.Configuration["ApiSettings:BaseUrl"] ?? "https://localhost:7100";
    
    builder.Services.AddRefitClient<IItemsApi>()
        .ConfigureHttpClient(client =>
        {
            client.BaseAddress = new Uri(apiBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(15);
        })
        // Enables Microsoft.Extensions.Http.Resilience (retries with exponential jitter, circuit breaker, rate limiter)
        .AddStandardResilienceHandler();

    var app = builder.Build();

    // 7. Enable Serilog HTTP request logging
    app.UseSerilogRequestLogging();

    if (!app.Environment.IsDevelopment())
    {
        app.UseExceptionHandler("/Home/Error");
        app.UseHsts();
    }

    app.UseHttpsRedirection();
    app.UseRouting();

#if (IndividualAuth || WindowsAuth)
    app.UseAuthentication();
#endif
    app.UseAuthorization();
    app.MapStaticAssets();

    // 8. Health Check endpoint
    app.MapHealthChecks("/health")
       .WithName("HealthCheck")
       .WithTags("System");

    app.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}")
        .WithStaticAssets();

#if (IndividualAuth)
    app.MapRazorPages();
#endif

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}
```

---

## 4. Configuring `template.json`

Now we turn our solution folder into a real .NET Template. 

Go back to the root `MvcApiTemplate/` folder and create the `.template.config` folder:

```bash
cd MvcApiTemplate
mkdir .template.config
```

Create `.template.config/template.json`:

```json
{
  "$schema": "http://json.schemastore.org/template",
  "author": "YourName",
  "classifications": [ "Web", "MVC", "API", "Solution", "EFCore", "Serilog", "Scalar", "Refit", "Authentication" ],
  "name": "ASP.NET Core MVC & API Solution with EF Core, Serilog, Scalar UI, Refit & Auth Options (.NET 10)",
  "identity": "CustomTemplates.MvcApiSolution.CSharp",
  "shortName": "mvc-api",
  "tags": {
    "language": "C#",
    "type": "solution"
  },
  "sourceName": "Company.App",
  "preferNameDirectory": true,
  "symbols": {
    "auth": {
      "type": "parameter",
      "datatype": "choice",
      "choices": [
        {
          "choice": "None",
          "description": "No authentication"
        },
        {
          "choice": "Individual",
          "description": "Individual authentication using ASP.NET Core Identity"
        },
        {
          "choice": "Windows",
          "description": "Windows Authentication"
        }
      ],
      "defaultValue": "None",
      "description": "The type of authentication to configure for the solution."
    },
    "IndividualAuth": {
      "type": "computed",
      "value": "(auth == \"Individual\")"
    },
    "WindowsAuth": {
      "type": "computed",
      "value": "(auth == \"Windows\")"
    },
    "NoAuth": {
      "type": "computed",
      "value": "(auth == \"None\")"
    }
  },
  "sources": [
    {
      "modifiers": [
        {
          "exclude": [
            "**/[Bb]in/**",
            "**/[Oo]bj/**",
            "**/.vs/**",
            "**/.idea/**",
            "**/*.user",
            "**/*.lock.json",
            "**/.git/**"
          ]
        },
        {
          "condition": "(!IndividualAuth)",
          "exclude": [
            "**/_LoginPartial.cshtml"
          ]
        }
      ]
    }
  ],
  "primaryOutputs": [
    {
      "path": "Company.App.sln"
    }
  ]
}
```

### Key Configuration Breakdown:

| Property | Purpose |
| :--- | :--- |
| `shortName` | The command abbreviation passed to `dotnet new` (e.g. `dotnet new mvc-api`). |
| `sourceName` | **Crucial:** The template engine will search for `"Company.App"` across all file/folder names and content, replacing it with the user's chosen name (e.g., `MyApp`). |
| `symbols.auth` | Exposes the `--auth` CLI choice option with choices `None`, `Individual`, and `Windows`. |
| `symbols.IndividualAuth` | Computed boolean flag evaluating to `true` when `--auth Individual` is provided. |
| `symbols.WindowsAuth` | Computed boolean flag evaluating to `true` when `--auth Windows` is provided. |
| `sources.modifiers` | Excludes temporary build files (`bin/`, `obj/`) and excludes `_LoginPartial.cshtml` when `!IndividualAuth`. |
| `tags.type` | Set to `"solution"` so tools like JetBrains Rider and Visual Studio recognize it as a solution-level template. |
| `preferNameDirectory` | When `true`, if the user runs `dotnet new mvc-api -n MyApp`, it creates a folder named `MyApp` if not already in one. |
| `primaryOutputs` | Identifies the main file (`Company.App.sln`) so IDEs automatically open the solution upon generation. |

---

## 5. Folder Hierarchy Checklist

Before testing, verify that your authoring layout looks exactly like this:

```text
MvcApiTemplate/
├── .template.config/
│   └── template.json
└── Company.App/
    ├── Company.App.sln
    ├── Directory.Packages.props
    └── src/
        ├── Company.App.Shared/
        │   ├── Constants/
        │   │   └── AppVersion.cs
        │   ├── DTOs/
        │   │   └── ItemDto.cs
        │   ├── Contracts/
        │   │   └── IItemsApi.cs
        │   └── Company.App.Shared.csproj
        ├── Company.App.Data/
        │   ├── Entities/
        │   │   └── Item.cs
        │   ├── AppDbContext.cs
        │   └── Company.App.Data.csproj
        ├── Company.App.ApiService/
        │   ├── Controllers/
        │   │   └── ItemsController.cs
        │   ├── appsettings.json
        │   ├── Program.cs
        │   └── Company.App.ApiService.csproj
        └── Company.App.Web/
            ├── Controllers/
            │   ├── HomeController.cs
            │   └── ItemsController.cs
            ├── Models/
            │   └── ErrorViewModel.cs
            ├── Views/
            │   ├── Home/
            │   ├── Items/
            │   │   └── Index.cshtml
            │   └── Shared/
            │       ├── _Layout.cshtml
            │       └── _LoginPartial.cshtml
            ├── wwwroot/
            │   ├── css/
            │   │   └── site.css
            │   ├── js/
            │   │   └── site.js
            │   └── lib/
            │       ├── bootstrap/
            │       ├── chartjs/
            │       │   └── chart.umd.min.js
            │       ├── datatables/
            │       │   └── dataTables.min.js
            │       ├── datatables-bs5/
            │       │   ├── dataTables.bootstrap5.min.css
            │       │   └── dataTables.bootstrap5.min.js
            │       ├── jquery/
            │       ├── leaflet/
            │       │   ├── leaflet.js
            │       │   ├── leaflet.css
            │       │   └── images/
            │       ├── select2/
            │       │   ├── css/select2.min.css
            │       │   └── js/select2.min.js
            │       └── select2-bootstrap-5-theme/
            │           └── select2-bootstrap-5-theme.min.css
            ├── libman.json
            ├── appsettings.json
            ├── Program.cs
            └── Company.App.Web.csproj
```

> **Important:** Make sure you clean out any `bin` and `obj` folders inside `Company.App` before installing the template:
> ```bash
> dotnet clean Company.App/Company.App.sln
> ```

---

## 6. Installing and Testing the Template Locally

### Step 6.1: Install the Template

You can install a template directly from a local folder without publishing to NuGet:

```bash
# From the MvcApiTemplate root folder
dotnet new install .
```

You will see output confirming installation:

```text
The following template packages will be installed:
   C:\Path\To\MvcApiTemplate

Success: MvcApiTemplate installed the following templates:
Template Name                                                                           Short Name  Language  Tags
--------------------------------------------------------------------------------------  ----------  --------  -----------------------------------------------------------------
ASP.NET Core MVC & API Solution with EF Core, Serilog, Scalar UI, Refit & Auth Options  mvc-api     [C#]      Web/MVC/API/Solution/EFCore/Serilog/Scalar/Refit/Authentication
```

---

### Step 6.2: Test Generating Different Authentication Flavors

Let's test all three authentication choices to verify the conditional generation:

#### 1. Default (No Authentication):
```bash
mkdir C:\Temp\TestNoAuth
cd C:\Temp\TestNoAuth
dotnet new mvc-api -n MyApp -o MyApp
```

#### 2. Individual Authentication (ASP.NET Core Identity):
```bash
mkdir C:\Temp\TestIndividual
cd C:\Temp\TestIndividual
dotnet new mvc-api -n MyApp -o MyApp --auth Individual
```
When generated with `--auth Individual`:
- `MyApp.Data/AppDbContext.cs` inherits from `IdentityDbContext<IdentityUser>`.
- `MyApp.Web/Program.cs` wires up `AddDefaultIdentity<IdentityUser>()` and `AddRazorPages()`.
- `_LoginPartial.cshtml` is preserved and wired into `_Layout.cshtml`.
- `MyApp.Web.csproj` includes `Microsoft.AspNetCore.Identity.UI`.

#### 3. Windows Authentication:
```bash
mkdir C:\Temp\TestWindows
cd C:\Temp\TestWindows
dotnet new mvc-api -n MyApp -o MyApp --auth Windows
```
When generated with `--auth Windows`:
- `MyApp.Web/Program.cs` configures `AddAuthentication(NegotiateDefaults.AuthenticationScheme).AddNegotiate()`.
- `_LoginPartial.cshtml` is cleanly excluded.

---

### Step 6.3: Inspect Generated Directory & Verify Build

Let's inspect the generated directory tree for `MyApp` with `--auth Individual`:

```bash
cd C:\Temp\TestIndividual\MyApp
dir /s /b
```

Output:
```text
C:\Temp\TestIndividual\MyApp\MyApp.sln
C:\Temp\TestIndividual\MyApp\Directory.Packages.props
C:\Temp\TestIndividual\MyApp\src\MyApp.Shared
C:\Temp\TestIndividual\MyApp\src\MyApp.Shared\MyApp.Shared.csproj
C:\Temp\TestIndividual\MyApp\src\MyApp.Shared\Constants\AppVersion.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Shared\DTOs\ItemDto.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Shared\Contracts\IItemsApi.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Data
C:\Temp\TestIndividual\MyApp\src\MyApp.Data\MyApp.Data.csproj
C:\Temp\TestIndividual\MyApp\src\MyApp.Data\Entities\Item.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Data\AppDbContext.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.ApiService
C:\Temp\TestIndividual\MyApp\src\MyApp.ApiService\MyApp.ApiService.csproj
C:\Temp\TestIndividual\MyApp\src\MyApp.ApiService\Controllers\ItemsController.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Web
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\MyApp.Web.csproj
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\libman.json
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\chartjs\chart.umd.min.js
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\datatables\dataTables.min.js
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\datatables-bs5\dataTables.bootstrap5.min.css
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\datatables-bs5\dataTables.bootstrap5.min.js
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\leaflet\leaflet.js
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\leaflet\leaflet.css
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\select2\js\select2.min.js
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\select2\css\select2.min.css
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\wwwroot\lib\select2-bootstrap-5-theme\select2-bootstrap-5-theme.min.css
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\Controllers\ItemsController.cs
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\Views\Items\Index.cshtml
C:\Temp\TestIndividual\MyApp\src\MyApp.Web\Views\Shared\_LoginPartial.cshtml
```

Build the entire generated solution to verify that MSBuild restores all NuGet dependencies centrally across all four projects and runs LibMan checks:

```bash
dotnet build
```

#### 1. Start the API Service:
```bash
dotnet run --project src/MyApp.ApiService/MyApp.ApiService.csproj
```

##### A. Inspect Root Version Endpoint (`GET /`):
Query the root API endpoint in your browser or with `curl`:
```bash
curl -k https://localhost:7100/
```
Response:
```json
{
  "application": "MyApp",
  "version": "1.0.0",
  "fullVersion": "1.0.0",
  "environment": "Development",
  "status": "Online",
  "timestampUtc": "2026-09-14T18:00:00.0000000Z"
}
```

##### B. Open Scalar API Reference UI:
Navigate to:
```text
https://localhost:7100/scalar/v1
```
The Scalar UI header prominently displays the application title and version: `MyApp API Reference (v1.0.0)`. You can inspect endpoints, execute requests, and test the `ItemsController` directly from Scalar!

#### 2. Start the MVC Web Project:
In a separate terminal:
```bash
dotnet run --project src/MyApp.Web/MyApp.Web.csproj
```

Navigate to:
```text
https://localhost:7000/
```
You will notice:
- **Navbar & Footer Version Rendering:** The application version `v1.0.0` is prominently rendered in the layout footer (`Application Version: v1.0.0`) and the top navbar brand on every page.
- **Items Dashboard (`/Items`):** Renders interactive **DataTables** (with live search, column sorting, page size selector, and responsive pagination), **Chart.js** doughnut charts, searchable **Select2** dropdowns, and **Leaflet.js** distribution maps instantly with zero external CDN dependencies.
- **Authentication:** Displays Register / Login navigation links when generated under `--auth Individual`.

---

### Step 6.4: Verify Central Version Updates Across Solution

Whenever you update your code or prepare a new release, simply update the version values in `src/MyApp.Shared/Constants/AppVersion.cs`:

```csharp
namespace MyApp.Shared.Constants;

public static class AppVersion
{
    // Bump version from 1.0.0 to 1.1.0
    public const string Current = "1.1.0";
    public const string ApplicationName = "MyApp";

    public const int Major = 1;
    public const int Minor = 1; // Increment minor version for new features
    public const int Patch = 0;
    public const string? Suffix = null;

    public static string FullVersion => string.IsNullOrWhiteSpace(Suffix)
        ? $"{Major}.{Minor}.{Patch}"
        : $"{Major}.{Minor}.{Patch}-{Suffix}";

    public static string InformationalVersion => $"{ApplicationName} v{FullVersion}";
}
```

Because all projects reference `MyApp.Shared`, recompiling or launching the solution immediately updates:
1. **MVC Web Footer & Navbar:** Automatically displays `v1.1.0` on every page.
2. **API Service Root Endpoint (`GET /`):** Instantly outputs `"version": "1.1.0"` in JSON responses for health checks and deployment monitoring.
3. **Scalar API UI & OpenAPI Docs:** Displays `MyApp API Reference (v1.1.0)` in the documentation header.
4. **Serilog Startup Logs:** Outputs `Starting MyApp (v1.1.0)...` in both Web and API terminal consoles.

---

## 7. Packaging the Template as a NuGet Package (`.nupkg`)

To share your template with team members or distribute it via an internal/public NuGet feed, package it using a `.csproj` file.

### Step 7.1: Add `MvcApiTemplate.csproj`

In the root `MvcApiTemplate/` folder, create `MvcApiTemplate.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <PackageType>Template</PackageType>
    <PackageId>MyCompany.Templates.MvcApi</PackageId>
    <Title>ASP.NET Core MVC &amp; API Solution Template with Auth Options (.NET 10)</Title>
    <Version>1.0.0</Version>
    <Authors>YourName</Authors>
    <Description>Modular multi-project solution template generating ASP.NET Core MVC, API Service, EF Core Data layer, and Shared library in .NET 10 with Authentication choices (None, Individual, Windows), Central Package Management, Client-Side Libraries (DataTables, Chart.js, Select2, Leaflet.js, LibMan), Serilog, Scalar UI, and Refit.</Description>
    <PackageTags>dotnet-new;templates;aspnetcore;mvc;webapi;data;shared;dotnet10;cpm;serilog;efcore;scalar;refit;authentication;identity;datatables;chartjs;select2;leaflet;maps;libman</PackageTags>
    <TargetFramework>netstandard2.0</TargetFramework>
    <IncludeContentInPack>true</IncludeContentInPack>
    <IncludeBuildOutput>false</IncludeBuildOutput>
    <ContentTargetFolders>content</ContentTargetFolders>
    <NoWarn>$(NoWarn);NU5128</NoWarn>
  </PropertyGroup>

  <ItemGroup>
    <Content Include="Company.App\**\*" Exclude="Company.App\**\bin\**;Company.App\**\obj\**" />
    <Content Include=".template.config\**\*" />
  </ItemGroup>

</Project>
```

### Step 7.2: Pack the Template

Run:

```bash
dotnet pack -c Release
```

This creates `bin/Release/MyCompany.Templates.MvcApi.1.0.0.nupkg`.

---

### Step 7.3: Install from the NuGet Package

Developers on your team can install your template directly from the `.nupkg` file or your private NuGet feed:

```bash
# Install from local .nupkg file
dotnet new install bin/Release/MyCompany.Templates.MvcApi.1.0.0.nupkg

# Or install from NuGet feed (once pushed)
dotnet new install MyCompany.Templates.MvcApi
```

To uninstall:

```bash
dotnet new uninstall MyCompany.Templates.MvcApi
```

---

## 8. Production-Readiness, Resilience & Developer Best Practices

To ensure your custom solution template is robust, resilient, and enterprise-ready, follow these production engineering guidelines:

### 8.1 HTTP Client Resilience & Fault Tolerance
- **Standard Resilience Handler:** By configuring `.AddStandardResilienceHandler()` on Refit clients via `Microsoft.Extensions.Http.Resilience`, your application automatically benefits from:
  1. **Rate Limiting:** Prevents overwhelming downstream microservices with burst traffic.
  2. **Total Request Timeout:** Enforces an absolute timeout cap (e.g. 30s) across all attempts.
  3. **Exponential Backoff Retries with Jitter:** Intelligently retries transient HTTP 5xx errors and network blips without creating retry storms.
  4. **Circuit Breaker:** Temporarily halts traffic to failing downstream services, preventing cascading failures across your infrastructure.
  5. **Attempt Timeout:** Caps the execution duration for each individual HTTP call attempt.

### 8.2 Database Transient Fault Handling (`EnableRetryOnFailure`)
- In cloud environments like Azure SQL or AWS RDS, transient connection hiccups occur during maintenance or network reconfiguration. Always configure `sqlOptions.EnableRetryOnFailure()` in `AppDbContext` registration so queries recover automatically without throwing fatal exceptions to users.

### 8.3 Cancellation Token Propagation
- Always accept `CancellationToken cancellationToken = default` in controller action methods, service methods, Refit contracts, and EF Core asynchronous calls (`ToListAsync(cancellationToken)`, `SaveChangesAsync(cancellationToken)`).
- When a user closes their browser tab or navigates away, ASP.NET Core cancels the request token, immediately aborting long-running SQL queries and freeing database connections for other active requests.

### 8.4 Health Checks & Container Probes (`/health`)
- Both `Company.App.ApiService` and `Company.App.Web` pre-expose `/health` endpoints. In Docker Compose, Kubernetes, or Azure Container Apps, configure liveness and readiness probes pointing to `/health`:
  ```yaml
  livenessProbe:
    httpGet:
      path: /health
      port: 8080
    initialDelaySeconds: 5
    periodSeconds: 10
  ```

### 8.5 Standard RFC 7807 ProblemDetails
- By registering `builder.Services.AddProblemDetails()` and `app.UseExceptionHandler()`, all unhandled API exceptions automatically serialize to standardized JSON RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `instance`), preventing sensitive stack traces from leaking to clients while providing uniform error schemas.

### 8.6 Centralized Versioning (SemVer 2.0.0) & CI/CD Integration
- Maintain your version key (`AppVersion.cs`) inside `*.Shared` following strict `MAJOR.MINOR.PATCH` semantics.
- In CI/CD pipelines (GitHub Actions, Azure DevOps, GitLab CI), you can also pass MSBuild properties to synchronize NuGet and assembly metadata:
  ```bash
  dotnet build -c Release /p:Version=1.2.0 /p:InformationalVersion=1.2.0-preview.1+commit.abc1234
  ```

### 8.7 Pre-Bundled Client Libraries (Offline-Ready with LibMan)
- Always bundle critical UI libraries (DataTables, Chart.js, Select2, Leaflet.js, Bootstrap, jQuery) in `wwwroot/lib/` alongside `libman.json` and `Microsoft.Web.LibraryManager.Build`.
- Developers can immediately code and test offline on airplanes, intranet environments, or during external CDN outages, while `dotnet build` ensures all assets are present and validated at compile time.

### 8.8 Clean Packaging Guidelines
- **Clean Before Packaging:** Always run `dotnet clean` and ensure `bin/` or `obj/` folders are excluded from `content` in `MvcApiTemplate.csproj`.
- **Distinct Placeholder:** Always use a multi-part canonical placeholder like `Company.App` as your `sourceName` to prevent unintended substring replacements (e.g., using `App` alone could inadvertently corrupt words like `Application` or `Approach`).

---

## Summary

By combining **.NET 10 Solution Templates**, **Authentication Options (`--auth None|Individual|Windows`)**, **Central Semantic Versioning (`AppVersion`)**, **Pre-Bundled Client Libraries (DataTables, Chart.js, Select2, Leaflet.js, LibMan)**, **Clean Project Layering** (`Web`, `ApiService`, `Data`, `Shared`), **Central Package Management (CPM)**, **Resilience Pipelines (`Microsoft.Extensions.Http.Resilience` & EF Core retries)**, **Health Checks**, **Cancellation Token Propagation**, **Serilog Structured Logging**, **Scalar API Reference UI**, and **Refit Type-Safe Clients**, you provide a standardized, battle-tested starting architecture that satisfies enterprise security, modularity, visual UI capabilities, resilience, and rapid developer onboarding for every new project.

---

## References & Further Reading

### .NET Template Engine & Tooling
- [Microsoft Learn: Custom Templates for `dotnet new`](https://learn.microsoft.com/en-us/dotnet/core/tools/custom-templates)
- [Microsoft Learn: Reference for `template.json`](https://learn.microsoft.com/en-us/dotnet/core/tools/template-json)
- [GitHub: dotnet/templating Repository](https://github.com/dotnet/templating)
- [Part 16: Creating Custom Project and Item Templates in .NET](/2026/03/11/dotnet-custom-templates/)

### Package Management & Versioning
- [Microsoft Learn: Central Package Management (CPM) in NuGet](https://learn.microsoft.com/en-us/nuget/consume-packages/Central-Package-Management)
- [Semantic Versioning 2.0.0 Specification](https://semver.org/)

### Architecture, Resilience & Data Access
- [Microsoft Learn: Build Resilient HTTP Apps with `Microsoft.Extensions.Http.Resilience`](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [Polly Project Documentation](https://www.pollyjs.org/)
- [Microsoft Learn: Connection Resiliency in Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency)
- [Microsoft Learn: Overview of Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

### Authentication & Security
- [Microsoft Learn: Introduction to Identity on ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Microsoft Learn: Configure Windows Authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/windowsauth)

### APIs, OpenAPI & Communication
- [Scalar Official Documentation & GitHub](https://scalar.com/)
- [Microsoft Learn: OpenAPI Support in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [GitHub: Refit - The Automatic Type-Safe REST Library for .NET](https://github.com/reactiveui/refit)

### Diagnostics, Health & Logging
- [Serilog Structured Logging Documentation](https://serilog.net/)
- [GitHub: Serilog.AspNetCore Integration](https://github.com/serilog/serilog-aspnetcore)
- [Microsoft Learn: Health Checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [Microsoft Learn: Handle Errors with RFC 7807 ProblemDetails in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors#problem-details)

### Client-Side Libraries & LibMan
- [Microsoft Learn: Client-Side Library Management (LibMan) in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/client-side/libman/)
- [DataTables Official Documentation & Bootstrap 5 Styling](https://datatables.net/)
- [Chart.js Interactive JavaScript Charts Documentation](https://www.chartjs.org/)
- [Select2 Dropdown Replacement Documentation](https://select2.org/)
- [Leaflet.js Interactive Mobile-Friendly Maps Documentation](https://leafletjs.com/)
