---
layout: single
title: "GitHub Actions for Beginners: Your First Workflow, Step by Step"
date: 2026-10-25
show_date: true
toc: true
toc_label: "GitHub Actions Basics"
toc_sticky: true
classes: wide
categories:
  - DevOps
  - .NET
tags:
  - GitHub Actions
  - CI/CD
  - .NET 10
  - Beginner
  - DevOps
---

This is a beginner tutorial for GitHub Actions. We start from zero and build a small workflow that tests a .NET project every time you push code. I use short sentences and simple words, and I explain every new word the first time it appears. You don't need any DevOps experience.

> **Reading order:** this post is **Part 1** (the basics). When you finish it, continue with [Part 2: Building a CI/CD Pipeline with GitHub Actions]({% post_url 2026-10-25-github-actions-cicd-pipeline-dotnet-azure %}), which shows a full real-world pipeline that deploys to Azure.

{% raw %}

**What you will learn:**

- What GitHub Actions is, and what CI/CD means
- The 5 main words: **workflow**, **event**, **job**, **step**, **runner**
- How to write your first workflow file
- How to build and test a .NET project automatically
- How to read the logs and fix a failed run
- Useful features: manual runs, variables, secrets, conditions, job order, matrix, cache

---

## 1. What Is GitHub Actions?

**GitHub Actions** is a tool inside GitHub that **runs commands for you automatically** when something happens in your repository.

For example:

- You **push** code → GitHub builds your project and runs your tests.
- You open a **pull request** → GitHub checks that nothing is broken.
- You **merge** to `main` → GitHub deploys your app to the cloud.

**In simple words:** GitHub Actions is like a helper robot. You write a list of instructions in a file. When something happens (like a push), the robot follows your list on a computer in the cloud and tells you if everything worked.

### What does CI/CD mean?

| Term | Full name | In simple words |
|---|---|---|
| **CI** | Continuous Integration | Every time code changes, **build it and test it** automatically. You find bugs early. |
| **CD** | Continuous Delivery / Deployment | After the tests pass, **deliver the app** (for example, deploy it to a server) automatically. |

In this post we focus on **CI**. Part 2 covers **CD**.

### Why should I use it?

- **You don't forget to run tests.** The robot always runs them.
- **"It works on my machine" problems go away.** Tests run on a clean computer every time.
- **Your team can see the result** on every pull request: a green check ✅ or a red cross ❌.
- **It's free** for public repositories, and private repositories get free minutes every month.

---

## 2. The 5 Words You Must Know

Before we write anything, learn these 5 words. Everything else is built on them.

| Word | Meaning | Example |
|---|---|---|
| **Workflow** | A YAML file with your instructions. It lives in `.github/workflows/`. | `.github/workflows/ci.yml` |
| **Event** (trigger) | The thing that **starts** the workflow. | `push`, `pull_request` |
| **Job** | A group of steps that runs on **one** computer. | `build-and-test` |
| **Step** | **One** task inside a job: a command or a ready-made action. | `dotnet test` |
| **Runner** | The computer (a virtual machine) that runs the job. GitHub gives you one for free. | `ubuntu-latest` |

How they fit together:

```text
Event (push)
  └── starts a Workflow (ci.yml)
        └── which has Jobs (build-and-test)
              └── each Job runs on a Runner (ubuntu-latest)
                    └── and runs Steps in order (checkout → setup → build → test)
```

One more word:

- **Action**: a **ready-made step** that someone already wrote, so you don't have to. For example, `actions/checkout` downloads your code onto the runner. You use an action with the word `uses:`.

---

## 3. A Quick Note About YAML

Workflow files are written in **YAML**. YAML is a simple text format, but it is **very strict about spaces**.

```yaml
name: My workflow          # key: value
on: push                   # a key with a simple value
jobs:                      # a key that contains more keys
  my-job:                  # 2 spaces in = "inside jobs"
    runs-on: ubuntu-latest # 4 spaces in = "inside my-job"
    steps:                 # a list starts here
      - name: Say hello    # "-" means "one item in the list"
        run: echo "Hello"
```

