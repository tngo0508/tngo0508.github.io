---
layout: single
title: "ADO.NET Fundamentals: The Foundation of .NET Data Access"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - .NET
  - ADO.NET
  - C#
  - Database
  - Performance
---

Before ORMs like Entity Framework existed, there was **ADO.NET** (ActiveX Data Objects for .NET). It remains the low-level foundation for almost all data access in .NET. Understanding ADO.NET is crucial for any senior C# developer because it exposes how .NET manages database connections, commands, and memory.

## 1. The Core Architecture

ADO.NET follows a provider-based model. For SQL Server, we use `Microsoft.Data.SqlClient`. The four main objects you must master are:

1.  **`SqlConnection`:** Manages the physical connection to the database.
2.  **`SqlCommand`:** Represents the SQL query or stored procedure to be executed.
3.  **`SqlDataReader`:** A high-performance, forward-only, read-only stream of data from the database.
4.  **`SqlDataAdapter`:** A bridge between a `DataSet` and the database for disconnected scenarios.

---

## 2. Resource Management & `IDisposable`

Database connections are **unmanaged resources**. If you don't close them, you'll leak connections and eventually crash your application. Always use the `using` statement.

```csharp
string connectionString = "Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;";

await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();
// Do work here
```

**Interview Tip:** ADO.NET uses **Connection Pooling** by default. When you "close" a connection, it's actually returned to a pool to be reused, which is much faster than opening a new physical connection every time.

---

## 3. Executing Commands

### ExecuteNonQuery, ExecuteScalar, and ExecuteReader
*   **`ExecuteNonQuery`:** For `INSERT`, `UPDATE`, `DELETE`. Returns the number of rows affected.
*   **`ExecuteScalar`:** Returns a single value (e.g., `SELECT COUNT(*)` or `SELECT MAX(Id)`).
*   **`ExecuteReader`:** Returns a `SqlDataReader` for multiple rows.

```csharp
await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

await using var command = new SqlCommand("SELECT Name, Email FROM Users", connection);
await using var reader = await command.ExecuteReaderAsync();

while (await reader.ReadAsync())
{
    Console.WriteLine($"{reader["Name"]} - {reader["Email"]}");
}
```

---

## 4. Security: Preventing SQL Injection

**NEVER** concatenate strings to build SQL queries. Always use `SqlParameter`.

```csharp
// BAD (Vulnerable to SQL Injection)
string sql = "SELECT * FROM Users WHERE Email = '" + userEmail + "'";

// GOOD (Parameterized)
string sql = "SELECT * FROM Users WHERE Email = @Email";
SqlCommand command = new SqlCommand(sql, connection);
command.Parameters.AddWithValue("@Email", userEmail);
```

Parameters ensure that the input is treated as literal data, not executable code.

---

## 5. Working with Transactions

Transactions ensure **ACID** properties. Use `SqlTransaction` to wrap multiple operations.

```csharp
using (SqlTransaction transaction = connection.BeginTransaction())
{
    try
    {
        SqlCommand command = connection.CreateCommand();
        command.Transaction = transaction;

        command.CommandText = "UPDATE Accounts SET Balance = Balance - 100 WHERE Id = 1";
        await command.ExecuteNonQueryAsync();

        command.CommandText = "UPDATE Accounts SET Balance = Balance + 100 WHERE Id = 2";
        await command.ExecuteNonQueryAsync();

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

---

## 6. Disconnected Architecture: DataSet & DataTable

While `SqlDataReader` is fast and memory-efficient, sometimes you need to work with data offline or bind it to a UI control.

*   **`DataTable`:** Represents one table in memory.
*   **`DataSet`:** A collection of `DataTable` objects (a mini in-memory database).
*   **`SqlDataAdapter`:** Populates these objects.

```csharp
SqlDataAdapter adapter = new SqlDataAdapter("SELECT * FROM Users", connection);
DataTable table = new DataTable();
adapter.Fill(table);

foreach (DataRow row in table.Rows)
{
    Console.WriteLine(row["Name"]);
}
```

---

## 7. Async Operations in ADO.NET

In modern C#, always prefer the `Async` versions of methods (`OpenAsync`, `ExecuteReaderAsync`, `ReadAsync`). This prevents thread-blocking and allows your application to handle more concurrent requests, especially in ASP.NET Core.

---

## 8. Practical Implementation: CRUD Operations

For a simple project, let's create a `ProductRepository` that manages basic CRUD operations using raw SQL and ADO.NET.

### Model and Database Setup
First, define the SQL table and the C# model.

```sql
CREATE TABLE Products (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL
);
```

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
}
```

