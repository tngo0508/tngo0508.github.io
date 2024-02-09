---
layout: single
title: "Problem of The Day: Perfect Squares"
date: 2024-2-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-368](/assets/images/2024-02-08_17-22-15-problem-368.png)

>Note: Need to review this again

## Brute Force Approach - TLE

My idea is to generate all possible combinations that satisfy the requirements asked in the question which is making sure that `nums[i] % nums[j] == 0 or nums[j] % nums[i] == 0`. This approach passes most of the basic cases, but soon it hits the Time Limit Exceeded on Leet Code with a large test case.

```python
class Solution:
    def largestDivisibleSubset(self, nums: List[int]) -> List[int]:
        def is_valid(arr):
            for i in range(len(arr)):
                for j in range(i + 1, len(arr)):
                    if not (arr[i] % arr[j] == 0 or arr[j] % arr[i] == 0):
                        return False
            return True

        N = len(nums)
        def dfs(idx, curr):
            if idx == N:
                if is_valid(curr):
                    return curr[:]
                return []
            res = []
            for i in range(idx, N):
                exclude = dfs(i + 1, curr)
                include = dfs(i + 1, curr + [nums[i]])
                if len(res) < len(exclude):
                    res = exclude[:]
                if len(res) < len(include):
                    res = include[:]
            
            return res

        return dfs(0, [])
```

- Time complexity: O(2^n) because in the recursion function call, we have two choices either include the number or skip it.
- Space complexity: O(n) because In the worst case, the maximum depth of the recursion stack is equal to the length of the input list 'n'.
