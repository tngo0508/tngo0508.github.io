---
layout: single
title: "Problem of The Day: Generate Parentheses"
date: 2024-4-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem22](/assets/images/2024-04-28_12-54-33-problem-22.png)

## Intuition

When I first looked at this problem, I noticed it's a classic backtracking problem. We need to generate all valid combinations of parentheses for a given value of n

## Approach

My approach involves using backtracking to explore all possible combinations of opening and closing parentheses while ensuring that at each step, the parentheses remain balanced. I keep track of the number of open and close parentheses used so far, and I append '(' or ')' accordingly.

## Complexity

- Time complexity:
  O(4^n / sqrt(n)) This complexity arises from the Catalan number, which is the number of valid combinations of parentheses for a given nnn, multiplied by n to account for the cost of generating each combination. It's a bit more complex than a simple O(2^(2nß)) due to the additional constraints and checks in the algorithm.

- Space complexity:
  O(n)

## Code

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res = []
        def backtrack(open_paren, close_paren, curr):
            if open_paren > n:
                return
            if close_paren > open_paren:
                return
            if open_paren == close_paren and open_paren == n:
                res.append(''.join(curr))
                return

            backtrack(open_paren + 1, close_paren, curr + ['('])
            backtrack(open_paren, close_paren + 1, curr + [')'])

        backtrack(0, 0, [])
        return res
```
