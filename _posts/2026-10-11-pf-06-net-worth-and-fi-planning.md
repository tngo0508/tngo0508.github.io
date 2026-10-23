---
layout: single
title: "Building a Personal Finance App, Part 6: Net Worth Projection and FI Planning"
date: 2026-10-11
show_date: true
toc: true
toc_label: "Net Worth and FI"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - Chart.js
  - Refit
  - EF Core
  - Financial Independence
---

This part covers the feature I use most in my own app: a Net Worth projection page that answers "if I keep saving like this, when am I financially independent?" I built the first version in one day (October 11), then spent the following weeks fixing the parts that were wrong: where the math lived, what the Reset button did, and how many copies of the same ten fields existed. The math is simple. Most of the work was keeping it in one place.

**In this post you'll learn:**

- How a year-by-year compound growth projection works, and how the 4% rule turns spending into an FI target
- How I moved the calculation from the MVC app into an API service with shared DTOs and validation
- How presets, sliders, and a Randomize button make "what if" exploration fast
- Why Reset should never delete saved data (ADR 0003)
- How I collapsed eight copies of a ten-field mapping into one, and tested it with reflection

The projections in this app (and the numbers in this post) are educational. They are not financial advice.
{: .notice--warning}

---

## The Problem

I wanted to see my net worth growing over time under a few different assumptions, with a line marking the point where I could stop working. The requirements were:

- **Ten inputs**: starting balance, annual savings, annual income, annual spending, current age, retirement age, three return rates (Base, Conservative, Aggressive), and a higher savings amount for the Aggressive scenario.
- **Three scenarios** side by side, so I see a range instead of one optimistic number.
- **An FI Target** (Financial Independence target): the portfolio size where investments can pay for my spending.
- **Instant feedback** when I drag a slider.
- **Saved parameters** per user, so the page opens with my numbers next time.

---

## The Math

### Year-by-year growth

Every year, the balance grows by its return on investment (ROI), and then I add that year's savings. In code, that's one loop in `PersonalFinance.ApiService/Services/NetWorthProjectionService.cs`. Look at the `while` loop. It is the whole model:

```csharp
decimal balance = startingBalance;
decimal totalContributions = startingBalance;
int year = startYear;
int age = startAge;

while (age <= retirementAge)
{
    var roi = balance * roiRate;
    var endingBalance = balance + annualSavings + roi;

    scenario.Years.Add(new NetWorthYearDto
    {
        Year = year,
        Age = age,
        StartingBalance = balance,
        Savings = annualSavings,
        Roi = roi,
        EndingBalance = endingBalance
    });

    totalContributions += annualSavings;
    balance = endingBalance;
    year++;
    age++;
}

scenario.FinalNetWorth = balance;
scenario.TotalContributions = totalContributions;
scenario.TotalInterestEarned = balance - totalContributions;
```

A few simplifications are built in, and it's worth naming them:

- ROI is calculated on the **starting** balance, so that year's savings don't earn anything until the next year.
- Savings stay **flat** every year. There are no raises.
- There is **no inflation or tax** input. Every number is in today's dollars.
- `TotalContributions` includes the starting balance, so "interest earned" means growth on top of everything I put in.

### The 4% rule and the FI Target

The **4% rule** is a common retirement guideline: if you withdraw about 4% of a portfolio each year, it has historically lasted around 30 years. Flip it around: if you need `S` dollars a year, you need a portfolio of `S / 0.04`, which is `S × 25`. The app calls that number the **FI Target**:

```csharp
private const decimal FiRuleMultiplier = 25m;
// ...
FiTarget = request.AnnualSpending * FiRuleMultiplier
```

### A worked example

