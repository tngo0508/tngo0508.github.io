---
title: "Solving Valid Parentheses in C#"
excerpt: "Learn how to validate a string of parentheses efficiently by using a Stack and Dictionary to ensure every bracket matches correctly."
date: 2026-03-28
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Stack
  - Dictionary
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Valid Parentheses

The "Valid Parentheses" problem requires us to determine if an input string containing only brackets is valid.

> Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.
>
> An input string is valid if:
> 1. Open brackets must be closed by the same type of brackets.
> 2. Open brackets must be closed in the correct order.
> 3. Every close bracket has a corresponding open bracket of the same type.

### 2. The Intuition: Stack for Balanced Strings

To validate the parentheses, we must ensure that every closing bracket matches the most recently opened bracket. 

A `Stack<char>` is the perfect data structure for this because it follows the **Last-In, First-Out (LIFO)** principle. By pushing open brackets onto the stack and popping them when a matching closing bracket appears, we can easily track the expected order:

- **Opening Brackets**: Push them onto the stack.
- **Closing Brackets**: Check if the stack is empty (meaning no matching open bracket) or if the top of the stack matches the expected opening bracket.
- **Matching**: Use a `Dictionary<char, char>` to map closing brackets to their corresponding opening brackets for quick lookup.

### 3. Implementation: Stack and Dictionary Approach

This implementation uses a `Stack` to manage the nesting of brackets and a `Dictionary` for mapping.

```csharp
public class Solution {
    public bool IsValid(string s) {
        var stack = new Stack<char>();
        var openParens = new Dictionary<char, char>() {
            {']', '['},
            {'}', '{'},
            {')', '('},
        };

        foreach (var c in s) {
            // 1. If the character is a closing bracket
            if (openParens.ContainsKey(c)) {
                // 2. If stack is empty, there's no opening bracket to match
                if (stack.Count == 0) {
                    return false;
                }

                // 3. Pop the top and check if it matches the required opening bracket
                var top = stack.Pop();
                if (top != openParens[c]) {
                    return false;
                }
            } else {
                // 4. If it's an opening bracket, push it onto the stack
                stack.Push(c);
            }
        }

        // 5. If the stack is empty, all brackets were matched correctly
        return stack.Count == 0;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize Data Structures
We create a `Stack<char>` to track opening brackets and a `Dictionary<char, char>` that maps each closing bracket to its corresponding opening bracket.

#### Step 2: Iterate Through the String
We process each character in the string `s` one by one.

#### Step 3: Handle Closing Brackets
When we encounter a closing bracket (like `]` or `}`):
- We first check if the stack is empty. If it is, then there is no opening bracket to match the current closing one, making the string invalid.
- We pop the top element from the stack and compare it to the value in our `openParens` dictionary for the current character. If they don't match, the order is incorrect.

#### Step 4: Handle Opening Brackets
If the character is an opening bracket, we simply push it onto the stack to be matched later.

#### Step 5: Final Check
After iterating through the entire string, we check if the stack is empty. If it is, every opening bracket was correctly matched and closed. If not, some brackets remain open, making the string invalid.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We iterate through the string of length N exactly once. Stack operations (push/pop) and Dictionary lookups are O(1) on average. |
| **Space Complexity** | **O(N)** | In the worst case (e.g., all opening brackets), we might store all N characters in the stack. |

### 6. Summary

Validating parentheses is a fundamental problem that highlights the power of the Stack data structure for managing nested or ordered constraints. By using a dictionary for matching, we keep the code clean and easily extensible to other bracket types.

### 7. Further Reading
- [Stack<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1)
- [Dictionary<TKey,TValue> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)
- [Neetcode - Valid Parentheses](https://neetcode.io/problems/valid-parentheses)
- [LeetCode Problem 20](https://leetcode.com/problems/valid-parentheses/)
