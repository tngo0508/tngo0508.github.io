---
layout: single
title: "AZ-900 Study Notes: IaaS vs. PaaS vs. SaaS, and When to Use Each"
date: 2026-10-28
show_date: true
toc: true
toc_label: "IaaS vs. PaaS vs. SaaS"
classes: wide
tags:
  - Azure
  - AZ-900
  - Cloud Computing
  - Certification
---

AZ-900 rarely asks "what does PaaS stand for?" It asks **scenario questions**: *"A company wants to do X. Which service type should it use?"* This post is about answering those: how the three types differ, the real use cases for each, and a simple way to pick the right one.

New to the three types? Start with my shorter [cloud service types notes]({% post_url 2026-10-27-az-900-cloud-service-types %}), then come back here for the use cases and decision practice.
{: .notice--info}

---

## 1. The Difference in One Question

Ask yourself: **"What does the customer want to manage?"**

| The customer wants to manage... | Service type |
|---|---|
| The **operating system** and everything above it | **IaaS** |
| Only their **code and data** | **PaaS** |
| Only their **data and users** (no code at all) | **SaaS** |

That single question answers most exam scenarios.

---

## 2. The Differences Side by Side

| | **IaaS** | **PaaS** | **SaaS** |
|---|---|---|---|
| **What you rent** | Virtual machines, storage, networks | A platform that runs your code | A finished application |
| **Who uses it** | IT admins, infrastructure teams | Developers | End users (everyone) |
| **You manage** | OS, patches, runtime, apps, data | Your app code and data | Your data, users, settings |
| **Microsoft manages** | Physical hardware, network, datacenter | Hardware + OS + runtime + patching | Everything except your data and users |
| **Who patches the OS?** | **You** | Microsoft | Microsoft |
| **Control** | High | Medium | Low |
| **Effort / skills needed** | High | Medium | Low |
| **Time to get started** | Hours (build and configure VMs) | Minutes (deploy code) | Seconds (sign up, log in) |
| **How you pay** | Per VM/resource, while it runs | Per plan, instance, or execution | Per user, per month (subscription) |
| **Azure examples** | Virtual Machines, Virtual Network, Managed Disks | App Service, Azure SQL Database, Functions, Cosmos DB | Microsoft 365, Teams, Outlook, Dynamics 365 |

**The trade-off in one line:** the more control you get, the more work you do. IaaS = most control, most work. SaaS = least control, least work. PaaS sits in the middle.

---

## 3. IaaS: Use Cases and When to Use It

**IaaS = renting virtual hardware.** Microsoft gives you a VM; what happens inside it is your job.

### Common use cases

| Use case | Why IaaS fits |
|---|---|
| **Lift-and-shift migration** | Move existing on-prem servers to Azure **without changing the app**. The VM looks just like the old server. |
| **Test and development environments** | Spin up VMs for testing, then delete them when done. Pay only while they run. |
| **Legacy or custom software** | Old apps that need a specific OS version, custom drivers, or software that must be installed on the server. |
| **Full control over the OS** | You need to choose the OS, configure it deeply, or run special security tools on it. |
| **Website hosting on your own terms** | You want to install and configure the web server yourself. |
| **Storage, backup, and recovery** | Store and back up data without buying storage hardware. |
| **High-performance computing (HPC)** | Big simulations or data processing that need many powerful VMs for a short time. |

### Use IaaS when...
- ✅ You're **migrating existing servers quickly** without rewriting them
- ✅ You need **control of the operating system**
- ✅ The app needs **special software, settings, or an OS version** a platform doesn't offer

### Don't use IaaS when...
- ❌ You don't want to patch, update, and secure an OS
- ❌ Your team just wants to deploy code and move on

**Azure example scenario:** A company has 50 Windows Servers in its datacenter running an old inventory app. It wants out of the datacenter in 3 months with no code changes. → **IaaS (Azure Virtual Machines)**.

---

## 4. PaaS: Use Cases and When to Use It

**PaaS = a ready-made platform for your code.** You deploy your app; Microsoft runs and patches everything under it.

### Common use cases

| Use case | Why PaaS fits |
|---|---|
| **Building and deploying web apps and APIs** | Push your code to Azure App Service; no servers to set up or patch. |
| **Managed databases** | Azure SQL Database or Cosmos DB: Microsoft handles backups, patching, and high availability. |
| **Development framework** | Developers get built-in tools for scaling, monitoring, and deployment, so they write less plumbing code. |
| **Analytics and business intelligence** | Built-in tools to analyze data and find insights without managing servers. |
| **Event-driven code (serverless)** | Azure Functions runs small pieces of code when something happens, like a file upload or a timer. |
| **Fast, frequent releases (DevOps)** | Deployment slots and CI/CD integration make shipping updates quick and safe. |

### Use PaaS when...
- ✅ Your team wants to **focus on writing code**, not managing servers
- ✅ You're **building a new app** (or modernizing an old one)
- ✅ You want **automatic scaling, patching, and backups** handled for you
- ✅ You need to **get to market fast**

### Don't use PaaS when...
- ❌ You need **full control of the OS** or must install custom software on the server
- ❌ The app can't change at all and depends on a specific server setup (that's IaaS)

**Azure example scenario:** A startup's developers built a new web app and a database. They don't want to manage servers or apply OS updates. → **PaaS (Azure App Service + Azure SQL Database)**.

