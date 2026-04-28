---
title: "Solving Binary Search in C#"
excerpt: "Learn how to find a target value in a sorted array using a Binary Search approach in C#."
date: 2026-04-18
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Binary Search
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Binary Search

The "Binary Search" problem is a fundamental algorithm task where we need to find the index of a target value within a sorted array.

> Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.

### 2. The Intuition: Midpoint Evaluation

In a sorted array, we can use the midpoint to determine if our target lies in the left or right half of the current range. 

The strategy is:
1. Initialize two pointers, `l` (left) and `r` (right), at the boundaries of the array.
2. Calculate the middle index `mid`.
3. If the value at `mid` is the target, we are done.
4. If it's smaller, we move our left boundary forward.
5. If it's larger, we move our right boundary backward.

### 3. Implementation: Binary Search Approach

This implementation uses a `while` loop to narrow down the search range by evaluating the midpoint in each iteration.

```csharp
public class Solution {
    public int Search(int[] nums, int target) {
        int l = 0, r = nums.Length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                l++;
            } else {
                r--;
            }
        }
        return -1;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Set Search Boundaries
We start with `l = 0` and `r = nums.Length - 1`, covering the entire array.

#### Step 2: Calculate Midpoint
Inside the loop, we calculate `mid = l + (r - l) / 2`. This formula is preferred over `(l + r) / 2` to prevent potential integer overflow issues with very large arrays.

#### Step 3: Compare Midpoint Value
- **Match:** If `nums[mid]` equals `target`, we return `mid`.
- **Target is Larger:** If `nums[mid] < target`, we know the target (if it exists) must be at a higher index, so we increment `l`.
- **Target is Smaller:** If `nums[mid] > target`, we know the target must be at a lower index, so we decrement `r`.

#### Step 4: Loop Termination
The loop continues as long as `l <= r`. If they cross, it means the target is not in the array, and we return `-1`.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | Because we only move `l` or `r` by 1 in each step, the algorithm may visit every element in the worst case. |
| **Space Complexity** | **O(1)** | The search is performed in-place with only a few integer variables. |

*Note: Standard binary search achieves O(log N) by jumping to `mid + 1` or `mid - 1` instead of `l++` or `r--`.*

### 6. Summary

Binary Search is a classic example of how sorted data allows for more efficient searching. Even with incremental pointer adjustments, evaluating the midpoint helps guide the search towards the target.

### 7. Further Reading
- [Binary Search (LeetCode 704)](https://leetcode.com/problems/binary-search/)
- [Binary Search Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Neetcode Roadmap - Binary Search](https://neetcode.io/roadmap)
