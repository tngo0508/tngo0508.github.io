---
layout: single
title: "Problem of The Day: Climbing Stairs"
date: 2024-1-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
```
You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

 

Example 1:

Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
Example 2:

Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
 

Constraints:

1 <= n <= 45
```

# Intuition
I initially consider using recursion to explore different combinations of one and two steps to climb the stairs. This would involve building a tree-like structure to represent the possible paths.

# Approach
I implemented a recursive solution using a depth-first search (DFS) approach. The function `dfs` explores the possibilities of taking `one` or `two` steps at each level until reaching the target number of stairs. `Memoization` is employed to store previously computed results and optimize the solution by avoiding redundant calculations.

# Complexity
- Time complexity:
The time complexity is O(n) as each stair is visited once, and memoization ensures repeated calculations are avoided.

- Space complexity:
The space complexity is O(n) due to the memo dictionary, which stores intermediate results for each stair level.

# Brute Force - Memoization
```python
class Solution:
    def climbStairs(self, n: int) -> int:
        def dfs(i, memo):
            if i > n:
                return 0

            if i == n:
                return 1
            
            if i in memo:
                return memo[i]
            
            one_step = dfs(i + 1, memo)
            two_step = dfs(i + 2, memo)
            memo[i] = one_step + two_step
            return memo[i]

        memo = defaultdict(int)
        return dfs(0, memo)
```

# Dynamic Programming
To enhance the solution, I employed dynamic programming with an array dp to store the number of distinct ways to climb the stairs for each step. I iteratively filled the array based on the recurrence relation `dp[i] = dp[i - 1] + dp[i - 2]`. This approach eliminates the need for explicit recursion and memoization.

- Time complexity: The time complexity is O(n) as the array is iterated through once to compute the number of ways for each step.
- Space complexity: The space complexity is O(n) due to the array dp, which stores the intermediate results for each step.

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 1:
            return 1

        dp = [0] * (n + 1)
        dp[1] = dp[0] = 1
        for i in range(2, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        
        return dp[-1]
```