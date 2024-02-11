---
layout: single
title: "Problem of The Day: Cherry Pickup II"
date: 2024-2-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1463](/assets/images/2024-02-10_17-04-48-problem-1463.png)](/assets/images/2024-02-10_17-04-48-problem-1463.png)

## Intuition

I realized that the cherry picking is essentially a traversal problem through a grid with some constraints. Given that we need to find the maximum number of cherries that can be collected while two people traverse the grid simultaneously, the overlapping subproblems hint at using memoization.

## Approach

The idea is to traverse the grid row by row, considering all possible positions for the two robots at each step. The recursive function `dfs` explores different cherry picking paths while memoizing the results to avoid redundant computations.

I used a defaultdict to store the memoized results, with the tuple `(r, r1_c, r2_c)` representing the current state of the traversal. The base case checks if we have reached the last row, and if so, returns 0. Otherwise, it explores all possible moves for both robots and maximizes the total cherries collected.

## Complexity

- Time complexity:
O(ROWS * COLS ^ 2) because in the worst case, we have to solve `rows * cols * cols` total number of possible states

- Space complexity:
O(ROWS *COLS ^ 2) because we need a hash map of O(ROWS* COLS ^ 2) to store results

## Code

```python
class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        ROWS = len(grid)
        COLS = len(grid[0])

        memo = defaultdict()
        def dfs(r, r1_c, r2_c):
            if r >= ROWS:
                return 0

            if (r, r1_c, r2_c) in memo:
                return memo[(r, r1_c, r2_c)]

            cols = [-1,0,1]
            res = 0
            for col in cols:
                r1_col = r1_c + col
                if 0 <= r1_col < COLS:
                    for col in cols:
                        r2_col = r2_c + col
                        if 0 <= r2_col < COLS and r1_col != r2_col:
                            res = max(res, dfs(r + 1, r1_col, r2_col) + grid[r][r1_c] + grid[r][r2_c])
            memo[(r, r1_c, r2_c)] = res
            return res

        return dfs(0, 0, COLS - 1)
```

## Editorial Solution

### Approach #1: Dynamic Programming (Top Down)

```python
class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        m = len(grid)
        n = len(grid[0])

        @lru_cache(None)
        def dp(row, col1, col2):
            if col1 < 0 or col1 >= n or col2 < 0 or col2 >= n:
                return -inf
            # current cell
            result = 0
            result += grid[row][col1]
            if col1 != col2:
                result += grid[row][col2]
            # transition
            if row != m-1:
                result += max(dp(row+1, new_col1, new_col2)
                              for new_col1 in [col1, col1+1, col1-1]
                              for new_col2 in [col2, col2+1, col2-1])
            return result

        return dp(0, 0, n-1)
```

### Approach #2: Dynamic Programming (Bottom Up)

>Note: need to review this approach again. I am still not cleared.

```python
class Solution:
    def cherryPickup(self, grid: List[List[int]]) -> int:
        m = len(grid)
        n = len(grid[0])
        dp = [[[0]*n for _ in range(n)] for __ in range(m)]

        for row in reversed(range(m)):
            for col1 in range(n):
                for col2 in range(n):
                    result = 0
                    # current cell
                    result += grid[row][col1]
                    if col1 != col2:
                        result += grid[row][col2]
                    # transition
                    if row != m-1:
                        result += max(dp[row+1][new_col1][new_col2]
                                      for new_col1 in [col1, col1+1, col1-1]
                                      for new_col2 in [col2, col2+1, col2-1]
                                      if 0 <= new_col1 < n and 0 <= new_col2 < n)
                    dp[row][col1][col2] = result
        return dp[0][0][n-1]
```
