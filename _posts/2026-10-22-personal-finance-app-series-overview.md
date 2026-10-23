---
layout: single
title: "Building a Personal Finance App: Series Overview"
date: 2026-10-22
show_date: true
toc: true
toc_label: "Series Overview"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - ASP.NET Core
  - Azure
  - Architecture
  - Learning in Public
---

For about a month, from late September to late October 2026, I built a **Personal Finance app** from an empty solution to a deployed, multi-service .NET 10 application. It went through 367 commits and more than 50 merged pull requests. This series documents that work: what I built, why I built it that way, and what broke along the way.

I'm writing it for two reasons. It's an **archive** of my own decisions so future me can remember *why*, not just *what*. And it's a way to **learn in public**: if you're building something similar, I hope my notes save you a few of the mistakes I made.

**In this overview you'll find:**
- What the app does and the tech stack behind it
- The architecture in one picture
- A reading guide for all 13 parts
- How each post is structured, so you can skim or dive in

---

## What the App Does

The app helps you answer one question: *"Am I on track for financial independence?"* It does that with a handful of features:

| Feature | What it does |
|---|---|
| **Google Drive Explorer** | Connects a Google Drive folder and lists your budget spreadsheets |
| **Budget Report & Analysis** | Reads Google Sheets budgets and turns them into planned-vs-actual charts and savings rates |
| **Budget Tracker & Planner** | Lets you keep a monthly budget inside the app instead of a spreadsheet |
| **Net Worth Projection** | Projects your net worth year by year and estimates when you reach your FI target (4% rule) |
| **AI Assistant** | A chat widget that answers questions about your own budget data |
| **Dashboard** | Net worth, progress to FI, savings rate, goals, and recent activity on one page |
| **Account & Privacy** | Email confirmation, Google sign-in, admin roles, data export, and account deletion |

---

## The Tech Stack

| Area | Technology |
|---|---|
| Framework | .NET 10, ASP.NET Core MVC |
| Orchestration | .NET Aspire (service discovery, telemetry, dashboard) |
| Database | Azure SQL Database in production, SQL Server 2022 in Docker locally |
| ORM | Entity Framework Core (Code-First migrations) |
| Auth | ASP.NET Core Identity, Google OAuth 2.0, Brevo for email |
| Service-to-service | Refit typed HTTP clients with Polly resilience |
| Frontend | Bootstrap 5, Chart.js, DataTables, vanilla JS modules |
| Observability | OpenTelemetry, Serilog, health checks |
| Hosting | Docker, Azure Container Apps (scale to zero), Bicep IaC |
| CI/CD | GitHub Actions with Azure OIDC (no stored passwords) |
| Testing | xUnit, EF Core InMemory, WebApplicationFactory, Playwright |

---

## The Architecture in One Picture

The app is split into a UI project and an API project that talk over HTTP. It took me a few tries to get to this shape; Part 8 tells that story.

```text
                      Browser
                         │  cookie (ASP.NET Core Identity)
                         ▼
 ┌─────────────────────────────────────────┐
 │  PersonalFinance.Web  (MVC + Razor + JS) │
 │  thin controllers, view models           │
 └───────────────┬─────────────────────────┘
                 │  HTTP via Refit
                 │  X-User-Id + X-Internal-Key
                 ▼
 ┌─────────────────────────────────────────┐
 │  PersonalFinance.ApiService  (REST API) │
 │  Controllers → Validators → Services     │
 └───────────────┬─────────────────────────┘
                 │  EF Core
                 ▼
 ┌─────────────────────────────────────────┐
 │  PersonalFinance.Data  (DbContext,      │
 │  Entities, migrations) → Azure SQL       │
 └─────────────────────────────────────────┘

 PersonalFinance.Shared  → DTOs and Refit contracts, used by all
 PersonalFinance.AppHost → .NET Aspire, runs everything locally
```

---

## How to Read This Series

The parts follow the order things happened. Each one stands on its own, so feel free to jump to the topic you care about.

### Getting started (September)

| Part | Topic | You'll learn about |
|---|---|---|
| [Part 1]({% post_url 2026-9-20-pf-01-project-setup-and-google-drive %}) | Project Setup and the Google Drive Explorer | Solution setup, EF Core migrations, calling the Google Drive API, caching |
| [Part 2]({% post_url 2026-9-28-pf-02-parsing-budget-spreadsheets %}) | Turning Budget Spreadsheets into Reports | Parsing Google Sheets, XLSX vs CSV export, budget analytics |

### Making it real (early October)

