---
layout: single
title: "AZ-900 Study Notes: Cloud Computing, Cloud Models, and Azure Stack"
date: 2026-10-26
show_date: true
toc: true
toc_label: "AZ-900 Study Notes"
classes: wide
tags:
  - Azure
  - AZ-900
  - Cloud Computing
  - Certification
---

I'm preparing for **AZ-900: Microsoft Azure Fundamentals**, and these are my study notes for the first big topic on the exam: *what cloud computing is*, *the different cloud models*, and *how Azure reaches outside its own datacenters* with Azure Stack and Azure Arc. I wrote them so I can come back the week before the exam, skim the tables, and test myself with the questions at the end.

**In this post you'll learn:**
- What cloud computing is and the vocabulary the exam expects (CapEx, OpEx, consumption-based pricing)
- The shared responsibility model, and who owns what in IaaS, PaaS, and SaaS
- Public, private, hybrid, and multi-cloud, and how to pick the right one for a scenario
- The benefits of the cloud: high availability, scalability, elasticity, reliability, predictability, security, governance, and manageability
- What Azure Stack (Hub, HCI/Azure Local, Edge) and Azure Arc are, and when you'd use each
- The keywords that give away the answer on scenario questions

AZ-900 has three domains: **Describe cloud concepts** (about 25–30%), **Describe Azure architecture and services** (about 35–40%), and **Describe Azure management and governance** (about 30–35%). This post covers the first domain plus the hybrid pieces from the other two. Microsoft updates the weights from time to time, so check the [official study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900) before your exam.
{: .notice--info}

---

## 1. What Is Cloud Computing?

**Cloud computing is the delivery of computing services over the internet.** Those services include compute (virtual machines, containers, functions), storage, networking, databases, analytics, and AI. Instead of buying and running your own servers, you rent what you need from a cloud provider such as Microsoft Azure, and you pay only for what you use.

A simple way to picture it: electricity. You don't build a power plant to turn on a light. You plug into the grid and pay for the kilowatt-hours you use. The cloud does the same for servers.

### Why companies move to the cloud

Running your own datacenter means you have to:

- Buy servers, storage, and network gear up front
- Pay for the building, power, cooling, and physical security
- Hire people to patch, replace, and monitor hardware
- Guess how much capacity you'll need years in advance (guess too low and you run out; guess too high and you waste money)

In the cloud, the provider handles the physical side, and you can grow or shrink in minutes instead of months. You focus on your applications and data.

### CapEx vs. OpEx

This is one of the most tested ideas on AZ-900.

| | **Capital Expenditure (CapEx)** | **Operational Expenditure (OpEx)** |
|---|---|---|
| What it is | Up-front spending on **physical infrastructure** | Spending on **services or products as you use them** |
| When you pay | Once, at the start, then the value drops over time (depreciation) | Ongoing, billed for the period you use it |
| Example | Buying servers, building a datacenter | Renting VMs in Azure, paying a monthly SaaS subscription |
| Typical of | On-premises / traditional IT | **Cloud computing** |

**Cloud computing is OpEx.** You don't buy the hardware; you pay for the service you consume.

### The consumption-based model

Azure uses a **consumption-based model**, which means:

- **No up-front costs** and no need to buy and manage expensive infrastructure
- **Pay for what you use**, and stop paying when you stop using it
- **Pay for additional resources only when you need them**
- **Stop paying for resources you no longer need**

### Pricing models to know

| Pricing model | How it works | Good for |
|---|---|---|
| **Pay-as-you-go** | Pay per second/minute/hour of use, no commitment | Unpredictable or short-term workloads, trying things out |
| **Reserved instances / reservations** | Commit to 1 or 3 years for a big discount | Steady workloads that run all the time |
| **Spot pricing** | Use Azure's spare capacity at a deep discount, but Azure can evict you with short notice | Interruptible jobs: batch processing, testing, rendering |
| **Azure Hybrid Benefit** | Reuse your existing Windows Server / SQL Server licenses in Azure | Companies that already own licenses |

### Serverless

