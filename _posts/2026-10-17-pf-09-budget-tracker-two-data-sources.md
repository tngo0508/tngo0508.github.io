---
layout: single
title: "Building a Personal Finance App, Part 9: Budget Tracker and Two Data Sources"
date: 2026-10-17
show_date: true
toc: true
toc_label: "Budget Tracker"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - EF Core
  - Architecture
  - Globalization
  - FluentValidation
---

Until this point, every budget number in the app came from a Google Sheet that I sync from Google Drive (see [Part 2]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %})). That works for me, but not for anyone who doesn't keep a spreadsheet. This part covers the in-app Budget Tracker and the Budget Planner, the design decision that lets one app read budget data from two very different places, and a set of bugs where the app showed numbers that weren't true: a wrong currency symbol, a chart of made-up history, and empty pages that looked like lost data.

**In this post you'll learn:**

- How to add a second data source without mixing figures from both (ADR 0002)
- Why I store budget amounts in dollars and cents instead of percentages
- Why a .NET app in a container printed `¤` instead of `$`, and how to fix it for good
- Why "show nothing" is better than "show something fake" when data can't load

---

## The Problem

I needed a way for users to enter a monthly budget directly in the app: planned amounts per category, real transactions, and a summary of planned versus actual. Analysis and the Dashboard had to work with **either** the synced Google Sheet data **or** this new Budget Tracker data.

The constraints:

- **Google sync overwrites.** A sync rewrites the snapshot rows for a file and month. Anything a user typed into those tables would be lost on the next sync.
- **No mixing.** If one view adds up some months from the sheet and some from the tracker, the totals are meaningless and nobody can tell.
- **One decision point.** I didn't want Analysis, the Dashboard, the AI Assistant, and Search each writing their own `if (source == ...)` logic.

Before the tracker, there was also a simpler page: the **Budget Planner**, which splits monthly income across ten categories. I'll start there because it was first.

---

## Step 1: The Budget Planner (`3fc1f58`)

The Budget Planner lives at `/Budget`. You enter your monthly income, then give each of ten categories (Housing, Food, Transportation, Utilities, Insurance, Healthcare, Savings, Debt Repayment, Entertainment, Miscellaneous) a share using a slider, a percent box, or a dollar box. A Chart.js pie chart and a summary list update as you type.

The first version stored a **percentage** per category. That caused a bug users would notice right away. From the spec I wrote for the fix (`.junie/plans/budget-planner-exact-amounts.md`):

> In the Budget Planner, a user types a category amount such as $700 against their Monthly Income, saves, and the page comes back showing about $699.67.

The planner saved a rounded percentage, then multiplied it back by income on reload. The amount the user typed was never stored.

### Exact allocation amounts (`368620e`)

The fix flipped the source of truth. Each category now stores an **Allocation Amount** in dollars and cents (`decimal(18,2)`), and the percentage is always calculated from it. The GLOSSARY puts it in one line: percentages are always derived from the amount.

Changing what a column means needs a data migration. The migration `AddBudgetAllocationAmounts` adds the new columns, then backfills them from the old percentages. Look at the two comments. Both describe traps:

```csharp
// Backfill every existing row, including soft-deleted ones (a plain UPDATE bypasses the EF query filter).
// EXEC defers compilation so the UPDATE is valid in generated scripts, where it shares a batch with the ALTERs.
migrationBuilder.Sql(@"
EXEC(N'UPDATE UserBudgetAllocations
SET HousingAmount = ROUND(MonthlyIncome * HousingPercent / 100.0, 2),
    FoodAmount = ROUND(MonthlyIncome * FoodPercent / 100.0, 2),
    -- ...eight more categories
    MiscellaneousAmount = ROUND(MonthlyIncome * MiscellaneousPercent / 100.0, 2)');");
```

The second comment is the subtle one. In a generated SQL script, the `ALTER TABLE ... ADD` and the `UPDATE` can end up in the same batch, and SQL Server compiles the whole batch before running it. At compile time the new columns don't exist yet, so the `UPDATE` fails. Wrapping it in `EXEC(N'...')` delays compiling that statement until it runs.

