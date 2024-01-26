---
layout: single
title: "Problem of The Day: Climbing Stairs"
date: 2024-1-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
[70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/description/?envType=daily-question&envId=2024-01-18)

# My Solution
Memoization Approach
```python
class Solution:
    def climbStairs(self, n: int) -> int:
        memo = defaultdict()
        def dfs(steps):
            if steps < 0:
                return 0
            if steps == 0:
                return 1

            if steps in memo:
                return memo[steps]
                
            memo[steps] = dfs(steps - 1) + dfs(steps - 2)
            return memo[steps]

        return dfs(n)
```

I already solved and explained this question in the past. See this [Journal]({% post_url 2024-1-8-climbing-stairs %}) for detailed explanation.