**Serverless** doesn't mean there are no servers. It means *you don't manage them*. The cloud provider runs the servers, scales them automatically, and bills you only when your code runs. In Azure, the classic examples are **Azure Functions** (run code on an event) and **Azure Logic Apps** (run a workflow). Serverless is usually grouped with **PaaS** on the exam.

---

## 2. The Shared Responsibility Model

In a traditional datacenter, **you own everything**: the building, the hardware, the operating system, the apps, and the data. In the cloud, the responsibility is **shared** between you and the cloud provider. How much you own depends on the service type.

### Always yours, always Microsoft's

| **You are ALWAYS responsible for** | **Microsoft is ALWAYS responsible for** |
|---|---|
| The **information and data** stored in the cloud | The **physical datacenter** |
| The **devices** allowed to connect (phones, laptops) | The **physical network** |
| The **accounts and identities** of people, services, and devices | The **physical hosts** (servers) |

Remember this table. A question like *"Who is responsible for protecting your data in SaaS?"* always has the same answer: **you, the customer**. Even when Microsoft runs everything else.
{: .notice--warning}

### Who owns what, by service type

`You` = customer, `MS` = Microsoft, `Shared` = depends on the service.

| Responsibility | On-premises | IaaS | PaaS | SaaS |
|---|:---:|:---:|:---:|:---:|
| Information and data | You | You | You | You |
| Devices (mobile and PCs) | You | You | You | You |
| Accounts and identities | You | You | You | You |
| Identity and directory infrastructure | You | You | Shared | Shared |
| Applications | You | You | Shared | MS |
| Network controls | You | You | Shared | MS |
| Operating system | You | You | MS | MS |
| Physical hosts | You | MS | MS | MS |
| Physical network | You | MS | MS | MS |
| Physical datacenter | You | MS | MS | MS |

Read the table left to right: **the further right you go, the less you manage.**

### IaaS, PaaS, and SaaS

| | **IaaS** (Infrastructure as a Service) | **PaaS** (Platform as a Service) | **SaaS** (Software as a Service) |
|---|---|---|---|
| What you rent | Raw infrastructure: VMs, storage, networking | A ready-made platform to build and run apps | A finished application |
| You manage | OS, runtime, apps, data, patching | Your apps and data | Your data, users, and settings |
| Control vs. effort | **Most control**, most work | Balanced | **Least control**, least work |
| Azure examples | Azure Virtual Machines, Virtual Network, Managed Disks | Azure App Service, Azure SQL Database, Azure Functions | Microsoft 365, Outlook, Teams, Dynamics 365 |
| Common scenarios | **Lift-and-shift** migrations, test/dev environments, full control over the OS | Building apps without managing servers, dev frameworks, analytics | Email, messaging, office productivity, CRM |

An analogy that sticks:

- **On-premises** = cooking at home with ingredients you grew yourself
- **IaaS** = renting a kitchen; you bring the food and cook
- **PaaS** = a meal kit; the ingredients and recipe are ready, you just cook
- **SaaS** = eating at a restaurant; you just show up and eat

---

## 3. Cloud Models (Deployment Models)

A **cloud model** describes *where* the cloud resources live and *who* uses them. AZ-900 focuses on three, plus multi-cloud.

### Public cloud

The cloud provider (Microsoft, AWS, Google) **owns and runs** the hardware, and **many customers share it** over the internet. Each customer's data is isolated, but the physical infrastructure is shared.

- **No CapEx** to scale up; you pay as you go (OpEx)
- Apps can be provisioned and deprovisioned **quickly**
- Organizations pay **only for what they use**
- **Less control** over the hardware and its exact security setup

### Private cloud

A cloud environment used by **only one organization**. It can sit in the company's own datacenter or be hosted by a third party, but it is dedicated to that one organization.

- **Full control** over resources and security
- Can meet **strict security, compliance, or legal requirements**
- **Higher cost**: the organization buys and maintains the hardware (CapEx)
- The organization is responsible for hardware maintenance and updates

### Hybrid cloud

