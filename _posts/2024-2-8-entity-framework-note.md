---
title: ".NET C# - Entity Framework Core Review Note"
date: 2024-2-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
---

## What is Entity Framework Core (ORM)

Framework core is a type of `ORM` and that stands for `Object Relational Mapping`.

Mapping some group of objects to the datastore.

Entity Framework Core simplifies database interactions in .NET applications by providing a convenient and flexible ORM framework, supporting various databases, and offering features like migration support and cross-platform compatibility.

In simpler terms, when using Entity Framework Core (EF Core) in our application, it acts as a bridge between our code and the database.

* **Database Schema:**

  * In a relational database, the schema defines the structure of the database, including tables, fields, and relationships.
  * Tables represent entities (e.g., users, products), and relationships define how these entities are related.
* **ORM Framework (e.g., Entity Framework Core):**

  * Acts as a bridge between the application code and the database.
  * Provides an abstraction layer, allowing developers to work with database entities using programming objects in their code.
* **Mapping:**

  * ORM frameworks map application objects to database tables. Each class in your code corresponds to a table in the database.
  * Relationships between objects in your code mirror the relationships between tables in the database.
* **Object-Relational Mapping (ORM):**

  * ORM simplifies database interactions by letting developers work with objects in their code rather than writing raw SQL queries.
  * When the application runs, the ORM framework handles the translation between the application's objects and the database schema.
* **In-Memory Mapping:**

  * The ORM maintains an in-memory mapping between application objects and database entities.
  * This mapping allows seamless communication between the application and the database without developers needing to deal directly with SQL.
* **Simplified Interaction:**

  * Developers can focus on working with objects in their code, using familiar programming constructs.
  * Changes to the database schema (e.g., adding a new field) can be handled through the ORM's migration tools, simplifying the process of keeping the database schema in sync with the application code.

* `Migration` = a way to create all of the tables in the database or add another new table in the database or change the table columns or the relationships.

## Nuget Packages for EF

* To work with `ASP.NET CORE` and use Entity Framework (EF), we need to install a few Nuget packages.
  * Entity framework Core SQL Server
  * For migration:
    * EntityFrameworkCore.Tools
    * EntityFrameworkCore.Design

## Create Database Context

In the example code below, the `DbSet` is actually a table in our database. Each property in the `Shirt` class represents for different columns in that table.

```csharp
// Data/ApplicationDbContext.cs
public class ApplicationDbContext: DbContext
{
    public DbSet<Shirt> Shirts {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
```

Table `Shirt`

By default, the `ShirtId` or `Id` will be the primary key (PK) in the table.

```csharp
public class Shirt
{
    public int ShirtId {get; set;}
    ...
}
```

### Seed Data

```csharp
// Data/ApplicationDbContext.cs
public class ApplicationDbContext: DbContext
{
    public ApplicationDbContext(DbContextOptions options): base(options)
    {

    }

    public DbSet<Shirt> Shirts {get; set;}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // data seeding
        modelBuilder.Entity<Shirt>().HasData(
            new Shirt{ShirtId = 1, ...<other properties>}
        )
    }
}
```

## Db Migration

Again, migration is like an operation to update the actually Db according to the `DBContext` class. If there is no existing table, the first migration is actually creating the entire new Database and tables and all relationship in SQL Server.

Note: we can use `launchSettings.json` to set up our environment inside our project. This file contains the information for setting up schemes(Http, https), port, etc.

### Specify connections string

```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YourServer;Database=YourDatabase;User=YourUsername;Password=YourPassword;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}

```

### Add middleware to use EF

```csharp
// program.cs

var builder = WebApplication.CreateBuilder(args);

#region SET UP DBCONTEXT HERE
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{   
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
});
#endregion

// Add services to the container
builder.Services.AddController();

var app = builder.Build();

// Configure the HTTP request pipeline

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
```

### Run migration

In visual studio, Tools > NuGet Package Manager > Package Manager Console

Run the following command in the Package Manager Console to generate the scripts to create tables and relationship.

```console
Add-Migration Init
```

After executing the command above, we should be able to see a new folder called `Migrations` generated.

If we inspect the autogenerated files in `Migrations` folder, we notice that there are 2 main method `Up` and `Down`

In the context of Entity Framework Core migrations, the `Up` method is responsible for applying changes to the database schema, typically by creating or modifying database objects. The `Down` method, on the other hand, is designed to revert these changes, allowing for the rollback of migrations.

In scenarios where there is a single table or entity within the database, the `Up` method, during the initial migration, will generate SQL statements to create the corresponding table and apply any specified configurations. Conversely, the `Down` method, associated with the initial migration's rollback, will contain SQL statements to drop the created table, effectively undoing the changes introduced by the `Up` method.

It's essential to recognize that the `Up` and `Down` methods within a migration class encapsulate the actions needed to transition the database schema forward and backward, respectively, with the aim of maintaining consistency throughout the application's development lifecycle.

Next, we need to run the `update-database` command in the Package Manager Console or the .NET CLI. It applies the pending migrations to the database. This involves executing the `Up` method in each migration.

```console
update-database Init
```
