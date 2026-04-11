---
title: "Solving Container With Most Water in C#"
excerpt: "Learn how to find the maximum amount of water a container can store using an efficient two-pointer approach in C#."
date: 2026-04-11
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Two Pointers
  - Array
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Container With Most Water

The "Container With Most Water" problem (LeetCode 11) asks us to find two vertical lines from an array of heights that, together with the x-axis, form a container that holds the most water.

> **Problem Statement:** You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the $i^{th}$ line are $(i, 0)$ and $(i, height[i])$. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.

### 2. The Intuition: Two-Pointer Greedy Approach

The area of water is determined by the distance between two lines (width) and the height of the shorter line. To find the maximum area, we want to maximize both width and height.

1.  **Initialize at the Extremes:** We start with the widest possible container by placing two pointers at the very beginning (`left = 0`) and the very end (`right = n - 1`).
2.  **Calculate Area:** The width is `right - left`, and the height is `Math.Min(heights[left], heights[right])`.
3.  **The Greedy Move:** Since the width only decreases as we move pointers inward, we must try to find a taller line to compensate for the loss in width.
    - We move the pointer that points to the **shorter line**, because moving the taller one would only decrease the width without any chance of increasing the height of the container (since the shorter line already limits the height).
4.  **Tracking the Max:** We keep track of the largest area found during this process.

### 3. Implementation: My Two-Pointer Approach

This implementation uses a `while` loop to traverse the array from both ends, achieving an $O(n)$ time complexity.

```csharp
public class Solution {
    public int MaxArea(int[] heights) {
        int left = 0;
        int right = heights.Length - 1;
        int res = 0;
        while (left < right) {
            int w = right - left;
            int h = Math.Min(heights[left], heights[right]);
            int area = w * h;
            res = Math.Max(res, area);
            if (heights[left] < heights[right]) {
                left++;
            } else {
                right--;
            }
        }

        return res;
    }
}
```

### 4. Implementation: NeetCode Solution

This is a more concise version of the two-pointer approach, commonly shared in the NeetCode community.

```csharp
public class Solution {
    public int MaxArea(int[] heights) {
        int res = 0;
        int l = 0, r = heights.Length-1;

        while (l < r){
            int area = (Math.Min(heights[l], heights[r])) * (r - l);
            res = Math.Max(area, res);

            if (heights[l] <= heights[r]){
                l++;
            } else{
                r--;
            }
        }
        return res;
    }
}
```

### 5. Step-by-Step Breakdown

#### Step 1: Initialize Two Pointers
The pointers start at the very beginning and the very end of the array. We also initialize `res` to `0` to store the maximum area.

#### Step 2: Loop Until Pointers Meet
We use a `while` loop that continues as long as the left pointer is less than the right pointer. In each iteration, we calculate the current width.

#### Step 3: Find Limiting Height
The height of the water in the container is the minimum of the two heights at the pointers.

#### Step 4: Update Maximum Area
We calculate the current area and update the result if it's larger than the previous maximum.

#### Step 5: Move the Shorter Line
We move the pointer that points to the shorter line inward. This is because the shorter line is the limiting factor for the height, and only by finding a potentially taller line can we increase the area despite the decreasing width.

### 6. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **$O(n)$** | We traverse the array once, with the pointers meeting in the middle. |
| **Space Complexity** | **$O(1)$** | We only use a constant amount of space for variables. |

### 7. Summary

The "Container With Most Water" problem is a classic example of how a two-pointer approach can optimize a search from $O(n^2)$ down to $O(n)$. Both implementations above use this greedy strategy to effectively explore all potentially larger areas without checking every possible pair.

### 8. Further Reading
- [LeetCode 11: Container With Most Water](https://leetcode.com/problems/container-with-most-water/)
- [NeetCode: Container With Most Water Explanation](https://neetcode.io/problems/container-with-most-water)
- [C# Math.Min Method](https://learn.microsoft.com/en-us/dotnet/api/system.math.min)
