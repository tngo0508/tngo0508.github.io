---
layout: single
title: "Python Interview Preparation: Key Concepts and Knowledge"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - Concepts
  - Interview Preparation
  - Python
---

This post covers essential Python concepts and knowledge to help you prepare for your technical interviews, focusing on the language's internals, OOP, and unique features.

## 1. Memory & Type System

### Dynamic Typing vs. Strong Typing
*   **Dynamic Typing:** You don't need to declare types; they are determined at runtime.
*   **Strong Typing:** Python doesn't allow implicit type conversion that loses information (e.g., `"2" + 2` raises a `TypeError`).

### Mutable vs. Immutable Types
*   **Immutable (Value-like):** Cannot be changed after creation. If you "modify" it, you create a new object.
    *   `int`, `float`, `bool`, `str`, `tuple`, `frozenset`.
*   **Mutable (Reference-like):** Can be modified in-place.
    *   `list`, `dict`, `set`, `bytearray`.
*   **Interview Tip:** Be careful when using mutable default arguments in functions (e.g., `def func(a=[])`). The list is created once and shared across calls.

### Global Interpreter Lock (GIL)
*   **Definition:** A mutex that allows only one thread to execute Python bytecode at a time.
*   **Impact:** Prevents true multi-core parallelism in CPU-bound multi-threaded programs.
*   **Workaround:** Use `multiprocessing` for CPU-bound tasks or `asyncio`/`threading` for I/O-bound tasks.

### Garbage Collection
*   **Reference Counting:** The primary mechanism. Objects are deleted when their reference count drops to zero.
*   **Cyclic Garbage Collector:** Handles reference cycles (e.g., two objects pointing to each other).

---

## 2. Object-Oriented Programming (OOP)

### Classes and Instances
*   `self`: Represents the instance of the class. It must be the first parameter of any instance method.
*   `__init__`: The constructor method.

### Access Modifiers (Conventions)
*   **Public:** `var_name`
*   **Protected:** `_var_name` (Convention: "please don't touch this outside the class").
*   **Private:** `__var_name` (Triggers **Name Mangling**: the name becomes `_ClassName__var_name` to prevent accidental overrides in subclasses).

### Inheritance and Multiple Inheritance
*   Python supports multiple inheritance.
*   **MRO (Method Resolution Order):** The order in which Python looks for a method in a class hierarchy (uses the C3 Linearization algorithm). Check it via `ClassName.mro()`.

### Abstract Base Classes (ABC)
*   Used to define "interfaces" or abstract classes.
*   Requires the `abc` module and the `@abstractmethod` decorator.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
```

---

## 3. Language-Specific Features

### List & Dict Comprehensions
*   Concise way to create collections.
*   `[x**2 for x in range(10) if x % 2 == 0]`

### Generators & `yield`
*   **Iterables** that produce values one at a time, saving memory (Lazy evaluation).
*   Functions using `yield` return a generator object.

### Decorators
*   A way to modify or wrap the behavior of functions or classes.
*   Syntax: `@decorator_name`

### `*args` and `**kwargs`
*   `*args`: Allows a function to accept any number of positional arguments (tuple).
*   `**kwargs`: Allows a function to accept any number of keyword arguments (dict).

---

## 4. Advanced Concepts

### Asyncio (Async/Await)
*   Used for single-threaded concurrency in I/O-bound tasks.
*   `async def` defines a coroutine; `await` yields execution.

### Context Managers (`with` statement)
*   Used for resource management (e.g., opening files, database connections).
*   Implemented via `__enter__` and `__exit__` methods or the `@contextmanager` decorator.

### Lambdas
*   Anonymous, one-line functions: `lambda x: x * 2`.

### Properties vs. Fields
*   **Fields:** Variables stored in an instance (usually initialized in `__init__`).
*   **Properties:** Use the `@property` decorator to define methods that can be accessed like attributes. This allows for validation, lazy loading, or computed values while maintaining a clean API.

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0: raise ValueError("Negative radius")
        self._radius = value
```

---

## 5. SOLID Principles in Python

*   **S - Single Responsibility:** A class should do one thing.
*   **O - Open/Closed:** Use inheritance or composition to extend behavior without modifying original code.
*   **L - Liskov Substitution:** Subclasses should be usable in place of their base classes (crucial with ABCs).
*   **I - Interface Segregation:** Use multiple specific ABCs rather than one bulky one.
*   **D - Dependency Inversion:** Depend on abstractions (ABCs) rather than concrete implementations. Use **Dependency Injection** (often simpler in Python due to its dynamic nature).

---

## Python Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-python-review %})
* [Part 2: LeetCode Prep and Templates]({{ site.baseurl }}{% post_url 2026-3-5-python-leetcode-prep %})
