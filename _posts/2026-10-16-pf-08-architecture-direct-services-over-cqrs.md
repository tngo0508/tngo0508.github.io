---
layout: single
title: "Building a Personal Finance App, Part 8: Choosing Direct Services over CQRS"
date: 2026-10-16
show_date: true
toc: true
toc_label: "Architecture Journey"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - Architecture
  - ASP.NET Core
  - EF Core
  - CQRS
  - ADR
---

This part is about architecture, and about changing my mind. In four days the app went from "controllers talk to the database" to CQRS with MediatR, then to a feature-folder reorganization, and then, on the same day I wrote it down as the standard, I reversed the decision and settled on plain service injection. I'll show what each step looked like in code, why I backed out, and the boring-but-useful rules that came out of it: strict layering, soft deletes, manual mapping, and a `Program.cs` that reads like a table of contents.

**In this post you'll learn:**

- What CQRS and MediatR are, and what they actually bought (and cost) in a small app
- How to record a decision, and its reversal, in an ADR (Architecture Decision Record)
- How to add audit fields and soft deletes to every user-owned table with one base class and EF Core global query filters
- How `Directory.Build.props`, central package management and analyzers keep a multi-project solution consistent

---

## The Problem

By mid-October the ApiService had grown fast, and it showed. Controllers such as `PersonalFinanceController` injected `AppDbContext` directly and did everything inline: load the row, create it if missing, copy ten fields by hand, save, log. Business rules lived in HTTP code, so they were hard to reuse and hard to test.

I wanted:

- **Thin controllers** that only bind requests and return status codes.
- **One obvious place** for business logic, so that adding a feature (by me or an AI coding agent) follows a repeatable recipe.
- **Only dependencies I can use for free, forever.** This is a personal project; surprise license fees are not an option.

---

## Step 1: Services, CQRS, MediatR and FluentValidation (Oct 12)

Commit `c7f0bfb` did two things at once, and it is worth separating them.

**First, it extracted services.** `BudgetService`, `SavingsGoalService`, `WatchlistService` and `CommunityService` were created, and the database code moved out of the controllers into them. `CommunityController` alone lost 463 lines and gained 38.

**Second, it put MediatR between the controllers and those services.** Some definitions:

- **CQRS** (Command Query Responsibility Segregation) splits operations into *commands* (change state) and *queries* (read state), each with its own class.
- **MediatR** is a library that implements the *mediator* pattern: the controller creates a command object and calls `_mediator.Send(...)`; MediatR finds the matching *handler* class and runs it.
- **FluentValidation** lets you write validation rules as classes (`RuleFor(x => x.Amount).GreaterThan(0)`) instead of attributes or `if` statements.

Here is the save-budget command from `Features/Budget/SaveBudgetCommand.cs`. Look at what the handler actually does:

```csharp
public sealed class SaveBudgetCommand : IRequest<Unit>
{
    public string UserId { get; set; } = string.Empty;
    public SaveBudgetRequestDto Request { get; set; } = new();
}

public sealed class SaveBudgetCommandHandler : IRequestHandler<SaveBudgetCommand, Unit>
{
    private readonly IBudgetService _budgetService;

    public SaveBudgetCommandHandler(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    public async Task<Unit> Handle(SaveBudgetCommand request, CancellationToken cancellationToken)
    {
        await _budgetService.SaveBudgetAsync(request.UserId, request.Request, cancellationToken);
        return Unit.Value;
    }
}
```

The handler forwards to the service and returns nothing. That is a whole class, plus a command class, to make one method call. The controller side looked like this:

```csharp
await _mediator.Send(new SaveBudgetCommand { UserId = userId, Request = request }, cancellationToken);
```

The same day I wrote `docs/CQRS_ARCHITECTURE.md` (`fc3fee5`), a nearly 500-line guide to the pattern, listing benefits such as "Reads and writes can be scaled independently." In an app with one database and one API container, that benefit was theoretical.

