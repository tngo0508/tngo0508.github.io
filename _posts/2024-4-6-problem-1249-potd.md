---
layout: single
title: "Problem of The Day: minimum-remove-to-make-valid-parentheses"
date: 2024-4-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-1249](/assets/images/2024-04-06_11-45-04-problem-1249.png)

## Intuition

My initial thought on solving this problem is to utilize a stack data structure. Since we need to remove the minimum number of parentheses to make the string valid, we can use a stack to keep track of the indices of opening parentheses. When we encounter a closing parenthesis, if there's a corresponding opening parenthesis on the stack, we can remove both. If there's no corresponding opening parenthesis, we mark the index of the closing parenthesis for removal.

## Approach

I'll iterate through the string, maintaining a stack to keep track of opening parentheses' indices. Whenever I encounter a closing parenthesis, I'll check if the stack is non-empty and the top of the stack contains an opening parenthesis that matches the current closing parenthesis. If so, I'll remove the opening parenthesis from the stack. If not, I'll mark the index of the closing parenthesis for removal. After processing the string, I'll construct the resulting string by excluding the characters at the marked indices.

## Complexity

- Time complexity:
  O(N)

- Space complexity:
  O(N)

## Code

```python
class Solution:
    def minRemoveToMakeValid(self, s: str) -> str:
        stack = []
        for i, c in enumerate(s):
            if stack:
                if s[stack[-1]] == '(' and c == ')':
                    stack.pop()
                    continue
            if c in '()':
                stack.append(i)

        res = []
        hash_set = set(stack)
        for i, c in enumerate(s):
            if i in hash_set:
                continue
            res.append(c)

        return ''.join(res)
```