A second migration, `RemoveBudgetAllocationPercentages`, then dropped the old percentage columns. Doing it in two steps meant the first migration was safe to ship on its own: old code that still read percentages kept working.

On the browser side, the JavaScript keeps all state in **integer cents** to avoid floating-point drift (in JavaScript, `0.1 + 0.2` is not exactly `0.3`). From `wwwroot/js/budget/budget.js`:

```javascript
incomeCents = Math.round(parseFloat(initialData.monthlyIncome) * 100) || 0;
// ...
function toPercent (cents) {
    if (incomeCents <= 0) {
        return 0;
    }
    return (cents / incomeCents) * 100;
}
```

### From "must add up exactly" to a warning (`378925e`)

The exact-amounts change also added a FluentValidation rule: you could only save when the allocations added up to monthly income **to the cent**. In practice that was too strict. You couldn't save a half-finished plan, and you couldn't save a plan that spent more than you earn, even to look at it.

Commit `378925e` removed that rule from `SaveBudgetRequestValidator`. The validator now only checks each amount on its own (non-negative, at most $10,000,000, at most two decimal places). The Web controller shows a **warning** instead of blocking:

```csharp
await _budgetPlannerApi.SaveBudgetAsync(request, HttpContext.RequestAborted);
if (model.TotalAllocated > model.MonthlyIncome)
{
    TempData["SaveWarning"] =
        $"Budget saved. Note: Total allocations (${model.TotalAllocated:F2}) exceed your monthly income of ${model.MonthlyIncome:F2}.";
}
else
{
    TempData["SaveSuccess"] = "Budget saved successfully.";
}
```

The same commit fixed a small bug: the Transportation amount input was missing its `asp-for` tag helper, so its value reset to empty on save. The fix came with a test that checks all ten category inputs in `Index.cshtml` have an `asp-for` binding.

---

## Step 2: The Budget Tracker (`e138043`)

The Budget Tracker is a monthly budget page with two views, **Summary** and **Transactions**, designed to match the layout and rules of my Google monthly budget sheet. It introduced a few terms that I added to `GLOSSARY.md`:

| Term | Meaning |
|---|---|
| **Planned** | What you intend to spend (or earn) in a category this month |
| **Actual** | The sum of that category's transactions this month, unless an override is set |
| **Actual Override** | A number typed by hand that replaces the transaction sum. It can be reverted |
| **Diff** | Planned − Actual for expenses, Actual − Planned for income |
| **Data Source** | Which data Analysis and the Dashboard show: Google Sheet or Budget Tracker |

The rules for one month's rows live in a small static class, `ApiService/Services/MonthlyBudgetCalculator.cs`. Look at how `actual` is chosen and how `diff` flips sign for income, so a positive Diff always means "good":

```csharp
lineMap.TryGetValue(cat.Id, out var line);
var planned = line?.PlannedAmount ?? 0m;
var hasOverride = line?.ActualOverride.HasValue == true;
var actual = hasOverride
    ? line!.ActualOverride!.Value
    : (txSumByCategory.TryGetValue(cat.Id, out var txSum) ? txSum : 0m);

var diff = cat.Kind == BudgetCategoryKind.Expense
    ? planned - actual
    : actual - planned;
```

The same class decides which categories to show. Active categories always appear. An archived (soft-deleted) category appears only if it still has a planned amount, an override, or transactions that month, so deleting a category never makes old months add up differently.

---

## Step 3: Two Data Sources, One Provider (ADR 0002)

This is the main design decision of this part, written up in `docs/adr/0002-budget-tracker-separate-from-spreadsheet-data.md`.

### Decision 1: separate tables

The tracker gets its own user-owned entities: `BudgetCategory`, `MonthlyBudgetPlan`, `MonthlyBudgetLine`, `BudgetTransaction`, and `UserBudgetSourcePreference`. The synced `Spreadsheet*` tables are not changed or reused. That way a Google sync can never overwrite something a user typed.

The ADR is honest about the cost: there are now two sets of tables for similar ideas, and merging them later would be a big migration.