**Combines a public cloud and a private cloud**, and lets data and applications move between them. The organization decides where each workload runs.

- **Most flexible** of the three
- Keep sensitive or regulated workloads on the private side, and burst to the public cloud when demand spikes
- Use existing on-premises investments while adopting cloud services
- The organization decides what runs where, which means **more to manage**

### Multi-cloud

Using **two or more public cloud providers** at the same time, for example Azure and AWS. Companies do this to use the best service from each provider, to avoid depending on a single vendor, or because they are migrating from one to another. The challenge is managing resources and security across different platforms.

### Community cloud (for completeness)

A cloud **shared by several organizations with common needs**, such as government agencies or hospitals. It comes from the NIST definition of cloud computing. You'll see it in textbooks, but AZ-900 rarely asks about it.

### Comparison table

| | **Public** | **Private** | **Hybrid** |
|---|---|---|---|
| Who owns the hardware | Cloud provider | The organization (or a dedicated host) | Both |
| Who uses it | Many customers | One organization | One organization, across both |
| Cost model | OpEx, pay-as-you-go | CapEx, plus maintenance | Mix of both |
| Control | Least | Most | Flexible |
| Scale | Practically unlimited | Limited by your hardware | Burst to public when needed |
| Best for | Fast scaling, no up-front cost | Strict compliance, full control | Keeping some data on-prem while using the cloud |

### How to pick on the exam

| If the scenario says... | The answer is usually... |
|---|---|
| "No up-front cost", "pay only for what you use", "scale quickly", "no hardware to maintain" | **Public cloud** |
| "Complete control", "strict regulatory requirements", "data must stay in our own datacenter", "single organization" | **Private cloud** |
| "Keep some data on-premises while using cloud services", "burst to the cloud during peak demand", "use existing on-prem investments" | **Hybrid cloud** |
| "Use Azure and AWS together", "avoid vendor lock-in" | **Multi-cloud** |

---

## 4. Benefits of Using the Cloud

The exam lists the benefits in three groups. Know what each word means, because the questions often hinge on the difference between two similar-sounding terms.

### Group 1: High availability and scalability

**High availability** means your application stays **up and accessible** with as little downtime as possible, even when something fails. Azure backs its services with **Service Level Agreements (SLAs)** that promise a percentage of uptime.

| SLA | Max downtime per month | Max downtime per year |
|---|---|---|
| 99% | ~7.2 hours | ~3.65 days |
| 99.9% | ~43.8 minutes | ~8.76 hours |
| 99.95% | ~21.9 minutes | ~4.38 hours |
| 99.99% | ~4.38 minutes | ~52.6 minutes |
| 99.999% | ~26 seconds | ~5.26 minutes |

Each extra "9" cuts the allowed downtime by about 10×.

**Scalability** means the ability to **adjust resources to meet demand**. There are two directions:

| | **Vertical scaling** (scale up / down) | **Horizontal scaling** (scale out / in) |
|---|---|---|
| What changes | The **size** of a resource (more CPU, more RAM) | The **number** of resources (more VMs or instances) |
| Example | Change a VM from 2 vCPUs to 8 vCPUs | Go from 2 web servers to 10 web servers |
| Think | A **bigger** machine | **More** machines |

**Elasticity** is closely related: it means scaling happens **automatically** based on demand. An e-commerce site that adds servers on Black Friday and removes them afterward, without anyone clicking a button, is elastic. Scalability is the *ability* to scale; elasticity is scaling *automatically and dynamically*.

**Agility** means you can **deploy and configure resources quickly**, in minutes instead of the weeks it takes to buy and rack hardware.

### Group 2: Reliability and predictability

**Reliability** is the ability of a system to **recover from failures and keep working**. Azure's global network of regions lets you run copies of your app in different places, so if one region has a disaster, another takes over. Related terms:

- **Fault tolerance**: a component fails and a redundant one takes over with no interruption
- **Disaster recovery**: getting back up and running after a major outage, using backups and replication to another region

**Predictability** comes in two forms:

- **Performance predictability**: you can count on the resources you need to deliver a good experience (autoscaling, load balancing, high availability)
- **Cost predictability**: you can forecast and track what you'll spend (Azure Pricing Calculator, TCO Calculator, Microsoft Cost Management)

### Group 3: Security, governance, and manageability

**Security**: the cloud gives you security tools and patches built in. Pick **IaaS** if you want maximum control over security (you patch the OS), or **PaaS/SaaS** if you want the provider to handle patching for you. Microsoft also handles **physical security** of the datacenter and protects against attacks like DDoS at the network level.

**Governance**: the cloud helps you meet **corporate, industry, and legal standards**. You can set templates and policies so new resources are compliant by default, and audit for anything that drifts. In Azure, this is done with tools like **Azure Policy**.

**Manageability** has two meanings:

- **Management *of* the cloud**: managing your resources, such as scaling automatically, deploying from templates, monitoring health, and getting alerts
- **Management *in* the cloud**: *how* you manage, through the **Azure portal**, **Azure CLI**, **Azure PowerShell**, **APIs**, or infrastructure-as-code templates (ARM, Bicep)

### Quick-recall table

| Term | One-line meaning |
|---|---|
| High availability | Stays up; measured by SLA uptime % |
| Scalability | Can add or remove resources to meet demand |
| Elasticity | Scales **automatically** with demand |
| Agility | Deploys **fast** |
| Reliability | Recovers from failures |
| Fault tolerance | A backup component takes over with no interruption |
| Disaster recovery | Gets back up after a major outage |
| Predictability | Know your performance and cost ahead of time |
| Security | Built-in tools; you choose your level of control |
| Governance | Meets standards and policies; stays compliant |
| Manageability | Easy to manage, many ways to manage |
| Geo-distribution | Deploy close to users worldwide |

---

## 5. Azure in Your Own Datacenter: Azure Stack

Many organizations can't put everything in the public cloud. They may have data that legally must stay in their own building, a factory or ship with a poor internet connection, or latency requirements that need compute right next to the equipment. **Azure Stack** is Microsoft's family of products that brings **Azure services and capabilities into your own datacenter or edge location**. It's the main way Azure supports **hybrid** scenarios with hardware you run yourself.

### The Azure Stack family

| Product | What it is | Typical use case |
|---|---|---|
| **Azure Stack Hub** | An extension of Azure that runs **Azure services (IaaS and PaaS) on-premises** on certified hardware. Can run **fully disconnected** from the internet. | Run Azure-consistent apps in your own datacenter for **regulatory, sovereignty, or disconnected** needs (a cruise ship, a military site, an oil rig). Develop once, deploy to Azure or Azure Stack Hub. |
| **Azure Stack HCI** (now **Azure Local**) | A **hyperconverged infrastructure (HCI)** solution that runs **virtualized Windows and Linux workloads** on-premises on validated hardware, managed from Azure. | **Modernize an on-premises datacenter**, run VMs and virtual desktops at branch offices, keep latency-sensitive workloads on-site. |
| **Azure Stack Edge** | A **Microsoft-managed appliance** (hardware-as-a-service) that brings compute, storage, and **AI/ML inference** to the edge, and can transfer data to Azure. | Run AI at the **edge**: analyze camera footage in a store, process sensor data in a factory before sending results to Azure. |

**About the names:** in late 2024 Microsoft renamed **Azure Stack HCI** to **Azure Local**. Older textbooks and practice tests still say "Azure Stack HCI", and the exam may use either name. They are the same product.
{: .notice--info}

### How to remember the three

- **Hub** = "**Azure in a box**": the Azure services themselves (VMs, App Service, storage) running in *your* datacenter, even offline
- **HCI / Azure Local** = "**modern virtualization**": your own servers running VMs, managed through Azure
- **Edge** = "**AI appliance at the edge**": a box Microsoft ships to you for compute and ML close to where data is created

### Azure Arc: managing everything from Azure

Azure Stack brings Azure *hardware and services* to you. **Azure Arc** does something different: it brings Azure *management* to resources that live **outside Azure**. With Arc, you can see and govern resources in one place, the Azure portal, no matter where they run:

