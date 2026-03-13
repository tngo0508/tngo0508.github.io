---
layout: single
title: "REST vs. gRPC: A Beginner's Guide to Microservices Communication"
date: 2026-03-12
show_date: true
toc: true
toc_label: "REST vs. gRPC"
classes: wide
tags:
  - Microservices
  - REST
  - gRPC
  - Architecture
  - API
  - FHIR
  - Healthcare
---

If you're just starting your journey into the world of **Microservices**, one of the first big questions you'll encounter is: *"How do these services talk to each other?"* 

In a traditional "Monolith" application, communication is easy—you just call a method. But in microservices, each service is a separate "island." To share information, they need a bridge. The two most popular "bridges" today are **REST** and **gRPC**.

In this post, we'll explain both in simple terms, using analogies to help you understand when to use which.

---

## 1. What is REST? (The Universal Language)

**REST (Representational State Transfer)** is like the "English" of the internet. It's the standard way that almost all web applications communicate today.

### The Analogy: The Library
Think of REST like visiting a **Library**.
- **Resources:** Everything in the library is a "resource" (a book, a magazine, a CD).
- **URLs:** Each resource has a unique address (e.g., `/books/123`).
- **Verbs (Actions):** You use standard "verbs" to interact with those resources:
    - `GET`: Read a book (Retrieve data).
    - `POST`: Donate a new book to the library (Create data).
    - `PUT`: Replace an old, damaged book with a new one (Update data).
    - `DELETE`: Remove a book from the shelf (Delete data).

### Why use REST?
1.  **Human Readable:** REST usually uses **JSON** (JavaScript Object Notation), which looks like plain text. It's easy for humans to read and debug.
2.  **Simple & Flexible:** It works over standard HTTP/1.1. You don't need any special tools to test it—even your browser can do it!
3.  **Stateless:** The server doesn't need to "remember" who you are between requests. Each request contains everything the server needs to know.

---

## 2. What is gRPC? (The High-Speed Specialist)

**gRPC (Google Remote Procedure Call)** is a newer technology designed for high-performance communication between services.

### The Analogy: The Internal Intercom System
If REST is like a library where anyone can walk in and browse, gRPC is like a **High-Tech Intercom System** inside a secret laboratory.

- **Direct Communication:** Instead of looking at "resources," gRPC is about "actions." It's as if Service A can directly "call" a function sitting inside Service B, even though they are on different servers.
- **Binary Format:** Instead of sending readable text (JSON), gRPC sends **Binary Data** (using Protocol Buffers). It's like sending a coded message that's tiny and incredibly fast to transmit, even if humans can't read it by eye.
- **HTTP/2:** It uses a faster, more modern version of the web's protocol that allows for "streaming" (sending data continuously without waiting for a reply).

---

## 3. A Note on Performance: Latency vs. Throughput

When we talk about gRPC being "faster," it's helpful to understand *why* by looking at two key terms: **Latency** and **Throughput**.

### Latency (The Delay)
Think of latency as the **Travel Time**. 
- **Analogy:** How long it takes for a single pizza delivery car to get from the shop to your house.
- **In Tech:** It's the time it takes for *one* request to go to the server and for the response to come back. gRPC has lower latency because it uses binary data, which is smaller and quicker to process than text.

### Throughput (The Volume)
Think of throughput as the **Delivery Capacity**.
- **Analogy:** How many pizzas the shop can deliver in one hour across all its drivers.
- **In Tech:** It's how many requests your system can handle at the same time. gRPC has higher throughput because it uses **HTTP/2**, which allows it to send many messages at once over a single connection, like a multi-lane highway.

---

## 4. Comparison: Head-to-Head

| Feature | REST | gRPC |
| :--- | :--- | :--- |
| **Data Format** | JSON (Plain Text) | Protobuf (Binary) |
| **Speed** | Fast | **Super Fast** |
| **Readability** | High (Easy to read) | Low (Needs tools to decode) |
| **Strictness** | Flexible | **Strict** (Both sides must agree on a "Contract") |
| **Best For** | Public APIs, Browser/Mobile apps | Internal communication between services |

---

## 5. Which one should you use?

The short answer is: **It depends on who is talking to whom.**

### Use REST when:
- **Your client is a Web Browser:** Browsers love REST.
- **You are building a Public API:** You want it to be easy for other developers to understand and use.
- **You want simplicity:** It's easier to set up and debug.

### Use gRPC when:
- **Service-to-Service Communication:** When your "Backend A" needs to talk to "Backend B."
- **High Performance is Critical:** If you are handling millions of requests per second.
- **Real-time Data:** If you need features like "Streaming" (e.g., a live sports scoreboard or a chat app).

---

## 6. Implementation Examples (C#)

Let's look at how we'd implement a simple "Greeter" service in C# for both.

### REST Example (ASP.NET Core Controller)

In REST, you define a **Controller** with "Actions" that match HTTP verbs.

```csharp
[ApiController]
[Route("api/[controller]")]
public class GreeterController : ControllerBase
{
    // GET: api/greeter?name=Thomas
    [HttpGet]
    public IActionResult SayHello(string name)
    {
        return Ok(new { Message = $"Hello, {name}!" });
    }
}
```

**Calling the REST API (Client Side)**

