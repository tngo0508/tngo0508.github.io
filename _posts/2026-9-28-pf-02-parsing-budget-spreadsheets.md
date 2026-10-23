---
layout: single
title: "Building a Personal Finance App, Part 2: Turning Budget Spreadsheets into Reports"
date: 2026-9-28
show_date: true
toc: true
toc_label: "Spreadsheet Parsing"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - C#
  - Google Sheets
  - OpenXML
  - CSV
  - Refactoring
---

In [Part 1]({% post_url 2026-9-20-pf-01-project-setup-and-google-drive %}) the app learned to list the files in a Google Drive folder. That's not very useful on its own. This part is about **reading** those files: downloading a budget spreadsheet, making sense of its rows, and turning it into a monthly report with income, spending, savings rate, and category breakdowns. It's also about a mistake I made early and only fully fixed three weeks later: when the parser couldn't read a sheet, it made up the numbers.

**In this post you'll learn:**
- How to download a Google Sheet as XLSX (all tabs) or CSV (first tab only), and why the order matters
- How to read an `.xlsx` file with nothing but `ZipArchive` and LINQ to XML
- A label-matching approach for parsing spreadsheets that people lay out by hand
- How I detected transaction tables, including two tables side by side
- Why "fallback data" is a trap, and what the refactor that removed it looked like

---

## The Problem

My budget uses Google's **"Monthly budget"** Sheets template. It has two tabs:

- **Summary**: planned vs. actual income and expenses, start and end balance, and per-category totals
- **Transactions**: two tables side by side, **Expenses** on the left and **Income** on the right, each with Date / Amount / Description / Category columns

I wanted a "Budget report" button next to each budget spreadsheet in the Drive explorer that would open a modal with KPI cards, charts, and a month-by-month view.

Constraints:
- **No Google Sheets API or OAuth.** I already had an API key that could read publicly shared files (Part 1). So I'd download the file and parse it myself.
- **Real spreadsheets are messy.** People rename labels, add rows, and move things around. A parser that expects fixed cell addresses (like `B12`) would break the first time I edited my sheet.

---

## Step 1: Which Files Are Budgets?

The explorer only shows the Budget report button for files that look like budgets. The rule in `GoogleDriveHelper.IsMonthlyBudgetSpreadsheet` was simple: the name starts with "Monthly budget" **and** it's some kind of spreadsheet (Google Sheet, `.xlsx`, `.xls`, or `.csv`).

```csharp
if (!trimmedName.StartsWith("Monthly budget", StringComparison.OrdinalIgnoreCase))
{
    return false;
}

var mime = mimeType?.ToLowerInvariant() ?? string.Empty;
if (mime is "application/vnd.google-apps.spreadsheet" or
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" or
    "application/vnd.ms-excel" or
    "text/csv")
{
    return true;
}
```

It's a naming convention, not real detection. But it's predictable, and it matches how Google names copies of the template.

---

## Step 2: The Report Shape

Before writing the parser, I defined the output in `PersonalFinance.Shared/DTOs/MonthlyBudgetReportDto.cs` (commit `142e54d`, September 28). The report holds a list of months, and each month holds a list of categories. Most of the analytics are **computed properties**, so they can't drift out of sync with the raw numbers:

```csharp
public class MonthlyBudgetMonthSummaryDto
{
    public decimal BudgetedIncome { get; set; }
    public decimal ActualIncome { get; set; }
    public decimal BudgetedExpenses { get; set; }
    public decimal ActualExpenses { get; set; }

    public decimal NetSavings => ActualIncome - ActualExpenses;
    public double SavingsRate => ActualIncome > 0 ? (double)(NetSavings / ActualIncome) * 100 : 0;
    public decimal ExpenseVariance => BudgetedExpenses - ActualExpenses;

    public string Status
    {
        get
        {
            if (BudgetedExpenses > 0)
            {
                if (ActualExpenses <= BudgetedExpenses) return "Under Budget";
                if (ActualExpenses <= BudgetedExpenses * 1.05m) return "On Track";
                return "Over Budget";
            }
            return NetSavings >= 0 ? "Under Budget" : "Over Budget";
        }
    }

    public List<MonthlyBudgetCategoryItemDto> Categories { get; set; } = new();
}
```

