---
layout: single
title: "Problem of The Day: Basic Calculator"
date: 2024-3-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-224](/assets/images/2024-03-06_12-04-40-problem-224.png)](/assets/images/2024-03-06_12-04-40-problem-224.png)

Note:

- My approach is accepted by Leetcode Judge, but it's quite slow -> need to transform the recursion into stack or something to improve the time complexity.
- Need to review again for interview practice.

## Brute Force - recursion - Accepted

### Intuition

My initial thoughts are to tokenize the input string, considering the arithmetic operations and parentheses. After tokenization, I can recursively evaluate the expressions following the order of operations.

### Approach

I will define a method `tokenize` to break the input string into meaningful tokens, such as numbers, addition, subtraction, and parentheses. Then, I'll create a recursive method `calc` to perform the actual calculation. This method will handle different cases, such as encountering digits, operators, or parentheses.

The `calc` method will have parameters like the current index in the tokens list, the list of tokens, the current sign, and the running total. It will recursively process the tokens and update the total accordingly.

### Complexity

- Time complexity:
  O(n) where n is the length of the input string. The tokenization process and recursive evaluation of the expression contribute to this complexity.

- Space complexity:
  O(n) where n is the length of the input string. The space required for the tokens list and the recursive call stack contributes to the space complexity.

### Code

```python
class Solution:
    def calculate(self, s: str) -> int:
        s = s.replace(" ", "")
        N = len(s)
        def tokenize(expr):
            tokens = []
            i = 0
            curr = ""
            while i < N:
                c = expr[i]
                if c in '+-()':
                    if curr:
                        tokens.append(curr)
                    tokens.append(c)
                    curr = ""
                else:
                    curr += c
                i += 1

            if curr:
                tokens.append(curr)

            return tokens


        def calc(i, tokens, sign, curr):
            if i == len(tokens) or tokens[i] == ')':
                return curr

            if tokens[i] not in "+-()": # digits
                return calc(i + 1, tokens, sign, sign * int(tokens[i]) + curr)

            if tokens[i] in "+-":
                sign = 1 if tokens[i] == "+" else -1
                return calc(i + 1, tokens, sign, curr)

            if tokens[i] == '(':
                hash_map = {'(': 1, ')': 0}
                j = i
                while j < len(tokens) and hash_map['('] > 0:
                    j += 1
                    if tokens[j] in '()':
                        hash_map['('] += (1 if tokens[j] == '(' else -1)
                return curr + (calc(i + 1, tokens, 1, 0) * sign) + calc(j + 1, tokens, 1, 0)


        tokens = tokenize(s)
        return calc(0, tokens, 1, 0)

```
