---
layout: single
title: "Building an AI-Powered Grading System with .NET 10 MVC and Azure AI"
date: 2026-4-11
show_date: true
toc: true
toc_label: "AI Grading System"
classes: wide
tags:
  - .NET
  - C#
  - AI
  - MVC
  - .NET 10
  - Azure
---

In the modern classroom, grading hundreds of handwritten exams can be a monumental task for professors. With the release of **.NET 10**, we now have even better tools to build robust, scalable, and intelligent applications. In this post, we'll walk through how to build an automated grading system that uses AI to recognize handwriting and grade exams.

---

## 1. The Vision

The idea is simple: a professor uploads a PDF or image of a student's exam. The system uses Optical Character Recognition (OCR) and Handwriting Recognition to extract the text, compares it against a master answer key, and assigns a grade.

### Key Features:
- **Handwriting Recognition:** Capture student answers from scanned papers.
- **Automated Grading:** Compare recognized text with the correct answers.
- **Professor Dashboard:** Review and override AI-generated grades.
- **Scalable Processing:** Use background services for heavy AI tasks.

---

## 2. System Architecture

To understand how the data flows through our system, here is a high-level component diagram:

```text
+----------------+      +------------------+      +---------------------------+
|                |      |                  |      |                           |
|   Professor    |----->|   ASP.NET MVC    |      |   Azure AI Document       |
|   (Browser)    | (1)  |   Web Portal     |      |   Intelligence (OCR)      |
|                |      |                  |      |                           |
+-------^--------+      +----+-------+-----+      +-------------+-------------+
        |                    |       |                          ^     |
        | (7)                | (2)   | (3)                      | (5) | (6)
        |                    v       v                          |     |
+-------+--------+      +-------+  +-------+                    |     |
|                |      |  SQL  |  | Azure |                    |     |
|   Review       |<-----|  DB   |  | Blob  |--------------------+     |
|   Dashboard    |      |   ^   |  |       |                          |
|                |      +---|---+  +-------+                          |
+----------------+          +-----------------------------------------+
```

**Workflow:**
1. **Upload:** Professor uploads exam images or PDFs.
2. **Database:** Web portal creates 'Pending' records in SQL Server.
3. **Storage:** Files are uploaded to **Azure Blob Storage** for secure persistence.
4. **Trigger:** A background worker identifies pending submissions.
5. **Analysis:** The worker retrieves the file from Blob Storage and sends it to **Azure AI Document Intelligence**.
6. **Extraction:** Azure returns recognized results, which are stored in the SQL Database.
7. **Review:** Professor reviews results on the dashboard and confirms grades.

---

## 3. Implementation Plan

Following this structured plan will help you build the system incrementally:

### Phase 1: Setup & Database
- Initialize .NET 10 MVC project.
- Design schema for `Exams`, `Questions`, `Submissions`, and `Results`.

### Phase 2: File Storage & Processing
- Implement secure upload portal to **Azure Blob Storage**.
- Use **SkiaSharp** to normalize/resize images before OCR if needed.

### Phase 3: AI Integration
- Connect to **Azure AI Document Intelligence**.
- Use the "prebuilt-read" model or train a **Custom Model** for fixed layouts.

### Phase 4: Grading Logic
- Implement exact match for MCQs.
- Use **Levenshtein Distance** for fuzzy matching on short answers.

### Phase 5: Dashboard
- Build side-by-side view (Image vs. Text).
- Allow manual overrides and CSV export.

---

## 4. The Technical Stack

To build this, we'll use a modern Microsoft-centric stack:
- **Framework:** ASP.NET Core 10 MVC.
- **Database:** SQL Server with EF Core.
- **File Storage:** **Azure Blob Storage** for scalable and secure cloud storage of exam files.
- **AI Service:** **Azure AI Document Intelligence** (formerly Form Recognizer). This is the "brain" of our system, capable of high-accuracy handwriting recognition.
- **Background Processing:** .NET Worker Services.

### Required NuGet Packages
Install these via CLI or NuGet Manager:
- `Azure.AI.DocumentIntelligence`
- `Azure.Storage.Blobs`
- `Microsoft.EntityFrameworkCore.SqlServer`
- `Microsoft.Extensions.Configuration.UserSecrets`
- `SkiaSharp` (for image pre-processing)

