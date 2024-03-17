---
layout: single
title: "Problem of The Day: Contiguous Array"
date: 2024-3-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-525](/assets/images/2024-03-17_14-02-42-problem-525.png)](/assets/images/2024-03-17_14-02-42-problem-525.png)

> Need to redo and review this in again.

## Brute Force - TLE

### Nested Loop Approach

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        if len(nums) < 2:
            return 0

        N = len(nums)
        max_length = 0
        for i in range(N):
            counter = Counter()
            for j in range(i, N):
                counter[nums[j]] += 1
                if counter[0] == counter[1]:
                    max_length = max(max_length, j - i + 1)

        return max_length
```

- Time complexity: O(n^2)
- Space complexity: O(1)

### sliding windows - TLE

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        if len(nums) < 2:
            return 0

        counter = Counter(nums)
        N = len(nums)
        window = N
        while window >= 2:
            for i in range(0, N-window + 1):
                counter = Counter(nums[i:i+window])
                if counter[0] == counter[1]:
                    return window

            window -= 1
        return 0
```

## Solution

This algorithm traverses through the input list, maintaining a running count that represents the difference between the number of 1s and 0s encountered so far. It stores the index of the first occurrence of each unique count value in a dictionary. Whenever it encounters a count value seen before, it calculates the length of the current subarray and updates the maximum length if needed. By efficiently keeping track of the count and the corresponding indices, it determines the maximum length of a contiguous subarray with an equal number of 0s and 1s, ultimately returning this value as the result.

> The main idea is to keep track of the difference between zeroes and ones since we need to know a head of time when to remove the surplus to meet the requirement in the problem which is zeroes == ones

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        max_length = 0
        count = 0
        sum_index_map = {0: -1}

        for i in range(len(nums)):
            if nums[i] == 0:
                count -= 1
            else:
                count += 1

            if count in sum_index_map:
                max_length = max(max_length, i - sum_index_map[count])
            else:
                sum_index_map[count] = i

        return max_length
```

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        seen_at = {0: -1}
        max_len = count = 0

        for i, n in enumerate(nums):
            count += (1 if n else -1)
            if count in seen_at:
                max_len = max(max_len, i - seen_at[count])
            else:
                seen_at[count] = i
        return max_len
```