---

## Step 2: The Big Reorganization (Oct 16, morning)

By Oct 16 the code had two styles: Budget, Community, Savings Goals and Watchlist went through MediatR, while Net Worth, Google Drive and the AI Assistant (Part 7) called services directly. Commit `acc4aaf` tried to fix the inconsistency by going *all in*:

- Every feature moved into its own folder (`AiAssistant/`, `Budget/`, `NetWorth/`, ...) with `Commands/`, `Queries/`, `Services/` and `Validators/` inside.
- New commands were written for the AI Assistant, Google Drive and Net Worth.
- `GLOSSARY.md` was added with canonical terms.
- **ADR 0001** was written: "Standardize ApiService on CQRS with Feature-Based Organization". Its decision section read: "Every feature in the ApiService will use commands and queries sent through MediatR. Controllers will inject `IMediator` ... never call services directly."

An **ADR** is a short markdown file that records one architectural decision: the context, the decision and its consequences. It is the "why" that code cannot tell you.

The same commit also added something that survived everything that followed: `AuditableEntity` and soft deletes (Step 5).

---

## Step 3: The Reversal (Oct 16, afternoon and evening)

That afternoon, commit `a2b6727` removed the `MediatR` packages from `Directory.Packages.props` and deleted every command, query, handler and the validation pipeline behavior. At 19:51 commit `36ce67c` rewrote ADR 0001 to say the opposite of what it said that morning. The new title: *"Standardize ApiService on Direct Service Injection and Permissive Open-Source Licensing"*.

The ADR gives two main reasons, which I'll quote rather than paraphrase:

> 1. **Licensing constraints** — MediatR and AutoMapper transitioned to commercial licensing models (Lucky Penny Software / paid licensing). The project enforces a strict policy that all dependencies must use permissive open-source licenses (MIT, BSD, Apache 2.0).
> 2. **Unnecessary indirection** — MediatR and CQRS command/query handlers introduce unnecessary layers of indirection and boilerplate for the project's scale without clear benefits.

The decisions it records:

| Decision | What it means in practice |
|---|---|
| Direct service injection | Controllers inject `IBudgetService`, `INetWorthParametersService`, ... No mediator. |
| Permissive licenses only | MIT, BSD or Apache 2.0. MediatR and AutoMapper are banned by name. |
| Type-based folders | `Controllers/`, `Services/`, `Validators/` at the top of ApiService |
| DTOs by feature | `Shared/DTOs/NetWorth/`, `Shared/DTOs/Community/`, ... |
| `AuditableEntity` | Every user-owned entity gets audit fields and soft delete |
| Simple Web layer | Web controllers call Refit contracts; no CQRS there either |

The license rule also went into `AGENTS.md`, the instructions file AI coding agents read before they touch the repo:

```text
Only MIT, BSD (2/3-clause) and Apache 2.0 dependencies. Check the license before adding any
NuGet/npm package. **MediatR and AutoMapper are banned** (use direct DI and manual mapping).
No GPL/AGPL/copyleft, no paid or dual-licensed packages.
```

Writing it there matters: an agent asked to "add validation" or "map these DTOs" will otherwise reach for the most popular package.

### Before and after

Here is the same "save budget" endpoint in its two shapes. Before (Oct 12), the controller only knew about the mediator:

```csharp
public PersonalFinanceController(IMediator mediator)
{
    _mediator = mediator;
}

public async Task<IActionResult> SaveBudget([FromBody] SaveBudgetRequestDto request, CancellationToken cancellationToken = default)
{
    // ...
    await _mediator.Send(new SaveBudgetCommand { UserId = userId, Request = request }, cancellationToken);
    // ...
}
```

After, in today's `ApiService/Controllers/BudgetController.cs`, the controller asks for exactly what it uses, and you can press F12 on `SaveBudgetAsync` and land in the real code:

