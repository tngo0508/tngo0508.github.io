---
title: "Solving Trapping Rain Water in C#"
excerpt: "Learn how to compute trapped rain water efficiently using a left-max array and a reverse sweep in C#."
date: 2026-04-17
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Arrays
  - Prefix Maximum
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Trapping Rain Water

The "Trapping Rain Water" problem (LeetCode 42) asks us to determine how much water can be trapped after raining, given an elevation map represented by an integer array.

Each value in the array is the height of a vertical bar, and each bar has width `1`.

> **Problem Statement:** Given `n` non-negative integers `height` where each value represents an elevation bar of width `1`, return the total amount of rain water that can be trapped.

### 2. Key Insight

At index `i`, the trapped water depends on two boundaries:

- The tallest bar on the **left** of `i`
- The tallest bar on the **right** of `i`

So the water above index `i` is:

`min(leftMax[i], rightMax[i]) - height[i]`

If this value is positive, that amount of water is trapped at `i`.

Your implementation computes this in two passes:

1. Build `leftArr`, where `leftArr[i]` is the maximum height from `0..i`.
2. Traverse from right to left while tracking `currHeight` as the running right maximum.
3. Accumulate `min(leftArr[i], currHeight) - height[i]`.

### 3. C# Implementation

```csharp
public class Solution {
    public int Trap(int[] height) {
        int n = height.Length;
        int res = 0;
        int[] leftArr = new int[n];
        int currHeight = 0;
        for (int i = 0; i < n; i++) {
            currHeight = Math.Max(currHeight, height[i]);
            leftArr[i] = currHeight;
        }
        currHeight = 0;
        for (int i = n - 1; i >= 0; i--) {
            currHeight = Math.Max(currHeight, height[i]);
            res += (Math.Min(leftArr[i], currHeight) - height[i]);
        }
        return res;
    }
}
```

#### NeetCode.io Variant (LeftMax + RightMax Arrays)

```csharp
public class Solution {
    public int Trap(int[] height) {
        int n = height.Length;
        if (n == 0) {
            return 0;
        }

        int[] leftMax = new int[n];
        int[] rightMax = new int[n];

        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) {
            leftMax[i] = Math.Max(leftMax[i - 1], height[i]);
        }

        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            rightMax[i] = Math.Max(rightMax[i + 1], height[i]);
        }

        int res = 0;
        for (int i = 0; i < n; i++) {
            res += Math.Min(leftMax[i], rightMax[i]) - height[i];
        }
        return res;
    }
}
```

### 4. Step-by-Step Example

For `height = [0,1,0,2,1,0,1,3,2,1,2,1]`:

- Left maximums become: `[0,1,1,2,2,2,2,3,3,3,3,3]`
- During the right-to-left pass, we keep updating the right maximum and add water at each index.

Non-zero trapped water appears at indices `2`, `4`, `5`, `6`, and `9`, giving a total of:

`1 + 1 + 2 + 1 + 1 = 6`

So the final answer is `6`.

### 5. Why This Works

- `leftArr[i]` guarantees the highest possible left boundary at `i`.
- `currHeight` in the reverse pass guarantees the highest possible right boundary at `i`.
- The lower of these two boundaries determines the effective water level.
- Subtracting `height[i]` gives exactly how much water sits on top of bar `i`.

Because this is done for every index, summing all positions gives the correct total trapped water.

### 6. Complexity Analysis

| Metric | Value |
| :--- | :--- |
| Time Complexity | **O(n)** |
| Space Complexity | **O(n)** |

- We do two linear passes through the array.
- Extra space is used for the `leftArr` prefix maximum array.

### 7. Summary

This approach is a clean and efficient way to solve Trapping Rain Water in C#.

- It avoids brute force checks for each index.
- It computes left boundaries once, right boundaries on the fly.
- It runs in linear time and is practical for large inputs.

### 8. Further Reading

- [LeetCode 42: Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
- [Microsoft Docs: Math.Max Method](https://learn.microsoft.com/en-us/dotnet/api/system.math.max)
- [Microsoft Docs: Math.Min Method](https://learn.microsoft.com/en-us/dotnet/api/system.math.min)
