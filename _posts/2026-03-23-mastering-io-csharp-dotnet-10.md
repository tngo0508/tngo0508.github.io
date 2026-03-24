---
layout: single
title: "Mastering I/O in C# & .NET 10: A Practical Guide to Files, Directories, and Streams"
excerpt: "Learn how to perform common I/O tasks in .NET 10 with high performance and modern C# syntax. From simple file reading to advanced stream handling."
date: 2026-03-23
show_date: true
classes: wide
categories:
  - .NET C#
  - Programming
tags:
  - .NET 10
  - C#
  - I/O
  - Performance
  - Streams
toc: true
toc_label: "I/O Guide"
---

Input/Output (I/O) is the bread and butter of almost every application. Whether you are reading a configuration file, saving user data, or processing massive logs, knowing how to handle I/O efficiently is crucial for building responsive and scalable applications in **.NET 10**.

In this guide, we'll explore the most common I/O tasks using modern C# features and the high-performance APIs available in the `System.IO` namespace.

---

### 1. Working with Files: The Basics (Beginner)

The `File` static class is your best friend for quick operations. In .NET 10, these methods are highly optimized.

**Note:** Helper methods like `File.WriteAllTextAsync` and `File.ReadAllTextAsync` handle opening and closing the file for you automatically. You don't need the `using` keyword here!

#### Reading and Writing Text
For small to medium-sized files, `ReadAllTextAsync` and `WriteAllTextAsync` are the simplest options.

```csharp
using System.IO;

string path = "example.txt";
string content = "Hello, .NET 10!";

// Writing to a file (creates or overwrites)
await File.WriteAllTextAsync(path, content);

// Reading from a file
string readText = await File.ReadAllTextAsync(path);
Console.WriteLine(readText);
```

#### Handling Large Files
If you are dealing with large files, **never** load the whole thing into memory. Instead, process it line-by-line using `ReadLinesAsync`.

```csharp
// Processes the file without loading it all at once
await foreach (string line in File.ReadLinesAsync("large_log.txt"))
{
    if (line.Contains("ERROR"))
    {
        Console.WriteLine(line);
    }
}
```

---

### 2. Why the `using` Keyword? (Resource Management)

When you manually open a file using `FileStream`, `StreamReader`, or `StreamWriter`, you are interacting with **unmanaged resources**. These are system-level handles that the .NET Garbage Collector doesn't manage automatically.

#### What happens if you don't use it?
1.  **File Locking:** Your application "holds" the file. If you try to open it again or delete it while it's still open, you'll get an error: *"The process cannot access the file because it is being used by another process."*
2.  **Resource Leaks:** System handles are finite. If you open thousands of files without closing them, your application (or even the OS) might crash.

The `using` keyword ensures that the file is **closed and disposed of immediately** once you are done, even if an exception (error) occurs in your code.

#### Modern Syntax: `using` vs `await using`
*   **`using` (Synchronous):** Calls `.Dispose()` when the block ends.
*   **`await using` (Asynchronous):** Calls `.DisposeAsync()` asynchronously. This is the **best practice** for .NET 10 I/O to avoid blocking threads during cleanup.

```csharp
// The "using declaration" (C# 8+) - disposes at the end of the method scope
await using var stream = File.OpenRead("data.txt");
// ... work with stream ...
```

---

### 3. Manual Control: Readers and Writers (Intermediate)

When you need more control over encoding or want to write data sequentially without loading it all, use `StreamReader` and `StreamWriter`.

#### Writing with `StreamWriter`
Perfect for generating logs or large text files.

```csharp
string logPath = "app.log";

await using (StreamWriter writer = new StreamWriter(logPath, append: true))
{
    await writer.WriteLineAsync($"Log Entry: {DateTime.Now} - User logged in.");
}
```

#### Reading with `StreamReader`
Useful for reading structured text files line-by-line manually.

```csharp
await using (StreamReader reader = new StreamReader("config.ini"))
{
    while (await reader.ReadLineAsync() is { } line)
    {
        Console.WriteLine($"Processing: {line}");
    }
}
```

---

### 4. Path Manipulation: The Modern Way

Don't manually concatenate strings to build paths! Use the `Path` class to ensure your code works across Windows, Linux, and macOS.

```csharp
string folder = "Data";
string filename = "report.pdf";

// The WRONG way (don't do this!)
// string fullPath = folder + "/" + filename; 

// The RIGHT way
string fullPath = Path.Combine(folder, filename);

// Getting metadata
string extension = Path.GetExtension(fullPath); // .pdf
string fileNameOnly = Path.GetFileNameWithoutExtension(fullPath); // report
```

**.NET 10 Tip:** Use `Path.Join` for faster concatenation if you don't need the path-rooting logic of `Path.Combine`.

---

### 5. Directory Operations

Managing folders is just as easy with the `Directory` and `DirectoryInfo` classes.

```csharp
string dirPath = "MyLogs";

// Create a directory if it doesn't exist
if (!Directory.Exists(dirPath))
{
    Directory.CreateDirectory(dirPath);
}

// Listing files in a directory
string[] files = Directory.GetFiles(dirPath, "*.log");

foreach (var file in files)
{
    Console.WriteLine($"Found log: {Path.GetFileName(file)}");
}
```

---

### 6. Understanding FileMode: How to Open a File

When opening a file manually with `FileStream` or `FileStreamOptions`, you need to tell .NET **how** you want to interact with the file. This is done using the `FileMode` enum.

