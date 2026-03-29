---
title: "Solving Evaluate Reverse Polish Notation in C#"
excerpt: "Learn how to evaluate arithmetic expressions in Reverse Polish Notation (RPN) efficiently using a Stack in C#."
date: 2026-03-29
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Stack
  - Math
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Evaluate Reverse Polish Notation

The "Evaluate Reverse Polish Notation" problem requires us to calculate the value of an arithmetic expression in Reverse Polish Notation (Postfix Notation).

> You are given an array of strings `tokens` that represents an arithmetic expression in a Reverse Polish Notation.
> 
> Evaluate the expression. Return an integer that represents the value of the expression.
> 
> Valid operators are '+', '-', '*', and '/'.
> Each operand may be an integer or another expression.
> The division between two integers always truncates toward zero.
> There will not be any division by zero.
> The input represents a valid arithmetic expression in a reverse polish notation.

### 2. The Intuition: Stack-Based Evaluation

Reverse Polish Notation is designed to be evaluated using a **Stack**. The core idea is:
1. When you encounter a **number**, push it onto the stack.
2. When you encounter an **operator**, pop the required number of operands from the stack (usually two), perform the operation, and push the result back onto the stack.

By the end of the process, the stack will contain exactly one value: the final result of the expression.

### 3. Implementation: Switch-Based Approach

The first implementation uses a `switch` statement and `int.TryParse` for a robust evaluation.

```csharp
public class Solution {
    public int EvalRPN(string[] tokens) {
        var stack = new Stack<int>();
        foreach(var token in tokens) {
            if (int.TryParse(token, out int digit)) {
                // If the token is a number, push it to the stack
                stack.Push(digit);
            } else {
                // If the token is an operator, pop two operands
                if (stack.Count >= 2) {
                    var y = stack.Pop();
                    var x = stack.Pop();
                    
                    // Apply the operator and push the result back
                    switch (token) {
                        case "+":
                            stack.Push(x + y);
                            break;
                        case "-":
                            stack.Push(x - y);
                            break;
                        case "*":
                            stack.Push(x * y);
                            break;
                        case "/":
                            stack.Push(x / y);
                            break;
                    }
                }
            }
        }

        // The final result is the only remaining item in the stack
        return stack.Pop();
    }
}
```

### 4. Implementation: Concise Approach (NeetCode IO)

This alternative implementation uses a more concise `if-else` structure and direct `int.Parse` for tokens that aren't operators.

```csharp
public class Solution {
    public int EvalRPN(string[] tokens) {
        Stack<int> stack = new Stack<int>();
        foreach (string c in tokens) {
            if (c == "+") {
                stack.Push(stack.Pop() + stack.Pop());
            } else if (c == "-") {
                int a = stack.Pop();
                int b = stack.Pop();
                stack.Push(b - a);
            } else if (c == "*") {
                stack.Push(stack.Pop() * stack.Pop());
            } else if (c == "/") {
                int a = stack.Pop();
                int b = stack.Pop();
                stack.Push((int) ((double) b / a));
            } else {
                stack.Push(int.Parse(c));
            }
        }
        return stack.Pop();
    }
}
```

### 5. Step-by-Step Breakdown

#### Step 1: Initialize the Stack
We create a `Stack<int>` to hold the integers. This structure ensures that we always access the most recent operands first (Last-In-First-Out).

#### Step 2: Iterate Through Tokens
We loop through each string in the `tokens` array.

#### Step 3: Handle Operands
We use `int.TryParse` to determine if the token is a number. If it is, we push it onto the stack.

#### Step 4: Handle Operators
If the token is an operator (`+`, `-`, `*`, `/`):
1. We pop the top value from the stack (let's call it `y`).
2. We pop the next value from the stack (let's call it `x`).
3. We perform the operation: `x [operator] y`. Note the order is important for subtraction and division.
4. We push the result back onto the stack.

#### Step 5: Final Result
After processing all tokens, the stack will have one element left. We pop and return it.

### 6. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We iterate through the list of `N` tokens exactly once. Each stack operation (push/pop) is **O(1)**. |
| **Space Complexity** | **O(N)** | In the worst case (e.g., all tokens are numbers), the stack will store all `N` elements. |

### 7. Summary

Evaluating expressions in Reverse Polish Notation is a classic problem that demonstrates the utility of the **Stack** data structure. By processing operands and operators in a specific order, we eliminate the need for parentheses and operator precedence rules, making the calculation straightforward and efficient.

### 8. Further Reading
- [Stack<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1)
- [Neetcode - Evaluate Reverse Polish Notation](https://neetcode.io/problems/evaluate-reverse-polish-notation)
- [LeetCode Problem 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/)