Rules to remember:

1. **Use spaces, never tabs.** Most people use 2 spaces per level.
2. **Indentation means "belongs to".** If a line moves in, it belongs to the line above it.
3. **`-` means a list item.** Every step starts with `-`.
4. **`#` starts a comment.** GitHub ignores it.

> **Tip:** Most errors in a first workflow are wrong spaces. If GitHub says *"Invalid workflow file"*, check the indentation first. VS Code with the **GitHub Actions** extension shows these errors while you type.

---

## 4. Your First Workflow: "Hello, World"

Let's start very small.

### Step 1: Create the file

In your repository, create this folder and file. The folder name must be **exactly** `.github/workflows`:

```text
your-repo/
└── .github/
    └── workflows/
        └── hello.yml
```

### Step 2: Write the workflow

```yaml
name: Hello World

on: push

jobs:
  say-hello:
    runs-on: ubuntu-latest
    steps:
      - name: Print a greeting
        run: echo "Hello from GitHub Actions!"

      - name: Show some information
        run: |
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Started by: ${{ github.actor }}"
          echo "Today is: $(date)"
```

Line by line:

| Line | What it means |
|---|---|
| `name: Hello World` | The name you see in the **Actions** tab. |
| `on: push` | Run this workflow **every time someone pushes** to any branch. |
| `jobs:` | The list of jobs starts here. |
| `say-hello:` | The job's ID. You choose this name. Use lowercase and `-`. |
| `runs-on: ubuntu-latest` | Run the job on a fresh Linux computer from GitHub. |
| `steps:` | The list of steps starts here. Steps run **from top to bottom**. |
| `run: echo "..."` | Run a shell command, just like in your terminal. |
| `${{ github.repository }}` | An **expression**. GitHub replaces it with a real value before the step runs. |

In the second step, the pipe symbol after `run:` lets you write **many commands**, one per line.

### Step 3: Push it

```bash
git add .github/workflows/hello.yml
git commit -m "Add hello world workflow"
git push
```

### Step 4: Watch it run

1. Open your repository on GitHub.
2. Click the **Actions** tab at the top.
3. Click the run called **"Add hello world workflow"**.
4. Click the job **say-hello**.
5. Click each step to open its log.

You will see your messages printed in the log. 🎉 Congratulations, you just ran your first workflow!

---

## 5. A Real Example: Build and Test a .NET Project

"Hello world" is nice, but now let's do real CI: **build the code and run the tests on every push and every pull request.**

### Step 1: Create a small project (if you don't have one)

On your computer, inside your repository folder:

```bash
dotnet new sln -n Calculator
dotnet new classlib -n Calculator
dotnet new xunit -n Calculator.Tests
dotnet sln add Calculator Calculator.Tests
dotnet add Calculator.Tests reference Calculator
```

Add a tiny class in `Calculator/MathHelper.cs`:

```csharp
namespace Calculator;

public static class MathHelper
{
    public static int Add(int a, int b) => a + b;
}
```

And a test in `Calculator.Tests/MathHelperTests.cs`:

```csharp
using Calculator;

namespace Calculator.Tests;

public class MathHelperTests
{
    [Fact]
    public void Add_ReturnsSum()
    {
        Assert.Equal(5, MathHelper.Add(2, 3));
    }
}
```

Check that it works on your machine first:

```bash
dotnet test
```

> **Good habit:** always run the same commands locally before you put them in a workflow. The workflow just runs your commands on another computer. If they fail locally, they will fail on GitHub too.

### Step 2: Write the CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Get the code
        uses: actions/checkout@v4

      - name: Install .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore packages
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration Release --no-restore

      - name: Run tests
        run: dotnet test --configuration Release --no-build