| FileMode | If file exists | If file does not exist |
| :--- | :--- | :--- |
| **`Create`** | Overwrites the file. | Creates a new file. |
| **`CreateNew`** | Throws `IOException`. | Creates a new file. |
| **`Open`** | Opens the existing file. | Throws `FileNotFoundException`. |
| **`OpenOrCreate`** | Opens the existing file. | Creates a new file. |
| **`Append`** | Opens and moves to the end. | Creates a new file. |
| **`Truncate`** | Opens and deletes all content. | Throws `FileNotFoundException`. |

**Recommendation:** Use `Append` when you are just adding logs to a file, and `Create` if you want to completely replace it.

---

### 7. Working with Streams: The Performance Heavyweight (Advanced)

Streams are used when you need to process data as a sequence of bytes. This is essential for network communication, file compression, or handling very large datasets.

#### Using `FileStream` for Byte-Level Access
Always use the `await using` syntax to ensure resources are disposed of correctly and asynchronously.

```csharp
string source = "source.bin";
string destination = "copy.bin";

await using FileStream sourceStream = File.OpenRead(source);
await using FileStream destStream = File.Create(destination);

// High-performance copy
await sourceStream.CopyToAsync(destStream);
```

#### Handling Binary Data
For non-text files (like images or custom binary formats), use `BinaryReader` and `BinaryWriter`.

```csharp
// Writing binary data
await using (FileStream fs = File.Create("data.dat"))
using (BinaryWriter writer = new BinaryWriter(fs))
{
    writer.Write(1.25m); // Decimal
    writer.Write("String data");
    writer.Write(true);
}

// Reading binary data
await using (FileStream fs = File.OpenRead("data.dat"))
using (BinaryReader reader = new BinaryReader(fs))
{
    decimal price = reader.ReadDecimal();
    string name = reader.ReadString();
    bool active = reader.ReadBoolean();
}
```

---

### 8. FileStream vs. StreamWriter: Which one to use?

A common question for .NET developers is: **"When should I use FileStream and when should I use StreamWriter?"**

The answer depends on **what you are writing**:

| Feature | `FileStream` | `StreamWriter` |
| :--- | :--- | :--- |
| **Data Type** | `byte[]` (Raw Bytes) | `string` / `char` (Text) |
| **Usage** | Any file type (Images, PDFs, Binary) | Only Text files (.txt, .log, .csv) |
| **Encoding** | None (Raw) | Handles Encoding (UTF-8, ASCII, etc.) |
| **Performance** | Lower-level, high-performance | Higher-level, easy to use |

#### The Relationship
Actually, `StreamWriter` is often just a **wrapper** around a `FileStream`. It takes your strings, converts them into bytes using an encoding (like UTF-8), and then uses a `FileStream` to write those bytes to the disk.

**Use `FileStream` when:**
- You are copying files.
- You are working with non-text files (images, zip, binary).
- You need precise control over file sharing and locks.

**Use `StreamWriter` when:**
- You are writing text, logs, or reports.
- You want the convenience of `WriteLineAsync` without manually converting strings to bytes.

---

### 9. Serialization: JSON I/O

In modern apps, I/O often involves reading/writing JSON. `System.Text.Json` is built for speed in .NET.

```csharp
using System.Text.Json;

var user = new { Name = "Thomas", Role = "Developer" };
string jsonPath = "user.json";

// Serialize to file
await using FileStream createStream = File.Create(jsonPath);
await JsonSerializer.SerializeAsync(createStream, user);

// Deserialize from file
await using FileStream openStream = File.OpenRead(jsonPath);
var loadedUser = await JsonSerializer.DeserializeAsync<dynamic>(openStream);
```

---

### 10. High-Performance I/O with `FileStreamOptions`

In .NET 10, you can fine-tune how files are opened for maximum performance using `FileStreamOptions`.

```csharp
var options = new FileStreamOptions
{
    Mode = FileMode.Open,
    Access = FileAccess.Read,
    Options = FileOptions.Asynchronous | FileOptions.SequentialScan,
    BufferSize = 4096,
    PreallocationSize = 1024 * 1024 // 1MB pre-allocation for writes
};

await using FileStream fs = new FileStream("huge_file.dat", options);
```

---

### 11. Best Practices for I/O in .NET 10

1.  **Always use Async:** I/O is slow compared to CPU operations. Using `Async` methods (like `WriteAllTextAsync`) keeps your UI responsive and your web servers scalable.
2.  **Use `using` or `await using`:** Ensure that file handles are released as soon as you are done.
3.  **Check for existence:** Always check if a file/directory exists before reading to avoid `FileNotFoundException`.
4.  **Handle Exceptions:** Wrap I/O operations in `try-catch` blocks to handle issues like permission errors or full disks.

```csharp
try 
{
    await File.WriteAllTextAsync("protected.txt", "Data");
}
catch (UnauthorizedAccessException ex)
{
    Console.WriteLine("Access Denied: " + ex.Message);
}
catch (IOException ex)
{
    Console.WriteLine("Disk Error: " + ex.Message);
}
```

---

### Further Reading & References

- [File and Stream I/O (Microsoft Learn)](https://learn.microsoft.com/en-us/dotnet/standard/io/)
- [System.IO Namespace Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.io)
- [Working with Large Files in .NET](https://learn.microsoft.com/en-us/dotnet/standard/io/how-to-read-text-from-a-file)
- [System.Text.Json Overview](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview)