- **Servers** (physical or virtual, Windows or Linux) in your datacenter or in **another cloud like AWS or Google Cloud**
- **Kubernetes clusters** anywhere
- **Azure data services** (such as SQL Managed Instance) on-premises
- **SQL Server** instances
- **VMs** on VMware vSphere or Azure Local

Once a resource is connected through Arc, you can apply **Azure Policy**, **role-based access control (RBAC)**, **tags**, and monitoring to it as if it were an Azure resource.

| | **Azure Stack** | **Azure Arc** |
|---|---|---|
| What it brings | Azure **services/hardware** to your location | Azure **management** to resources outside Azure |
| Physical hardware? | Yes, certified hardware or a Microsoft appliance | No, it's a management layer (an agent) |
| Main scenario | Run Azure-consistent workloads on-prem or at the edge | Govern hybrid **and multi-cloud** resources from one portal |

### Azure VMware Solution

One more hybrid service worth knowing: **Azure VMware Solution** lets you run your **VMware workloads in Azure** without rewriting them. It's a good fit when a company already runs VMware on-premises and wants to move to Azure with minimal change.

### Which hybrid tool fits the scenario?

| If the scenario says... | The answer is usually... |
|---|---|
| "Run Azure services in our own datacenter", "disconnected from the internet", "Azure-consistent apps on-premises" | **Azure Stack Hub** |
| "Hyperconverged infrastructure", "run virtual machines on-premises managed from Azure", "branch office VMs" | **Azure Stack HCI / Azure Local** |
| "AI/ML at the edge", "process data locally before sending to Azure", "Microsoft-managed appliance" | **Azure Stack Edge** |
| "Manage servers in AWS and on-prem from the Azure portal", "apply Azure Policy to non-Azure resources" | **Azure Arc** |
| "Move our VMware VMs to Azure with minimal change" | **Azure VMware Solution** |

---

## 6. Exam Keywords Cheat Sheet

| Keyword in the question | Think of |
|---|---|
| Up-front cost, buying hardware, depreciation | **CapEx** |
| Pay as you go, monthly bill, rent | **OpEx** |
| Full control over the OS, lift-and-shift | **IaaS** |
| Build apps without managing servers/OS | **PaaS** |
| Ready-to-use software, Microsoft 365 | **SaaS** |
| Run code on an event, pay per execution | **Serverless** (Azure Functions) |
| Always the customer's responsibility | **Data, devices, accounts and identities** |
| Always Microsoft's responsibility | **Physical datacenter, network, hosts** |
| Bigger VM | **Vertical** scaling (scale up) |
| More VMs | **Horizontal** scaling (scale out) |
| Scales automatically with demand | **Elasticity** |
| Uptime percentage | **SLA / High availability** |
| Recover from a regional outage | **Disaster recovery / Reliability** |
| Forecast costs | **Predictability** |
| Enforce company standards | **Governance** (Azure Policy) |
| Azure services on-prem, even offline | **Azure Stack Hub** |
| Manage non-Azure resources from Azure | **Azure Arc** |

---

## 7. Practice Questions

Try each one before opening the answer.

**1. A company wants to stop buying servers and instead pay a monthly bill based on what it uses. Which expense model is this?**

<details markdown="1">
<summary>Show answer</summary>

**Operational Expenditure (OpEx).** Buying servers up front is CapEx; paying for services as you use them is OpEx.
</details>

**2. In a SaaS solution such as Microsoft 365, who is responsible for the data stored in it?**

<details markdown="1">
<summary>Show answer</summary>

**The customer.** Information and data, devices, and accounts and identities are always the customer's responsibility, in every service type.
</details>

**3. You want to migrate existing on-premises VMs to Azure with as few changes as possible, and you need control over the operating system. Which service type fits best?**

<details markdown="1">
<summary>Show answer</summary>

**IaaS** (Azure Virtual Machines). This is a classic "lift-and-shift" scenario.
</details>

