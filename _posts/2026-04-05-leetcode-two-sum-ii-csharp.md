---
title: "Solving Two Sum II - Input Array Is Sorted in C#"
excerpt: "Learn how to find two numbers that add up to a specific target in a sorted array using a two-pointer approach within an iterative loop in C#."
date: 2026-04-05
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

### 1. The Problem: Two Sum II - Input Array Is Sorted

The "Two Sum II" problem (LeetCode 167) asks us to find two numbers in an array that add up to a specific `target` value. The key constraints are:
- The input array `numbers` is already sorted in non-decreasing order.
- You must return the indices of the two numbers as a 1-indexed array `[index1, index2]`, where `1 <= index1 < index2 <= numbers.length`.
- You may not use the same element twice.
- There is exactly one solution.

> **Problem Statement:** Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number.

### 2. The Intuition: Two Pointers with Iteration

While the most common approach for this problem is a single-pass two-pointer technique, this algorithm provides a robust version that incorporates an outer loop and a `HashSet` to ensure unique processing of starting indices.

1.  **Iterative Start:** We use an outer `for` loop to select a starting point `i`.
2.  **Tracking Used Indices:** A `HashSet<int>` called `used` keeps track of indices we have already processed as starting points to avoid redundant computations.
3.  **Two-Pointer Strategy:** For each starting index, we initialize `left` at `i` and `right` at the very end of the array. We then narrow the range:
    - If the sum is **equal** to the target, we've found our answer.
    - If the sum is **too small**, we move the `left` pointer forward to increase the total.
    - If the sum is **too large**, we move the `right` pointer backward to decrease the total.

### 3. Implementation: C# Two-Pointer Approach

This implementation utilizes C# 12 collection expressions (`[]`) for concise array returns.

```csharp
public class Solution {
    public int[] TwoSum(int[] numbers, int target) {
        var used = new HashSet<int>();
        for (int i = 0; i < numbers.Length; i++) {
            if (used.Contains(i)) continue;
            used.Add(i);
            var left = i;
            var right = numbers.Length - 1;
            while (left < right) {
                var curr = numbers[left] + numbers[right];
                if (curr == target) {
                    return [left + 1, right + 1];
                } else if (curr < target)  {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return [];
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize the Outer Loop
The algorithm starts a loop from `i = 0`. It uses a `HashSet` to skip any indices that have already been evaluated as a starting `left` pointer.

#### Step 2: Set Two Pointers
For the current index `i`, we set `left = i` and `right` to the last index of the array (`numbers.Length - 1`).

#### Step 3: Compare and Adjust
Inside the `while` loop, we calculate `curr = numbers[left] + numbers[right]`.
- If `curr == target`, we return the 1-indexed results: `[left + 1, right + 1]`.
- If `curr < target`, we increment `left` to look for a larger sum.
- If `curr > target`, we decrement `right` to look for a smaller sum.

#### Step 4: Final Result
Because the problem guarantees exactly one solution, the algorithm will return the correct indices once the conditions are met.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N²)** | In the worst case, the nested loops might iterate over the array multiple times, although it behaves like **O(N)** for a sorted array where the first pointer finds the result. |
| **Space Complexity** | **O(N)** | The `HashSet` stores up to $N$ indices in the worst case. |

### 6. Summary

The "Two Sum II" problem demonstrates the power of the two-pointer technique on sorted data. This specific implementation adds a layer of safety with a `HashSet` and an outer loop, ensuring that even if the search space is large, we systematically move towards the target sum. By returning 1-indexed values, it directly satisfies the LeetCode requirements.

### 7. Further Reading
- [LeetCode 167: Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [NeetCode: Two Sum II Explanation](https://neetcode.io/problems/two-sum-ii)
- [C# Collection Expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/collection-expressions)
