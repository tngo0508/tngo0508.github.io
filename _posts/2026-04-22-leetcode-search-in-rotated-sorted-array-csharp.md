---
title: "Search in Rotated Sorted Array in C#"
excerpt: "Learn how to search for a target value in a rotated sorted array efficiently using binary search in C#."
date: 2026-04-22
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

### 1. The Problem: Search in Rotated Sorted Array

There is an integer array `nums` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, `nums` is **possibly rotated** at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (**0-indexed**). For example, `[0,1,2,4,5,6,7]` might be rotated at pivot index `3` and become `[4,5,6,7,0,1,2]`.

Given the array `nums` **after** the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.

You must write an algorithm with `O(log n)` runtime complexity.

> **Example:**
> Input: `nums = [4,5,6,7,0,1,2], target = 0`
> Output: `4`

### 2. The Intuition: Binary Search on Rotated Arrays

Even though the array is rotated, it still consists of two sorted subarrays. In any binary search step, at least one of the two halves (left to mid or mid to right) must be sorted.

1.  If the left half `[left, mid]` is sorted (i.e., `nums[left] <= nums[mid]`):
    *   Check if the target lies within this range. If so, move `right` to `mid - 1`.
    *   Otherwise, the target must be in the right half, so move `left` to `mid + 1`.
2.  If the left half is not sorted, then the right half `[mid, right]` **must** be sorted:
    *   Check if the target lies within this range. If so, move `left` to `mid + 1`.
    *   Otherwise, the target must be in the left half, so move `right` to `mid - 1`.

### 3. Solution 1: Binary Search (One Pass)

This approach uses a single binary search loop. In each step, we determine which half of the array is sorted and check if the target lies within that sorted half.

```csharp
public class Solution {
    public int Search(int[] nums, int target) {
        int n = nums.Length;
        int left = 0, right = n - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target <= nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] <= target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
}
```

### 4. Solution 2: Binary Search (NeetCode Approach)

The [NeetCode.io](https://neetcode.io) approach is highly intuitive because it breaks the problem down into two simple, logical steps. Instead of handling the rotation logic inside a single complex binary search, we find where the array was "split" and then search the two sorted pieces.

#### How it Works:

1.  **Find the Pivot (Minimum Element):**
    A rotated array is just two sorted lists joined together. The "pivot" is the smallest element where the array wraps around. We use a modified binary search to find this point:
    *   If the middle element is larger than the rightmost element (`nums[m] > nums[r]`), it means the pivot is somewhere to the right.
    *   Otherwise, the pivot is at the middle or to the left.
2.  **Split the Problem:**
    Once we know the pivot index, we effectively have two separate sorted arrays:
    *   **Left Side:** Everything from the start up to the pivot index - 1.
    *   **Right Side:** Everything from the pivot index to the end.
3.  **Search Twice:**
    We perform a standard binary search on the first half. If the target isn't there, we search the second half. Since both searches take `O(log n)` time, the total complexity remains `O(log n)`.

```csharp
public class Solution {
    public int Search(int[] nums, int target) {
        int l = 0, r = nums.Length - 1;

        while (l < r) {
            int m = (l + r) / 2;
            if (nums[m] > nums[r]) {
                l = m + 1;
            } else {
                r = m;
            }
        }

        int pivot = l;

        int result = BinarySearch(nums, target, 0, pivot - 1);
        if (result != -1) {
            return result;
        }

        return BinarySearch(nums, target, pivot, nums.Length - 1);
    }

    public int BinarySearch(int[] nums, int target, int left, int right) {
        while (left <= right) {
            int mid = (left + right) / 2;
            if (nums[mid] == target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
}
```

### 5. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **One Pass** | **O(log N)** | **O(1)** | Single binary search traversal. |
| **NeetCode** | **O(log N)** | **O(1)** | Two binary search traversals (find pivot, then search). |

### 6. Summary

Both approaches achieve the required `O(log n)` time complexity. The One Pass method is slightly more concise as it finds the target in a single loop, while the NeetCode approach is very intuitive as it breaks the problem down into two simpler sub-problems: finding the rotation point and performing standard binary search.

### 7. Further Reading
- [Search in Rotated Sorted Array (LeetCode 33)](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [Binary Search Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Neetcode Roadmap - Binary Search](https://neetcode.io/roadmap)