---

## 5. Designing the Database

A solid system starts with a good schema. We need to track exams, questions, submissions, and results.

```csharp
public enum SubmissionStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}

public class Exam
{
    public int Id { get; set; }
    public string Title { get; set; }
    public List<Question> Questions { get; set; }
}

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; }
    public string CorrectAnswer { get; set; }
    public int Points { get; set; }
}

public class Submission
{
    public int Id { get; set; }
    public string StudentName { get; set; }
    public string FilePath { get; set; }
    public SubmissionStatus Status { get; set; }
    public List<Result> Results { get; set; }
}

public class Result
{
    public int Id { get; set; }
    public int SubmissionId { get; set; }
    public int QuestionId { get; set; }
    public string RecognizedAnswer { get; set; }
    public double Score { get; set; }
    public string Feedback { get; set; }
}
```

---

## 6. Handling File Uploads to Azure Blob Storage

Instead of saving files to the local web server, we'll use **Azure Blob Storage**. This allows our background workers to access the files easily from any instance.

```csharp
using Azure.Storage.Blobs;

[HttpPost]
public async Task<IActionResult> Upload(IFormFile examFile)
{
    if (examFile != null && examFile.Length > 0)
    {
        // 1. Initialize Blob Client
        var containerClient = new BlobContainerClient(_connectionString, "exams");
        await containerClient.CreateIfNotExistsAsync();
        
        var blobClient = containerClient.GetBlobClient(Guid.NewGuid() + Path.GetExtension(examFile.FileName));
        
        // 2. Upload to Azure Blob Storage
        using (var stream = examFile.OpenReadStream())
        {
            await blobClient.UploadAsync(stream, true);
        }
        
        // 3. Create a record in the database
        var submission = new Submission 
        { 
            FilePath = blobClient.Uri.ToString(), 
            Status = SubmissionStatus.Pending 
        };
        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();
        
        return RedirectToAction("Dashboard");
    }
    return View();
}
```

---

## 7. Background Processing with Worker Services

Since OCR analysis can take several seconds per page, we shouldn't process it in the web request. Instead, use a .NET **Worker Service**.

```csharp
public class GradingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    public GradingWorker(IServiceProvider serviceProvider) => _serviceProvider = serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var pending = await context.Submissions
                                           .Where(s => s.Status == SubmissionStatus.Pending)
                                           .FirstOrDefaultAsync();

                if (pending != null)
                {
                    pending.Status = SubmissionStatus.Processing;
                    await context.SaveChangesAsync();
                    
                    await ProcessSubmission(pending, scope.ServiceProvider);
                }
            }
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
```

In your `Program.cs`, register it: `builder.Services.AddHostedService<GradingWorker>();`.

---

## 8. Deep Dive: Azure AI Document Intelligence

For a beginner, **Azure AI Document Intelligence** (formerly known as Form Recognizer) is a cloud-based service that uses AI to extract text, key-value pairs, and structured data from your documents. In our grading system, we'll use it to convert handwritten student answers into digital text.

### Key Concepts & Models

Before we dive into the code, you should understand the "Models" provided by Azure:
1.  **Prebuilt-Read:** This is a general-purpose model for OCR. It's fantastic at extracting all text and numbers, including complex handwriting, regardless of the document's layout.
2.  **Prebuilt-Layout:** This model goes a step further by identifying structures like tables, selection marks (checkboxes), and document layout (headers, footers).
3.  **Custom Neural Models:** For exams with a fixed layout (like a standardized test), you can "train" a model with a few sample papers. This allows you to say: "Always look in this specific box for the student's name" or "This box is for Question 1's answer."

### Setting Up Your Azure Resource