```csharp
public BudgetController(IBudgetService budgetService, SaveBudgetRequestValidator validator)
{
    _budgetService = budgetService;
    _validator = validator;
}

[HttpPost("budget")]
public async Task<IActionResult> SaveBudget([FromBody] SaveBudgetRequestDto request,
    CancellationToken cancellationToken = default)
{
    var validationResult = await _validator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
        return BadRequest(validationResult.Errors.Select(e => new { e.ErrorCode, e.ErrorMessage }));
    }

    var userId = User.GetUserId();
    await _budgetService.SaveBudgetAsync(userId, request, cancellationToken);
    // ...
}
```

Fewer files, explicit dependencies, and validation that visibly runs. FluentValidation itself stayed: it is Apache 2.0 licensed and the validators are useful. Only the mediator went.

---

## Step 4: Strict Layering

With the mediator gone, the rules for "where does code go" became the architecture. `docs/ARCHITECTURE.md` describes the request flow for a typical feature:

```text
Browser (wwwroot/js)
   |  POST + antiforgery token
   v
Web controller            -> builds view models, returns views/JSON
   |  Refit contract (Shared/Contracts/I<Feature>Api)
   |  HTTP + X-User-Id + X-Internal-Key
   v
ApiService controller     -> binds, validates, delegates to ONE service
   |
   +--> Validator (FluentValidation, no DB access)
   v
Service                   -> business rules, EF Core, manual mapping
   v
AppDbContext / Azure SQL
```

And, more useful still, a table of what each layer must *never* do:

| Step | Owns | Never does |
|---|---|---|
| Web controller | View models, views or JSON, antiforgery | Business rules, EF Core access, injecting ApiService services |
| Refit contract | The HTTP shape between Web and ApiService | Logic |
| ApiService controller | Binding, calling a validator, delegating to one service, status codes | Business rules or queries |
| Validator | FluentValidation rules for one request DTO | Database access |
| Service | Business rules, EF Core reads and writes, mapping entities to DTOs by hand | HTTP concerns |

Web never references the ApiService project; it only talks to it over HTTP. That single HTTP boundary is also where the account-isolation work in Part 10 plugs in.

The doc ends with an **add-a-feature checklist** that both I and AI agents follow: entity (inherit `AuditableEntity` if user-owned) and migration, DTOs, service and its registration, validators, ApiService controller with `[Authorize]`, Refit contract, Web controller and view, tests, then a version bump and changelog entry. Having it written down turned "how should I structure this?" into "which step am I on?".

---

## Step 5: AuditableEntity, Soft Deletes and Global Query Filters

This is the part of the Oct 16 reorganization that I kept unchanged. Every entity that belongs to a user inherits one base class, `PersonalFinance.Data/Entities/AuditableEntity.cs`:

```csharp
public abstract class AuditableEntity
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}
```

A **soft delete** marks a row as deleted instead of removing it. That makes accidental deletes recoverable and keeps an audit trail. The risk is obvious: every query must now remember to skip deleted rows. EF Core's **global query filters** remove that risk. In `AppDbContext.OnModelCreating`, each entity gets a filter that is added to every LINQ query automatically:

```csharp
// Global query filters for soft deletes — automatically exclude soft-deleted records
builder.Entity<NetWorthParameters>().HasQueryFilter(e => !e.IsDeleted);
builder.Entity<SavingsGoal>().HasQueryFilter(e => !e.IsDeleted);
builder.Entity<UserBudgetAllocation>().HasQueryFilter(e => !e.IsDeleted);
builder.Entity<CommunityStory>().HasQueryFilter(e => !e.IsDeleted);
// ... one line per user-owned entity
```

Now `_dbContext.SavingsGoals.Where(g => g.UserId == userId)` never returns deleted goals, and deleting is just `goal.SoftDelete()` followed by `SaveChangesAsync()`. The columns arrived in the `AddAuditableEntityAndSoftDeletes` migration. (Part 13 builds on this: account deletion first soft-deletes everything with one shared `DeletedAt` stamp, then a job purges it for real.)