```csharp
using var client = new HttpClient();
var response = await client.GetAsync("https://api.example.com/api/greeter?name=Thomas");
var content = await response.Content.ReadAsStringAsync();
Console.WriteLine(content); // Output: {"message":"Hello, Thomas!"}
```

### gRPC Example (.NET Service)

In gRPC, you first define your "Contract" in a `.proto` file.

**1. The Contract (greeter.proto)**
```proto
syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

**2. The Implementation (GreeterService.cs)**
```csharp
public class GreeterService : Greeter.GreeterBase
{
    public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context)
    {
        return Task.FromResult(new HelloReply
        {
            Message = "Hello " + request.Name
        });
    }
}
```

**Calling the gRPC Service (Client Side)**

```csharp
using var channel = GrpcChannel.ForAddress("https://localhost:5001");
var client = new Greeter.GreeterClient(channel);
var reply = await client.SayHelloAsync(new HelloRequest { Name = "Thomas" });
Console.WriteLine(reply.Message); // Output: Hello Thomas
```

---

## 7. REST in the Real World: GitHub, Stripe, and FHIR

While REST is used for almost everything, it shines when different systems need a common way to talk to each other.

### 1. Public APIs (GitHub & Stripe)
If you've ever used a developer API, you've likely used REST. 
- **GitHub API:** Developers use it to fetch repository info or create issues.
- **Stripe API:** Almost every payment on the internet is processed through Stripe's RESTful API. 

### 2. Industry Standards: FHIR (Healthcare)
One of the most important modern uses of REST is **FHIR**.

**FHIR (Fast Healthcare Interoperability Resources)** is a global standard for exchanging electronic health records. 

### How it relates to REST:
FHIR is built entirely on **RESTful principles**.
- **Resources:** Instead of generic "Books" in our library, FHIR defines healthcare resources like `Patient`, `Observation`, `Medication`, and `Appointment`.
- **Standard URLs:** To get a patient's information, you'd make a REST call like `GET /Patient/123`.
- **Standard Format:** It uses **JSON** (or XML), making it easy for different hospital systems to talk to each other without misinterpretation.

### The Analogy: The Universal Medical Form
Imagine every hospital in the world agreed to use the exact same form for a patient's history. No matter which country or hospital you go to, the "Patient Name" is always in the same box. That's what FHIR does for healthcare data—it uses the "Bridge" of REST to make sure medical information can travel safely and clearly between systems.

### FHIR Implementation Example (C#)

In the .NET world, developers use the official FHIR library to work with these resources easily. Here is how you might create a `Patient` resource in C#:

```csharp
using Hl7.Fhir.Model;
using Hl7.Fhir.Rest;

// 1. Create a new Patient resource
var patient = new Patient
{
    Id = "123",
    Active = true,
    Name = new List<HumanName> 
    { 
        new HumanName { Family = "Smith", Given = new[] { "John" } } 
    },
    Gender = AdministrativeGender.Male,
    BirthDate = "1980-01-01"
};

// 2. Send the Patient to a FHIR Server (Client Side)
var client = new FhirClient("https://server.fire.ly");
var createdPatient = await client.CreateAsync(patient);
Console.WriteLine($"Created Patient ID: {createdPatient.Id}");
```

---

## 8. gRPC in the Real World: Netflix & Internal Microservices

While REST is the king of the public internet, **gRPC** is the king of the "Internal Backend."

### The Case Study: Netflix
Netflix is one of the most famous users of gRPC. When you press "Play" on a movie, your request doesn't just go to one server. It triggers a chain reaction:
1. One service checks your subscription.
2. Another service fetches your "Continue Watching" progress.
3. Another service selects the best streaming server for your location.
4. Another service logs the event for recommendations.

All these services (hundreds of them!) need to talk to each other **instantly**. 

### Why gRPC fits Netflix:
- **Speed:** With millions of people watching at once, even a millisecond of delay per service call adds up. gRPC's binary format keeps things moving at lightning speed.
- **Polyglot (Many Languages):** Netflix uses different programming languages (Java, Node.js, Python). gRPC allows a Java service to talk to a Node.js service as easily as if they were written in the same language.

### The Analogy: The Pit Crew
Think of gRPC at Netflix like a **Formula 1 Pit Crew**. Every second counts, every person has a specific job, and they use highly specialized, high-speed tools to get the car back on the track. They don't use "general purpose" tools because they need the absolute best performance for their specific environment.

---

## 9. Summary for Beginners

In a modern microservices architecture, it's very common to use **both**:

1.  **The "Front Door" (REST):** When a user's mobile app or browser talks to your system, they use REST.
2.  **The "Back Hallway" (gRPC):** Once the request is inside your system, your internal microservices talk to each other using gRPC to ensure maximum speed and efficiency.

Understanding these two will give you a solid foundation as you build more complex, scalable systems!

---

## 10. Further Reading
*   **HL7 FHIR:** [FHIR Foundation - Getting Started](https://fhir.org/guides/hrsa/getting-started.html)
*   **Microsoft Learn:** [REST vs. gRPC for .NET Microservices](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/communication-in-microservice-architecture)
*   **gRPC Official Documentation:** [Introduction to gRPC](https://grpc.io/docs/what-is-grpc/introduction/)
