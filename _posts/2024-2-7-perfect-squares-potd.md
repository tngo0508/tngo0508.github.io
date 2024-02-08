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

[![problem-279](/assets/images/2024-02-07_17-25-45-problem-279.png)](/assets/images/2024-02-07_17-25-45-problem-279.png)

## TLE Approaches

### Memoization - TLE

```python
class Solution:
    def numSquares(self, n: int) -> int:
        nums = []
        for i in range(1, n + 1):
            square = i**2
            if square <= n:
                nums.append(square)
            else:
                break
        
        nums.sort(reverse=True)
        memo = defaultdict()
        
        def dfs(i, n):
            if n < 0:
                return float('inf')
            if n == 0:
                return 0
            if (i, n) in memo:
                return memo[(i, n)]
            res = float('inf')
            for j in range(i, len(nums)):
                res = min(res, dfs(j, n - nums[j]) + 1, dfs(j + 1, n) + 1)
            
            memo[(i, n)] = res
            return res

        return dfs(0, n)
```

### Dynamic Programming - TLE

```python
class Solution:
    def numSquares(self, n: int) -> int:
        dp = [n] * (n + 1)
        for i in range(n + 1):
            if i ** 2 > n:
                break
            dp[i**2] = 1
        
        for i in range(1, n + 1):
            for j in range(0, i//2 + 1):
                dp[i] = min(dp[i], dp[i - j] + dp[j])
        
        return dp[-1]
```

### BFS Approach - Memory Limit Exceeded

```python
class Solution:
    def numSquares(self, n: int) -> int:
        nums = []
        for i in range(n + 1):
            if i ** 2 > n:
                break
            nums.append(i**2)

        nums.sort(reverse=True)
        queue = deque()
        queue.append([n, 0])
        while queue:
            total, level = queue.popleft()
            if total < 0:
                continue
            if total == 0:
                return level
            
            for num in nums:
                queue.append([total - num, level + 1])
        
        return res
```

## Improved BFS Approach - Accepted

### Intuition

My initial thought is to use a breadth-first search (BFS) approach to explore all possible combinations of perfect square numbers that add up to the given integer n. By breaking down the problem into smaller subproblems, we can efficiently find the minimum number of squares required.

### Approach

I start by creating a list of perfect square numbers up to `n` and use a queue to perform BFS. The queue contains pairs of the remaining total (`total`) and the current level of the BFS (`level`). I explore all possible combinations by subtracting each perfect square number from the total and enqueueing the updated values. The process continues until I find a combination that results in `total` being zero.

I keep track of the level during BFS, and when I find a combination that satisfies the condition (`total - num == 0`), I set the result (`res`) to the current level plus 1. I also break out of the loop to stop further exploration since we aim to find the minimum number of squares.

### Complexity

- Time complexity:
O(n * sqrt(n)), where `n` is the given integer. The loop to find perfect squares takes O(sqrt(n)), and in the worst case, we may explore all combinations.

- Space complexity:
O(n) for the queue, as it can grow up to the size of `n`.

### Code

```python
class Solution:
    def numSquares(self, n: int) -> int:
        nums = []
        for i in range(n + 1):
            if i ** 2 > n:
                break
            nums.append(i**2)

        queue = deque()
        queue.append([n, 0])
        res = 0
        while queue:
            total, level = queue.popleft()
            for num in nums:
                if total - num == 0:
                    res = level + 1
                    break
                if total - num < 0:
                    continue
                queue.append([total - num, level + 1])

            if res > 0:
                break

        return res


```
