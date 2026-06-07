---
title: "Building a Todo List App with ReactJS and .NET 10 from Scratch"
excerpt: "A comprehensive guide on creating a full-stack Todo list application using ReactJS for the frontend and ASP.NET Core .NET 10 for the backend, featuring both manual and Data Annotation validation."
date: 2026-06-07
categories:
  - Full Stack
  - .NET
  - React
tags:
  - ReactJS
  - .NET 10
  - ASP.NET Core
  - C#
  - Tutorial
toc: true
toc_label: "Guide Sections"
---

### 1. Introduction

In this tutorial, we will build a simple but functional Todo List application from the ground up. You will learn how to set up a **.NET 10 Web API** backend and a **ReactJS** frontend. We will also implement basic input validation on both sides to ensure data integrity.

#### Vocabulary & Key Terms
- **Full-Stack:** Developing both the client-side (frontend) and server-side (backend) of an application.
- **Web API:** A set of endpoints provided by the backend that the frontend calls to interact with data.
- **CORS (Cross-Origin Resource Sharing):** A security feature that allows or restricts resources on a web page to be requested from another domain.
- **Middleware:** Software that sits between the request and response in the .NET pipeline.
- **State Management:** How the frontend keeps track of data (like the list of todos) as it changes.

---

### 2. Prerequisites

Before we begin, ensure you have the following installed:
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js and npm](https://nodejs.org/)
- A code editor (Visual Studio, VS Code, or Rider)

---

### 3. Project Structure

To help you stay organized, here is the folder and file structure for the `TodoApp` solution:

```text
TodoApp/
├── TodoApi/                 # .NET 10 Web API
│   ├── Controllers/
│   │   └── TodoController.cs
│   ├── Models/
│   │   └── TodoItem.cs
│   ├── Program.cs           # Configuration & CORS
│   └── TodoApi.csproj
└── todo-client/             # React Frontend (Vite)
    ├── src/
    │   ├── App.jsx          # Main logic & Validation
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

### 4. Step 1: Create the .NET 10 Backend

First, let's create a directory for our project and set up the Web API.

```bash
mkdir TodoApp
cd TodoApp
dotnet new webapi -n TodoApi
```

#### The Model
Create a `Models` folder in `TodoApi` and add a `TodoItem.cs` file:

```csharp
namespace TodoApi.Models;

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}
```

#### The Controller
Create a `Controllers/TodoController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private static List<TodoItem> _todos = new();
    private static int _nextId = 1;

    [HttpGet]
    public ActionResult<IEnumerable<TodoItem>> Get() => Ok(_todos);

    [HttpPost]
    public IActionResult Create(TodoItem item)
    {
        // Simple Backend Validation
        if (string.IsNullOrWhiteSpace(item.Title))
        {
            return BadRequest("Title cannot be empty.");
        }

        item.Id = _nextId++;
        _todos.Add(item);
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var item = _todos.FirstOrDefault(t => t.Id == id);
        if (item == null) return NotFound();
        
        _todos.Remove(item);
        return NoContent();
    }
}
```

#### Enabling CORS
In `Program.cs`, allow the React app to communicate with the API:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173") // Vite default port
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowReactApp");
app.MapControllers();
app.Run();
```

---

### 5. Step 2: Create the React Frontend

We will use **Vite** for a fast React setup. Run this in the `TodoApp` root directory (outside `TodoApi`):

```bash
npm create vite@latest todo-client -- --template react
cd todo-client
npm install
```

#### Todo Component logic
Edit `src/App.jsx`:

```jsx
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/todo"; // Adjust to your .NET port

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => setTodos(data));
  }, []);

  const addTodo = async () => {
    // Frontend Validation
    if (!newTodo.trim()) {
      setError("Please enter a task!");
      return;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo, isCompleted: false })
    });

    if (response.ok) {
      const addedTodo = await response.json();
      setTodos([...todos, addedTodo]);
      setNewTodo("");
      setError("");
    }
  };

  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setTodos(todos.filter(t => t.Id !== id)); // Note: JSON might use PascalCase or camelCase
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <div className="input-group">
        <input 
          value={newTodo} 
          onChange={(e) => setNewTodo(e.target.value)} 
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.title}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

---

### 6. Understanding Validation Concepts

#### Why Validate on Both Sides?
1.  **Frontend Validation:** Provides immediate feedback to the user (e.g., "Field required"). It improves user experience (UX) but can be bypassed by malicious users.
2.  **Backend Validation:** The "Source of Truth." It protects your database and system. Even if someone uses a tool like Postman to skip your React form, the .NET backend will still catch the empty title and return a `400 Bad Request`.

---

### 7. Running the App

1.  **Start Backend:**
    ```bash
    cd TodoApi
    dotnet run
    ```
    *(Take note of the URL, e.g., http://localhost:5000)*

2.  **Start Frontend:**
    ```bash
    cd todo-client
    npm run dev
    ```

Open your browser to the URL provided by Vite, and you'll have a working Full-Stack application!

### 8. Advanced: .NET Data Annotations & React

One of the most common questions is: *"In Razor, I just use `asp-validation-for`. How does React know about my C# validation errors?"*

The secret lies in the **JSON response**. When you use Data Annotations in a Web API, .NET doesn't send back HTML; it sends a structured error object that React can "read."

#### 1. Backend: The "Source of Truth"

Update your `TodoItem.cs` to include validation attributes:

```csharp
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models;

