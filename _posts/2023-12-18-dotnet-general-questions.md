---
title: "General C# Knowledge for interview preparation"
date: 2023-12-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
classes: wide
---
In this journal, I want to list the general questions about C# knowledge to prepare for technical interviews.
# Value types vs. reference types
- Value types store data directly, while reference types store references to the data.
- Examples of value types include int, float, and char, while examples of reference types include classes and interfaces.
  
# "Using" statement:
The "using" statement is used for automatic resource management, ensuring that IDisposable objects are properly disposed of when they are no longer needed.

# Abstract classes vs. interfaces
Abstract classes can have method implementations and fields, while interfaces only declare method signatures

# Exception handling
- The `try` block contains the code that might throw an exception.
- The `catch` block handles exceptions.
- The `finally` block contains code that will be executed whether an exception is thrown or not.
- 
# Delegates and events
- Delegates are function pointers that reference methods.
- Events are a special kind of delegate used for handling notifications between objects.
  
# Extension methods
- Extension methods allow adding new methods to existing types without modifying them.
  
# Properties vs. fields
- Properties provide a way to access and modify private fields using getters and setters
  
# Entity Framework and ADO.NET
- ADO.NET is a low-level library for database access, while Entity Framework is an Object-Relational Mapping (ORM) framework that simplifies database interaction.
  
# What is the difference between StringBuilder and String in C#?
`StringBuilder` is mutable and can be modified without creating a new object, making it more efficient for string manipulations. `String` objects, on the other hand, are immutable.

# Explain the difference between IEnumerable and IEnumerator in C#.
`IEnumerable` represents a collection of objects that can be enumerated, while `IEnumerator` is responsible for iterating over the collection.

# How does the using statement work in C#? Why is it important?
The `using` statement is used for automatic resource management, ensuring that IDisposable objects are properly disposed of when they go out of scope. It helps prevent resource leaks and improves code readability.

# Explain the concept of ViewState in ASP.NET.
ViewState is used to persist state information of server-side objects across postbacks in a web application. It helps in maintaining the state of controls even after the page is refreshed.

# What is the purpose of database migrations in Entity Framework?
Migrations in Entity Framework are used to version and update the database schema over time. They allow developers to apply changes to the database schema as the application evolves.

# What is SOLID, and how does it apply to object-oriented design?
SOLID is an acronym representing a set of five design principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion) that aim to create more maintainable and scalable software.