The annual totals at the report level (`TotalAnnualSavings`, `AverageSavingsRate`, starting and ending balance) work the same way. The UI just renders what the DTO says.

---

## Step 3: Downloading the Spreadsheet

There are two kinds of "spreadsheet" in Drive, and each one is downloaded differently:

| File kind | How to get the bytes |
|---|---|
| Native Google Sheet | **Export** it: `/drive/v3/files/{id}/export?mimeType=...` |
| Uploaded `.xlsx` / `.csv` | **Download** it as stored: `/drive/v3/files/{id}?alt=media` |

My first version (September 28) exported Google Sheets as **CSV**. The catch: **a CSV export only contains the first tab.** The Summary tab came through, and the Transactions tab was silently missing.

On October 3 (`bd9a2e8`) I switched the order: try **XLSX** first, because an XLSX export includes every tab, and fall back to CSV only if that fails.

```text
 Google Sheet ──► export as XLSX ──ok──► parse Summary + Transactions tabs
                       │
                     fails
                       ▼
                 export as CSV ───ok──► parse first tab only
                       │
                     fails
                       ▼
                 (what happens here is the real story, see Gotchas)
```

Here's how that logic looks today in `PersonalFinance.ApiService/Services/GoogleDriveFileSource.cs`. It's an `IAsyncEnumerable`, so each download only happens if the caller asks for the next one:

```csharp
if (isGoogleSheet)
{
    // The XLSX export keeps every sheet (Summary, Transactions); the CSV export only has the first one.
    var xlsxUrl = apiKey is null
        ? $"https://docs.google.com/spreadsheets/d/{id}/export?format=xlsx"
        : $"https://www.googleapis.com/drive/v3/files/{id}/export?mimeType=application%2Fvnd.openxmlformats-officedocument.spreadsheetml.sheet&key={Uri.EscapeDataString(apiKey)}";
    var xlsx = await TryGetAsync(xlsxUrl, fileId, cancellationToken);
    if (xlsx is not null)
    {
        yield return new SpreadsheetDownload(name, SpreadsheetFormat.Xlsx, xlsx, "Google Drive Live Spreadsheet (Exported XLSX)");
    }

    var csvUrl = /* same idea, format=csv */;
    var csv = await TryGetAsync(csvUrl, fileId, cancellationToken);
    if (csv is not null)
    {
        yield return new SpreadsheetDownload(name, SpreadsheetFormat.Csv, csv, "Google Drive Live Spreadsheet (Exported Data)");
    }

    yield break;
}
```

---

## Step 4: Reading XLSX Without a Library

An `.xlsx` file is just a **ZIP archive of XML files**. I didn't need a spreadsheet library to read values. I only needed to know which XML files matter:

| Entry in the ZIP | What it contains |
|---|---|
| `xl/workbook.xml` | Sheet names, each with a relationship ID (`r:id`) |
| `xl/_rels/workbook.xml.rels` | Maps each relationship ID to a file like `worksheets/sheet2.xml` |
| `xl/sharedStrings.xml` | Every text value, stored once; cells refer to it by index |
| `xl/worksheets/sheetN.xml` | Rows and cells |

The first version just read every `sheetN.xml` in order and merged all the rows together. That mixed Summary rows with Transactions rows. The October 3 version maps **sheet names** to entries so the parser can treat each tab differently:

```csharp
var relMap = relsDoc.Descendants(relsNs + "Relationship")
    .Where(r => r.Attribute("Id") != null && r.Attribute("Target") != null)
    .ToDictionary(r => r.Attribute("Id")!.Value, r => r.Attribute("Target")!.Value);

foreach (var sheetElem in wbDoc.Descendants(wbNs + "sheet"))
{
    var sheetName = sheetElem.Attribute("name")?.Value ?? string.Empty;
    var rId = sheetElem.Attribute(rNs + "id")?.Value ?? string.Empty;
    if (relMap.TryGetValue(rId, out var target))
    {
        var cleanTarget = target.TrimStart('/');
        if (!cleanTarget.StartsWith("xl/", StringComparison.OrdinalIgnoreCase))
            cleanTarget = "xl/" + cleanTarget;
        var wsEntry = archive.GetEntry(cleanTarget);
        if (wsEntry != null) result.Add((sheetName, wsEntry));
    }
}
```

Reading a cell then depends on its `t` (type) attribute:
- `t="s"`: the `<v>` value is an **index** into the shared strings list
- `t="inlineStr"`: the text is inline in `<is><t>`
- anything else: `<v>` holds the raw value (usually a number)

Cells also arrive **sparse**. Empty cells are simply missing, so I convert each cell reference like `C7` into a column index and fill the gaps with empty strings. Without that step, columns shift left whenever a row has a blank cell.

With named sheets, the flow became: find the tab whose name contains "summary", parse it into the report, then use any tab whose name contains "transaction" to fill in category actuals that the summary left at zero.

---

## Step 5: Parsing by Labels, Not Cell Addresses

This is where most of the code went. Instead of "income is in cell `C8`", the parser scans every row, splits it into **(label, numbers)** segments, and classifies each label. Here is `ExtractRowSegments`:

```csharp
foreach (var cell in row)
{
    if (string.IsNullOrWhiteSpace(cell)) continue;

    if (TryParseDecimal(cell, out var val))
    {
        if (string.IsNullOrEmpty(currentName)) currentName = "Item";
        currentNumbers.Add(val);
    }
    else
    {
        if (!string.IsNullOrEmpty(currentName))
        {
            segments.Add((currentName, currentNumbers));
            currentNumbers = new List<decimal>();
        }
        currentName = cell.Trim();
    }
}
```

So a row like `Total Income, 5000, 5200, , Total Expenses, 3000, 3100` becomes two segments, which handles the side-by-side blocks the template uses. Each label then goes through small matcher functions such as `IsTotalIncomeText`, `IsStartBalanceText`, or `IsNetSavingsText`. They normalize the text (lowercase, strip spaces, underscores, and dashes) and check a list of synonyms:

```csharp
private static bool IsStartBalanceText(string text)
{
    var clean = text.ToLowerInvariant().Replace(" ", "").Replace("_", "").Replace("-", "");
    return clean.Contains("startbalance") || clean.Contains("startingbalance") ||
           clean.Contains("openingbalance") || clean.Contains("beginningbalance");
}
```

Numbers need their own cleanup. `TryParseDecimal` strips currency symbols and `%`, and turns accounting-style negatives like `(150.00)` into `-150.00`.

The October 3 change also taught the parser to **ignore balance-change rows** like "Increase in total savings" when computing expenses. Those are summary lines, not spending, so counting them would have skewed both expenses and the savings rate.

---

## Step 6: The Transactions Viewer

On October 10 (`2614c81`, released as v1.1.0) I added a **Transactions** button that shows the rows of the Transactions tab in a searchable, sortable modal. The parser for this, `ParseTransactionRows`, works differently from the summary parser:

1. A **header row** containing a "Date" column and an "Amount" column starts a table.
2. If a header row has **several** Date columns, each one starts its own table. That's how the template's Expenses and Income tables are read side by side.
3. The parser looks up to three rows **above** each header for a section label ("Expenses", "Income") to decide the transaction type.
4. If there's no label and no Type column, **signed amounts** decide: negative means expense, positive means income (bank-export style).

