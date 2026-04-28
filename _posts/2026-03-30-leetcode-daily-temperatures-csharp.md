---
title: "Solving Daily Temperatures in C#"
excerpt: "Learn how to find the number of days until a warmer temperature using a Monotonic Stack in C#."
date: 2026-03-30
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Stack
  - Monotonic Stack
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Daily Temperatures

The "Daily Temperatures" problem asks us to find the number of days we must wait until a warmer temperature occurs for each day in an array.

> Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i-th` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.

### 2. The Intuition: Monotonic Stack

A naive O(N²) approach would involve checking every subsequent day for each day. However, we can achieve O(N) using a **Monotonic Stack**.

The core idea is:
1. We use a stack to store the **indices** of temperatures we haven't found a warmer day for yet.
2. The stack will be "monotonic decreasing" in terms of temperature values: as we iterate, if the current temperature is higher than the temperature at the index on top of the stack, we've found our "warmer day."
3. We pop indices from the stack and calculate the difference (current index minus popped index) until the stack is empty or the current temperature is no longer warmer than the top.

### 3. Implementation: Monotonic Stack Approach

Here is the implementation using a `Stack<int>` to track indices.

```csharp
public class Solution {
    public int[] DailyTemperatures(int[] temperatures) {
        var stack = new Stack<int>();
        var n = temperatures.Length;
        var result = new int[n];
        for (int i = 0; i < temperatures.Length; i++) {
            var curr = temperatures[i];
            // While the current temperature is warmer than the temperature at stack top
            while (stack.Count > 0 && curr > temperatures[stack.Peek()]) {
                var index = stack.Pop();
                // The difference in indices is the number of days to wait
                result[index] = (i - index);
            }
            // Push the current index onto the stack
            stack.Push(i);
        }

        return result;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize the Stack and Result Array
We create a `Stack<int>` to store indices and a `result` array of the same length as `temperatures`, initialized with zeros.

#### Step 2: Iterate Through Temperatures
We loop through the `temperatures` array using index `i`.

#### Step 3: Check for Warmer Temperatures
For the current temperature `curr` at index `i`:
1. While the stack is not empty and `curr` is greater than `temperatures[stack.Peek()]`:
   - Pop the index from the stack (this is a day we've been waiting for a warmer temperature).
   - Calculate the distance: `i - index`.
   - Store this distance in `result[index]`.

#### Step 4: Push the Current Day
Push the current index `i` onto the stack, as we now need to find a warmer temperature for this day.

#### Step 5: Final Result
The `result` array, which still contains zeros for any day that never found a warmer temperature, is returned.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | Each index is pushed onto and popped from the stack at most once. |
| **Space Complexity** | **O(N)** | In the worst case (e.g., temperatures are strictly decreasing), the stack will store all `N` indices. |

### 6. Summary

The "Daily Temperatures" problem is a classic application of the **Monotonic Stack**. By storing indices and only popping when we encounter a larger value, we can solve what appears to be a nested search problem in a single linear pass.

### 7. Further Reading
- [Stack<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1)
- [Neetcode - Daily Temperatures](https://neetcode.io/problems/daily-temperatures)
- [LeetCode Problem 739](https://leetcode.com/problems/daily-temperatures/)