**Watch out for this trap:** **SQL Server installed on an Azure VM = IaaS** (you manage the VM and OS). **Azure SQL Database = PaaS** (Microsoft manages it). Same database engine, different service type.
{: .notice--warning}

---

## 5. SaaS: Use Cases and When to Use It

**SaaS = a finished app you just use.** Sign in, configure your settings, and go.

### Common use cases

| Use case | Example |
|---|---|
| **Email and calendar** | Outlook / Exchange Online |
| **Office productivity** | Microsoft 365 (Word, Excel, PowerPoint) |
| **Chat, meetings, collaboration** | Microsoft Teams |
| **File sharing and storage** | OneDrive, SharePoint Online |
| **CRM and business apps** | Dynamics 365 |

### Use SaaS when...
- ✅ A **ready-made app** already does what you need
- ✅ You want **no development and no infrastructure** to manage
- ✅ You want to **start immediately** and pay a predictable price per user
- ✅ Users need access **from anywhere, on any device**

### Don't use SaaS when...
- ❌ You need **custom features** the app doesn't offer
- ❌ You need control over **how or where** the app runs

**Azure example scenario:** A 200-person company runs its own email server and wants to stop maintaining it. → **SaaS (Microsoft 365 / Exchange Online)**.

---

## 6. How to Choose: A 3-Step Decision Guide

```text
1. Is there a ready-made app that already does the job?
       YES -> SaaS
       NO  -> go to step 2

2. Do you need control of the operating system
   (custom software, specific OS, no code changes allowed)?
       YES -> IaaS
       NO  -> go to step 3

3. Are you building or deploying your own app/code?
       YES -> PaaS
```

**Rule of thumb:** prefer the *least* management that still meets your needs. Try **SaaS** first, then **PaaS**, and use **IaaS** only when you really need control of the OS.

---

## 7. Exam Clue Words

| Clue in the question | Answer |
|---|---|
| "lift-and-shift", "migrate without changes", "virtual machine" | **IaaS** |
| "full control of the operating system", "install custom software on the server" | **IaaS** |
| "legacy application", "specific OS version" | **IaaS** |
| "developers", "focus on code", "deploy a web app" | **PaaS** |
| "don't manage the OS", "Microsoft handles patching", "managed database" | **PaaS** |
| "runs when an event happens", "pay per execution" | **PaaS (serverless)** |
| "ready-to-use", "no development", "subscription", "per user" | **SaaS** |
| "email", "Microsoft 365", "Teams", "CRM" | **SaaS** |

---

## 8. Scenario Practice

**1. A company must move an old app that only runs on Windows Server 2016 with a custom driver. It cannot change the code.**

<details markdown="1">
<summary>Show answer</summary>

**IaaS.** Specific OS + custom driver + no code changes = you need control of the OS.
</details>

**2. A development team wants to deploy a new API and never think about servers, scaling, or patches.**

<details markdown="1">
<summary>Show answer</summary>

**PaaS** (for example, Azure App Service).
</details>

**3. A small business needs email, file sharing, and video meetings as soon as possible, with no IT staff.**

<details markdown="1">
<summary>Show answer</summary>

**SaaS** (Microsoft 365 and Teams).
</details>

**4. A team needs 10 test servers for two weeks, with full admin access, then wants to delete them.**

<details markdown="1">
<summary>Show answer</summary>

**IaaS.** Short-lived test VMs with OS-level access.
</details>

**5. A company wants a relational database but doesn't want to handle backups, patching, or high availability.**

<details markdown="1">
<summary>Show answer</summary>

**PaaS** (Azure SQL Database).
</details>

**6. Every time an image is uploaded, a small piece of code should resize it. The company wants to pay only when the code runs.**

<details markdown="1">
<summary>Show answer</summary>

**PaaS (serverless)**, using Azure Functions.
</details>

**7. A sales team needs a customer relationship management (CRM) tool without building one.**

<details markdown="1">
<summary>Show answer</summary>

**SaaS** (Dynamics 365).
</details>

**8. Which service type requires the customer to apply operating system updates?**

<details markdown="1">
<summary>Show answer</summary>

**IaaS.** In PaaS and SaaS, Microsoft patches the OS.
</details>

**9. Which service type gives the most flexibility and control? Which needs the least management?**

<details markdown="1">
<summary>Show answer</summary>

**Most control: IaaS. Least management: SaaS.**
</details>

**10. Is SQL Server running on an Azure Virtual Machine IaaS or PaaS?**

<details markdown="1">
<summary>Show answer</summary>

**IaaS.** You manage the VM and its OS. (Azure SQL Database would be PaaS.)
</details>

---

## 9. Summary

| | **IaaS** | **PaaS** | **SaaS** |
|---|---|---|---|
| **In 3 words** | Rent virtual servers | Bring your code | Just use it |
| **Pick it when** | You need OS control or must migrate as-is | You're building an app and don't want to manage servers | A ready-made app does the job |
| **Top use case** | Lift-and-shift | Web apps and APIs | Email and office apps |
| **Azure example** | Virtual Machines | App Service, Azure SQL Database | Microsoft 365 |

## References

- [Describe cloud service types (Microsoft Learn)](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/)
- [What is IaaS? (Azure)](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-iaas)
- [What is PaaS? (Azure)](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-paas)
- [What is SaaS? (Azure)](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-saas)
