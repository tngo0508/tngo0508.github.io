---
layout: single
title: "Problem of The Day: Partition Array for Maximum Sum"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-1043](/assets/images/2024-02-02_23-17-45-problem-1043.png)

Scratch Notes

![note](/assets/images/2024-02-02_23-21-48-scatch-note-problem-1043.png)

## Brute Force - TLE

Attempted to use backtrack to solve

```python
class Solution:
    def maxSumAfterPartitioning(self, arr: List[int], k: int) -> int:
        subarrays_max = []
        N = len(arr)
        def dfs(idx):
            if idx >= N:
                return sum(subarrays_max)

            res = 0
            for i in range(1, k + 1):
                val = max(arr[idx:idx + i])
                for _ in range(len(arr[idx:idx + i])):
                    subarrays_max.append(val)

                res = max(res, dfs(idx + i))

                for _ in range(len(arr[idx:idx + i])):
                    subarrays_max.pop()
            
            return res

        return dfs(0)
```

Other implementation

```python
class Solution:
    def maxSumAfterPartitioning(self, arr: List[int], k: int) -> int:
        N = len(arr)
        def dfs(idx, curr):

            if idx >= N:
                re = 0
                for subarray in curr:
                    max_val = max(subarray)
                    for _ in range(len(subarray)):
                        re += max_val
                return re

            res = 0
            for i in range(1, k + 1):
                res = max(res, dfs(idx + i, curr + [arr[idx:idx + i]]))

            return res

        return dfs(0, [])
```

## Memoization Approach - Accepted

### Intuition
The key idea is likely to consider all possible partitioning strategies and find the one that maximizes the sum.

### Approach
The provided code is using a recursive approach with memoization. It defines a function `dfs` that takes an index `i` as a parameter, indicating the current position in the array. The function explores all possible partitions by considering subarrays of at most size `k`, calculating the sum for each partition, and recursively moving to the next position.

The `memo` dictionary is used to store already computed results for a given index, avoiding redundant calculations.

### Complexity
- Time complexity:
O(n*k) the function `dfs` is called for each index from 0 to N-1, and for each call, it explores up to the next k elements.

- Space complexity:
The space complexity is determined by the size of the memo dictionary, which is proportional to the number of unique subproblems. In the worst case, it could be O(n), where n is the length of the input array.

### Code
```python
class Solution:
    def maxSumAfterPartitioning(self, arr: List[int], k: int) -> int:
        N = len(arr)
        memo = defaultdict()

        def dfs(i):
            if i >= N:
                return 0

            if i in memo:
                return memo[i]

            curr_max = 0
            res = 0

            for j in range(i, min(N, i + k)):
                curr_max = max(curr_max, arr[j])
                window_size = j - i + 1
                res = max(res, curr_max * window_size + dfs(j + 1))

            memo[i] = res
            return res
        return dfs(0)
```
