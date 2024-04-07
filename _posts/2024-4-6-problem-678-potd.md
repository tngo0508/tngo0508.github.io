---
layout: single
title: "Problem of The Day: Valid Parenthesis String"
date: 2024-4-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-678](/assets/images/2024-04-06_19-49-40-problem-678.png)

## Intuition

Initially, I'm thinking of using a depth-first search (DFS) approach to check the validity of the given string. The idea is to traverse the string character by character and maintain a balance count of open and close parentheses encountered so far.

## Approach

I'll define a recursive function `dfs` that takes an index to keep track of the current position in the string and a balance count to track the number of open and close parentheses encountered. At each step, I'll examine the current character:

- If it's an open parenthesis '(', I'll increment the balance count.
- If it's a close parenthesis ')', I'll decrement the balance count.
- If it's an asterisk '\*', I'll explore all possibilities: considering it as an empty string, an open parenthesis, or a close parenthesis.

I'll continue this process recursively until I reach the end of the string. If at any point the balance count becomes negative, it implies there are more close parentheses than open ones, which violates the validity condition. If after processing the entire string, the balance count is zero, it indicates a valid string.

To optimize and avoid redundant computations, I'll use memoization to store the results of already computed states (index, balance) to avoid recomputation.

## Complexity

- Time complexity:
  In the worst case, each character is explored thrice due to the three possibilities for '\*', leading to a time complexity of O(3^N), where N is the length of the string.

- Space complexity:
  O(N) due to the memoization dictionary storing results for each index and balance pair.

## Code

```python
class Solution:
    def checkValidString(self, s: str) -> bool:
        N = len(s)
        memo = defaultdict()
        def dfs(index, balance):
            if index == N:
                return balance == 0

            if balance < 0:
                return False

            if (index, balance) in memo:
                return memo[(index, balance)]

            res = False
            if s[index] == '(':
                res = dfs(index + 1, balance + 1)
            elif s[index] == ')':
                res = dfs(index + 1, balance - 1)
            else:
                res = dfs(index + 1, balance) or dfs(index + 1, balance + 1) or dfs(index + 1, balance - 1)

            memo[(index, balance)] = res
            return res

        return dfs(0, 0)
```
