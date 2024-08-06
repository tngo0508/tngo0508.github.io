---
layout: single
title: "The SOLID Design Principles Review"
date: 2024-8-4
# toc: true
# toc_label: "Page Navigation"
# toc_sticky: true
show_date: true
classes: wide
tags:
  - Design Patterns C#
---

# SOLID Principles Summary

## Single Responsibility Principle (SRP)

- **Concept**: A class should have only one reason to change.
- **Related Idea**: Separation of Concerns - different classes handle independent aspects of the system.
- **Implementation**: Classes handle different tasks and solve different problems, which can then interact with each other.

## Open/Closed Principle (OCP)

- **Concept**: Classes should be open for extension but closed for modification.
- **Practical Meaning**: Avoid modifying existing classes directly. Instead, extend their functionality using inheritance, interfaces, or dependency injection.
- **Design Approach**: Introduce interfaces to allow extension without altering the original class. Example: Implementing the specification pattern.

## Liskov Substitution Principle (LSP)

- **Concept**: Subtypes must be substitutable for their base types.
- **Implementation**: Ensure that objects of a derived class can replace objects of the base class without altering the correctness of the program.
- **Key Point**: Maintain consistency in class design to avoid issues when consumers of your API use base types.

In C#, we use `virtual` keyword and `override` to implement the derived class.

## Interface Segregation Principle (ISP)

- **Concept**: Avoid putting too much in an interface; keep them small and focused.
- **Practical Meaning**: Large interfaces force implementers to provide unnecessary implementations.
- **Implementation**: Split large interfaces into smaller, more specific ones to avoid forcing unnecessary implementations. Related to the YAGNI (You Ain't Gonna Need It) principle.

## Dependency Inversion Principle (DIP)

- **Concept**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Implementation**: Use interfaces to abstract low-level details. High-level modules can then depend on these abstractions rather than the concrete details.
- **Example**: Instead of exposing a collection directly, provide query mechanisms through an interface like `IEnumerable` or `IQueryable`. High-level modules can interact with this interface without knowing the underlying implementation details.

These principles form the foundation of good object-oriented design, promoting flexibility, maintainability, and scalability in software systems.
