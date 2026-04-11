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

### Phase 1: Setup & Database Design
- **Project Scaffolding:** Create a new ASP.NET Core MVC project targeting **.NET 10**.
- **Dependency Management:** Install NuGet packages for `Azure.AI.DocumentIntelligence`, `Azure.Storage.Blobs`, and `Microsoft.EntityFrameworkCore.SqlServer`.
- **Identity Setup:** Configure ASP.NET Core Identity to manage Professor accounts and secure the dashboard.
- **Schema Implementation:** Use EF Core Migrations to create the `Courses`, `Students`, `Exams`, `Questions`, `Submissions`, and `Results` tables.
- **Environment Config:** Securely store Azure credentials and connection strings using **User Secrets** (development) and **Azure Key Vault** (production).

### Phase 2: File Storage & Pre-processing
- **Azure Blob Storage:** Create a container named `exam-uploads` with private access levels.
- **Upload Pipeline:** Build a multi-part form upload that streams files directly to Blob Storage to minimize memory usage.
- **Image Normalization:** Use **SkiaSharp** to convert uploaded images to grayscale and resize them if they exceed 4K resolution (to optimize OCR performance).
- **Metadata Persistence:** Save the Blob URI and initial `Pending` status to the SQL database.

### Phase 3: AI Integration (OCR & Handwriting)
- **Service Layer:** Build a `HandwritingService` that wraps the `DocumentIntelligenceClient`.
- **Background Worker:** Implement a `BackgroundService` that polls the database for `Pending` submissions and marks them as `Processing`.
- **OCR Execution:** Send documents to the `prebuilt-read` model and handle the asynchronous polling for analysis results.
- **Error Handling:** Implement retry logic for transient Azure service failures and mark submissions as `Failed` if processing persists in error.

### Phase 4: Grading Logic Engine
- **Master Key Retrieval:** Fetch the correct answers from the `Questions` table associated with the exam.
- **Text Normalization:** Create a pipeline to strip punctuation, handle casing, and remove common OCR artifacts (e.g., misreading '0' as 'O').
- **Similarity Scoring:** Implement the **Levenshtein Distance** algorithm for short answers to calculate a similarity percentage.
- **Multiple Choice Logic:** Integrate detection of **Selection Marks** from the Azure AI output to grade MCQs automatically.
- **Score Assignment:** Automatically assign points based on match type and flag ambiguous results for manual review.

### Phase 5: Dashboard & Human-in-the-loop
- **Submission List:** Build a dashboard showing all students, their current status, and calculated scores.
- **Review Workspace:** Implement a side-by-side UI component showing the original image (retrieved from Blob Storage) next to the AI-extracted text.
- **Manual Adjustments:** Allow the professor to click "Accept AI Grade" or type in a manual override.
- **Finalization:** Once reviewed, mark the submission as `Completed` and generate a final grade report in CSV format.

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

A solid system starts with a good schema. We need to track exams, questions, submissions, and results. Below is the ER Diagram and the C# classes for our Entity Framework Core models.

### ER Diagram (ASCII)

```text
+--------------+    1      *    +--------------+    1      *    +--------------+
|    Course    |----------------|     Exam     |----------------|   Question   |
+--------------+                +--------------+                +--------------+
| PK: Id       |                | PK: Id       |                | PK: Id       |
|    Name      |                | FK: CourseId |                | FK: ExamId   |
|    Code      |                |     Title    |                |    Text      |
+--------------+                +--------------+                |    Type      |
                                       |                        +--------------+
                                       | 1                             |
                                       |                               |
+--------------+    1      *    +------v-------+                       |
|    Student   |----------------|  Submission  |                       |
+--------------+                +--------------+                       | *
| PK: Id       |                | PK: Id       |        *       +--------------+
|    Name      |                | FK: ExamId   |----------------|    Result    |
|    Email     |                | FK: StudentId|       1        +--------------+
+--------------+                |    FilePath  |                | PK: Id       |
                                |    Status    |                | FK: SubId    |
                                +--------------+                | FK: QuestId  |
                                                                | Score        |
                                                                +--------------+
```

### Entity Framework Models

