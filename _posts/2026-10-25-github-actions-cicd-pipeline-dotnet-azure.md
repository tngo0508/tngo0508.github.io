---
layout: single
title: "Building a CI/CD Pipeline with GitHub Actions: A Step-by-Step Guide from My PersonalFinance Project (.NET 10 + Azure)"
date: 2026-10-25
show_date: true
toc: true
toc_label: "CI/CD Pipeline Guide"
toc_sticky: true
classes: wide
categories:
  - DevOps
  - .NET
  - Azure
tags:
  - CI/CD
  - GitHub Actions
  - .NET 10
  - Azure
  - Azure Container Apps
  - Docker
  - Bicep
  - OIDC
  - DevOps
---

I recently set up a full CI/CD pipeline for my [PersonalFinance](https://github.com/tngo0508/PersonalFinance) project with help from Claude Code. It works well, but a pipeline you can't explain is a pipeline you can't rebuild. This post is my own runbook: what every piece does, why it's there, and the exact order to set it up again on a new project at work.

> This guide is a companion to my [Building a Personal Finance App]({% post_url 2026-10-22-personal-finance-app-series-overview %}) series. [Part 5: Deploying to Azure Container Apps]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %}) tells the story of how this pipeline came together and the failures I fixed along the way; this post is the setup guide.

{% raw %}

By the end you'll have:

- A **CI** workflow that builds, tests, lints, runs E2E tests and checks database migrations on every pull request.
- A **CD** workflow that builds Docker images, signs in to Azure **without a stored password** (OIDC), deploys with Bicep and smoke-tests the live site.
- A **release** process (one GitHub Release per merged PR) and a **one-click rollback**.

---

## 1. The Big Picture

CI/CD answers two questions automatically:

- **CI (Continuous Integration):** "Is this change safe to merge?" Build it, test it, lint it, on every PR.
- **CD (Continuous Delivery/Deployment):** "Ship what was merged." Package it, deploy it, verify it's alive.

Here is the whole PersonalFinance pipeline (`.github/workflows/deploy-azure.yml`):

```text
 Trigger: pull_request → main | push → main | manual (workflow_dispatch)
 (docs-only changes are skipped)
                │
                ▼
 ┌──────────────────────── run in parallel ────────────────────────┐
 │ build-and-test      lint-js        e2e-browser-tests            │
 │ sql-server-migrations              validate-infra (Bicep)       │
 │ build-and-push-containers  (matrix: api, web)                   │
 │   └─ PR: build only (validates Dockerfiles)                     │
 │   └─ main: push to GHCR tagged :<short-sha>                     │
 └─────────────────────────────────────────────────────────────────┘
                │  all required jobs green, push/manual only
                ▼
 deploy-azure        → azure/login (OIDC) → Bicep → Container Apps
                │
                ▼
 smoke-test          → curl /health, /alive, login page, auth redirects
                │
        ┌───────┴────────┐
        ▼                ▼
 promote-latest     create-release
 (:sha → :latest)   (git tag vX.Y.Z + GitHub Release)
```

And what runs for each kind of trigger:

| Trigger | Build & test | Build images | Push to GHCR | Deploy | Smoke test | Release |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Pull request to `main` | ✅ | ✅ (no push) | ❌ | ❌ | ❌ | ❌ |
| Push / merge to `main` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manual run | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (on `main`) |
| Manual with `dry_run = true` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**The key idea:** PRs prove the change is safe; only `main` is allowed to touch Azure.

---

## 2. The Files Involved

```text
.github/
├── workflows/
│   ├── deploy-azure.yml       # The main CI/CD pipeline
│   ├── release-check.yml      # PR gate: version bumped + CHANGELOG entry
│   └── rollback.yml           # Manual: redeploy images from an older release tag
├── actions/
│   ├── deploy-azure/action.yml   # Reusable composite action: login + Bicep deploy
│   └── smoke-test/action.yml     # Reusable composite action: HTTP probes
├── scripts/
│   └── release-version.sh     # Reads AppVersion.cs, compares SemVer, extracts CHANGELOG notes
└── pull_request_template.md   # Done checklist for every PR
global.json                    # Pins the .NET SDK (CI reads it)
infra/main.bicep               # Infrastructure as code for Azure
PersonalFinance/src/*/Dockerfile
```

Some quick vocabulary:

| Term | Meaning |
|---|---|
| **Workflow** | A YAML file in `.github/workflows/`. Triggered by events. |
| **Job** | A group of steps that runs on one fresh VM (runner). Jobs run **in parallel** unless you add `needs:`. |
| **Step** | A shell command (`run:`) or a prebuilt action (`uses:`). |
| **Composite action** | Your own reusable bundle of steps (`.github/actions/<name>/action.yml`). |
| **Secret / Variable** | Encrypted values (`secrets.X`) and plain config (`vars.X`) stored in repo settings. |

---

## 3. Prerequisites

Before writing YAML, have these ready:

1. A GitHub repo with a default branch (`main`).
2. An app that builds and tests from the command line (`dotnet build`, `dotnet test`).
3. A **Dockerfile** per deployable service.
4. **Infrastructure as code** (here: `infra/main.bicep`) that describes the Azure resources.
5. An Azure subscription where you can create an **App Registration** and assign roles (at work, you'll likely need a cloud admin for this part).
6. `global.json` pinning the SDK so local and CI use the same version:

```json
{
  "sdk": {
    "version": "10.0.402",
    "rollForward": "latestPatch"
  }
}
```

---

## Step 1: Workflow Skeleton — Triggers, Permissions, Concurrency

Create `.github/workflows/deploy-azure.yml` and start with the header:

```yaml
name: Build, Test, and Deploy to Azure Container Apps

on:
  push:
    branches: [main]
    paths-ignore:
      - '**/*.md'        # Docs don't affect the build
      - '.idea/**'
      - '.claude/**'
  pull_request:
    branches: [main]
    paths-ignore:
      - '**/*.md'
      - '.idea/**'
      - '.claude/**'
  workflow_dispatch:     # "Run workflow" button in the Actions tab
    inputs:
      environment:
        description: 'Azure Environment Name prefix (e.g. pf-prod)'
        default: 'pf-prod'
        type: string
      deploy_sql:
        description: 'Provision Azure SQL Database'
        default: true
        type: boolean
      dry_run:
        description: 'Validate only (skip container push and Azure deployment)'
        default: false
        type: boolean

permissions:
  contents: read     # checkout the code
  packages: write    # push images to GHCR
  id-token: write    # REQUIRED for Azure OIDC login

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

env:
  REGISTRY: ghcr.io
  API_IMAGE_NAME: personalfinance-api
  WEB_IMAGE_NAME: personalfinance-web
  AZURE_RESOURCE_GROUP: rg-personalfinance-prod
  AZURE_LOCATION: westus2
  ENVIRONMENT_NAME: pf-prod
```

What each part buys you:

- **`paths-ignore`** — editing a README doesn't burn 15 minutes of runner time.
- **`workflow_dispatch` inputs** — a manual button with options. `dry_run` is great for testing pipeline changes without deploying.
- **`permissions`** — the default `GITHUB_TOKEN` gets *only* these rights. `id-token: write` is what lets the job ask GitHub for an OIDC token (Step 6).
- **`concurrency`** — a new push to a PR **cancels** its old run (saves minutes). On `main` runs **queue** instead, so a deployment is never killed halfway.

---

## Step 2: The Core CI Job — Build & Test

```yaml
jobs:
  build-and-test:
    name: Build & Test (.NET 10)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup .NET SDK (from global.json)
        uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: nuget-${{ runner.os }}-${{ hashFiles('**/Directory.Packages.props', '**/*.csproj') }}
          restore-keys: |
            nuget-${{ runner.os }}-

      - name: Setup Node.js   # The Web project minifies JS/CSS during Release build
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Restore NuGet packages
        run: dotnet restore PersonalFinance.sln

      - name: Build solution (Release)
        run: dotnet build PersonalFinance.sln --configuration Release --no-restore -p:EnforceWarningsAsErrors=true

      - name: Check code formatting (non-blocking)
        continue-on-error: true
        run: dotnet format whitespace PersonalFinance.sln --verify-no-changes --no-restore

      - name: Execute test suite
        run: dotnet test PersonalFinance.sln --configuration Release --no-build --verbosity normal
```

Tips worth copying:

- **`timeout-minutes`** on every job. The default is 6 hours — a hung test can eat your monthly minutes.
- **Cache key = hash of the project files.** The cache is reused until a `.csproj` changes.
- **`--no-restore` / `--no-build`** — each command reuses the previous step's output instead of redoing it.
- **Warnings as errors in CI** keeps the codebase from slowly rotting.
- **`continue-on-error: true`** is a good way to *introduce* a new check (like formatting) without blocking everyone on day one. Remove it once the codebase is clean.

---

## Step 3: Extra Quality Gates (Run in Parallel)

Jobs without `needs:` all start at the same time, so adding more checks doesn't make the pipeline much slower. PersonalFinance has four more:

### 3a. JavaScript lint

```yaml
  lint-js:
    name: Lint JavaScript (ESLint)
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm run lint
```

### 3b. E2E browser tests with Playwright

The idea: start the real API and Web apps **in the background** on the runner with an in-memory database, wait for `/health`, then run Playwright against them.

```yaml
      - name: Assign random ports
        id: ports
        run: |
          echo "api_port=$((RANDOM % 10000 + 10000))" >> $GITHUB_OUTPUT
          echo "web_port=$((RANDOM % 10000 + 10000))" >> $GITHUB_OUTPUT

      - name: Start ApiService with InMemory DB
        env:
          ASPNETCORE_ENVIRONMENT: Development
          DATABASE_PROVIDER: InMemory
        run: |
          dotnet run --project PersonalFinance/src/PersonalFinance.ApiService \
            --urls "http://0.0.0.0:${{ steps.ports.outputs.api_port }}" > .api.log 2>&1 &

      - name: Wait for ApiService health
        run: |
          for i in $(seq 1 50); do
            CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${{ steps.ports.outputs.api_port }}/health" || echo 000)
            [ "$CODE" = "200" ] && exit 0
            sleep 3
          done
          echo "::error::ApiService failed to start"; tail -n 200 .api.log; exit 1

      # ...same for Web, then:
      - name: Run Playwright UI E2E tests
        env:
          WEB_URL: http://localhost:${{ steps.ports.outputs.web_port }}
        run: npm run test:e2e

      - name: Stop services
        if: always()
        run: pkill -f "dotnet.*PersonalFinance" || true
```

Patterns to remember:

- **`$GITHUB_OUTPUT`** passes a value from one step to later steps (`steps.<id>.outputs.<name>`).
- **`&` + a health-check loop** is how you run a server inside a job.
- **On failure, print the logs** (`tail .api.log`). You can't SSH into the runner afterwards, so the log is all you get.
- **`if: always()`** runs cleanup even when tests fail. **`if: failure()`** runs diagnostics only when something broke.
- Cache Playwright browsers (`~/.cache/ms-playwright`) — downloading Chromium every run is slow.

### 3c. Migrations against a real SQL Server

In-memory databases don't catch SQL that SQL Server rejects. This job starts SQL Server 2022 in Docker (via the same `compose.yaml` developers use locally), applies all migrations, then applies them **again** and asserts nothing changed — proving they're idempotent.

```yaml
      - name: Write .env with a random sa password
        run: |
          SA_PASSWORD="Aa1!$(openssl rand -hex 16)"
          echo "::add-mask::${SA_PASSWORD}"
          printf 'MSSQL_SA_PASSWORD=%s\nSQL_HOST_PORT=1433\n' "${SA_PASSWORD}" > .env

      - name: Start SQL Server (npm run db:up)
        run: npm run db:up      # docker compose up -d --wait
```

Two nice tricks:

- **A throwaway password generated per run** — no secret to manage.
- **`::add-mask::`** hides a value from the logs, even if a later step prints it.

### 3d. Validate the infrastructure templates

```yaml
  validate-infra:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - run: az bicep build --file infra/main.bicep --stdout > /dev/null
```

A typo in Bicep fails on the PR instead of halfway through a production deploy. The Azure CLI is preinstalled on `ubuntu-latest`.

---

## Step 4: Build & Push Docker Images to GHCR

GitHub Container Registry (`ghcr.io`) is free for public packages and authenticates with the built-in `GITHUB_TOKEN` — no extra secret.

```yaml
  build-and-push-containers:
    name: Build & Push Containers (GHCR) · ${{ matrix.service }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    strategy:
      fail-fast: false
      matrix:
        include:
          - service: api
            dockerfile: PersonalFinance/src/PersonalFinance.ApiService/Dockerfile
          - service: web
            dockerfile: PersonalFinance/src/PersonalFinance.Web/Dockerfile
    env:
      # Never push from a PR or a dry run
      PUSH_IMAGE: ${{ github.event_name != 'pull_request' && inputs.dry_run != true }}
    outputs:
      api_image_tag: ${{ steps.tags.outputs.api_image_tag }}
      web_image_tag: ${{ steps.tags.outputs.web_image_tag }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3

      - name: Determine Image Names and Tags
        id: tags
        run: |
          OWNER_LC=$(echo "${{ github.repository_owner }}" | tr '[:upper:]' '[:lower:]')
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)
          API_IMAGE="ghcr.io/${OWNER_LC}/${{ env.API_IMAGE_NAME }}"
          WEB_IMAGE="ghcr.io/${OWNER_LC}/${{ env.WEB_IMAGE_NAME }}"
          if [[ "${{ matrix.service }}" == "api" ]]; then IMAGE="$API_IMAGE"; else IMAGE="$WEB_IMAGE"; fi
          echo "image=${IMAGE}" >> $GITHUB_OUTPUT
          echo "api_image_tag=${API_IMAGE}:${SHORT_SHA}" >> $GITHUB_OUTPUT
          echo "web_image_tag=${WEB_IMAGE}:${SHORT_SHA}" >> $GITHUB_OUTPUT

      - name: Log in to GHCR
        if: ${{ env.PUSH_IMAGE == 'true' }}
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract container metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ steps.tags.outputs.image }}
          tags: |
            type=sha,format=short,prefix=

      - name: Build and push ${{ matrix.service }} container
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.dockerfile }}
          push: ${{ env.PUSH_IMAGE == 'true' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha,scope=${{ matrix.service }}
          cache-to: ${{ env.PUSH_IMAGE == 'true' && format('type=gha,scope={0},mode=max,ignore-error=true', matrix.service) || '' }}
```

Why it's built this way:

- **Matrix** — one job definition, two parallel legs (`api`, `web`). Adding a third service is three lines.
- **PRs still build the image** (just don't push). A broken Dockerfile is caught before merge.
- **Tag with the commit SHA, not `latest`.** Every deployment maps to exactly one commit, which makes rollback trivial (Step 10).
- **Lowercase the owner** — Docker image names must be lowercase; GitHub usernames don't have to be.
- **Separate cache `scope` per image** so the two builds don't overwrite each other's layer cache.
- **Job `outputs`** expose the image tags to later jobs via `needs.build-and-push-containers.outputs.api_image_tag`.

> **Dockerfile tip:** copy the `.csproj` files and run `dotnet restore` *before* copying source code. The restore layer then stays cached until a dependency changes. PersonalFinance also uses a **chiseled** (distroless, non-root) runtime image and ReadyToRun compilation for faster cold starts.

---

## Step 5: Set Up Passwordless Azure Login (OIDC)

This is the part most worth understanding. The old way was to create a service principal **client secret** and paste it into GitHub. That secret is long-lived, can leak, and expires at the worst time.

With **OIDC (OpenID Connect)**:

```text
GitHub runner ──(1) "I am repo tngo0508/PersonalFinance, branch main" (signed JWT)──► Microsoft Entra ID
              ◄─(2) short-lived Azure access token (only if a federated credential matches)──
              ──(3) deploy with that token ─────────────────────────────────────────────────► Azure
```

There is **no password stored anywhere**. Azure trusts GitHub's signed token, but only for the exact repo + branch you configure.

### 5.1 Using the Azure Portal

1. **Microsoft Entra ID → App registrations → New registration**
   - Name: `personalfinance-github-actions`
   - Supported account types: *this organizational directory only*
   - Record **Application (client) ID** → `AZURE_CLIENT_ID` and **Directory (tenant) ID** → `AZURE_TENANT_ID`.
2. **Subscription (or resource group) → Access control (IAM) → Add role assignment**
   - Role: **Contributor**, member: `personalfinance-github-actions`.
3. **App registration → Certificates & secrets → Federated credentials → Add credential**
   - Scenario: **GitHub Actions deploying Azure resources**
   - Organization: `tngo0508`, Repository: `PersonalFinance`
   - Entity type: **Branch**, Branch: `main`
   - Name: `main-branch-deploy`
4. Record your **Subscription ID** → `AZURE_SUBSCRIPTION_ID`.

### 5.2 Same thing with the Azure CLI (easier to repeat at work)

```bash
az login
```

```bash
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
APP_ID=$(az ad app create --display-name personalfinance-github-actions --query appId -o tsv)
az ad sp create --id "$APP_ID"

az role assignment create \
  --assignee "$APP_ID" \
  --role Contributor \
  --scope "/subscriptions/$SUBSCRIPTION_ID"

az ad app federated-credential create --id "$APP_ID" --parameters '{
  "name": "main-branch-deploy",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:tngo0508/PersonalFinance:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'

echo "AZURE_CLIENT_ID=$APP_ID  AZURE_TENANT_ID=$TENANT_ID  AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID"
```

The **`subject`** is the whole security boundary. Common forms:

| Who may log in | `subject` value |
|---|---|
| Runs on the `main` branch | `repo:OWNER/REPO:ref:refs/heads/main` |
| Jobs that use a GitHub Environment named `prod` | `repo:OWNER/REPO:environment:prod` |
| Pull requests (usually you **don't** want this for deploys) | `repo:OWNER/REPO:pull_request` |
| A release tag | `repo:OWNER/REPO:ref:refs/tags/v1.2.3` |

> **Gotcha:** if the job runs from any other branch, `azure/login` fails with *"No matching federated identity record found"*. That's why the rollback workflow (Step 10) refuses to run unless it's on `main`.

> **Least privilege at work:** PersonalFinance gives Contributor on the subscription because the pipeline creates its own resource group. At work, ask for the resource group to be pre-created and scope the role assignment to `/subscriptions/<id>/resourceGroups/<rg>` instead.

---

## Step 6: Add GitHub Secrets and Variables

**Settings → Secrets and variables → Actions.**

- **Secrets** are encrypted and masked in logs: API keys, passwords, connection strings.
- **Variables** are plain text config: sender email, domain name, region.

PersonalFinance uses:

| Name | Type | Purpose |
|---|---|---|
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` | Secret | OIDC login (Step 5). Not really secret, but keeps them out of the YAML. |
| `SQL_ADMIN_PASSWORD` *or* `CUSTOM_CONNECTION_STRING` | Secret | Database |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DRIVE_API_KEY` | Secret | Google sign-in & Drive |
| `BREVO_API_KEY`, `OPENAI_API_KEY`, `INTERNAL_API_KEY` | Secret | Third-party services |
| `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `CUSTOM_DOMAIN_NAME`, `SEC_USER_AGENT` | Variable | App config |

You can set them from the terminal with the GitHub CLI:

```bash
gh secret set AZURE_CLIENT_ID --body "<app-id>"
```

```bash
gh variable set BREVO_SENDER_NAME --body "PersonalFinance"
```

How a secret travels into the running app (it is **never** baked into the image):

```text
GitHub secret BREVO_API_KEY
  → Bicep @secure() parameter brevoApiKey          (redacted in Azure deployment history)
  → Container App secret  brevo-api-key
  → environment variable  Brevo__ApiKey  (secretRef)
  → IConfiguration        Brevo:ApiKey             (.NET turns "__" into ":")
```

Use a fallback for optional variables so a missing one doesn't break the run:

```yaml
brevo_sender_name: ${{ vars.BREVO_SENDER_NAME || 'PersonalFinance' }}
```

---

## Step 7: The Deploy Job (Using a Reusable Composite Action)

The deploy job is short because the real work lives in `.github/actions/deploy-azure/action.yml`:

```yaml
  deploy-azure:
    name: Deploy to Azure Container Apps
    needs: [build-and-test, sql-server-migrations, validate-infra, build-and-push-containers]
    if: ${{ (github.event_name == 'push' || github.event_name == 'workflow_dispatch') && inputs.dry_run != true }}
    runs-on: ubuntu-latest
    timeout-minutes: 40
    permissions:
      contents: read
      id-token: write
    outputs:
      web_url: ${{ steps.deploy-bicep.outputs.webUrl }}
      web_fqdn: ${{ steps.deploy-bicep.outputs.webFqdn }}
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Azure Infrastructure & Container Apps (Bicep)
        id: deploy-bicep
        uses: ./.github/actions/deploy-azure
        with:
          environment: ${{ inputs.environment || env.ENVIRONMENT_NAME }}
          api_image: ${{ needs.build-and-push-containers.outputs.api_image_tag }}
          web_image: ${{ needs.build-and-push-containers.outputs.web_image_tag }}
          resource_group: ${{ env.AZURE_RESOURCE_GROUP }}
          location: ${{ env.AZURE_LOCATION }}
          azure_client_id: ${{ secrets.AZURE_CLIENT_ID }}
          azure_tenant_id: ${{ secrets.AZURE_TENANT_ID }}
          azure_subscription_id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          sql_admin_password: ${{ secrets.SQL_ADMIN_PASSWORD }}
          # ...other secrets and variables
```

Two lines do the heavy lifting:

- **`needs: [...]`** — the deploy waits for *every* check. If one fails, nothing reaches Azure.
- **`if:`** — PRs and dry runs skip the deploy entirely.

### The composite action

Simplified here; the real file also waits for a stale Container Apps environment to finish deleting and checks that the database secret matching `deploy_sql` is set.

```yaml
# .github/actions/deploy-azure/action.yml
name: Deploy to Azure Container Apps
description: Logs in to Azure with OIDC and deploys infra/main.bicep with the given images.

# Composite actions cannot read `secrets`, so the caller passes each one in as an input.
inputs:
  environment:     { required: true }
  api_image:       { required: true }
  web_image:       { required: true }
  resource_group:  { required: true }
  location:        { required: true }
  azure_client_id: { required: true }
  azure_tenant_id: { required: true }
  azure_subscription_id: { required: true }
  sql_admin_password: { required: false }

outputs:
  webUrl:
    value: ${{ steps.deploy-bicep.outputs.webUrl }}

runs:
  using: composite
  steps:
    - name: Azure Login via Passwordless OIDC
      uses: azure/login@v2
      with:
        client-id: ${{ inputs.azure_client_id }}
        tenant-id: ${{ inputs.azure_tenant_id }}
        subscription-id: ${{ inputs.azure_subscription_id }}

    - name: Ensure Azure resource group exists
      uses: azure/cli@v2
      with:
        inlineScript: |
          if [[ "$(az group exists --name "${{ inputs.resource_group }}")" == "true" ]]; then exit 0; fi
          az group create --name "${{ inputs.resource_group }}" --location "${{ inputs.location }}"

    - name: Deploy Bicep
      id: deploy-bicep
      uses: azure/arm-deploy@v2
      with:
        scope: resourcegroup
        resourceGroupName: ${{ inputs.resource_group }}
        template: infra/main.bicep
        parameters: >-
          environmentName=${{ inputs.environment }}
          location=${{ inputs.location }}
          apiImage=${{ inputs.api_image }}
          webImage=${{ inputs.web_image }}
          sqlAdministratorLoginPassword=${{ inputs.sql_admin_password }}

    - name: Show Azure deployment operations on failure
      if: ${{ failure() }}
      uses: azure/cli@v2
      with:
        inlineScript: |
          az deployment operation group list --resource-group "${{ inputs.resource_group }}" --name main \
            --query "[].{state:properties.provisioningState,target:properties.targetResource.resourceName,error:properties.statusMessage.error.message}"
```

Why a composite action? **The rollback workflow uses exactly the same deploy steps.** Shared code means a rollback can't drift from a normal deploy.

**Why Bicep?** The deploy is *idempotent*: Bicep describes the desired end state (Log Analytics, Container Apps environment, SQL, the two Container Apps), and Azure only changes what's different. Running it twice is safe. Bicep `outputs` (like `webUrl`) flow back to the workflow for the smoke test.

---

## Step 8: Smoke Test the Live Deployment

"Deployment succeeded" only means Azure accepted the template. The smoke test proves the site actually answers:

```yaml
  smoke-test:
    name: End-to-End Smoke Tests
    needs: deploy-azure
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/smoke-test
        with:
          web_url: ${{ needs.deploy-azure.outputs.web_url }}
```

The composite action is a bash script with `curl` checks:

1. `/health` — retried up to 60 times, 5 s apart (Container Apps may be cold-starting from zero replicas).
2. `/alive` returns 200.
3. `/` returns 200 or 302.
4. Login and Register pages return 200 **and** contain the expected form fields.
5. Protected pages (`/Budget`, `/Networth`, …) redirect to login — proves auth is wired up.

It counts passes/failures, dumps headers + the first 400 bytes of the body for each failure, and exits 1 if anything failed.

---

## Step 9: Promote `latest` and Create a Release

Only after the smoke test passes:

```yaml
  promote-latest:
    needs: [build-and-push-containers, smoke-test]
    if: ${{ github.ref == format('refs/heads/{0}', github.event.repository.default_branch) }}
    runs-on: ubuntu-latest
    steps:
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Tag deployed images as latest
        run: |
          for IMAGE_TAG in "${{ needs.build-and-push-containers.outputs.api_image_tag }}" \
                           "${{ needs.build-and-push-containers.outputs.web_image_tag }}"; do
            docker buildx imagetools create --tag "${IMAGE_TAG%:*}:latest" "$IMAGE_TAG"
          done
```

So **`latest` always means "deployed and verified"**, never "most recently built". `imagetools create` just re-points the manifest — no layers are pulled or pushed.

Then `create-release` (needs `contents: write`) reads the version from `AppVersion.cs`, skips if the tag already exists, and creates a GitHub Release with that version's CHANGELOG section plus auto-generated PR notes:

```bash
VERSION=$(bash .github/scripts/release-version.sh current)
TAG="v$VERSION"
if git ls-remote --exit-code --tags origin "refs/tags/$TAG" > /dev/null; then
  echo "::notice::Tag $TAG already exists"; exit 0
fi
bash .github/scripts/release-version.sh notes "$VERSION" > "$RUNNER_TEMP/release-notes.md"
gh release create "$TAG" --target "$GITHUB_SHA" --title "$TAG" \
  --notes-file "$RUNNER_TEMP/release-notes.md" --generate-notes --latest
```

---

## Step 10: The PR Gate — `release-check.yml`

The rule in PersonalFinance is **one GitHub Release per merged PR**. A separate workflow enforces it on every PR:

```yaml
name: Release Check
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, labeled, unlabeled]
```

It fails the PR unless:

1. `AppVersion.Current` is **higher** than on `main` (SemVer: patch = fix, minor = feature, major = breaking/schema), **and**
2. `CHANGELOG.md` has a `## [x.y.z] - YYYY-MM-DD` section for that version.

Escape hatches: PRs labelled **`no-release`** and docs-only PRs pass automatically.

> **Gotcha I learned:** this workflow deliberately has **no `paths-ignore`**. If a workflow is skipped, it never reports a status — and a *required* status check that never reports blocks the PR forever. So the docs-only check happens *inside* the job instead.

---

## Step 11: One-Click Rollback — `rollback.yml`

Because every image is tagged with its commit SHA and every release is a git tag, rolling back is "redeploy the images that tag was built from":

```yaml
name: Roll Back to a Release
on:
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag to redeploy (e.g. v5.9.0)'
        required: true
        type: string
      allow_schema_drift:
        description: 'Roll back even though DB migrations changed since this tag'
        default: false
        type: boolean

# Same group as deploy-azure.yml on main → a rollback and a deploy never overlap
concurrency:
  group: Build, Test, and Deploy to Azure Container Apps-refs/heads/main
  cancel-in-progress: false
```

Jobs:

1. **resolve-tag** — must run from `main` (OIDC only trusts `main`), checks the tag looks like `vX.Y.Z`, resolves it to a commit, builds the image names `:<short-sha>`, verifies both images still exist in GHCR with `docker manifest inspect`, and **refuses to roll back if database migrations changed since that tag** (migrations only move forward) unless you tick `allow_schema_drift`.
2. **deploy-azure** — the *same* composite action from Step 7.
3. **smoke-test** — the *same* composite action from Step 8.
4. **promote-latest** — moves `latest` to the rolled-back images, so `latest` still equals "what's live".

To run it: **Actions → Roll Back to a Release → Run workflow → enter `v6.2.1`**.

---

## Step 12: Protect the `main` Branch

The pipeline is only a gate if people can't go around it. **Settings → Branches → Add branch ruleset** (or classic branch protection) for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks to pass: `Build & Test (.NET 10)`, `Lint JavaScript (ESLint)`, `E2E Browser Tests (Playwright)`, `Migrations on SQL Server 2022`, `Validate Bicep Templates`, `Check AppVersion bump and CHANGELOG`
- ✅ Require branches to be up to date before merging
- ✅ Block force pushes

The check names are the jobs' `name:` values — they appear in the search box only after the workflow has run at least once.

---

## Step 13: Day-to-Day Usage

```bash
git checkout -b feature/budget-export
```

```bash
git push -u origin feature/budget-export
```

```bash
gh pr create --fill
```

1. Open the PR → CI runs (no deploy). Fix anything red.
2. Bump `AppVersion` and add a CHANGELOG section (or label `no-release`).
3. Merge → the pipeline deploys, smoke-tests, moves `latest`, and publishes `vX.Y.Z`.
4. Something broke in production → run **Roll Back to a Release** with the previous tag.

Watching a run from the terminal:

```bash
gh run watch
```

---

## Step 14: Reusing This at Work — Checklist

Use this order on a new project. Each step is independently testable, so get one green before adding the next.

| # | Task | What to change from PersonalFinance |
|---|---|---|
| 1 | Pin the SDK with `global.json` | SDK version |
| 2 | Add the workflow skeleton + `build-and-test` only. Open a PR, get it green. | Solution name, test command |
| 3 | Add parallel gates (lint, E2E, migrations, IaC validation) one at a time | Drop what doesn't apply |
| 4 | Add Dockerfiles and the image matrix (build-only on PRs) | Service names, Dockerfile paths, registry (GHCR vs. company ACR) |
| 5 | Ask your cloud admin for an App Registration + federated credential + role on the resource group | Org/repo/branch in `subject`, RG scope |
| 6 | Add secrets and variables | Your app's settings |
| 7 | Add the deploy composite action + deploy job | Bicep path and parameters |
| 8 | Add smoke tests | Your health and key page URLs |
| 9 | Add `promote-latest`, release, and rollback | Versioning source of truth |
| 10 | Turn on branch protection with required checks | Job names |

Things I'd add at a company that a personal project doesn't need:

- **GitHub Environments** (`staging`, `production`) with **required reviewers**, so production deploys wait for a human approval. Add `environment: production` to the deploy job and change the OIDC `subject` to `repo:ORG/REPO:environment:production`.
- **A staging stage first:** deploy → smoke test staging → (approval) → deploy production with the *same image SHA*.
- **Pin third-party actions to a full commit SHA** (e.g. `uses: azure/login@<sha>`) for supply-chain safety, and let Dependabot keep them updated.
- **A private registry** (Azure Container Registry) if images must not be public.
- **Code scanning** (CodeQL) and dependency review as extra PR gates.

---

## Troubleshooting Cheat Sheet

| Symptom | Likely cause / fix |
|---|---|
| `AADSTS70021: No matching federated identity record found` | The workflow ran from a branch/environment the federated credential doesn't trust. Check the `subject`. |
| `azure/login` says it can't get an ID token | Missing `permissions: id-token: write` on the workflow or job. |
| `denied: permission_denied` pushing to GHCR | Missing `packages: write`, or the image name has uppercase letters. |
| Required check stuck on "Expected — Waiting for status" | The workflow was skipped (`paths-ignore`) or the job `name:` changed. |
| Composite action can't see a secret | Composite actions can't read `secrets` — pass each one in as an input. |
| Smoke test times out on `/health` | Cold start from zero replicas or a failing migration at startup. Check container logs: `az containerapp logs show -n <app> -g <rg> --follow`. |
| Deploy failed with a vague ARM error | Read the "Show Azure deployment operations on failure" step — it lists which Bicep module failed and why. |

---

## Wrapping Up

The pipeline boils down to a few principles that carry over to any project:

1. **PRs prove, `main` ships.** Everything is validated on the PR; only `main` can reach the cloud.
2. **Parallel checks, one gate.** Many independent jobs, one `needs:` list in front of the deploy.
3. **No stored cloud passwords.** OIDC + a narrowly scoped federated credential.
4. **Immutable, traceable artifacts.** Images tagged by commit SHA; `latest` only after verification.
5. **Reuse the same steps for deploy and rollback** via composite actions.
6. **Verify the live site**, not just the deploy command.

The full source is in the [PersonalFinance repository](https://github.com/tngo0508/PersonalFinance) under `.github/`, and `docs/deployment.md` there covers the Google, Brevo and Azure SQL setup in more detail.

{% endraw %}

---

**Related:** [Building a Personal Finance App: Series Overview]({% post_url 2026-10-22-personal-finance-app-series-overview %}) · [Part 5: Deploying to Azure Container Apps]({% post_url 2026-10-5-pf-05-deploying-to-azure-container-apps %})
