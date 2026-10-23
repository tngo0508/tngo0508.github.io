---
layout: single
title: "Building a Personal Finance App, Part 12: Building with AI Coding Agents"
date: 2026-10-21
show_date: true
toc: true
toc_label: "Working with Agents"
classes: wide
categories: Personal-Finance-App
tags:
  - .NET
  - AI Agents
  - Claude Code
  - Junie
  - Developer Workflow
  - Git
---

Most of this app was written with AI coding agents at the keyboard and me in the reviewer's chair. This post is about *how* that worked: the files the agents read, the skills and tools I gave them, how I ran several at once, and how I reviewed their output. I'll also cover where it went wrong, because some of the most useful lessons came from agent mistakes that made it into `main`.

**In this post you'll learn:**

- How to write an `AGENTS.md` that agents actually follow (hint: keep it short)
- How a glossary and ADRs give humans and agents the same vocabulary
- How modular skills, MCP servers and git worktrees fit into a day-to-day workflow
- How I used numbered PR series and "address code-review findings" commits as a review loop
- The failure modes I hit (invented data, stale configs, green tests on broken code) and the guardrails I added

---

## The Problem

I used two agents on this project:

- **Junie** (JetBrains' coding agent), from Oct 11. Its config lives in `.junie/`.
- **Claude Code** (Anthropic's CLI agent), from Oct 16. Its config lives in `.claude/`.

You can see both in the history through `Co-authored-by` trailers. Of the 367 commits in the repo, 124 carry a Junie trailer and 105 carry a Claude one. Some carry both, from sessions where one agent picked up the other's work.

An agent starts every session with no memory of the last one. So the real problem wasn't "how do I get an agent to write code". It was:

1. How does a fresh agent learn the project's rules, layout and vocabulary quickly?
2. How do I stop it from confidently doing the wrong thing?
3. How do I review a lot of generated code without rubber-stamping it?

Everything below is an answer to one of those three questions.

---

## AGENTS.md: The Always-Loaded Rules

`AGENTS.md` at the repo root is a file agents read at the start of every session. (Junie reads its own copy at `.junie/AGENTS.md`.) It's the closest thing an agent has to onboarding.

### Version 1 was too long

My first `AGENTS.md` tried to hold everything: coding standards, architecture, git worktree rules, changelog format, JavaScript style. By Oct 18 it was 823 lines. That caused two problems:

- It used up a big chunk of the agent's context before it had read any code.
- Important rules were buried in detail, so they got skipped.

Commit `ef42c60` (#68) cut it to 84 lines and moved the full standards into `docs/CODING_STANDARDS.md`. The new file only holds rules that apply to *every* task, plus pointers to the rest. It opens with how to check your work:

```markdown
## Verify your work

- **C#:** `dotnet test PersonalFinance.sln`
- **JavaScript:** `npm run lint` (auto-fix: `npm run lint:fix`). Never call `eslint` directly: the repo
  pins ESLint 8 inside this script, and a bare `eslint` (v9+) cannot read `.eslintrc.js`.
- **E2E (Playwright):** needs a running database, Web app and ApiService. Run `npm run e2e:preflight` first.
- Never claim something works unless you ran the check. If a check is blocked, say exactly why.
```

That last line is the most valuable sentence in the file. Without it, agents would sometimes report "all tests pass" after editing code and running nothing.

The rest of the file is a "where things live" table, short architecture and data rules, and a done checklist. The checklist turns house rules into steps an agent can tick off:

```markdown
## Done checklist (every feature or fix)

1. Tests added or updated, `dotnet test` and `npm run lint` run.
2. **Bump `AppVersion`** in `PersonalFinance.Shared/Constants/AppVersion.cs` (SemVer: patch = fix,
   minor = feature, major = breaking or schema migration).
3. **Add a `CHANGELOG.md` entry** under `## [Unreleased]` in the right category.
4. Keep the change focused: no unrelated refactoring, no leftover TODOs or debug code.
5. Final report: what was implemented, files changed, DB changes, exact commands run and results.
```

This is why nearly every commit in the repo bumps the version and adds a CHANGELOG entry. The agents did it because the checklist said so.

**Tip:** Put rules in `AGENTS.md` only if they apply to every task. Everything else goes in a linked doc the agent reads when it's relevant.
{: .notice--info}

---

## Shared Vocabulary: GLOSSARY.md and ADRs

Agents love synonyms. Ask for "savings rate" in one session and you might get `SavingsPercentage`, `SaveRate` and `savingsRatio` across three files. Two documents fixed this.

**`GLOSSARY.md`** defines the project's terms, both technical and domain:

```markdown
### Service
A class that owns business logic and data access coordination for a feature. Injected directly into
controllers via dependency injection, containing domain rules, validation, and database operations.
Services live in `PersonalFinance.ApiService/Services/`.

### Soft Delete
A pattern where entities are marked as deleted (`IsDeleted = true`) instead of being removed from the
database. EF Core global query filters automatically exclude soft-deleted records from normal queries.
```

It pays off in review. One review fix (commit `ce09f3e`) relabelled budget-month figures as "Actual savings rate", citing the glossary: plain "Savings Rate" means the *planned* figure used by Net Worth. Two different numbers had been sharing one name.

**ADRs** (Architecture Decision Records) in `docs/adr/` record decisions *and the options that were rejected*. That second part matters for agents. An agent that sees `X-User-Id` headers might "helpfully" add an `X-User-Roles` header too. ADR 0004 says that was considered and rejected, and why:

```markdown
## Considered Options

- **`X-User-Roles` header:** rejected. When ApiService is public, anyone can make themselves Admin.
- **`[Authorize(Roles = "Admin")]` everywhere:** rejected. Restrictive roles (ReadOnly) would mean
  editing every controller instead of one policy definition.
```

`docs/agents/domain.md` tells the skills to read the glossary and relevant ADRs before exploring, to use glossary terms in issue titles and test names, and to flag any change that conflicts with an ADR.

---

## Modular Skills

A **skill** is a folder with a `SKILL.md` file describing one kind of task: when to use it and the steps to follow. The agent loads a skill only when the task calls for it. Think of `AGENTS.md` as the always-on rules and skills as playbooks pulled off the shelf.

Commit `c4f17c6` (Oct 14) added the first set under `.junie/skills/`:

| Skill | What it does |
|---|---|
| `code-review` | Reviews a diff on two axes: Standards (follows the repo's rules?) and Spec (does what the issue asked?) |
| `codebase-design` | Vocabulary for designing deep modules and clean seams |
| `diagnosing-bugs` | A structured process for hard bugs and performance regressions |
| `domain-modeling` | Builds the glossary and ADRs |
| `tdd` | Red-green-refactor loops and behavior-focused tests |

Many of these come from Matt Pocock's open-source `mattpocock/skills` repo. `skills-lock.json` records the source and a content hash for each imported skill, so you can tell what's upstream and whether it changed.

Here's the start of the code-review skill, which shows the shape of a good one: a precise description, then numbered steps.

```markdown
---
name: code-review
description: "Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes:
  Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match
  what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents..."
---

## Process

### 1. Pin the fixed point
Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against
the merge-base).
```

More skills followed: an Aspire deployment skill on Oct 16 (`cea875a`), and on Oct 21 commit `3e55cf7` copied the Junie skills into `.claude/skills/` so Claude Code could use the same playbooks (113 files).

---

## MCP Servers: Giving Agents Real Tools

**MCP** (Model Context Protocol) is a standard way to plug external tools into an agent: a browser, a cloud account, a docs search. Commit `bd94d2d` added Azure, GitHub and Microsoft Learn servers next to an existing Playwright one. Here is `.junie/mcp/mcp.json` as it stands now:

```json
{
    "mcpServers": {
        "Playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
        "azure": { "command": "npx", "args": ["-y", "@azure/mcp@latest", "server", "start"] },
        "github": { "url": "https://github.github.com/mcp" },
        "microsoft-learn": { "url": "https://learn.microsoft.com/mcp" }
    }
}
```

Each one fills a gap. Microsoft Learn lets the agent check current .NET and Azure docs instead of relying on memory. GitHub lets it read and file issues. Playwright lets it look at the page it just changed.

Note the "as it stands now". The first version listed different package names for Azure, GitHub and Learn, and they were swapped for the ones above four days later (in `91426f4`). Check an agent's config edits the same way you'd check its code.

---

## Git Worktrees for Parallel Agents

A **git worktree** is a second (or third...) working folder attached to the same repository, each on its own branch. Two agents in two worktrees can't trample each other's files, and they share one `.git` history.

Commit `b86a34e` (Oct 16) wrote the rules down for Junie:

```bash
# List all worktrees
git worktree list

# Add a new worktree with a new branch
git worktree add .worktrees/<name> -b <branch-name>

# Remove a worktree (clean)
git worktree remove .worktrees/<name>
```

The same evening, the Dashboard redesign ran as several agents in parallel. The redesign was split into numbered tickets ("Dashboard redesign tickets 04, 06, 07, 08" in the CHANGELOG commit), and each agent worked on a branch named `worktree-agent-<id>`, the naming Claude Code uses for sub-agents in isolated worktrees. The history shows the pattern:

```text
feature/homepage
   |\
   | +-- worktree-agent-ac69...  feat(dashboard): goals funded overview ...
   |\
   | +-- worktree-agent-a9f4...  (another ticket)
   |\
   | +-- worktree-agent-ad54...  (another ticket)
   |
   +-- merge each agent branch back, then:
   +-- 7452f44 fix(dashboard): address code-review findings on the homepage feature
```

Each agent branch first merged `feature/homepage` into itself to pick up its siblings' work, then merged back. Later, `1ba3d8e` added `.claude/worktrees/` to `.gitignore` so those folders never get committed.

Parallel agents are fast, but they're only safe when the tickets touch different files. The Dashboard worked because each ticket owned one section of the page.
{: .notice--warning}

---

## Reviewing: Numbered PR Series and Review Commits

### Big changes as a numbered series

On Oct 21 I did a large cleanup across the app. Instead of one giant PR, it went out as six numbered PRs, merged in order within about an hour:

| PR | Title |
|---|---|
| #81 | refactor(1/6): onboarding docs, shared build settings and analyzers, test folders |
| #82 | fix(security)(2/6): scope every ApiService request to the authenticated Account |
| #83 | refactor(3/6): make Web and ApiService Program.cs read as a feature list |
| #84 | refactor(4/6): split Google Drive ingestion and stop inventing budget data |
| #85 | fix(5/6): AI reads through the budget provider; restore notifications and search; one Web error translator |
| #86 | refactor(6/6): one Net Worth mapping and defaults; two named savings rates; review follow-ups |

Each PR is small enough to read in one sitting, has one theme, and builds on the previous one. If #84 had broken something, I could have stopped there with #81 to #83 already safe in `main`. Then #87 picked up the remaining review follow-ups.

### "Address code-review findings" commits

The other habit: after an agent finished a feature, a review pass produced a list of findings, and a separate commit fixed them. Searching the history for "address ... review" turns up nine of these. They're worth reading because they show what reviews actually catch. From `7452f44`, the Dashboard review:

```text
- Progress to FI label and aria text are floored so they never read 100% early.
- Goals funded caps each goal at its target before summing (database-side).
- FI Target comes from NetWorthProjectionService.ComputeProjection (no duplicate 25x).
- Dashboard DTOs defined once in PersonalFinance.Shared/DTOs/Dashboard.
- Service returns exactly the five recent activity items, deterministic order.
```

Those are real bugs: a progress bar that could say 100% before you got there, a total that over-counted over-funded goals, and a duplicated formula waiting to drift. None of them would fail a typical unit test, because the code did what its author meant. The author just meant the wrong thing.

Keeping fixes in their own commit has a side benefit: the history shows what the first draft got wrong, which is how I'm able to write this section.

---

## Gotchas and Lessons Learned

**1. Agents invent plausible data when real data is missing.** This was the scariest failure. The first Dashboard (it landed inside `cea875a`, a 95-file commit whose title only mentions an Aspire skill) had a "net worth trend" chart. The app stores no net worth history, so the chart made one up:

```javascript
series: [{
    name: 'Net Worth',
    data: [@Model.NetWorth.CurrentNetWorth, @((decimal)(Model.NetWorth.CurrentNetWorth * 1.05M)),
           @((decimal)(Model.NetWorth.CurrentNetWorth * 1.1M)), /* ... */ ]
}],
xaxis: {categories: ['1Y ago', '8mo', '6mo', '4mo', 'Now']},
```

It looked great. It was fiction. Commit `1fed286` removed it the same day. A bigger version showed up in #84: when a Google Sheet couldn't be read, the reader returned a seeded 12-month budget that looked real, and a sync **saved it**, so it fed Analysis, the Dashboard and the AI Assistant. The parser also copied one month's totals into empty months. The fix returns an "unavailable" report with the reason instead. In a finance app, an honest empty state beats a convincing fake every time.

**2. Big agent commits hide things.** That fabricated chart rode in on a commit titled "introduce Aspire deployment skill". Nobody reviewing that title would look for a dashboard. Ask agents for one theme per commit, and read the `--stat` before you trust the message.

**3. Green tests, broken feature.** Global Search passed every test and failed every search in production (Part 11 has the details). The retro (commit `48b3977`, "add agent guardrails from the Global Search retro") didn't add more prose to `AGENTS.md`. It added a test helper that checks queries against Azure SQL, ESLint rules for the JavaScript conventions that `search.js` broke, and it *removed* JS style rules from `AGENTS.md` because ESLint now enforces them. **If a rule matters, make a tool enforce it. Prose rules are suggestions.**

**4. An agent-written plan can confidently pick the wrong direction.** The Oct 16 spec in `.junie/plans/architecture-consistency-spec.md` standardized every feature on CQRS with MediatR. That was reversed: the app now uses direct service injection, and MediatR is on the banned list for licensing reasons (see Part 8). The agent made a clean case for a choice I didn't actually want. Read the "Solution" section of any plan before saying "go".

**5. Copies drift.** `AGENTS.md` and `.junie/AGENTS.md` started identical. Today they differ: the root file mentions the ADR 0005 purge exception and the InMemory translation warning, the Junie copy doesn't. The same risk applies to `.junie/skills` and `.claude/skills`. If you support two agents, generate one config from the other, or check in CI that they match.

**6. Keep agent config changes from triggering deploys.** The workflow's `paths-ignore` skips `.junie/**`, `.claude/**` and `**/*.md`. Tweaking a skill shouldn't redeploy production.

**7. Structure the issue tracker for agents.** `docs/agents/issue-tracker.md` tells agents to use the `gh` CLI and the project board, and `docs/agents/triage-labels.md` maps five triage roles to label names:

| Label | Meaning |
|---|---|
| `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | Requires human implementation |
| `wontfix` | Will not be actioned |

The `ready-for-agent` vs `ready-for-human` split is the useful part. It forces you to decide up front whether a ticket is specified well enough to hand off.

### Tips you can copy

- Start `AGENTS.md` with **how to verify** and "never claim it works unless you ran the check".
- Keep `AGENTS.md` under ~100 lines; link out to the details.
- Write a glossary early. It's cheaper than renaming things later.
- Record rejected options in ADRs, so agents don't "rediscover" them.
- Turn every repeated review comment into a test, a lint rule or an analyzer.
- Fix review findings in their own commit, so the history shows what the first draft got wrong.
- Run parallel agents in worktrees, one ticket per agent, tickets that touch different files.

---

## Recap

- Agents start every session cold. `AGENTS.md`, `GLOSSARY.md` and ADRs are how they learn the project, and short beats complete.
- Skills are on-demand playbooks; MCP servers are tools; worktrees let several agents work at once without collisions.
- Review is still the human's job. Numbered PR series and separate "address review findings" commits made it manageable and auditable.
- The worst agent failures were confident ones: invented chart data, a seeded fake budget, a plan that picked the wrong architecture.
- The durable fix for an agent mistake is almost never more prose. It's a test, a linter rule or a CI gate.

---

**Series:** [Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · Previous: [Part 11: Testing and Quality Gates]({% post_url 2026-10-21-pf-11-testing-and-quality-gates %}) · Next: [Part 13: GDPR Data Export and Account Deletion]({% post_url 2026-10-22-pf-13-gdpr-data-export-and-account-deletion %})

Source code: [tngo0508/PersonalFinance](https://github.com/tngo0508/PersonalFinance)