```csharp
public enum SubmissionStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}

public enum QuestionType
{
    ShortAnswer,
    MultipleChoice
}

public class Course
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }
    public List<Exam> Exams { get; set; }
}

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public List<Submission> Submissions { get; set; }
}

public class Exam
{
    public int Id { get; set; }
    public int CourseId { get; set; } // Foreign Key to Course
    public string Title { get; set; }
    public List<Question> Questions { get; set; }
    public List<Submission> Submissions { get; set; }
}

public class Question
{
    public int Id { get; set; }
    public int ExamId { get; set; } // Foreign Key to Exam
    public string Text { get; set; }
    public string CorrectAnswer { get; set; }
    public QuestionType Type { get; set; } // ShortAnswer or MultipleChoice
    public int Points { get; set; }
}

public class Submission
{
    public int Id { get; set; }
    public int ExamId { get; set; } // Foreign Key to Exam
    public int StudentId { get; set; } // Foreign Key to Student
    public string FilePath { get; set; }
    public SubmissionStatus Status { get; set; }
    public List<Result> Results { get; set; }
}

public class Result
{
    public int Id { get; set; }
    public int SubmissionId { get; set; } // Foreign Key to Submission
    public int QuestionId { get; set; }   // Foreign Key to Question
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
public async Task<IActionResult> Upload(IFormFile examFile, int examId, int studentId)
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
            ExamId = examId,
            StudentId = studentId,
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

Since OCR analysis can take several seconds per page, we shouldn't process it in the web request. Instead, use a .NET **Worker Service**. This keeps your web application responsive for the professor while the "heavy lifting" happens in the background.

### Implementing the GradingWorker

Here is a more complete implementation that handles the database scope and calls the grading service:

```csharp
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

public class GradingWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<GradingWorker> _logger;

    public GradingWorker(IServiceProvider serviceProvider, ILogger<GradingWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Grading Worker started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var gradingService = scope.ServiceProvider.GetRequiredService<IGradingService>();

                // 1. Find the next pending submission
                var pending = await context.Submissions
                                           .Where(s => s.Status == SubmissionStatus.Pending)
                                           .FirstOrDefaultAsync(stoppingToken);

                if (pending != null)
                {
                    try 
                    {
                        // 2. Mark as processing to prevent other workers from picking it up
                        pending.Status = SubmissionStatus.Processing;
                        await context.SaveChangesAsync(stoppingToken);
                        
                        _logger.LogInformation($"Processing Submission ID: {pending.Id}");

                        // 3. Hand off to the grading engine (defined in Section 9)
                        await gradingService.GradeSubmissionAsync(pending.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error processing submission {pending.Id}");
                        pending.Status = SubmissionStatus.Failed;
                        await context.SaveChangesAsync(stoppingToken);
                    }
                }
            }
            // 4. Wait for 5 seconds before checking for more work
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }
}
```

### Registering the Service

In your `Program.cs`, you must register both your `IGradingService` and the `HostedService`:

```csharp
builder.Services.AddScoped<IGradingService, GradingService>();
builder.Services.AddHostedService<GradingWorker>();
```

---

## 8. Deep Dive: Azure AI Document Intelligence

For a beginner, **Azure AI Document Intelligence** (formerly known as Form Recognizer) is a cloud-based service that uses AI to extract text, key-value pairs, and structured data from your documents.

### 8.1 Key Concepts & Models

Before we dive into the code, you should understand the "Models" provided by Azure:
1.  **Prebuilt-Read:** This is a general-purpose model for OCR. It's fantastic at extracting all text and numbers, including complex handwriting, regardless of the document's layout.
2.  **Prebuilt-Layout:** This model goes a step further by identifying structures like tables, **selection marks** (checkboxes, radio buttons), and document layout (headers, footers). This is the key model for handling multiple-choice questions automatically.
3.  **Custom Neural Models:** For exams with a fixed layout (like a standardized test), you can "train" a model with a few sample papers.

### 8.2 Creating a Free Azure Account

If you don't have an Azure account, you can start for free:
1.  Go to the [Azure Free Account Page](https://azure.microsoft.com/free/).
2.  Sign up using a Microsoft account. You'll get **$200 credit** for the first 30 days and many services (including AI) have a "Free Tier" that persists beyond that.

### 8.3 Setting Up Your AI Resource

Once you have your account:
1.  Search for **Document Intelligence** in the portal search bar.
2.  Click **Create**.
3.  **Pricing Tier:** Select `F0` (Free) if it's your first time, or `S0` (Standard) for production.
4.  Once created, navigate to **Keys and Endpoint** to grab your:
    *   **Endpoint:** (e.g., `https://my-resource.cognitiveservices.azure.com/`)
    *   **Key:** (A string like `5f6e7...`)

### 8.4 Setting Up Azure Blob Storage

You'll need a place to store the uploaded exam images:
1.  Search for **Storage Accounts** in the portal.
2.  Click **Create**. Give it a unique name (e.g., `examstorage2026`).
3.  Once the account is ready, go to the **Containers** menu on the left.
4.  Create a new container named `exams`.
5.  Set the **Public access level** to `Private` (no anonymous access). Your .NET code will use a secure connection string to access these files.
6.  Go to **Access keys** on the left to copy your **Connection String**.

### 8.5 Integrating with .NET 10

With the `Azure.AI.DocumentIntelligence` SDK, sending a file for analysis is a few lines of code. Here is a more detailed implementation:

```csharp
using Azure;
using Azure.AI.DocumentIntelligence;
using Azure.Storage.Blobs;
using System.Text;

public async Task<AnalyzeResult> AnalyzeDocumentAsync(string blobUri)
{
    // 1. Initialize the client
    var endpoint = _config["AzureAI:Endpoint"];
    var key = _config["AzureAI:Key"];
    var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(key));

    // 2. Use the Blob URI to stream content for analysis
    var blobClient = new BlobClient(new Uri(blobUri));
    using var stream = await blobClient.OpenReadAsync();
    var content = new AnalyzeDocumentContent(BinaryData.FromStream(stream));

    // 3. Start the analysis
    // Use "prebuilt-read" for raw text/handwriting
    // Use "prebuilt-layout" if you need to detect selection marks (MCQs)
    var operation = await client.AnalyzeDocumentAsync(
        WaitUntil.Completed, 
        "prebuilt-layout", 
        content);

    // 4. Return the full result (includes Pages, Tables, SelectionMarks)
    return operation.Value;
}
```

*Tip: Use the **[Azure AI Document Intelligence Studio](https://documentintelligence.ai.azure.com/studio)** to test your files without writing any code. It's a great way to see what the AI "sees" before you start building.*

---

## 9. The Grading Engine

Once you have the recognized text from the OCR analysis, you need to compare it to the `CorrectAnswer` in your database (the "Master Key"). This is where the **Grading Engine** takes over.

### The Grading Workflow

To understand how this works end-to-end, follow these steps:

1.  **Retrieve the Master Key:** The engine fetches the correct answers for the specific `ExamId` from the SQL database.
2.  **Mapping OCR Output:** 
    *   If using **Custom Models**, the OCR returns structured "fields" (e.g., `Answer1`, `Answer2`).
    *   If using **Prebuilt-Read**, you'll get a raw string. You must use regex or simple keyword searching (e.g., "1.", "2.") to split the text into individual answers.
3.  **Normalization:** Before comparing, "clean" both the student's answer and the correct answer.
    *   Convert to `lowercase`.
    *   Remove trailing spaces (`.Trim()`).
    *   Remove punctuation (e.g., "Paris." becomes "paris").
4.  **Comparison:**
    *   **Exact Match:** If `studentAnswer == correctAnswer`, assign 100% score.
    *   **Fuzzy Match:** If they don't match exactly, calculate the **Levenshtein Distance** to see how close they are.

### Fuzzy Matching Logic (Levenshtein Distance)

The **Levenshtein Distance** is the number of single-character changes (insertions, deletions, or substitutions) required to change one word into another. For example, the distance between "Photosynthesis" and "Photosyntesis" is 1 (the 'h' is missing).

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

### Calculating the Similarity Percentage

Once you have the distance, you can convert it to a score:

```csharp
public static double CalculateSimilarity(string studentAnswer, string correctAnswer)
{
    int distance = ComputeDistance(studentAnswer, correctAnswer);
    int maxLength = Math.Max(studentAnswer.Length, correctAnswer.Length);
    
    // Similarity is 1 minus the percentage of changes needed
    return 1.0 - ((double)distance / maxLength);
}

// Usage in Grading Engine:
double similarity = CalculateSimilarity("Photosyntesis", "Photosynthesis"); 
// Output: ~0.92 (92% match)

if (similarity >= 0.85) {
    // Automatically mark as correct or flag for review
}
```

### Handling Multiple-Choice Questions (MCQs)

For multiple-choice questions, the logic is slightly different. Instead of fuzzy matching text, you need to detect **Selection Marks** (checkboxes or radio buttons).

1.  **Detection:** Use the `prebuilt-layout` model in Azure AI Document Intelligence. It returns a collection of `SelectionMarks` for each page.
2.  **Mapping:** Each selection mark has a coordinate (polygon) on the page. You'll need to map these coordinates to your `Question` options.
3.  **State:** The AI will return a `state` for each mark: `selected` or `unselected`.
4.  **Grading Logic:**
    *   Find the `SelectionMark` that corresponds to the student's choice.
    *   If the state is `selected`, compare the option's value (e.g., "B") with the `CorrectAnswer`.
    *   Assign full points for a match, zero otherwise.

```csharp
public double GradeMultipleChoice(AnalyzeResult result, Question question)
{
    // 1. Identify selection marks on the page
    foreach (var page in result.Pages)
    {
        foreach (var mark in page.SelectionMarks)
        {
            // 2. Logic to determine if mark is within the question's area
            if (IsMarkInQuestionBounds(mark, question))
            {
                // 3. Check if the mark is 'selected'
                if (mark.State == SelectionMarkState.Selected)
                {
                    // 4. Determine which option this mark represents (A, B, C, etc.)
                    string selectedOption = MapMarkToOption(mark);
                    
                    return selectedOption == question.CorrectAnswer ? question.Points : 0;
                }
            }
        }
    }
    return 0; // No selection found
}
```

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

## 12. Azure Deployment Architecture

When you're ready to take your system from localhost to the cloud, you'll need a set of Azure resources to host the application, data, and AI services.

### Deployment Diagram (ASCII)

```text
+-------------------------------------------------------------+
|                     Azure Cloud                             |
|                                                             |
|  +-------------------+        +---------------------------+ |
|  |  Azure App Service| (REST) |  Azure AI                 | |
|  |  (Web + Worker)   |------->|  Document Intelligence    | |
|  +---------+---------+        +---------------------------+ |
|            |   ^                                            |
|            |   |              +---------------------------+ |
|            |   +--------------|  Azure Key Vault          | |
|            |      (Secrets)   |  (API Keys & ConnStrings) | |
|            |                  +---------------------------+ |
|            |                                                |
|            |                  +---------------------------+ |
|            +----------------->|  Azure Blob Storage       | |
|            |      (Files)     |  (Storage Account)        | |
|            |                  +---------------------------+ |
|            |                                                |
|            |                  +---------------------------+ |
|            +----------------->|  Azure SQL Database       | |
|                   (Data)      |  (PaaS SQL Server)        | |
|                               +---------------------------+ |
+-------------------------------------------------------------+
               ^
               | (HTTPS)
        +------+-------+
        |  Professor   |
        |  (Browser)   |
        +--------------+
```

### Required Azure Resources

1.  **Azure App Service:** Hosts your ASP.NET Core MVC application. You can run both the Web UI and the Background Worker in the same App Service Plan to save costs during initial development.
2.  **Azure SQL Database:** A managed relational database for your `Exam`, `Submission`, and `Result` data. Use the "Serverless" tier for cost-efficiency in low-traffic scenarios.
3.  **Azure Blob Storage:** A Storage Account with a container (e.g., `exams`) to hold the physical PDF and image files.
4.  **Azure AI Document Intelligence:** The cognitive service that performs the OCR and handwriting analysis.
5.  **Azure Key Vault:** Essential for security. Store your Storage connection strings and AI API keys here instead of in `appsettings.json` or environment variables.

---

## 13. Exporting Grades to LMS

Once the grading is complete and the professor has reviewed the scores, you'll want to move that data into your school's Learning Management System (LMS) like Canvas, Blackboard, or Moodle.

### 13.1 Simple CSV Export

Most LMS platforms allow you to "Import Grades" via a CSV file. You can easily generate this in .NET:

```csharp
[HttpGet]
public async Task<IActionResult> ExportToCsv(int examId)
{
    var submissions = await _context.Submissions
                                   .Where(s => s.ExamId == examId && s.Status == SubmissionStatus.Completed)
                                   .Include(s => s.Student)
                                   .Include(s => s.Results)
                                   .ToListAsync();

    var csv = new StringBuilder();
    csv.AppendLine("StudentName,StudentEmail,TotalScore");

    foreach (var sub in submissions)
    {
        double total = sub.Results.Sum(r => r.Score);
        csv.AppendLine($"{sub.Student.Name},{sub.Student.Email},{total}");
    }

    byte[] buffer = Encoding.UTF8.GetBytes(csv.ToString());
    return File(buffer, "text/csv", $"Grades_Exam_{examId}.csv");
}
```

### 13.2 Direct Integration (LTI 1.3)

For a more seamless experience, you can implement the **LTI (Learning Tools Interoperability)** standard.
- **How it works:** Your application acts as an "LTI Tool." The LMS sends a secure request to your app, and your app can "post back" the grades directly into the LMS gradebook using the **Assignment and Grading Service**.
- **Library Recommendation:** Use a library like `LtiAdvantage` or `LtiLibrary` to handle the complex OAuth2 and JWT handshake required for LTI 1.3.

---

## 14. Summary & Next Steps

Building an AI grading system in .NET 10 is more accessible than ever. By combining **ASP.NET Core MVC** for the interface and **Azure AI** for the heavy lifting, you can create a tool that saves educators hundreds of hours.

**Key Takeaways:**
1.  **Cloud Storage is Essential:** Use Blob Storage to decouple your web server from your file storage.
2.  **Asynchronous is Better:** Never make a user wait for an AI process. Use background workers.
3.  **Human-in-the-loop:** AI is a helper, not a replacement. Always provide a review interface.

---

## 15. References & Further Reading

*   [Microsoft Docs: Azure AI Document Intelligence](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/)
*   [Azure AI Document Intelligence Studio (No-Code Testing Tool)](https://documentintelligence.ai.azure.com/studio)
*   [ASP.NET Core MVC Documentation](https://learn.microsoft.com/en-us/aspnet/core/mvc/overview)