| Part | Topic | You'll learn about |
|---|---|---|
| [Part 3]({% post_url 2026-10-3-pf-03-identity-email-and-google-sign-in %}) | Identity, Email Confirmation, and Google Sign-In | ASP.NET Core Identity, transactional email, OAuth, account linking |
| [Part 4]({% post_url 2026-10-4-pf-04-dotnet-aspire-and-observability %}) | .NET Aspire and Observability | AppHost, ServiceDefaults, OpenTelemetry, logging, secrets |
| [Part 5]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %}) | Deploying to Azure Container Apps | Docker, Bicep, GitHub Actions, the CI failures I fixed, keeping costs low |

### Features (mid October)

| Part | Topic | You'll learn about |
|---|---|---|
| [Part 6]({% post_url 2026-10-11-pf-06-net-worth-and-fi-planning %}) | Net Worth Projection and FI Planning | Compound growth, the 4% rule, Chart.js, saving user parameters |
| [Part 7]({% post_url 2026-10-14-pf-07-ai-assistant %}) | Adding an AI Assistant | OpenAI integration, tool calling, spend caps, grounding answers in user data |
| [Part 8]({% post_url 2026-10-16-pf-08-architecture-direct-services-over-cqrs %}) | Choosing Direct Services over CQRS | Why I dropped MediatR, layered architecture, soft deletes, license policy |
| [Part 9]({% post_url 2026-10-17-pf-09-budget-tracker-two-data-sources %}) | Budget Tracker and Two Data Sources | Data modeling with two sources, the provider pattern, culture bugs |

### Hardening (late October)

| Part | Topic | You'll learn about |
|---|---|---|
| [Part 10]({% post_url 2026-10-18-pf-10-rbac-and-account-isolation %}) | RBAC and Account Isolation | Roles vs policies, trusting service-to-service headers, per-account data scoping |
| [Part 11]({% post_url 2026-10-21-pf-11-testing-and-quality-gates %}) | Testing and Quality Gates | Convention tests, InMemory pitfalls, Playwright, zero-warning builds |
| [Part 12]({% post_url 2026-10-21-pf-12-building-with-ai-coding-agents %}) | Building with AI Coding Agents | AGENTS.md, skills, worktrees, review loops, guardrails |
| [Part 13]({% post_url 2026-10-22-pf-13-gdpr-data-export-and-account-deletion %}) | GDPR Data Export and Account Deletion | Right to erasure, grace periods, scheduled purge jobs |

---

## How Each Post Is Structured

Every part uses the same layout, so you always know where to look:

1. **In this post you'll learn**: a short list of what you'll learn.
2. **The Problem**: what I needed and the constraints I had.
3. **The build**: step-by-step sections with real (trimmed) code from the repo and the file paths where it lives.
4. **Gotchas and Lessons Learned**: the bugs, reversals, and "I wish I'd known" moments. If you only read one section, read this one.
5. **Recap**: the key takeaways in a few bullets.

Code snippets are taken from the actual repository and trimmed for readability. Secrets, keys, and personal data are always replaced with placeholders.
{: .notice--info}

---

## A Few Themes You'll See Again and Again

Looking back over the commit history, a few lessons kept coming up:

- **Write the decision down.** The project has Architecture Decision Records (ADRs) in `docs/adr/`. Several of them were amended later, and having the original reasoning written down made those changes much easier.
- **Never show made-up data.** More than once, a page showed defaults or invented numbers when real data was missing. The fix each time was an honest "Unavailable" state.
- **Let tests enforce the rules.** Rules like "every API controller needs `[Authorize]`" are enforced by convention tests, not just by memory.
- **Small PRs, fast feedback.** The deployment pipeline broke repeatedly in its first days. Each fix was its own small PR, which made each failure easy to understand.
- **Keep it cheap.** Scale-to-zero containers and a Basic-tier database kept the hosting bill small enough for a side project.

---

## Recap

- This is a 13-part, learn-in-public series about building a .NET 10 personal finance app from scratch.
- The parts follow the real timeline, from the first commit to GDPR-compliant account deletion.
- Each post includes real code, the reasoning behind decisions, and an honest section on what went wrong.
- Start with [Part 1]({% post_url 2026-9-20-pf-01-project-setup-and-google-drive %}), or jump to whatever topic you need right now.

If you have questions or spot something I could do better, leave a comment below. That's the whole point of learning in public.

---

**Series:** Overview · Next: [Part 1: Project Setup and the Google Drive Explorer]({% post_url 2026-9-20-pf-01-project-setup-and-google-drive %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