### Decision 2: one provider picks one source

Every budget reader goes through `IBudgetDataProvider`. It figures out the user's Data Source and hands the call to one of two readers. Both readers implement the same `IBudgetMonthReader` interface and return the same normalized shape (`BudgetMonthData`).

```text
 Analysis      Dashboard      AI Assistant
     \             |              /
      \            |             /
       v           v            v
      +---------------------------+
      |    IBudgetDataProvider    |  resolves the Data Source once per request
      +---------------------------+
             |               |
     GoogleSheet        BudgetTracker
             v               v
 SheetBudgetMonthReader   TrackerBudgetMonthReader
             |               |
   Spreadsheet* tables   BudgetCategory / MonthlyBudgetPlan /
   (written by sync)     MonthlyBudgetLine / BudgetTransaction
```

This is the core of `ApiService/Services/BudgetDataProvider.cs`. Every public method looks like `GetMonthsAsync`: pick the reader, then delegate.

```csharp
public async Task<List<BudgetMonthData>> GetMonthsAsync(string userId, int year, CancellationToken ct = default)
{
    var reader = await GetReaderAsync(userId, ct);
    return await reader.GetMonthsAsync(userId, year, ct);
}

private async Task<IBudgetMonthReader> GetReaderAsync(string userId, CancellationToken ct)
{
    var source = await GetActiveSourceAsync(userId, ct);
    return source == BudgetDataSource.BudgetTracker
        ? _trackerReader
        : _sheetReader;
}
```

The provider is registered as **scoped** (one instance per HTTP request), and it caches the resolved source in a dictionary for that request. When the user switches source, `BudgetDataSourceService` raises a `PreferenceChanged` event and the provider removes the cached entry.

### Decision 3: no per-month fallback

It's tempting to say "if the tracker has no data for March, show the sheet's March." The ADR rules that out: **each month comes from exactly one source**. A fallback would quietly mix sources, which is the exact problem the design exists to prevent. An empty month in the tracker is just an empty month.

### How the default is chosen

If the user has never picked a source, the app decides at read time, from `BudgetDataSourceService.cs`:

```csharp
var hasSheetData = await _dbContext.SpreadsheetBudgetSnapshots
                       .AsNoTracking()
                       .AnyAsync(s => s.UserId == userId, ct)
                   || await _dbContext.SpreadsheetTransactionRecords
                       .AsNoTracking()
                       .AnyAsync(t => t.UserId == userId, ct);

return new BudgetDataSourceDto
{
    Source = hasSheetData ? BudgetDataSource.GoogleSheet : BudgetDataSource.BudgetTracker,
    IsDefault = true
};
```

A preference row is only written when the user switches explicitly. So a new user who later syncs a sheet automatically moves to the sheet, but a user who chose the tracker stays there.

### The Global Search amendment

ADR 0002 originally said that only budget readers go through the provider. Google sync reads and writes its tables directly, which still makes sense. But Global Search also read only the synced tables, so a Budget Tracker user could never find their own transactions. The ADR was amended on 2026-10-21 (#93): Search now resolves the Data Source with the **same rule** and searches only that source's transactions. It doesn't go through the provider, because it needs the source decision but not month data.

I like that this was recorded as an amendment to the existing ADR instead of a silent code change. The next person to read the ADR sees both the rule and the exception.

---

## Step 4: The Truthful Dashboard

Around the same time, I went through the Dashboard and found several places where it showed numbers that weren't real.

### A fabricated chart (`1fed286`)

The Dashboard had a "net worth trend" area chart. The app doesn't store net worth history, so where did the trend come from? Here is the removed code:

```text
data: [@Model.NetWorth.CurrentNetWorth,
       @((decimal)(Model.NetWorth.CurrentNetWorth * 1.05M)),
       @((decimal)(Model.NetWorth.CurrentNetWorth * 1.1M)),
       @((decimal)(Model.NetWorth.CurrentNetWorth * 1.15M)),
       @((decimal)(Model.NetWorth.CurrentNetWorth * 1.2M))]
xaxis: {categories: ['1Y ago', '8mo', '6mo', '4mo', 'Now']}
```

It took today's number, multiplied it by 1.05 to 1.20, and labeled the results as history. The CHANGELOG entry calls it what it was: invented history, because no net worth history is stored. `1fed286` deleted it and split the Dashboard into one Razor partial per section. The replacement (`db042a4`) is a real **projection** chart from the Net Worth parameters, with the FI Target line from [Part 6]({% post_url 2026-10-11-pf-06-net-worth-and-fi-planning %}). A projection of the future is honest; a fake past is not.

A related refactor (`0be0d8f`) found the same problem in Google Drive ingestion. When a spreadsheet couldn't be read, the code returned a seeded 12-month sample budget that looked like real data, and a sync could save it. Now an unreadable sheet returns an "unavailable" report with an error message, and the sync refuses a report with no months.

### Empty is not the same as unavailable (`3498a91`, `aab0409`)

The ApiService scales to zero when idle (see [Part 5]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %})). So the first Dashboard load after sign-in could fail while the container started. The Web controller caught the error and rendered an **empty** summary. A returning user saw the setup cards meant for brand-new users, as if all their data was gone.