1.  Log into the [Azure Portal](https://portal.azure.com/).
2.  Create a new **Document Intelligence** resource.
3.  Once created, navigate to **Keys and Endpoint** to grab your:
    *   **Endpoint:** (e.g., `https://my-resource.cognitiveservices.azure.com/`)
    *   **Key:** (A string like `5f6e7...`)

### Integrating with .NET 10

With the `Azure.AI.DocumentIntelligence` SDK, sending a file for analysis is a few lines of code. Here is a more detailed implementation:

```csharp
using Azure;
using Azure.AI.DocumentIntelligence;
using Azure.Storage.Blobs;
using System.Text;

public async Task<string> RecognizeHandwritingAsync(string blobUri)
{
    // 1. Initialize the client
    var endpoint = _config["AzureAI:Endpoint"];
    var key = _config["AzureAI:Key"];
    var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(key));

    // 2. Use the Blob URI to stream content for analysis
    var blobClient = new BlobClient(new Uri(blobUri));
    using var stream = await blobClient.OpenReadAsync();
    var content = new AnalyzeDocumentContent(BinaryData.FromStream(stream));

    // 3. Start the analysis (using "prebuilt-read" for general handwriting)
    var operation = await client.AnalyzeDocumentAsync(
        WaitUntil.Completed, 
        "prebuilt-read", 
        content);

    // 4. Process the results
    var result = operation.Value;
    var fullText = new StringBuilder();

    foreach (var page in result.Pages)
    {
        foreach (var line in page.Lines)
        {
            fullText.AppendLine(line.Content);
        }
    }

    return fullText.ToString();
}
```

*Tip: Use the **[Azure AI Document Intelligence Studio](https://documentintelligence.ai.azure.com/studio)** to test your files without writing any code. It's a great way to see what the AI "sees" before you start building.*

---

## 9. The Grading Engine

Once you have the recognized text, you need to compare it to the `CorrectAnswer`.

### Fuzzy Matching Logic (Levenshtein Distance)
For short answers, minor spelling mistakes shouldn't fail a student. Here is a simple implementation:

```csharp
public static int ComputeDistance(string s, string t)
{
    int n = s.Length, m = t.Length;
    int[,] d = new int[n + 1, m + 1];

    if (n == 0) return m;
    if (m == 0) return n;

    for (int i = 0; i <= n; d[i, 0] = i++) ;
    for (int j = 0; j <= m; d[0, j] = j++) ;

    for (int i = 1; i <= n; i++)
    {
        for (int j = 1; j <= m; j++)
        {
            int cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
            d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
        }
    }
    return d[n, m];
}
```

You can then calculate a similarity percentage: `1 - ((double)distance / Math.Max(s.Length, t.Length))`.

- **Exact Match:** Good for multiple-choice.
- **LLM Grading:** For complex essay questions, you can pass the recognized text to **Azure OpenAI (GPT-4o)** to grade based on context and criteria.

---

## 10. Building the Review Dashboard

AI isn't perfect. Always include a "Human-in-the-loop" step.
Create a view that shows the scanned image side-by-side with the AI's interpretation.

```csharp
public async Task<IActionResult> Review(int id)
{
    var submission = await _context.Submissions
                                   .Include(s => s.Results)
                                   .FirstOrDefaultAsync(s => s.Id == id);
    return View(submission);
}
```

In your Razor View, you can use Bootstrap columns to display the scanned image on the left and an editable list of recognized answers on the right.

---

## 11. Configuration & Security

Never hardcode your API keys. Use **User Secrets** for development and **Environment Variables** or **Azure Key Vault** for production.

**appsettings.json Template:**
```json
{
  "AzureAI": {
    "Endpoint": "https://your-resource.cognitiveservices.azure.com/",
    "Key": "YOUR_SECRET_KEY"
  },
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=yourname;AccountKey=yourkey;EndpointSuffix=core.windows.net"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GradingSys;Trusted_Connection=True;"
  }
}
```

---

## 12. Summary & Next Steps

Building an AI grading system in .NET 10 is more accessible than ever. By combining **ASP.NET Core MVC** for the interface and **Azure AI** for the heavy lifting, you can create a tool that saves educators hundreds of hours.

**Next Steps:**
1. Set up an Azure free account and configure **Document Intelligence** and **Blob Storage**.
2. Implement a background worker to process submissions asynchronously.
3. Add export functionality to send grades directly to your school's LMS.

---

## 13. References & Further Reading

*   [Microsoft Docs: Azure AI Document Intelligence](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
*   [Azure AI Document Intelligence Studio (No-Code Testing Tool)](https://documentintelligence.ai.azure.com/studio)
*   [ASP.NET Core MVC Documentation](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
