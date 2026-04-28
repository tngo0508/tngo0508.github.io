---
layout: single
title: "Setting Up Background Service in .NET 10 with FileSystemWatcher and Channels"
date: 2026-3-7
show_date: true
classes: wide
tags:
  - .NET 10
  - BackgroundService
  - FileSystemWatcher
  - Channels
  - C#
---

In modern .NET 10 applications, efficiently handling background tasks is crucial for maintaining responsiveness. This post explores a robust pattern using `FileSystemWatcher` to detect file changes and offload processing to a `QueuedHostedService` using `System.Threading.Channels`.

## The Components

1.  **`IBackgroundTaskQueue` (The Queue)**: A wrapper around `Channel<Func<CancellationToken, ValueTask>>`. It acts as the "broker" between the producer and the consumer, holding tasks in memory using a high-performance, thread-safe data structure.
2.  **`QueuedHostedService` (The Consumer)**: A long-running service that inherits from `BackgroundService`. It continuously "listens" to the queue, pulls out tasks, and executes them one by one.
3.  **`FileWatcherService` (The Producer)**: A service that monitors the file system. Instead of processing files directly (which could be slow and block new events), it creates a task and "produces" it into the queue.

## How It Works: The Producer-Consumer Pattern

The core idea behind this architecture is the **Producer-Consumer pattern**. This pattern decouples the *detection* of an event from the *processing* of that event.

### Why use this pattern?

-   **Responsiveness**: The `FileSystemWatcher` generates events on a separate thread. If you process a large file directly inside the `OnCreated` event handler, you might miss subsequent events because the handler is busy. By enqueuing the work, the producer finishes its job instantly.
-   **Resource Management**: Using a `BoundedChannel` (as shown in the code) allows you to limit the number of tasks in the queue. This prevents your application from consuming too much memory if thousands of files are suddenly created.
-   **Error Isolation**: If a background task fails, it doesn't crash the service that detected the change. The `QueuedHostedService` can catch exceptions, log them, and move on to the next task.
-   **Order Control**: While `FileSystemWatcher` can fire multiple events simultaneously, our consumer processes them sequentially (one after another). This is often desired when dealing with file operations to avoid race conditions.

---

## 1. Implementing the Background Task Queue

Using `System.Threading.Channels` provides a high-performance, thread-safe way to pass tasks between services.

```csharp
using System.Threading.Channels;

public interface IBackgroundTaskQueue
{
    ValueTask QueueBackgroundWorkItemAsync(Func<CancellationToken, ValueTask> workItem);
    ValueTask<Func<CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken);
}

public class DefaultBackgroundTaskQueue : IBackgroundTaskQueue
{
    private readonly Channel<Func<CancellationToken, ValueTask>> _queue;

    public DefaultBackgroundTaskQueue(int capacity)
    {
        // Bounded channel to prevent memory issues if tasks are enqueued faster than processed
        var options = new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<Func<CancellationToken, ValueTask>>(options);
    }

    public async ValueTask QueueBackgroundWorkItemAsync(Func<CancellationToken, ValueTask> workItem)
    {
        ArgumentNullException.ThrowIfNull(workItem);
        await _queue.Writer.WriteAsync(workItem);
    }

    public async ValueTask<Func<CancellationToken, ValueTask>> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
```

## 2. Implementing the Queued Hosted Service

This service inherits from `BackgroundService` and processes the enqueued work items sequentially.

```csharp
public class QueuedHostedService : BackgroundService
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly ILogger<QueuedHostedService> _logger;

    public QueuedHostedService(IBackgroundTaskQueue taskQueue, ILogger<QueuedHostedService> logger)
    {
        _taskQueue = taskQueue;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Queued Hosted Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = await _taskQueue.DequeueAsync(stoppingToken);

            try
            {
                _logger.LogInformation("Executing background task.");
                await workItem(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Prevent throwing when stoppingToken is canceled
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing background task.");
            }
        }

        _logger.LogInformation("Queued Hosted Service is stopping.");
    }
}
```

## 3. The FileWatcherService

This service uses `FileSystemWatcher` to monitor a folder. When a file is created, it enqueues a processing task.