The fix introduced a GLOSSARY term, the **Unavailable State**:

> What a page or section shows when its data could not be loaded. It tells the user their data is temporarily unreachable and offers a retry. It is never shown as an empty state, because an empty state means the user has no data yet.

`3498a91` fixed the Dashboard and added an `ApiServiceWarmer`: the Login page sends a throttled, anonymous ping to `/alive` so the API is awake by the time the user signs in. Then `aab0409` applied the same rule to the Budget Planner, Net Worth, Savings Goals, and Community pages, using one shared helper in `Web/Infrastructure/UnavailableStateExtensions.cs`:

```csharp
/// Returns the Unavailable State instead of the page, so a failed load never shows defaults or an empty state
/// that the user could mistake for their data (or save over it).
public static ViewResult UnavailableView(this Controller controller, string pageTitle, string heading,
    string retryController, string retryAction = "Index", IDictionary<string, string>? retryRouteValues = null)
{
    return controller.View(UnavailableViewName, new UnavailableStateViewModel
    {
        PageTitle = pageTitle,
        Heading = heading,
        RetryController = retryController,
        RetryAction = retryAction,
        RetryRouteValues = retryRouteValues ?? new Dictionary<string, string>()
    });
}
```

"Or save over it" is the important part. On the Budget Planner and Net Worth pages, a failed load used to show **default** values in an editable form. One click on Save would replace the user's real data with the defaults.

---

## Step 5: The `¤` Bug (`c17af7d`, `e07ef56`)

After deploying to Azure Container Apps, every amount on the site looked like `¤1,234.56`.

`¤` is the **generic currency sign**. It's what .NET prints for currency when the current culture is the **invariant culture**, which has no country and therefore no currency. The app runs in a "chiseled" container image (a very small Ubuntu-based image with almost nothing installed). It sets no locale, so .NET starts in the invariant culture. A normal development machine has a locale set, which is why this kind of bug tends to appear only after deployment.

The fix was a shared helper, `PersonalFinance.Shared/Constants/AppCulture.cs`, called at startup in **both** Web and ApiService:

```csharp
public const string DefaultCultureName = "en-US";

public static CultureInfo Default => CultureInfo.GetCultureInfo(DefaultCultureName);

public static void ApplyDefault()
{
    var culture = Default;
    CultureInfo.DefaultThreadCurrentCulture = culture;
    CultureInfo.DefaultThreadCurrentUICulture = culture;
    CultureInfo.CurrentCulture = culture;
    CultureInfo.CurrentUICulture = culture;
}
```

Setting the `DefaultThread...` properties matters. Setting only `CurrentCulture` changes the startup thread, but request threads and background work would still use the invariant culture.

The Web app also locks request localization to `en-US`, so a browser sending `Accept-Language: de-DE` can't switch the currency or decimal separator:

```csharp
builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture(AppCulture.DefaultCultureName);
    options.SupportedCultures = [AppCulture.Default];
    options.SupportedUICultures = [AppCulture.Default];
});
```