---

## Step 6: Manual Mapping Instead of AutoMapper

With AutoMapper banned, entities are mapped to DTOs by hand. The trick that keeps that from turning into copy-paste is to write each mapping **once**, as extension methods. `ApiService/Services/NetWorthParametersMapping.cs` is a good example:

```csharp
/// The one hand-written mapping between the saved Net Worth parameters and their DTOs (ADR 0001: no AutoMapper).
/// A new parameter is added here, not in each reader.
public static class NetWorthParametersMapping
{
    public static NetWorthParametersDto ToDto(this NetWorthParameters parameters)
    {
        return new NetWorthParametersDto
        {
            StartingBalance = parameters.StartingBalance,
            AnnualSavings = parameters.AnnualSavings,
            AnnualIncome = parameters.AnnualIncome,
            // ... seven more fields
            UpdatedAtUtc = parameters.UpdatedAt ?? parameters.CreatedAt
        };
    }
}
```

According to the changelog, this file and a matching pair on the Web side replaced eight hand-written copies of the ten-field mapping, and a test fails if a parameter is missed. Manual mapping is more typing than AutoMapper, but a missing field is a compile-time or test-time problem, not a runtime surprise, and "Go to definition" always works.

---

## Step 7: Program.cs as a Feature List (Oct 21)

Startup files grow by accretion: every feature adds a few `AddScoped` lines, and soon `Program.cs` is 200+ lines nobody reads. Commit `b9d5591` moved the details into named extension methods, one per feature, in `ApiService/Infrastructure/FeatureServiceExtensions.cs`. The ApiService `Program.cs` now reads like a table of contents:

```csharp
// Features (Infrastructure/FeatureServiceExtensions.cs).
builder.Services
    .AddBudgetFeature()
    .AddGoogleDriveFeature()
    .AddNetWorthFeature()
    .AddDashboardFeatures()
    .AddFeedbackFeature()
    .AddPersonalDataFeature()
    .AddAdminFeature()
    .AddAiAssistantFeature(builder.Configuration);
```

Each method is short and documented, for example:

```csharp
/// <summary>Net Worth parameters and projections.</summary>
public static IServiceCollection AddNetWorthFeature(this IServiceCollection services)
{
    services.AddScoped<INetWorthParametersService, NetWorthParametersService>();
    return services;
}
```

On the Web side, the same commit replaced ten copy-pasted Refit client registrations with one `AddInternalApiClients` helper, and added a test that fails if a contract is not registered. The ApiService `Program.cs` diff was 24 lines added and 150 removed.

---

## Step 8: Directory.Build.props, Central Packages and Analyzers

The last piece is build hygiene. **Central package management** was there from the first commit: `PersonalFinance/Directory.Packages.props` sets `ManagePackageVersionsCentrally` and holds every NuGet version in one place, so projects reference packages without versions and can never drift apart.

Commit `d3dc92a` did the same for build settings. `PersonalFinance/Directory.Build.props` is picked up automatically by MSBuild for every project below it:

```text
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>

    <!-- Code-quality analyzers and .editorconfig style rules run during build. -->
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>

    <TreatWarningsAsErrors Condition="'$(EnforceWarningsAsErrors)' == 'true'">true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

Each `.csproj` lost its copy of those three lines. A root `.editorconfig` holds the style rules, and the analyzers report problems as build warnings. Warnings-as-errors started out **opt-in** (`-p:EnforceWarningsAsErrors=true`) "until the existing count reaches zero", which is a practical way to switch on analyzers in an existing codebase without stopping all work. Once the count reached zero, the deploy workflow started passing the flag, so any new warning now fails CI.

---

## Gotchas and Lessons Learned

**1. Extracting services was the real win; the mediator was not.** Looking back at `c7f0bfb`, almost all the value came from moving database code out of controllers into services. The MediatR handlers just forwarded to those services. If your handlers are one-line pass-throughs, the pattern is costing you files and "Go to definition" jumps without giving anything back.

**2. The validation pipeline never ran.** `ValidationBehavior<TRequest, TResponse>` was a MediatR pipeline behavior meant to run FluentValidation on every command. But `Program.cs` only called `AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>())` and `AddValidatorsFromAssemblyContaining<Program>()`. I can find no registration of the behavior itself in any of those commits, and MediatR does not discover pipeline behaviors on its own here. So the behavior class existed, was moved to a new folder during the reorganization, and was then deleted, apparently without ever validating anything. Today's explicit `_validator.ValidateAsync(...)` call in the controller is boring, and it visibly runs.

**3. I wrote an ADR in the morning and reversed it in the evening.** That is fine; ADRs are cheap, and rewriting one is better than leaving a wrong one in place. But be honest about the history. The rewritten ADR says "the codebase never actually adopted CQRS or MediatR", while the history shows MediatR handlers in Budget, Community, Savings Goals and Watchlist for four days. Next time I would mark the first ADR *Superseded* and add a new one, so the reversal is visible to readers. The file name, `0001-standardize-cqrs-feature-organization.md`, still says the opposite of what the file now decides.

**4. A big change hid inside an unrelated commit.** The commit that removed MediatR and every handler is titled "feat: enhance Budget Planner UI and improve API case sensitivity handling". Anyone searching the log for "MediatR" would not find it by title. One concern per commit makes history searchable.

**5. Stale docs outlived the code.** `docs/CQRS_ARCHITECTURE.md` described a pattern that was gone by Oct 16 but was only deleted on Oct 21 (`fc5279f`). For AI coding agents a stale doc is worse than none: they will follow it.

**6. Read the migration EF generates.** In `AddAuditableEntityAndSoftDeletes`, EF Core decided that the `SavingsGoals` table's old `UpdatedAtUtc` column should be *renamed* to `CreatedAt` and that the old `CreatedAtUtc` column should be dropped:

```csharp
migrationBuilder.DropColumn(
    name: "CreatedAtUtc",
    table: "SavingsGoals");

migrationBuilder.RenameColumn(
    name: "UpdatedAtUtc",
    table: "SavingsGoals",
    newName: "CreatedAt");
```

EF guesses renames from column shapes. Here the guess means existing goals lose their original creation time and get their last-update time instead. That is why "Inspect the generated migration before committing" is an explicit step in the add-a-feature checklist.

**7. Shared build files must be in the Docker build context.** After `TargetFramework` moved into `Directory.Build.props`, both Dockerfiles still copied only `Directory.Packages.props`, so `dotnet restore` inside the image saw no target framework and failed with `NETSDK1013`. The fix (`9f6b697`) copies both shared files, and a test now fails if either Dockerfile stops doing so.

**8. Explicit is not always better: the user-secrets reversal.** On Oct 17 I added explicit `AddUserSecrets` calls for Development. The Program.cs cleanup removed them again: `CreateBuilder` already loads user secrets in Development, and re-adding them put secrets *above* environment variables, changing configuration precedence.

---

## Recap

- CQRS and MediatR are tools for specific problems. In a small app, one-line handlers were indirection without benefit, and a license change made the decision final.
- ADRs record the *why*. Reversing one is normal; make the reversal visible.
- Strict layering (Web, then Refit, then ApiService controller, then service, then data), plus a "never does" table and a checklist, gives humans and AI agents one obvious place for each piece of code.
- `AuditableEntity` plus global query filters gives every user-owned table audit fields and safe soft deletes for free.
- Hand-written mappings in one place, a feature-list `Program.cs`, and shared build settings keep the codebase easy to read and hard to drift.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 7: Adding an AI Assistant]({% post_url 2026-10-14-pf-07-ai-assistant %}) · Next: [Part 9: Budget Tracker and Two Data Sources]({% post_url 2026-10-17-pf-09-budget-tracker-two-data-sources %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
