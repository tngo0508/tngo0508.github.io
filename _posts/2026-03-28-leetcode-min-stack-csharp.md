---
title: "Solving Min Stack in C#"
excerpt: "Learn how to design a stack that supports push, pop, top, and retrieving the minimum element in constant time using a single stack with Tuples."
date: 2026-03-28
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Stack
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Min Stack

The "Min Stack" problem requires us to design a stack that supports standard stack operations (`push`, `pop`, `top`) while also providing a way to retrieve the minimum element in the stack in **constant time (O(1))**.

> Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.
>
> Implement the `MinStack` class:
> - `MinStack()` initializes the stack object.
> - `void Push(int val)` pushes the element `val` onto the stack.
> - `void Pop()` removes the element on the top of the stack.
> - `int Top()` gets the top element of the stack.
> - `int GetMin()` retrieves the minimum element in the stack.
>
> You must implement a solution with O(1) time complexity for each function.

### 2. The Intuition: Storing the Minimum at Each Step

In a regular stack, we only know the current top element. To find the minimum, we would normally have to iterate through all elements, which takes **O(N)** time. 

To achieve **O(1)** time for `GetMin()`, we need to keep track of the minimum value at every stage of the stack's growth. 

A common approach is to store not just the value itself, but also the **minimum value seen so far** up to that point in the stack. 

By using a `Stack<(int, int)>` (where the first `int` is the value and the second `int` is the current minimum), we ensure that:
- Every time we push a new value, we compare it with the current minimum at the top of the stack.
- The new minimum is stored alongside the value.
- When we pop, the previous minimum is naturally restored because it was stored with the element now at the new top.

### 3. Implementation: Stack with Tuples

This implementation uses a single `Stack` of Tuples to store both the value and the running minimum.

```csharp
public class MinStack {
    private Stack<(int, int)> _stack;

    public MinStack() {
        _stack = new Stack<(int, int)>();
    }
    
    public void Push(int val) {
        var minVal = val;
        // 1. If stack is not empty, find the new minimum
        if (_stack.Count > 0) {
            var topMin = _stack.Peek().Item2;
            minVal = Math.Min(topMin, val);
        }
        // 2. Push both the value and the current minimum as a tuple
        _stack.Push((val, minVal));
    }
    
    public void Pop() {
        _stack.Pop();
    }
    
    public int Top() {
        return _stack.Peek().Item1;
    }
    
    public int GetMin() {
        return _stack.Peek().Item2;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize the Stack
We use a `Stack<(int, int)>`. C# Tuples are lightweight and allow us to store two pieces of information in a single stack entry without creating a custom class.

#### Step 2: Push Operation
When pushing `val`:
- We check if the stack is empty. If it is, the current minimum is just `val`.
- If the stack isn't empty, we look at the minimum value of the current top (`_stack.Peek().Item2`) and compare it with `val`. The smaller of the two becomes our new `minVal`.
- We push `(val, minVal)` onto the stack.

#### Step 3: Pop Operation
The `Pop()` operation is standard. Since each entry in the stack stores the minimum value relative to the elements below it, popping an element automatically "removes" its contribution to the minimum tracking.

#### Step 4: Top and GetMin
- `Top()` returns `Item1` of the tuple at the top of the stack.
- `GetMin()` returns `Item2` of the tuple at the top of the stack. Both are O(1) operations.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(1)** | All operations (`Push`, `Pop`, `Top`, `GetMin`) take constant time. |
| **Space Complexity** | **O(N)** | We store two integers for every element pushed onto the stack. |

### 6. Summary

The `MinStack` problem is a great example of using extra space to trade off for time efficiency. By caching the minimum value at each step within the stack itself, we avoid the need for expensive linear searches, fulfilling the requirement for O(1) performance across all operations.

### 7. Further Reading
- [Stack<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1)
- [Tuple types (C# reference)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples)
- [Neetcode - Min Stack](https://neetcode.io/problems/min-stack)
- [LeetCode Problem 155](https://leetcode.com/problems/min-stack/)