public class TodoItem
{
    public int Id { get; set; }

    [Required(ErrorMessage = "The title is mandatory.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
```

#### 2. The "Magic" of `[ApiController]`

When your controller has the `[ApiController]` attribute, .NET automatically monitors `ModelState`. If a request arrives with an empty title, .NET intercepts it and returns a `400 Bad Request` with this exact JSON structure:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Title": [
      "The title is mandatory."
    ]
  }
}
```

#### 3. Frontend: Bridging the Gap

In React, we catch that `errors` object and save it into a state variable.

```jsx
const [errors, setErrors] = useState({}); // Think of this as your "React ModelState"

const addTodo = async () => {
  setErrors({}); // 1. Reset errors

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTodo })
  });

  if (response.status === 400) {
    // 2. Extract the 'errors' object from .NET's response
    const data = await response.json();
    setErrors(data.errors || {}); 
  } else if (response.ok) {
    // 3. Success! Clear input and update list
    const addedTodo = await response.json();
    setTodos([...todos, addedTodo]);
    setNewTodo("");
  }
};
```

#### 4. Displaying Errors (The "Razor" way in React)

Instead of `asp-validation-for`, we use a simple JavaScript check. If `errors.Title` exists, we map through the list of messages and show them.

```jsx
<div className="input-group">
  <input 
    value={newTodo} 
    onChange={(e) => setNewTodo(e.target.value)} 
    className={errors.Title ? "input-error" : ""}
  />
  <button onClick={addTodo}>Add</button>
</div>

{/* Displaying validation errors for 'Title' */}
{errors.Title && errors.Title.map((msg, index) => (
  <span key={index} style={{ color: "red", fontSize: "0.8rem", display: "block" }}>
    {msg}
  </span>
))}
```

### 9. Visual Flow: How it connects

```text
C# Model [Required]  --->  .NET checks ModelState  --->  JSON { "errors": { "Title": [...] } }
                                                                    |
                                                                    v
React App.jsx        <---  fetch() catches 400      <---  setErrors(json.errors)
      |
      v
HTML Rendering       <---  {errors.Title.map(...)}  <---  User sees "The title is mandatory"
```

### 10. ReactJS vs. Razor (CSHTML): Why Choose React?

A common question for .NET developers is: *"If I can build everything with Razor and CSHTML, why should I use React?"* Both are powerful, but they serve different architectural needs.

#### 1. User Experience (SPA vs. Multi-Page)
- **Razor (Multi-Page):** Every time you click a link or submit a form, the browser usually reloads the entire page. The server renders the HTML and sends it back.
- **React (Single Page Application):** React only updates the parts of the page that changed. When you add a todo, the page doesn't blink or reload; the new item just "appears." This feels more like a mobile app or a desktop software.

#### 2. Separation of Concerns
- **Decoupling:** With React and a Web API, your backend doesn't care about the UI. You could build a mobile app in the future that uses the exact same API.
- **Razor:** The UI logic (HTML/CSS) is tightly coupled with the C# backend.

#### 3. Ecosystem and Interactivity
- **React:** Has a massive ecosystem of pre-built components (Date pickers, complex charts, drag-and-drop lists) that are much harder to implement in pure Razor.
- **Razor:** Excellent for content-heavy sites (blogs, news sites) where SEO (Search Engine Optimization) is the top priority, as the server sends full HTML to Google's crawlers immediately.

#### 4. The Trade-off (The "Limit")
- **Complexity:** React requires learning JavaScript/JSX, `npm`, and build tools like Vite.
- **Initial Load:** React apps can be "heavy" to load the first time because the browser has to download the JavaScript bundle before the app starts.

| Feature | Razor (CSHTML) | ReactJS |
| :--- | :--- | :--- |
| **Rendering** | Server-Side (SSR) | Client-Side (CSR) |
| **Page Loads** | Full page refresh | Partial updates (Fast) |
| **Language** | C#, HTML, Tag Helpers | JavaScript/JSX |
| **Best For** | SEO, Simple Admin panels | High interactivity, SaaS apps |
| **Learning Curve** | Lower for C# devs | Higher (JS/React/Tools) |