```

What's new here:

| Part | What it means |
|---|---|
| `on: push: branches: [main]` | Run when someone pushes to **`main`** only. |
| `pull_request: branches: [main]` | Also run when someone opens or updates a **pull request into `main`**. |
| `uses: actions/checkout@v4` | A ready-made action that **downloads your code** onto the runner. The runner starts **empty**, so this is almost always your first step. |
| `@v4` | The **version** of the action. Always write a version, so your workflow doesn't break when the action changes. |
| `with:` | **Inputs** for an action. Here we tell `setup-dotnet` which .NET version to install. |
| `--no-restore`, `--no-build` | Don't do the same work twice. `build` reuses the restore, and `test` reuses the build. |

Push it and open the **Actions** tab. You'll see each step with a green check ✅.

### Step 3: See it on a pull request

1. Create a branch, change something, and push it.
2. Open a pull request into `main`.
3. At the bottom of the pull request, you'll see **"CI / build-and-test"** with a yellow dot (running), then a green check ✅ or a red cross ❌.

Now every pull request is tested automatically. This is CI. 🎉

---

## 6. When Something Fails: Reading the Logs

Failing is normal. Let's break the test on purpose and see what happens.

Change the test to expect a wrong answer:

```csharp
Assert.Equal(6, MathHelper.Add(2, 3)); // wrong on purpose
```

Push it. The run turns **red ❌**. To find out why:

1. Open the **Actions** tab and click the red run.
2. Click the failed job (**build-and-test**).
3. The failed step (**Run tests**) opens automatically. Scroll to the red lines.

You will see something like:

```text
Failed Calculator.Tests.MathHelperTests.Add_ReturnsSum
  Assert.Equal() Failure: Values differ
  Expected: 6
  Actual:   5
```

The log tells you **which step failed** and **why**. Fix the test, push again, and the run turns green.

**How to debug a failed run:**

1. **Find the first red step.** Steps after it usually didn't run (they show as skipped).
2. **Read the error message from the bottom up.** The real reason is usually near the end.
3. **Run the same command on your machine.** If it also fails locally, fix your code. If it passes locally, the difference is the environment (OS, .NET version, missing file, missing secret).
4. **Re-run** with the **"Re-run jobs"** button on the run page. You can also turn on **debug logging** there for more detail.

> **Note:** The runner is **Linux** (`ubuntu-latest`). Linux file names are **case-sensitive**. `Data.json` and `data.json` are different files on Linux, but the same file on Windows. This is a very common "works on my machine" problem.

---

## 7. Useful Features (Step by Step)

Now that the basics work, let's add useful features one at a time. You don't need all of them. Pick what you need.

### 7.1 Run the workflow manually (`workflow_dispatch`)

Add `workflow_dispatch:` to `on:`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
```

Now the **Actions** tab shows a **"Run workflow"** button for this workflow. This is great for testing.

You can also ask for **inputs** when someone clicks the button:

```yaml
on:
  workflow_dispatch:
    inputs:
      greeting:
        description: 'What should we say?'
        default: 'Hello'
        type: string

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - run: echo "${{ inputs.greeting }}, world!"
```

### 7.2 Run on a schedule (`schedule`)

Run every day at 6:00 AM UTC, using **cron** syntax:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'   # minute hour day month weekday (UTC time)
```

Useful for nightly tests or a daily report. The website [crontab.guru](https://crontab.guru/) helps you write cron expressions.

### 7.3 Skip runs for docs-only changes (`paths-ignore`)

If you only changed a `README.md`, there's no need to run the tests:

```yaml
on:
  push:
    branches: [main]
    paths-ignore:
      - '**/*.md'