### Full CRUD Repository (Production-Ready)
```csharp
public class ProductRepository
{
    private readonly string _connectionString;

    public ProductRepository(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
    }

    public async Task CreateAsync(Product product, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(product);

        // Using asynchronous declarations to ensure resources are disposed properly
        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("INSERT INTO Products (Name, Price, Stock) VALUES (@Name, @Price, @Stock)", conn);
        
        cmd.Parameters.AddWithValue("@Name", product.Name);
        cmd.Parameters.AddWithValue("@Price", product.Price);
        cmd.Parameters.AddWithValue("@Stock", product.Stock);

        await conn.OpenAsync(ct);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task<List<Product>> GetAllAsync(CancellationToken ct = default)
    {
        var products = new List<Product>();
        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("SELECT Id, Name, Price, Stock FROM Products", conn);

        await conn.OpenAsync(ct);
        await using var reader = await cmd.ExecuteReaderAsync(ct);

        while (await reader.ReadAsync(ct))
        {
            products.Add(new Product {
                Id = reader.GetInt32(0), // Using ordinal indices for better performance
                Name = reader.GetString(1),
                Price = reader.GetDecimal(2),
                Stock = reader.GetInt32(3)
            });
        }
        return products;
    }

    public async Task UpdateAsync(Product product, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(product);

        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("UPDATE Products SET Name = @Name, Price = @Price, Stock = @Stock WHERE Id = @Id", conn);
        
        cmd.Parameters.AddWithValue("@Id", product.Id);
        cmd.Parameters.AddWithValue("@Name", product.Name);
        cmd.Parameters.AddWithValue("@Price", product.Price);
        cmd.Parameters.AddWithValue("@Stock", product.Stock);

        await conn.OpenAsync(ct);
        await cmd.ExecuteNonQueryAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        await using var conn = new SqlConnection(_connectionString);
        await using var cmd = new SqlCommand("DELETE FROM Products WHERE Id = @Id", conn);
        
        cmd.Parameters.AddWithValue("@Id", id);

        await conn.OpenAsync(ct);
        await cmd.ExecuteNonQueryAsync(ct);
    }
}
```

---

## 9. Advanced Operations: Bulk Insert & Upsert

### Bulk Insert with `SqlBulkCopy`
For high-performance inserts of thousands of rows, `SqlBulkCopy` is significantly faster than executing individual `INSERT` commands.

```csharp
public async Task BulkInsertAsync(List<Product> products)
{
    using var bulkCopy = new SqlBulkCopy(_connectionString);
    bulkCopy.DestinationTableName = "Products";
    
    // Create a DataTable to hold the data
    var table = new DataTable();
    table.Columns.Add("Name", typeof(string));
    table.Columns.Add("Price", typeof(decimal));
    table.Columns.Add("Stock", typeof(int));

    foreach (var p in products)
    {
        table.Rows.Add(p.Name, p.Price, p.Stock);
    }

    await bulkCopy.WriteToServerAsync(table);
}
```

### Upsert (Update or Insert) using `MERGE`
An "Upsert" allows you to update an existing record if it matches a criteria (e.g., Name) or insert a new one if it doesn't.

```csharp
public async Task UpsertAsync(Product product)
{
    string sql = @"
        MERGE INTO Products AS Target
        USING (SELECT @Name AS Name, @Price AS Price, @Stock AS Stock) AS Source
        ON (Target.Name = Source.Name)
        WHEN MATCHED THEN
            UPDATE SET Price = Source.Price, Stock = Source.Stock
        WHEN NOT MATCHED THEN
            INSERT (Name, Price, Stock) VALUES (Source.Name, Source.Price, Source.Stock);";

    using var conn = new SqlConnection(_connectionString);
    using var cmd = new SqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@Name", product.Name);
    cmd.Parameters.AddWithValue("@Price", product.Price);
    cmd.Parameters.AddWithValue("@Stock", product.Stock);
    await conn.OpenAsync();
    await cmd.ExecuteNonQueryAsync();
}
```

---

## 10. ADO.NET vs Entity Framework Core

| Feature | ADO.NET | EF Core |
| :--- | :--- | :--- |
| **Control** | Absolute control over SQL. | High-level abstraction. |
| **Performance** | Maximum performance (raw speed). | Slight overhead due to LINQ translation. |
| **Complexity** | More boilerplate code. | Reduced boilerplate. |
| **Maintenance** | Harder to maintain large schemas. | Migration system makes it easy. |

**Rule of thumb:** Use EF Core for 90% of your work. Use ADO.NET (or Dapper) for high-performance reporting or complex bulk operations where EF Core is too slow.

---

## 11. References & Further Reading
*   **Microsoft Learn:** [ADO.NET Overview](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/ado-net-overview)
*   **Microsoft Learn:** [Retrieving Data Using a DataReader](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/retrieving-data-using-a-datareader)
*   **Microsoft Learn:** [SqlBulkCopy Class for High-Performance Inserts](https://learn.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlbulkcopy)
*   **Blog:** [Dapper vs EF Core vs ADO.NET: Performance Benchmarking](https://exceptionnotfound.net/dapper-vs-entity-framework-core-vs-ado-net-performance-benchmarking/)
*   **Blog:** [Using the MERGE Statement in SQL Server](https://www.sqlshack.com/understanding-the-sql-server-merge-statement/)

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
* [Part 7: Clean Architecture: Principles, Layers, and Best Practices]({{ site.baseurl }}{% post_url 2026-3-5-clean-architecture %})
* [Part 8: N-Tier Architecture: Structure, Layers, and Beginner Guide]({{ site.baseurl }}{% post_url 2026-3-5-n-tier-architecture %})
* [Part 9: Repository and Unit of Work Patterns: Implementation and Benefits]({{ site.baseurl }}{% post_url 2026-3-5-repository-unit-of-work %})
* [Part 10: TDD and Unit Testing in .NET: Production-Ready Strategies]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
