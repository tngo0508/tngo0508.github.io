---
title: "Solving Longest Consecutive Sequence in C#"
excerpt: "Learn how to find the length of the longest consecutive sequence in an unsorted array in O(n) time using HashSets."
date: 2026-03-25
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Array
  - Hash Set
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Longest Consecutive Sequence

The "Longest Consecutive Sequence" problem requires us to find the longest sequence of consecutive integers in an unsorted array.

> Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence.
>
> You must write an algorithm that runs in **O(n)** time.

For example, if the input is `[100, 4, 200, 1, 3, 2]`, the longest consecutive elements sequence is `[1, 2, 3, 4]`. Therefore, its length is 4.

### 2. The Intuition: Hash Set for Efficient Lookups

The most straightforward way to solve this would be to sort the array, which would take **O(n log n)** time. However, the problem explicitly requires an **O(n)** solution.

To achieve linear time, we need a way to check if a number exists in the array in **O(1)** time. A `HashSet<int>` is perfect for this.

The key insight is:
A number `x` is the **start** of a consecutive sequence only if `x - 1` is **not** present in the set.

If `x` is the start, we then check for `x + 1`, `x + 2`, `x + 3`, and so on, until the sequence breaks.

### 3. Implementation

This implementation uses a `HashSet<int>` to store all numbers and then iterates through the set to find and count the sequences.

```csharp
public class Solution {
    public int LongestConsecutive(int[] nums) {
        // 1. Build a HashSet for O(1) lookups
        var hashSet = new HashSet<int>(nums);
        var result = 0;

        // 2. Iterate through each unique number
        foreach (var num in hashSet) {
            // 3. Check if this number is the start of a sequence
            // (i.e., the predecessor doesn't exist)
            if (!hashSet.Contains(num - 1)) {
                int curr = num;
                int streak = 1;

                // 4. Count how long the sequence continues
                while (hashSet.Contains(curr + 1)) {
                    streak++;
                    curr++;
                }

                // 5. Keep track of the maximum streak found
                result = Math.Max(result, streak);
            }
        }
        return result;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Populate the HashSet
We first add all the elements from the input array `nums` into a `HashSet<int>`. This removes duplicates and allows us to perform presence checks in constant time on average.

#### Step 2: Identify Sequence Starters
We iterate through each number in our set. For each number `num`, we check if `num - 1` exists in the set. If it does, `num` cannot be the start of the sequence (because `num - 1` would have started it or is part of it). We only begin counting when we find a true sequence starter.

#### Step 3: Expand the Sequence
Once a starter is found, we use a `while` loop to check for the next consecutive numbers (`curr + 1`, `curr + 2`, etc.). We increment our `streak` counter for every consecutive number found.

#### Step 4: Update Global Maximum
After the `while` loop finishes for a particular sequence, we update `result` with the maximum of its current value and the new `streak` length.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We build the set in O(N) time. Although there's a nested `while` loop, each number is visited at most twice: once in the `foreach` and at most once inside the `while` across the entire execution. |
| **Space Complexity** | **O(N)** | We store all unique elements of the array in a `HashSet`. |

### 6. Summary

The "Longest Consecutive Sequence" problem is a classic example of using a space-for-time trade-off. By using a `HashSet`, we transform the problem from one requiring sorting into one that can be solved with a single (amortized) pass through the data.

### 7. Further Reading
- [HashSet<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1)
- [Neetcode - Longest Consecutive Sequence](https://neetcode.io/problems/longest-consecutive-sequence)
- [LeetCode Problem 128](https://leetcode.com/problems/longest-consecutive-sequence/)
