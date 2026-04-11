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
|   Professor    |----->|   ASP.NET MVC    |----->|   Azure AI Document       |
|   (Browser)    | (1)  |   Web Portal     | (3)  |   Intelligence (OCR)      |
|                |      |                  |      |                           |
+-------^--------+      +--------+---------+      +-------------+-------------+
        |                        |                              |
        | (6)                    | (2)                          | (4)
        |                        v                              |
+-------+--------+      +------------------+                    |
|                |      |                  |                    |
|   Review       |<-----|   SQL Server     |<-------------------+
|   Dashboard    | (5)  |   Database       |
|                |      |                  |
+----------------+      +------------------+
```

**Workflow:**
1. **Upload:** Professor uploads exam images or PDFs.
2. **Storage:** Web portal saves files and creates 'Pending' records in SQL Server.
3. **Analysis:** A background worker sends documents to Azure AI.
4. **Extraction:** Azure returns recognized handwriting; results are stored in the DB.
5. **Review:** Professor reviews and confirms AI-generated grades.
6. **Finalize:** Grades are exported to the school's LMS.

---

## 3. Implementation Plan

Following this structured plan will help you build the system incrementally:

### Phase 1: Setup & Database
- Initialize .NET 10 MVC project.
- Design schema for `Exams`, `Questions`, `Submissions`, and `Results`.

### Phase 2: File Processing
- Implement secure upload portal.
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
- **AI Service:** **Azure AI Document Intelligence** (formerly Form Recognizer). This is the "brain" of our system, capable of high-accuracy handwriting recognition.
- **Background Processing:** .NET Worker Services.

### Required NuGet Packages
Install these via CLI or NuGet Manager:
- `Azure.AI.DocumentIntelligence`
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

## 6. Handling File Uploads in MVC

In your `ExamController`, you'll need an action to handle the PDF/Image upload. Use `IFormFile` to receive the file and save it securely.

```csharp
[HttpPost]
public async Task<IActionResult> Upload(IFormFile examFile)
{
    if (examFile != null && examFile.Length > 0)
    {
        var filePath = Path.Combine(_storagePath, examFile.FileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await examFile.CopyToAsync(stream);
        }
        
        // Create a record in the database
        var submission = new Submission { FilePath = filePath, Status = SubmissionStatus.Pending };
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

## 8. Integrating Azure AI Document Intelligence

This is where the magic happens. We'll use the Azure SDK to send the uploaded file to the cloud for analysis.

```csharp
var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(key));

// Start the analysis
var operation = await client.AnalyzeDocumentAsync(
    WaitUntil.Completed, 
    "prebuilt-read", 
    new AnalyzeDocumentContent(File.OpenRead(filePath)));

// Extract text
foreach (var page in operation.Value.Pages)
{
    foreach (var line in page.Lines)
    {
        Console.WriteLine($"Recognized: {line.Content}");
    }
}
```

*Tip: For exams with a fixed layout, you can train a **Custom Model** in Azure to extract data from specific boxes (e.g., Name, Student ID, Question 1).*

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
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GradingSys;Trusted_Connection=True;"
  }
}
```

---

## 12. Summary & Next Steps

Building an AI grading system in .NET 10 is more accessible than ever. By combining **ASP.NET Core MVC** for the interface and **Azure AI** for the heavy lifting, you can create a tool that saves educators hundreds of hours.

**Next Steps:**
1. Set up an Azure free account and explore Document Intelligence Studio.
2. Implement a background worker to process submissions so users don't have to wait for the OCR to finish.
3. Add export functionality to send grades directly to your school's LMS.

---

## 13. References
*   [Azure AI Document Intelligence Documentation](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
*   [ASP.NET Core MVC Documentation](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