Here is a made-up example with round numbers (not anyone's real finances): a $100,000 starting balance, $20,000 saved per year, a 7% return, and $40,000 a year of spending.

**FI Target** = $40,000 × 25 = **$1,000,000**.

| Year | Starting balance | ROI (7%) | Savings | Ending balance |
|-----:|-----------------:|---------:|--------:|---------------:|
| 1 | $100,000.00 | $7,000.00 | $20,000 | $127,000.00 |
| 2 | $127,000.00 | $8,890.00 | $20,000 | $155,890.00 |
| 3 | $155,890.00 | $10,912.30 | $20,000 | $186,802.30 |
| 7 | $293,138.85 | $20,519.72 | $20,000 | $333,658.57 |
| 17 | $852,977.45 | $59,708.42 | $20,000 | $932,685.87 |
| 18 | $932,685.87 | $65,288.01 | $20,000 | **$1,017,973.88** |

Two things jump out:

1. In **year 7**, the portfolio earns more than I save. From then on, the money does more of the work than my paycheck does.
2. The FI Target is crossed in **year 18**. Without any growth, $100,000 + 18 × $20,000 is only $460,000. Compounding covers the rest.

The table on the real page highlights these moments too: rows past the FI Target get one color, rows past $5M get another, and an ROI cell is highlighted when that year's return is larger than the annual **income** (commit `97f5ae8`).

---

## Step 1: The First Version (all in the Web app)

The first commit (`f11b76c`) put everything in the MVC project: a `NetworthController`, a `NetWorthViewModel`, an `Index.cshtml` view, and a 432-line `networth.js`. A few hours later (`4f7f808`) I pulled the math into a `NetWorthProjectionService` class, added the three scenarios, and split the view into a `_NetWorthContent` partial.

Then came quality-of-life features on the same day:

- `65a0eb6`: tooltips and a "What is the 4% Rule?" explanation card on the page
- `bebeed4`: server-side and client-side validation, plus a "Reset to Defaults" button (this button comes back later as a bug)
- `d64b50f` / `6eeac91`: a dark theme for the charts, then removing a custom "glow" Chart.js plugin I had added. It wasn't worth the extra rendering code.

### The charts

The page uses [Chart.js](https://www.chartjs.org/) with two charts: a line chart of all three scenarios over time, and a bar chart comparing final net worth. The FI Target line is just a fourth dataset filled with the same value, drawn dashed. This is from `wwwroot/js/networth/networth-charts.js`:

```javascript
const datasets = [
    buildLineDataset('Base', data.base.roiPercent, data.base.years, colors.base, baseGrad, 3),
    buildLineDataset('Conservative', data.conservative.roiPercent, data.conservative.years, colors.conservative, consGrad, 2),
    buildLineDataset('Aggressive', data.aggressive.roiPercent, data.aggressive.years, colors.aggressive, aggGrad, 3),
    {
        label: 'FI Target',
        data: Array(labels.length).fill(fiTarget),
        borderColor: colors.fi,
        backgroundColor: 'transparent',
        borderDash: [8, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
    }
];
```

Before drawing, the code calls `growthChart.destroy()` on the old chart. Chart.js keeps a chart attached to its canvas, so if you create a new one on every slider move without destroying the old one, you get a memory leak and odd hover effects.

---

## Step 2: Moving the Math into the API (`fa77938`)

The app has two services (see [Part 4]({% post_url 2026-10-4-pf-04-dotnet-aspire-and-observability %})): `PersonalFinance.Web` (the MVC front end) and `PersonalFinance.ApiService` (the backend). The projection logic lived in Web, which meant nothing else could reuse it. Later the Dashboard and the AI Assistant both needed it, so this move paid off.

The refactor did three things:

1. Moved `NetWorthProjectionService` into ApiService and added a `NetWorthController` with `POST /api/networth/calculate`.
2. Put the request and response DTOs (Data Transfer Objects, plain classes that cross the wire) into the `PersonalFinance.Shared` project, so both sides compile against the same types.
3. Added a [Refit](https://github.com/reactiveui/refit) interface in Shared. Refit generates an HTTP client from an interface, so the Web app calls the API like a normal C# method.

This is the contract in `PersonalFinance.Shared/Contracts/INetWorthApi.cs` (the save/load/delete methods came a bit later):

```csharp
public interface INetWorthApi
{
    [Post("/api/networth/calculate")]
    Task<NetWorthProjectionDto> CalculateProjectionAsync(
        [Body] NetWorthProjectionRequestDto request,
        CancellationToken cancellationToken = default);

    [Post("/api/networth/parameters")]
    Task<NetWorthParametersDto> SaveParametersAsync(
        [Body] NetWorthProjectionRequestDto request,
        CancellationToken cancellationToken = default);

    [Get("/api/networth/parameters")]
    Task<NetWorthParametersDto?> LoadParametersAsync(
        CancellationToken cancellationToken = default);

    [Delete("/api/networth/parameters")]
    Task DeleteParametersAsync(CancellationToken cancellationToken = default);
}
```

The API validates every request before computing. The validator in `ApiService/Validators/NetWorthProjectionValidator.cs` returns the first error message, or `null` if the request is fine:

```csharp
if (request.CurrentAge < 18 || request.CurrentAge > 100)
{
    return "Current age must be between 18 and 100.";
}

if (request.RetirementAge <= request.CurrentAge)
{
    return "Retirement age must be greater than current age.";
}

if (request.BaseRoi < 0 || request.BaseRoi > 50)
{
    return "Base ROI must be between 0% and 50%.";
}
```

The same ranges appear as `[Range]` attributes on the Web view model, so the user sees errors before the request leaves the browser. The API check is the one that counts, because anyone can call an API directly.

The request flow now looks like this:

```text
Browser (slider moves)
   |  debounced fetch: GET /Networth/Calculate?startingBalance=...&baseRoi=...
   v
Web: NetworthController.Calculate
   |  INetWorthApi.CalculateProjectionAsync(request)   <-- Refit client
   v
ApiService: POST /api/networth/calculate
   |  NetWorthProjectionValidator.Validate  --> 400 with message
   |  NetWorthProjectionService.ComputeProjection
   v
JSON: { fiTarget, base, conservative, aggressive }  --> Chart.js redraws
```

The browser doesn't call the API on every input event. `networth-api.js` waits for a short pause (a **debounce**) and then sends one request.

---

## Step 3: Presets, Sliders, and Randomize

Typing ten numbers is slow, so the next two commits made the page easier to play with.

**Sliders** (`ee0c01e`) replaced the number boxes. Each field has a range slider and a text box that stay in sync. A savings-rate bar changes color with the share of income you save.

**Presets** fill all ten fields at once with a named scenario: FIRE, Coast FI, Traditional, Ultra, and Conservative. ("FIRE" means Financial Independence, Retire Early. "Coast FI" means you've saved enough that growth alone will reach your target by retirement age.) Each preset is just an object, and they all go through one `applyPreset` function in `networth-presets.js`:

```javascript
fire: {
    nwStartingBalance: 50000,
    nwAnnualSavings: 85000,
    nwAnnualIncome: 150000,
    nwAnnualSpending: 35000,
    nwCurrentAge: 28,
    nwRetirementAge: 45,
    nwBaseRoi: 8.0,
    nwConservativeRoi: 5.0,
    nwAggressiveRoi: 12.0,
    nwAggressiveSavings: 120000
},
```

**Randomize** (`35c0d2c`) generates a realistic scenario and feeds it to the same `applyPreset`. The useful trick is to generate values **relative to each other** rather than independently. A random savings amount that is larger than a random income would make no sense, so savings is derived from income, and the return rates are stacked so Conservative < Base < Aggressive:

```javascript
const annualIncome = randomInt(40000, 250000);
const savingsRate = randomFloat(0.10, 0.50, 2); // 10% to 50% savings rate
const annualSavings = Math.round(annualIncome * savingsRate / 1000) * 1000;

const currentAge = randomInt(22, 55);
let retirementAge = currentAge + randomInt(10, 35);
if (retirementAge > 80) { retirementAge = 80; }

const conservativeRoi = randomFloat(3.0, 7.0, 1);
const baseRoi = conservativeRoi + randomFloat(0.5, 3.0, 1);
const aggressiveRoi = baseRoi + randomFloat(1.0, 5.0, 1);
```

Because randomized values always pass validation, the button never produces an error state.

Later that evening (`07bc3ba`) the single `networth.js` file had grown to about 1,170 lines, so I split it into modules under `wwwroot/js/networth/`: `utils`, `sliders`, `api`, `charts`, `presets`, `ui`, and a small `networth.js` that wires them together.

---

## Step 4: Saving Parameters (`2d086b5`, `ec6e5c7`)

To remember each user's numbers, I added a `NetWorthParameters` entity with one row per user (a unique index on `UserId`). The first version (`2d086b5`) had the Web controller talking to the database directly. A few hours later, `ec6e5c7` moved it behind the API, the same as the projection: an `INetWorthParametersService` in ApiService, and save/load/delete endpoints on the Refit interface. The Web project went back to having no database code for this feature.

### Decimal precision

The first migration created the money and percentage columns as `decimal(18,2)`. Two decimal places is fine for dollars, but these columns also hold return rates, and a rate like 7.125% would lose a digit. A follow-up migration, `UpdateNetWorthParametersDecimalPrecision`, widened all eight decimal columns to `decimal(18,4)`, and the EF Core configuration in `AppDbContext.cs` now states the precision explicitly:

```csharp
// Explicit precision for decimal properties to avoid silent truncation warnings
const int decimalPrecision = 18;
const int decimalScale = 4;
entity.Property(e => e.StartingBalance).HasPrecision(decimalPrecision, decimalScale);
entity.Property(e => e.AnnualSavings).HasPrecision(decimalPrecision, decimalScale);
entity.Property(e => e.BaseRoi).HasPrecision(decimalPrecision, decimalScale);
// ...the other five decimal columns
```

If you don't set precision on a `decimal` property, EF Core warns you that SQL Server will use a default and may silently truncate values. Setting it explicitly removes the guesswork.

---

## Step 5: Reset Should Not Delete Anything (ADR 0003)

The "Reset to Defaults" button from `bebeed4` had a nasty second job. It reset the sliders **and** submitted a form that called `DeleteParameters`, which soft-deleted the saved row. Anyone who clicked Reset expecting "undo my experiments" would lose their saved numbers.

The fix (`91426f4`, issue #40) is written up as an ADR (Architecture Decision Record, a short document that records a decision and why it was made) in `docs/adr/0003-networth-reset-randomize-frontend-only.md`. The key idea is that **Reset and Randomize are exploration tools**, and exploration should never touch stored data:

| Action | What it does | Touches the database? |
|---|---|---|
| Randomize | Fills sliders with a random scenario | No |
| Reset to saved | Restores the values the page loaded with | No |
| Clear saved parameters | Deletes the saved row, after a `confirm()` dialog | Yes |

"Reset to saved" doesn't need an API call. When the page loads, the code copies the initial slider values (your saved numbers, or the defaults) into a JavaScript cache, and Reset reads from it:

```javascript
function resetToSaved () {
    const cached = window.NW.getSavedValuesCache && window.NW.getSavedValuesCache();
    if (cached && Object.keys(cached).length > 0) {
        applyPreset(cached);
        return;
    }
    // Fallback to the server's NetWorthDefaults (rendered into the page) if no cached values
    const defaults = window.nwDefaultParameters;
    if (!defaults) {
        return;
    }
    if (window.NW.showResetMessage) {
        window.NW.showResetMessage('No saved parameters, using defaults.');
    }
    applyPreset({ nwStartingBalance: defaults.startingBalance, /* ...nine more fields */ });
}
```

The destructive action is still there, but it sits in a dropdown, in red text, behind a confirmation. The ADR also lists the trade-off: if you save in another tab, this tab's cache is stale until you reload.

---

## Step 6: One Mapping, One Set of Defaults (`68a75d0`, `876f308`)

Ten days later I came back to clean up, and found the same ten fields copied all over the codebase. The commit message says it plainly: there were **eight copies of the ten-field mapping** between the entity, the request DTO, the response DTO, and the view model. Every new parameter would need eight edits, and missing one would be a silent bug.

The project doesn't use AutoMapper (ADR 0001 favors plain, explicit code), so the fix was to write the mapping **once** per direction. In ApiService, `NetWorthParametersMapping.cs` holds three extension methods: `ToProjectionRequest()`, `ToDto()`, and `Apply()`. In Web, the view model got `ToProjectionRequest()` and `ApplySaved()`. The Web `Calculate` action now binds the whole view model instead of taking ten separate parameters.

Hand-written mappings are easy to read but easy to forget. So I added a test that uses reflection to list every property on the request DTO, fills an object with distinct values, maps it, and checks that each property survived. From `tests/.../NetWorth/NetWorthMappingAndMetricsTests.cs`:

```csharp
private static readonly string[] ParameterNames = typeof(NetWorthProjectionRequestDto)
    .GetProperties(BindingFlags.Public | BindingFlags.Instance)
    .Select(p => p.Name)
    .ToArray();

[Fact]
public void WebViewModel_RoundTripsEveryParameter()
{
    var saved = WithDistinctValues(new NetWorthParametersDto());
    var model = new NetWorthViewModel();

    model.ApplySaved(saved);

    AssertSameParameters(saved, model.ToProjectionRequest());
}
```

Add an eleventh parameter and forget one mapping, and this test fails.

The same commit fixed two more "copies" problems:

- **Defaults**: the JavaScript Reset fallback had its own hardcoded numbers, and they didn't match the C# defaults. Now `PersonalFinance.Shared/Constants/NetWorthDefaults.cs` is the only source. The view serializes it into the page as `window.nwDefaultParameters`, and the JavaScript reads that.
- **Savings Rate**: the page showed a hardcoded percentage in the HTML until JavaScript replaced it. Worse, "savings rate" meant two different things in the app. The GLOSSARY now defines two terms, and `FinanceMetrics` computes both:

```csharp
// Savings Rate: planned savings from the Net Worth parameters
public static decimal? SavingsRatePercent(decimal annualSavings, decimal annualIncome)
{
    return annualIncome > 0m ? Math.Round(annualSavings / annualIncome * 100m, 1) : null;
}

// Actual Savings Rate: what was really left over in budget months
public static decimal ActualSavingsRatePercent(decimal actualIncome, decimal actualExpenses)
{
    return actualIncome > 0m
        ? Math.Round((actualIncome - actualExpenses) / actualIncome * 100m, 1)
        : 0m;
}
```

A follow-up, `876f308`, changed the Actual Savings Rate from `double` to `decimal` everywhere it appears, so both rates use the same type and the same "no income" rule.

---

## Gotchas and Lessons Learned

**1. A "not found" that looks like data.** When a user has no saved parameters, the API's `LoadParameters` returns `200 OK` with an empty `NetWorthParametersDto` (all zeros), not `404`. The Web controller applied it anyway, which set the current and retirement ages to zero, values the API's own validator rejects. The fix in `fe6d778` was a guard:

```csharp
// Only apply saved values if they represent real data (not a blank DTO with all zeros)
if (saved != null && saved.CurrentAge > 0 && saved.RetirementAge > 0)
{
    model.ApplySaved(saved);
}
```

The guard works, but the root cause is the API contract. If I were starting over, "nothing saved" would be a `204` or a `null`, not a blank object.

**2. Reset deleted saved data.** A button named "Reset" deleted a database row. Destructive actions should have their own clear label and a confirmation. Exploration buttons should be safe to click. ADR 0003 now records this rule.

**3. Copies drift.** The JavaScript defaults and the C# defaults had different numbers, and nobody noticed because each copy looked correct on its own. Any value that appears in two places will eventually disagree. Render it from one place, or write a test that checks they match.

**4. One word, two meanings.** "Savings Rate" meant planned savings on one page and actual leftover income on another. Giving each a GLOSSARY entry and its own function stopped them from being mixed up.

**5. A failed load must not show defaults.** Later (`aab0409`), I realized that if the API call failed, the page showed the **default** parameters. A user could think those were their numbers and click Save, overwriting their real data. Now a failed load shows an "Unavailable State" with a retry link instead. [Part 9]({% post_url 2026-10-17-pf-09-budget-tracker-two-data-sources %}) covers that pattern in more detail.

**6. A whole feature in a day means a long tail.** The first version shipped on October 11. The Reset fix came on October 18 and the mapping cleanup on October 21. Shipping fast was worth it, but the clean-up was real work.

---

## Recap

- The projection is a simple loop: each year, `ending = start + savings + start × ROI`. The FI Target is annual spending × 25 (the 4% rule).
- Moving the math into ApiService behind a Refit interface and shared DTOs let the Dashboard and AI Assistant reuse it later.
- Presets and Randomize share one `applyPreset` function. Randomize keeps values realistic by deriving them from each other.
- Reset and Randomize are frontend-only. Deleting saved data is a separate, confirmed action (ADR 0003).
- One mapping, one set of defaults, and a reflection test that catches a forgotten field.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 5: Deploying to Azure Container Apps]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %}) · Next: [Part 7: Adding an AI Assistant]({% post_url 2026-10-14-pf-07-ai-assistant %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