The helper's doc comment carries a warning worth repeating: `en-US` only resolves when ICU globalization data is present in the image. If `InvariantGlobalization` is turned on, `en-US` silently falls back to invariant and `¤` returns.

### Making culture explicit everywhere (`e07ef56`)

A process-wide default fixes the symptom but hides intent. Later, as part of reaching zero build warnings, I turned on the .NET analyzers that flag culture-dependent calls (CA1305, CA1304, CA1311, CA1310) and fixed every one. The rule I followed:

- **Machine formats** (period keys like `yyyy-MM`, parsing a year) use `CultureInfo.InvariantCulture`.
- **Text for people** (money, dates, percentages) uses `AppCulture.Default`.

For example, in `BudgetService.cs`:

```csharp
var period = request.Period ?? DateTime.UtcNow.ToString("yyyy-MM", CultureInfo.InvariantCulture);
// ...
var year = int.Parse(period.AsSpan(0, 4), CultureInfo.InvariantCulture);
var month = int.Parse(period.AsSpan(5, 2), CultureInfo.InvariantCulture);
```

New tests switch the thread culture to `de-DE` and `th-TH` and check that the output doesn't change. The Thai culture is a good test because it uses a different calendar by default, so a culture-sensitive year can come out very wrong.

---

## Gotchas and Lessons Learned

**1. Store what the user typed.** Saving a derived value (a percentage) and recalculating the original (dollars) on load turned $700 into $699.67. Store the source of truth and derive everything else for display.

**2. An enum that serialized differently on each side.** Right after the tracker shipped, switching the Data Source to Budget Tracker failed with HTTP 400. The Web app's Refit client sent the enum as a camelCase string (`"budgetTracker"`), and the ApiService couldn't bind it. The fix in `cb5ed2f` put a `[JsonConverter(typeof(JsonStringEnumConverter))]` attribute on the `BudgetDataSource` enum itself, so every serializer accepts both names and numbers. A test now checks `"budgetTracker"`, `"BudgetTracker"`, and `2` all deserialize correctly.

**3. A dollar amount is not a year.** The same fix commit found that a synced sheet named "Monthly budget - October 2026" could be saved under the year **2072**, because the year detection found a cell containing the amount `2072` and took it as a year. The file name is now the authoritative source of the year.

**4. "Must add up exactly" was too strict.** A validation rule that seems obviously correct can block normal use. Sometimes a warning is the right answer instead of an error.

**5. Fake data is worse than no data.** The fabricated chart and the seeded sample budget both looked real. If there's nothing true to show, show nothing (or say so) rather than a plausible guess.

**6. Empty states lie when loads fail.** "You have no data" and "we couldn't load your data" must look different, especially when the page has a Save button.

**7. Fixing the format doesn't fix stored text.** The `¤` fix only changes new output. The CHANGELOG notes that amounts already stored as text with `¤` (for example in old notifications) were not rewritten.

**8. Docs drift too.** The Budget Planner entry in `GLOSSARY.md` still says Save is only allowed when amounts match income exactly, even though `378925e` relaxed that rule. ADRs and glossaries need updating in the same commit as the behavior change, or they slowly become wrong.

---

## Recap

- The Budget Planner stores exact Allocation Amounts in dollars and cents. Percentages are always derived, and over-allocation is a warning, not an error.
- Budget Tracker data lives in its own tables, so a Google sync can never overwrite it (ADR 0002).
- `IBudgetDataProvider` picks exactly one Data Source per user, with no per-month fallback, so figures are never mixed.
- The Dashboard shows a real projection instead of fabricated history, and every page shows an Unavailable State instead of empty or default data when the API fails.
- Pin the culture at startup in every host, lock request localization, and make each format call say which culture it means.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 8: Choosing Direct Services over CQRS]({% post_url 2026-10-16-pf-08-architecture-direct-services-over-cqrs %}) · Next: [Part 10: RBAC and Account Isolation]({% post_url 2026-10-18-pf-10-rbac-and-account-isolation %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