```csharp
var dateCols = Enumerable.Range(0, row.Count).Where(i => IsDateHeader(row[i])).ToList();

for (int t = 0; t < dateCols.Count; t++)
{
    var start = dateCols[t];
    var end = t + 1 < dateCols.Count ? dateCols[t + 1] - 1 : row.Count - 1;

    int Find(Func<string, bool> predicate) =>
        Enumerable.Range(start, end - start + 1)
                  .FirstOrDefault(i => i != start && predicate(row[i].Trim().ToLowerInvariant()), -1);

    var amountCol = Find(h => h.Contains("amount") || h is "amt" or "cost" or "price" or "value");
    if (amountCol < 0) continue;

    tables.Add(new TransactionTableLayout
    {
        DateCol = start,
        AmountCol = amountCol,
        CategoryCol = Find(h => h.Contains("category")),
        SectionType = FindSectionType(rows, headerRow, start, end)
    });
}
```

Dates needed one more trick. In XLSX, a date cell usually holds an **OLE Automation serial number** (a count of days since an epoch in 1899), not text. So `ParseSheetDate` tries a number first:

```csharp
if (double.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out var serial))
{
    return serial is >= 1 and < 2958466 ? DateTime.FromOADate(serial).Date : null;
}
```

One small thing I like from this commit: skipping "Total" rows only checks descriptions that **start with "Total"**. The broader `IsTotalRow` helper also matched "Net" and "Sum" prefixes, which would have thrown away a payee like "Netflix". There's a comment in the code explaining exactly that.

The CHANGELOG for this release also says: *"Failures return an error message instead of generated sample rows."* That turned out to matter.

---

## Gotchas and Lessons Learned

### 1. I invented budget data, and it spread

This is the big one. From the very first version, whenever the report couldn't be built from the real file, the code called `GenerateMonthlyBudgetReport`. Despite its name, that method didn't read anything. It produced a **seeded, made-up 12-month budget**: fixed category amounts like housing and groceries, a "bonus" in June and December, and some variation derived from the file name's hash so it looked stable and realistic.

It was called from many places:

```text
 download failed             ─┐
 empty CSV                   ─┤
 workbook had no sheets      ─┼──► GenerateMonthlyBudgetReport(fileName)  ──► "real-looking" report
 parse threw any exception   ─┤
 no labels recognized        ─┤
 Web controller caught error ─┘
```

And the parser invented data even when it **did** read the file:
- A month with totals but no category rows got an **estimated split** (35% housing, 15% groceries, and so on).
- In a full-year view, empty months **copied** another month's totals.

For the first few days, the fake report was even marked `IsLiveSpreadsheetData = true`. The October 3 commit flipped that to `false`, in the same change that started checking the flag before accepting an XLSX result. But a flag that the UI can ignore isn't a safeguard.

There was a quieter bug in it too. The comment said "seed deterministically based on file name", but the seed came from `string.GetHashCode()`, which .NET (Core) randomizes per process. So the "stable" fake numbers could change every time the app restarted.

By October 21 the damage was clear. A **sync** feature (built later) saved budget reports as snapshots, and those snapshots fed the Analysis page, the Dashboard, and the AI Assistant. So a failed download could quietly turn into made-up numbers that the AI would then talk about as if they were mine.

### 2. The fix: one honest "Unavailable" state

