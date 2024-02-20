---
layout: single
title: "Problem of The Day: Missing Number"
date: 2024-2-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-268](/assets/images/2024-02-19_18-51-36-problem-268.png)](/assets/images/2024-02-19_18-51-36-problem-268.png)

## Approach: Hash set

```python
class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        N = len(nums)
        hash_set = set(nums)
        for i in range(N + 1):
            if i not in hash_set:
                return i
```

- Time complexity: O(n)
- Space complexity: O(n)

## Approach: cyclic sort

```python
class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        N = len(nums)
        i = 0
        for i in range(N):
            j = nums[i]
            while j < N and j != i:
                nums[i], nums[j] = nums[j], nums[i]
                j = nums[i]
        
        for i in range(N):
            if nums[i] != i:
                return i

        return N
```

- Time complexity: O(n^2) due to the while-loop inside the first loop.
- Space complexity: O(1)

## Editorial Solution

Approach #3 Bit Manipulation

The idea is to use the XOR operation to find the missing number. Since we know that the array contains numbers in the range [0, n-1] and is missing exactly one number, we can initialize a variable to n and XOR it with every index and value in the array. The result will be the missing number.

Example:

| Index | Value |
|-------|-------|
|   0   |   0   |
|   1   |   1   |
|   2   |   3   |
|   3   |   4   |

```text
missing = 4 ^ (0 ^ 0) ^ (1 ^ 1) ^ (2 ^ 3) ^ (3 ^ 4)
        = (4 ^ 4) ^ (0 ^ 0) ^ (1 ^ 1) ^ (3 ^ 3) ^ 2
        = 0 ^ 0 ^ 0 ^ 0 ^ 2
        = 2
```

```python
class Solution:
    def missingNumber(self, nums):
        missing = len(nums)
        for i, num in enumerate(nums):
            missing ^= i ^ num
        return missing
```
