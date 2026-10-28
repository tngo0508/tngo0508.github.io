---
layout: single
title: "AZ-900 Study Notes: Cloud Service Types (IaaS, PaaS, SaaS)"
date: 2026-10-27
show_date: true
toc: true
toc_label: "Cloud Service Types"
classes: wide
tags:
  - Azure
  - AZ-900
  - Cloud Computing
  - Certification
---

Short, exam-focused notes on the three cloud service types: **IaaS, PaaS, and SaaS**. Read it once, then use the tables and the quiz at the end to review.

This post builds on my [AZ-900 notes on cloud computing, cloud models, and Azure Stack]({% post_url 2026-10-26-az-900-cloud-computing-cloud-models-azure-stack %}).
{: .notice--info}

---

## 1. The Big Idea in One Sentence

**The service type decides how much *you* manage and how much *Microsoft* manages.**

```text
More control, more work  <---------------------------->  Less control, less work

   On-premises        IaaS              PaaS              SaaS
   (you do it all)    (you get VMs)     (you get a        (you get a
                                         platform)          finished app)
```

Memory trick: **I → P → S = "I Prefer Simple."** Each step to the right is simpler for you.

---

## 2. The Pizza Analogy

| Type | Pizza version | What you do |
|---|---|---|
| **On-premises** | Make pizza at home | Everything: dough, oven, table |
| **IaaS** | Rent a kitchen | You bring the ingredients and cook |
| **PaaS** | Pizza delivery | You just set the table and eat |
| **SaaS** | Eat at a restaurant | You just show up and eat |

---

## 3. The Three Types

### IaaS: Infrastructure as a Service

**You rent the hardware (as virtual machines). You manage everything on top of it.**

- **You manage:** operating system, patches, runtime, apps, data
- **Microsoft manages:** physical servers, network, datacenter
- **Most control, most work**
- **Azure examples:** Azure Virtual Machines, Azure Virtual Network, Azure Managed Disks
- **Use it for:** **lift-and-shift** (move on-prem servers to Azure without changes), test and dev environments, needing full control of the OS

### PaaS: Platform as a Service

**You bring your code and data. Microsoft runs the platform (servers, OS, patching).**

- **You manage:** your application code and data
- **Microsoft manages:** everything below your app, including the OS, patching, and runtime
- **Balanced control and work**
- **Azure examples:** Azure App Service, Azure SQL Database, Azure Functions, Azure Cosmos DB
- **Use it for:** building and deploying apps fast without managing servers

### SaaS: Software as a Service

**You use a finished app. Microsoft runs all of it.**

- **You manage:** your data, users, and settings
- **Microsoft manages:** the whole app and everything under it
- **Least control, least work**
- **Examples:** Microsoft 365 (Word, Excel, Outlook), Teams, Dynamics 365
- **Use it for:** email, office work, messaging, CRM: ready-to-use software

---

## 4. Side-by-Side Comparison

| | **IaaS** | **PaaS** | **SaaS** |
|---|---|---|---|
| You get | Virtual machines | A platform to run code | A finished app |
| You manage | OS + apps + data | Apps + data | Data + users |
| Who patches the OS? | **You** | Microsoft | Microsoft |
| Control | Highest | Medium | Lowest |
| Effort | Highest | Medium | Lowest |
| Azure example | Virtual Machines | App Service, Azure SQL Database | Microsoft 365 |
| Typical user | IT admins | Developers | End users |

---

## 5. Shared Responsibility at a Glance

✅ = you manage it. ☁️ = Microsoft manages it. 🤝 = shared.

| | IaaS | PaaS | SaaS |
|---|:---:|:---:|:---:|
| Data, devices, accounts and identities | ✅ | ✅ | ✅ |
| Identity and directory infrastructure | ✅ | 🤝 | 🤝 |
| Applications | ✅ | 🤝 | ☁️ |
| Network controls | ✅ | 🤝 | ☁️ |
| Operating system | ✅ | ☁️ | ☁️ |
| Physical hosts, network, datacenter | ☁️ | ☁️ | ☁️ |

**The two rules that answer most questions:**
1. **Your data, devices, and accounts are ALWAYS yours**, even in SaaS.
2. **The physical datacenter is ALWAYS Microsoft's**, even in IaaS.
{: .notice--warning}

---

## 6. Where Does Serverless Fit?

**Serverless** = you write code (or a workflow), Microsoft runs it **only when something triggers it**, and you pay **only when it runs**. Servers still exist; you just never see them.

- **Azure Functions** (run code on an event)
- **Azure Logic Apps** (run a workflow)

On the exam, **serverless is treated as part of PaaS**.

---

## 7. Spot the Answer: Exam Keywords

| If the question says... | Answer |
|---|---|
| "full control of the OS", "lift-and-shift", "install custom software on the server", "virtual machine" | **IaaS** |
| "deploy code without managing servers", "focus on development", "Microsoft handles OS patching", "managed database" | **PaaS** |
| "ready-to-use", "subscription software", "email", "Microsoft 365", "no development needed" | **SaaS** |
| "run code when an event happens", "pay per execution" | **Serverless (PaaS)** |

---

## 8. Quick Quiz

**1. You need to move 20 on-premises servers to Azure without changing them. Which type?**

<details markdown="1">
<summary>Show answer</summary>

**IaaS.** That's lift-and-shift onto Azure Virtual Machines.
</details>

**2. Your developers want to deploy a web app and never patch an OS. Which type?**

<details markdown="1">
<summary>Show answer</summary>

**PaaS.** For example, Azure App Service.
</details>

**3. Your company switches its email to Microsoft 365. Which type?**

<details markdown="1">
<summary>Show answer</summary>

**SaaS.**
</details>

**4. In IaaS, who patches the operating system?**

<details markdown="1">
<summary>Show answer</summary>

**You, the customer.** In PaaS and SaaS, Microsoft does.
</details>

**5. In SaaS, who is responsible for your data?**

<details markdown="1">
<summary>Show answer</summary>

**You, the customer.** Data is always the customer's responsibility.
</details>

**6. Which type gives you the MOST control? The LEAST?**

<details markdown="1">
<summary>Show answer</summary>

**Most: IaaS. Least: SaaS.**
</details>

**7. Is Azure SQL Database IaaS, PaaS, or SaaS?**

<details markdown="1">
<summary>Show answer</summary>

**PaaS.** Microsoft manages the database server and OS; you manage your data and schema. (SQL Server installed on an Azure VM would be **IaaS**.)
</details>

**8. Azure Functions runs code only when an event happens. Which category?**

<details markdown="1">
<summary>Show answer</summary>

**Serverless**, which counts as **PaaS** on the exam.
</details>

---

## 9. Remember These 5 Things

1. **IaaS = rent VMs.** You manage the OS. Most control. (Azure Virtual Machines)
2. **PaaS = bring your code.** Microsoft manages the OS. (App Service, Azure SQL Database, Functions)
3. **SaaS = use the app.** Microsoft manages everything but your data. (Microsoft 365)
4. **Data, devices, and identities are always yours.** The physical datacenter is always Microsoft's.
5. **I → P → S: control goes down, convenience goes up.**

## References

- [Describe cloud service types (Microsoft Learn)](https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/)
- [Shared responsibility in the cloud](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