The refactor landed as `0be0d8f` (PR #84, "split Google Drive ingestion and stop inventing budget data", v2.7.0). It did two things.

**It split the code.** By then `GoogleDriveHelper` in the Shared project had grown to **1,846 lines**: URL parsing, MIME types, downloads, CSV and XLSX parsing, sample data, and the fake report generator. Because it lived in Shared, the Web project carried the whole parser too. It was replaced by focused modules in `PersonalFinance.ApiService/Services/`:

| Module | Responsibility |
|---|---|
| `GoogleDriveFileSource` | Download URLs, API key choice, and finding the connection, scoped to the owning account |
| `BudgetSpreadsheetParser` | Pure CSV/XLSX parsing, with no I/O |
| `SpreadsheetReaderService` | Try each download in order and keep the first one that has data |
| `GoogleDriveMetadata`, `SampleSpreadsheets` | Small helpers and the demo files |

**It replaced every invented fallback with an explicit "unavailable" report:**

```csharp
public static MonthlyBudgetReportDto Unavailable(string? fileName, string? fileId, string reason)
{
    return new MonthlyBudgetReportDto
    {
        FileName = fileName ?? string.Empty,
        FileId = fileId,
        Title = "Budget report unavailable",
        DataSource = "Unavailable",
        IsLiveSpreadsheetData = false,
        ErrorMessage = reason
    };
}
```

The reader returns the first download that produces months, or explains why none did. Each layer then handles it honestly:
- The modal shows the reason instead of charts.
- The Web controller returns **502 Bad Gateway** if the API call itself fails, instead of building a fake report.
- The sync refuses to save a report with no months:

```csharp
// Only months actually read from the sheet are ever saved as snapshots.
if (budgetReport.Months.Count == 0)
{
    return new SyncSpreadsheetBudgetResult
    {
        Success = false,
        ErrorMessage = budgetReport.ErrorMessage ?? "No budget data could be read from the spreadsheet."
    };
}
```

The new tests in `SpreadsheetReaderTests` read like a spec for honesty, for example `MonthsMissingFromTheSheet_StayEmptyInsteadOfCopyingAnotherMonth` and `MonthTotalsWithoutCategoryRows_HaveNoInventedCategoryBreakdown`. Because the reader depends on `IGoogleDriveFileSource`, the tests pass in fake downloads instead of matching Google URLs.

**Rule I follow now:** a fallback must never look like success. If you can't show real data, show *why*. A "helpful" default that looks real is worse than an error, because nobody goes looking for a bug they can't see.
{: .notice--warning}

### 3. Bare `catch` blocks turned bugs into "unreadable file"

A follow-up commit the same day (`3db39bf`) narrowed the parser's `catch` blocks. Before, any exception, including a real bug like a `NullReferenceException`, became "the file is unreadable". Now only errors that actually mean "not a valid workbook" are caught:

```csharp
private static bool IsUnreadableWorkbook(Exception ex)
{
    return ex is InvalidDataException or System.Xml.XmlException;
}

// usage
catch (Exception ex) when (IsUnreadableWorkbook(ex))
{
    return Unavailable(fileName, fileId, "The file is not a readable Excel workbook.");
}
```

The same commit made the account ID a **required first parameter** of the reader and file source. It used to be an optional trailing parameter.

### 4. I was logging my API key

Every download URL includes `&key=<YOUR_API_KEY>`, and the original code logged the full URL at Information level ("Exporting Google Spreadsheet ... via '{Url}'"). So the key ended up in the logs. The refactor's `TryGetAsync` logs only the file ID and HTTP status code. If a URL can contain a secret, don't log the URL.

### 5. Smaller lessons

- **CSV exports only include the first tab.** If your data is spread across tabs, export XLSX.
- **XLSX cells are sparse** and **dates are serial numbers**. Handle both, or your columns shift and your dates show up as numbers like `46266`.
- **Label matching beats cell addresses** for sheets people edit by hand, but the synonym lists keep growing. Write tests with real layouts for every label you add.

---

## Recap

- Google Sheets are exported as **XLSX first** (all tabs) and **CSV second** (first tab only); uploaded files are downloaded as they are.
- An `.xlsx` is a ZIP of XML. `workbook.xml` plus its `.rels` file gives you sheet names, and shared strings give you the text.
- The summary parser matches **labels** rather than fixed cells; the transactions parser finds Date/Amount header rows and supports side-by-side tables.
- Budget analytics live as computed properties on the DTOs, so they can't drift from the raw numbers.
- The biggest lesson: invented fallback data spread into snapshots, the Dashboard, and the AI Assistant. Replacing it with an explicit "Unavailable" report, narrow `catch` blocks, and focused modules fixed it.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 1: Project Setup and the Google Drive Explorer]({% post_url 2026-9-20-pf-01-project-setup-and-google-drive %}) · Next: [Part 3: Identity, Email Confirmation, and Google Sign-In]({% post_url 2026-10-3-pf-03-identity-email-and-google-sign-in %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