```

### 7.4 Variables (`env`)

Use `env:` to set a value once and use it in many places:

```yaml
env:
  CONFIGURATION: Release      # available to every job and step

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: dotnet build --configuration $CONFIGURATION
```

`env:` can be at 3 levels: **workflow** (everywhere), **job** (only that job), or **step** (only that step).

### 7.5 Secrets (passwords and API keys)

**Never write a password or an API key in your workflow file.** Everyone who can read the repository can read the file.

Instead, save it as a **secret**:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `MY_API_KEY`, Value: your key. Click **Add secret**.

Then use it in the workflow:

```yaml
      - name: Call an API
        env:
          API_KEY: ${{ secrets.MY_API_KEY }}
        run: ./call-api.sh
```

GitHub **hides** secrets in logs. If a secret is printed, you'll see `***` instead.

> **Secrets vs. variables:** use **secrets** (`secrets.X`) for private values like passwords. Use **variables** (`vars.X`, same settings page, **Variables** tab) for normal settings like a region name or an email address.

### 7.6 Run a step only sometimes (`if`)

```yaml
      # Only on the main branch
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: echo "Deploying..."

      # Only if an earlier step failed
      - name: Print help on failure
        if: failure()
        run: echo "Something failed. Check the logs above."

      # Always, even if earlier steps failed (good for cleanup)
      - name: Clean up
        if: always()
        run: echo "Cleaning up..."
```

### 7.7 Many jobs and their order (`needs`)

By default, **all jobs run at the same time** (in parallel), each on its own computer. Use `needs:` to make a job **wait** for another job:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Running tests"

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Checking code style"

  deploy:
    needs: [test, lint]        # wait until BOTH jobs pass
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying"
```

```text
test ──┐
       ├──► deploy   (runs only if test AND lint pass)
lint ──┘
```

> **Remember:** each job runs on a **new, empty computer**. Files from one job are **not** in the next job. That's why each job starts with `actions/checkout`. (To pass files between jobs, use `actions/upload-artifact` and `actions/download-artifact`.)

### 7.8 Test on many systems at once (`matrix`)

A **matrix** runs the same job many times with different values:

```yaml
jobs:
  build-and-test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: dotnet test
```

This creates **3 jobs**, one per operating system, and they run in parallel.

### 7.9 Make it faster with a cache

Downloading NuGet packages on every run is slow. `setup-dotnet` can cache them for you. It needs a **lock file**, so first turn lock files on in your `.csproj` files:

```xml
<PropertyGroup>
  <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
</PropertyGroup>
```

Run `dotnet restore` once locally and commit the new `packages.lock.json` files. Then:

```yaml
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
          cache: true
```

The first run saves the packages. The next runs reuse them, until your packages change.

### 7.10 Stop wasting time with timeouts

If a test hangs, a job can run for **6 hours** (the default limit) and use your free minutes. Always add a timeout:

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

### 7.11 Add a status badge to your README

Show the result of your workflow at the top of your `README.md`:

```markdown
![CI](https://github.com/YOUR-NAME/YOUR-REPO/actions/workflows/ci.yml/badge.svg)
```

It shows a green **passing** or a red **failing** badge.

---

## 8. Putting It All Together

Here's the final beginner workflow, with the most useful features included:

```yaml
name: CI

on:
  push:
    branches: [main]
    paths-ignore:
      - '**/*.md'
  pull_request:
    branches: [main]
    paths-ignore:
      - '**/*.md'
  workflow_dispatch:

env:
  CONFIGURATION: Release

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Get the code
        uses: actions/checkout@v4

      - name: Install .NET 10
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Restore packages
        run: dotnet restore

      - name: Build
        run: dotnet build --configuration $CONFIGURATION --no-restore

      - name: Run tests
        run: dotnet test --configuration $CONFIGURATION --no-build

      - name: Print help on failure
        if: failure()
        run: echo "The build or tests failed. Open the red step above to see why."
```

### Protect your `main` branch

A workflow only **reports** a result. To **block** a broken pull request from being merged:

1. Go to **Settings** → **Branches** (or **Rules** → **Rulesets**) → add a rule for `main`.
2. Turn on **Require a pull request before merging**.
3. Turn on **Require status checks to pass**, and choose **build-and-test**.