```csharp
public class FileWatcherService : IHostedService, IDisposable
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly ILogger<FileWatcherService> _logger;
    private FileSystemWatcher? _watcher;

    public FileWatcherService(IBackgroundTaskQueue taskQueue, ILogger<FileWatcherService> logger)
    {
        _taskQueue = taskQueue;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("FileWatcher Service is starting.");

        _watcher = new FileSystemWatcher(@"C:\Temp\WatchFolder")
        {
            Filter = "*.txt",
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite
        };

        _watcher.Created += OnCreated;
        _watcher.EnableRaisingEvents = true;

        return Task.CompletedTask;
    }

    private void OnCreated(object sender, FileSystemEventArgs e)
    {
        _logger.LogInformation("File created: {FileName}. Enqueuing task.", e.FullPath);

        // Enqueue the work to be processed in the background
        _ = _taskQueue.QueueBackgroundWorkItemAsync(async (token) =>
        {
            _logger.LogInformation("Processing file: {FileName}...", e.FullPath);
            
            // Simulate processing time
            await Task.Delay(2000, token);
            
            _logger.LogInformation("Finished processing: {FileName}", e.FullPath);
        });
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("FileWatcher Service is stopping.");
        _watcher?.Dispose();
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _watcher?.Dispose();
    }
}
```

## 4. Wiring Everything Up in .NET 10

In your `Program.cs`, register the services and the background queue.

```csharp
var builder = Host.CreateApplicationBuilder(args);

// Register the background task queue with a capacity of 100 items
builder.Services.AddSingleton<IBackgroundTaskQueue>(new DefaultBackgroundTaskQueue(100));

// Register the consumer service
builder.Services.AddHostedService<QueuedHostedService>();

// Register the producer service (File Watcher)
builder.Services.AddHostedService<FileWatcherService>();

var host = builder.Build();
host.Run();
```

## 5. Publishing and Deploying as a Windows Service

To run this background service as a native Windows Service, follow these steps.

### Step 1: Add the Windows Services Package

First, add the `Microsoft.Extensions.Hosting.WindowsServices` NuGet package to your project:

```bash
dotnet add package Microsoft.Extensions.Hosting.WindowsServices
```

### Step 2: Configure the Host

Update your `Program.cs` to enable Windows Service support. This allows the application to respond to the Service Control Manager (SCM).

```csharp
var builder = Host.CreateApplicationBuilder(args);

// Enable Windows Service support
builder.Services.AddWindowsService(options =>
{
    options.ServiceName = "FileWatcherService";
});

// ... your service registrations ...
```

### Step 3: Publish for Windows

Publish the application as a standalone executable. Using the `-r win-x64` rid ensures it's targeting Windows 64-bit.

```bash
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish
```

### Step 4: Install the Service

Open **PowerShell (Run as Administrator)** and use `sc.exe` to create the service. 

```powershell
# Create the service (replace the path with your actual publish path)
# Note the space after "binpath=" is required!
sc.exe create "FileWatcherService" binpath= "C:\path\to\your\app\publish\MyApplication.exe"

# Start the service
sc.exe start "FileWatcherService"
```

### Step 5: Management

To stop or delete the service:

```powershell
# Stop the service
sc.exe stop "FileWatcherService"

# Remove the service
sc.exe delete "FileWatcherService"
```

## Conclusion

By combining `FileSystemWatcher` with a `Channel`-based queue and a `BackgroundService`, you've built a decoupled, high-performance system. The `FileWatcherService` produces tasks without being blocked by processing time, while the `QueuedHostedService` ensures tasks are handled efficiently in the background.

This pattern is highly extensible—you can swap `FileSystemWatcher` for an API endpoint or a message broker listener while keeping your background processing logic intact.

## Further Reading

- [Background tasks with hosted services in .NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Queued background tasks in .NET Core](https://learn.microsoft.com/en-us/dotnet/core/extensions/queued-background-service)
- [FileSystemWatcher Class (System.IO)](https://learn.microsoft.com/en-us/dotnet/api/system.io.filesystemwatcher)
- [An Introduction to System.Threading.Channels](https://devblogs.microsoft.com/dotnet/an-introduction-to-system-threading-channels/)
- [Host.CreateApplicationBuilder Method](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.host.createapplicationbuilder)
- [Run .NET services as Windows Services](https://learn.microsoft.com/en-us/dotnet/core/extensions/windows-service)
