---
title: "Solving Largest Rectangle in Histogram in C#"
excerpt: "Learn how to find the largest rectangular area in a histogram by using either a centered-expansion strategy or an optimized monotonic stack approach in C#."
date: 2026-04-14
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Histogram
  - Monotonic Stack
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Largest Rectangle in Histogram

The "Largest Rectangle in Histogram" problem (LeetCode 84) asks us to find the area of the largest rectangle that can be formed within a given histogram. Each bar in the histogram has a width of 1, and its height is provided in an array.

Key constraints:
- `1 <= heights.length <= 10^5`
- `0 <= heights[i] <= 10^4`

> **Problem Statement:** Given an array of integers `heights` representing the histogram's bar height where the width of each bar is 1, return *the area of the largest rectangle in the histogram*.

### 2. The Intuition: Two Approaches

There are two primary ways to approach this problem:

1.  **Centered Expansion (Brute Force):** Treat each bar as the potential minimum height of a rectangle and expand as far as possible to the left and right, including only those bars that are at least as tall as the current bar.
2.  **Monotonic Stack (Optimized):** Use a stack to track indices of bars with increasing heights. This allows us to find the nearest smaller bar to the left and right of every bar in linear time, which defines the maximum possible width for that bar's height.

### 3. Implementation: Expansion vs. Stack

#### 3.1 Centered-Expansion in C# (Brute Force)

This implementation uses a helper method `FindArea` to handle the expansion for each bar.

```csharp
public class Solution {
    public int FindArea(int i, int[] heights, int length) {
        int currHeight = heights[i];
        int left = i, right = i;
        
        // Expand to the left as long as heights are >= current height
        while (left >= 0 && heights[left] >= currHeight) {
            left--;
        }
        
        // Expand to the right as long as heights are >= current height
        while (right < length && heights[right] >= currHeight) {
            right++;
        }
        
        // Calculate the area for the current height
        // (right - left - 1) gives the width
        return currHeight * (right - left - 1);
    }

    public int LargestRectangleArea(int[] heights) {
        int N = heights.Length;
        int res = 0;
        
        for (int i = 0; i < N; i++) {
            // Optimization: Skip zero heights
            if (heights[i] == 0) continue;
            
            int currArea = FindArea(i, heights, N);
            res = Math.Max(res, currArea);
        }
        
        return res;
    }
}
```

#### 3.2 Monotonic Stack Approach (NeetCode.io)

This approach precalculates the boundaries for every bar using a monotonic stack, achieving linear time complexity.

```csharp
public class Solution {
    public int LargestRectangleArea(int[] heights) {
        int n = heights.Length;
        int[] leftMost = new int[n];
        int[] rightMost = new int[n];
        Stack<int> stack = new Stack<int>();

        // Find nearest smaller element to the left
        for (int i = 0; i < n; i++) {
            leftMost[i] = -1;
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i]) {
                stack.Pop();
            }
            if (stack.Count > 0) {
                leftMost[i] = stack.Peek();
            }
            stack.Push(i);
        }

        stack.Clear();
        // Find nearest smaller element to the right
        for (int i = n - 1; i >= 0; i--) {
            rightMost[i] = n;
            while (stack.Count > 0 && heights[stack.Peek()] >= heights[i]) {
                stack.Pop();
            }
            if (stack.Count > 0) {
                rightMost[i] = stack.Peek();
            }
            stack.Push(i);
        }

        int maxArea = 0;
        for (int i = 0; i < n; i++) {
            // Adjust indices to get inclusive boundaries
            leftMost[i] += 1;
            rightMost[i] -= 1;
            // Area = Height * (Right - Left + 1)
            maxArea = Math.Max(maxArea, heights[i] * (rightMost[i] - leftMost[i] + 1));
        }

        return maxArea;
    }
}
```

### 4. Step-by-Step Breakdown

#### 4.1 Expansion Approach (Brute Force)

1.  **Iterate through each bar**: Treat each bar's height as the "bottleneck".
2.  **Expand Left & Right**: In the `FindArea` method, move `left` and `right` pointers as long as adjacent bars are at least as tall as the current bar.
3.  **Compute Area**: The width is `right - left - 1`. The area is `currHeight * width`.
4.  **Final Result**: Return the maximum area found after checking all bars.

#### 4.2 Monotonic Stack Approach (Optimized)

1.  **Initialize Boundaries**: Use `leftMost` and `rightMost` arrays to store the index of the first bar shorter than the current bar on both sides.
2.  **Populate Left Boundaries**: Traverse from left to right. Maintain a stack of indices with increasing heights. If the current bar is shorter than the top of the stack, pop elements until you find a shorter bar or the stack is empty.
3.  **Populate Right Boundaries**: Repeat the process from right to left to find the first shorter bar to the right.
4.  **Calculate Max Area**: For each bar, compute `heights[i] * (rightMost[i] - leftMost[i] + 1)` and keep track of the maximum.

### 5. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Expansion** | **O(N²)** | **O(1)** | Worst case (all same height) expands full array for every bar. |
| **Monotonic Stack** | **O(N)** | **O(N)** | Each index is pushed and popped from the stack exactly once. |

### 6. Summary

While the **Centered Expansion** approach is intuitive and space-efficient ($O(1)$), its $O(N^2)$ time complexity makes it unsuitable for LeetCode's largest test cases. The **Monotonic Stack** approach optimizes the search for boundaries, reducing the time complexity to $O(N)$ at the cost of $O(N)$ extra space. For competitive programming, the stack-based solution is the standard approach.

### 7. Further Reading
- [LeetCode 84: Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)
- [NeetCode: Largest Rectangle in Histogram Video](https://neetcode.io/problems/largest-rectangle-in-histogram)
- [Microsoft Docs: Stack<T> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1)
- [Microsoft Docs: Math.Max Method](https://learn.microsoft.com/en-us/dotnet/api/system.math.max)
