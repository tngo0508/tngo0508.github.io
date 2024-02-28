---
layout: single
title: "Problem of The Day: Paint Fence"
date: 2024-2-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-276](/assets/images/2024-02-28_15-39-34-problem-276.png)](/assets/images/2024-02-28_15-39-34-problem-276.png)

My note:
[![problem-276-note](/assets/images/2024-02-28_15-33-41-problem-276-note.png)](/assets/images/2024-02-28_15-33-41-problem-276-note.png)

## Brute Force - Memoization Approach - TLE

```python
class Solution:
    def numWays(self, n: int, k: int) -> int:
        memo = defaultdict(tuple)
        def dfs(color, post, curr):
            if len(curr) >= 3 and curr[-1] == curr[-2] and curr[-2] == curr[-3]:
                return 0
            if post == n:
                return 1
            if (color, post, tuple(curr)) in memo:
                return memo[(color, post, tuple(curr))]
            res = 0
            for c in range(k):
                res += dfs(c, post + 1, curr + [c])

            memo[(color, post, tuple(curr))] = res
            return res

        return dfs(0, 0, [])
```

## Intuition

To overcome the TLE, my thought was that we can use dynamic programming to build a solution by considering the choices made at each step.

## Approach

I will use dynamic programming to build a solution. I will create an array `dp` where `dp[i]` represents the number of ways to paint the first `i` posts with the given constraints. I will initialize `dp[1]` to `k` since there are `k` ways to paint the first post.

For each subsequent post (starting from the second post), the number of ways to paint it depends on the choices made for the previous two posts. If the current post has the same color as the previous one, then the number of ways is `(k-1)` times the number of ways to paint the previous post. If the current post has a different color than the previous one, then the number of ways is `(k-1)` times the sum of the number of ways to paint the previous two posts.

I will iterate through the posts, updating the `dp` array based on the described logic. The final result will be `dp[n]`.

## Complexity

- Time complexity:
O(n), where n is the number of posts. We iterate through the posts once.

- Space complexity:
O(n), as we use an array of size `n+1` for dynamic programming.

## Code

```python
class Solution:
    def numWays(self, n: int, k: int) -> int:
        if k == 0 or n == 0:
            return 0
        dp = [0] * (n + 1)
        dp[1] = k
        for i in range(2, n + 1):
            if i == 2:
                dp[i] = k ** 2
            else:
                dp[i] = (dp[i-1] + dp[i-2]) * (k - 1)
        
        return dp[-1]
```

## Editorial Solution

### Approach 1: Top-Down Dynamic Programming (Recursion + Memoization)

```python
class Solution:
    def numWays(self, n: int, k: int) -> int:
        def total_ways(i):
            if i == 1:
                return k
            if i == 2:
                return k * k
            
            # Check if we have already calculated totalWays(i)
            if i in memo:
                return memo[i]
            
            # Use the recurrence relation to calculate total_ways(i)
            memo[i] = (k - 1) * (total_ways(i - 1) + total_ways(i - 2))
            return memo[i]

        memo = {}
        return total_ways(n)
```

### Approach 2: Bottom-Up Dynamic Programming (Tabulation)

```python
class Solution:
    def numWays(self, n: int, k: int) -> int:
        # Base cases for the problem to avoid index out of bound issues
        if n == 1:
            return k
        if n == 2:
            return k * k

        total_ways = [0] * (n + 1)
        total_ways[1] = k
        total_ways[2] = k * k
        
        for i in range(3, n + 1):
            total_ways[i] = (k - 1) * (total_ways[i - 1] + total_ways[i - 2])
        
        return total_ways[n]
```