Now nobody can merge a pull request into `main` until the tests pass ✅.

> **Note:** a check appears in that list only **after the workflow has run at least once**.

---

## 9. Common Mistakes (and How to Fix Them)

| Problem | Why it happens | Fix |
|---|---|---|
| The workflow doesn't appear in the Actions tab | The file is in the wrong folder | It must be in `.github/workflows/` and end with `.yml` or `.yaml`. |
| *"Invalid workflow file"* | Wrong spaces or a tab in YAML | Check the indentation. Use spaces only. |
| *"Couldn't find a project or solution file"* | You forgot `actions/checkout`, or the project is in a sub-folder | Add `uses: actions/checkout@v4` first, or use `working-directory:` / the path to the `.sln`. |
| *"MSB1011: more than one project or solution file"* | Two `.sln`/`.csproj` files in the same folder | Name the file: `dotnet build MyApp.sln`. |
| Works on Windows, fails on the runner | Linux is case-sensitive, or uses `/` in paths | Check file name casing and paths. |
| The workflow runs twice on a pull request | You used `on: push` (all branches) **and** `pull_request` | Limit `push` to `branches: [main]`. |
| A secret is empty | Wrong name, or the run comes from a fork | Check the exact name. Secrets are not given to pull requests from forks. |

---

## 10. Quick Cheat Sheet

```yaml
name: <name in the Actions tab>

on:                              # WHEN to run
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:             # manual "Run workflow" button
  schedule:
    - cron: '0 6 * * *'          # every day 06:00 UTC

env:                             # variables for everything
  MY_VAR: value

jobs:                            # WHAT to run
  job-id:
    runs-on: ubuntu-latest       # WHERE to run
    timeout-minutes: 15
    needs: [other-job]           # wait for another job
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4          # a ready-made action
      - name: My command
        run: echo "Hello ${{ github.actor }}"   # a shell command
        env:
          TOKEN: ${{ secrets.MY_SECRET }}  # a secret
```

Useful expressions:

| Expression | Value |
|---|---|
| `${{ github.repository }}` | `owner/repo` |
| `${{ github.ref_name }}` | The branch name, e.g. `main` |
| `${{ github.sha }}` | The commit ID |
| `${{ github.actor }}` | Who started the run |
| `${{ github.event_name }}` | `push`, `pull_request`, ... |
| `${{ secrets.NAME }}` | A secret |
| `${{ vars.NAME }}` | A variable |
| `${{ inputs.NAME }}` | An input from a manual run |
| `${{ matrix.NAME }}` | The current matrix value |

{% endraw %}

---

## 11. What's Next?

You now know the basics: **events, jobs, steps, runners, actions, secrets, conditions, `needs`, and `matrix`**. That's enough to run CI on almost any project.

When you're ready, continue with **[Part 2: Building a CI/CD Pipeline with GitHub Actions]({% post_url 2026-10-25-github-actions-cicd-pipeline-dotnet-azure %})**. It uses everything from this post and adds the advanced topics:

- **Docker images** built in the pipeline and pushed to a container registry
- **Passwordless login to Azure (OIDC)** — no cloud password stored in GitHub
- **Deploying to Azure** with infrastructure as code (Bicep)
- **Smoke tests** that check the live website after the deploy
- **Reusable actions**, automatic **releases**, and a one-click **rollback**

It's based on my real [PersonalFinance](https://github.com/tngo0508/PersonalFinance) project. You can read the story behind it in my [Building a Personal Finance App]({% post_url 2026-10-22-personal-finance-app-series-overview %}) series.

**Official docs** (good to bookmark):

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Workflow syntax reference](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows)
- [GitHub Marketplace for actions](https://github.com/marketplace?type=actions)

---

**GitHub Actions series:** Part 1: Beginner Tutorial · Next: [Part 2: Building a CI/CD Pipeline with GitHub Actions]({% post_url 2026-10-25-github-actions-cicd-pipeline-dotnet-azure %})
