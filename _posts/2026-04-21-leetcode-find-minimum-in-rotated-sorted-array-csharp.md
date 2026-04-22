---
title: "Find Minimum in Rotated Sorted Array in C#"
excerpt: "Learn how to efficiently find the minimum element in a rotated sorted array using a modified binary search approach in C#."
date: 2026-04-21
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Binary Search
  - Array
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Find Minimum in Rotated Sorted Array

Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. Given the sorted rotated array `nums` of **unique** elements, return the minimum element of this array.

The algorithm must run in `O(log n)` time.

> **Example:**
> Input: `nums = [3,4,5,1,2]`
> Output: `1`

### 2. The Intuition: Binary Search

A rotated sorted array can be thought of as two sorted sequences joined together. To find the minimum element, we can use binary search by identifying which part of the array is sorted.

In any given range `[left, right]`:
- If `nums[left] <= nums[mid]`, it means the left half is sorted. The smallest value in this half is `nums[left]`.
- Otherwise, the rotation point (and thus the minimum element) must be in the left half, and `nums[mid]` could be a candidate for the minimum.

By keeping track of the minimum value encountered during the search, we can efficiently converge on the global minimum.

### 3. Solution 1: Binary Search (Standard Approach)

This implementation uses a binary search loop, updating the result `res` whenever a potential minimum is found.

```csharp
public class Solution {
    public int FindMin(int[] nums) {
        int n = nums.Length;
        int left = 0, right = n - 1;
        int res = int.MaxValue;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[left] <= nums[mid]) {
                res = Math.Min(res, nums[left]);
                left = mid + 1;
            } else {
                res = Math.Min(res, nums[mid]);
                right = mid - 1;
            }
        }

        return res;
    }
}
```

### 4. Solution 2: Binary Search (NeetCode Approach)

An alternative approach, often found on [NeetCode.io](https://neetcode.io), compares the middle element with the rightmost element. This allows us to determine if the minimum lies in the left or right half without maintaining an external `res` variable.

```csharp
public class Solution {
    public int FindMin(int[] nums) {
        int l = 0;
        int r = nums.Length - 1;
        while (l < r) {
            int m = l + (r - l) / 2;
            if (nums[m] < nums[r]) {
                r = m;
            } else {
                l = m + 1;
            }
        }
        return nums[l];
    }
}
```

### 5. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Standard** | **O(log N)** | **O(1)** | Uses binary search and a result variable to track the minimum. |
| **NeetCode** | **O(log N)** | **O(1)** | Uses a simplified binary search to narrow down the inflection point. |

### 6. Summary

The "Find Minimum in Rotated Sorted Array" problem is a classic application of binary search. By recognizing that at least one half of a rotated sorted array is always sorted, we can eliminate half of the search space at each step, achieving logarithmic time complexity.

### 7. Further Reading
- [Find Minimum in Rotated Sorted Array (LeetCode 153)](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)
- [Binary Search Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Neetcode Roadmap - Binary Search](https://neetcode.io/roadmap)