**4. A hospital must keep patient records in its own datacenter for compliance, but wants to use Azure for its public website and to handle traffic spikes. Which cloud model is this?**

<details markdown="1">
<summary>Show answer</summary>

**Hybrid cloud.** Sensitive data stays private (on-premises), while other workloads use the public cloud.
</details>

**5. Your web app adds more VM instances automatically during peak hours and removes them when traffic drops. Which cloud benefit does this describe?**

<details markdown="1">
<summary>Show answer</summary>

**Elasticity.** Scaling that happens automatically based on demand. (The type of scaling is **horizontal**, because the number of VMs changes.)
</details>

**6. You change a VM from 4 GB of RAM to 16 GB of RAM. What kind of scaling is this?**

<details markdown="1">
<summary>Show answer</summary>

**Vertical scaling (scale up).** You made the existing resource bigger instead of adding more resources.
</details>

**7. A cruise line needs to run Azure-consistent applications on its ships, which are often without internet access. Which product should it use?**

<details markdown="1">
<summary>Show answer</summary>

**Azure Stack Hub.** It runs Azure services on-premises and supports fully disconnected scenarios.
</details>

**8. A company has servers in its own datacenter and in AWS. It wants to manage all of them and apply Azure Policy from the Azure portal. What should it use?**

<details markdown="1">
<summary>Show answer</summary>

**Azure Arc.** Arc extends Azure management and governance to resources outside Azure, including other clouds.
</details>

**9. A retailer wants to run AI models on camera footage inside each store, then send only the results to Azure. Which product fits?**

<details markdown="1">
<summary>Show answer</summary>

**Azure Stack Edge.** A Microsoft-managed appliance for compute and AI/ML inference at the edge.
</details>

**10. True or false: Serverless computing means there are no servers involved.**

<details markdown="1">
<summary>Show answer</summary>

**False.** The servers still exist; the cloud provider manages them, scales them, and bills you only when your code runs.
</details>

**11. Which cloud model gives an organization the most control over its resources and security?**

<details markdown="1">
<summary>Show answer</summary>

**Private cloud.** The trade-off is higher cost and the responsibility to maintain the hardware.
</details>

**12. An SLA of 99.9% allows roughly how much downtime per month?**

<details markdown="1">
<summary>Show answer</summary>

**About 43.8 minutes per month** (about 8.76 hours per year).
</details>

---

## 8. Key Takeaways

- **Cloud computing** = renting compute, storage, and networking over the internet, paying for what you use (**OpEx**, consumption-based)
- **Shared responsibility**: you always own your **data, devices, and identities**; Microsoft always owns the **physical** layer. The rest depends on **IaaS → PaaS → SaaS** (less to manage as you go right)
- **Cloud models**: **public** (shared, pay-as-you-go), **private** (one organization, full control), **hybrid** (both together), **multi-cloud** (more than one provider)
- **Benefits**: high availability (SLA), scalability (vertical vs. horizontal), elasticity (automatic), reliability, predictability, security, governance, manageability
- **Azure Stack** brings Azure **to your location**: **Hub** (Azure services on-prem, even offline), **HCI / Azure Local** (hyperconverged VMs managed from Azure), **Edge** (AI appliance at the edge)
- **Azure Arc** brings Azure **management** to anything outside Azure, including other clouds

## References

- [AZ-900 study guide (Microsoft Learn)](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900)
- [Microsoft Azure Fundamentals: Describe cloud concepts (learning path)](https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/)
- [Shared responsibility in the cloud](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
- [Azure Stack Hub overview](https://learn.microsoft.com/en-us/azure-stack/operator/azure-stack-overview)
- [Azure Local (formerly Azure Stack HCI) overview](https://learn.microsoft.com/en-us/azure/azure-local/overview)
- [Azure Stack Edge overview](https://learn.microsoft.com/en-us/azure/databox-online/)
- [Azure Arc overview](https://learn.microsoft.com/en-us/azure/azure-arc/overview)
- [Azure VMware Solution introduction](https://learn.microsoft.com/en-us/azure/azure-vmware/introduction)
