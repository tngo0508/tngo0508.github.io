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

## Editorial Solution

### Approach 1: Stack and String Reversal

```python
class Solution:

    def evaluate_expr(self, stack):

        # If stack is empty or the expression starts with
        # a symbol, then append 0 to the stack.
        # i.e. [1, '-', 2, '-'] becomes [1, '-', 2, '-', 0]
        if not stack or type(stack[-1]) == str:
            stack.append(0)

        res = stack.pop()

        # Evaluate the expression till we get corresponding ')'
        while stack and stack[-1] != ')':
            sign = stack.pop()
            if sign == '+':
                res += stack.pop()
            else:
                res -= stack.pop()
        return res

    def calculate(self, s: str) -> int:

        stack = []
        n, operand = 0, 0

        for i in range(len(s) - 1, -1, -1):
            ch = s[i]

            if ch.isdigit():

                # Forming the operand - in reverse order.
                operand = (10**n * int(ch)) + operand
                n += 1

            elif ch != " ":
                if n:
                    # Save the operand on the stack
                    # As we encounter some non-digit.
                    stack.append(operand)
                    n, operand = 0, 0

                if ch == '(':
                    res = self.evaluate_expr(stack)
                    stack.pop()

                    # Append the evaluated result to the stack.
                    # This result could be of a sub-expression within the parenthesis.
                    stack.append(res)

                # For other non-digits just push onto the stack.
                else:
                    stack.append(ch)

        # Push the last operand to stack, if any.
        if n:
            stack.append(operand)

        # Evaluate any left overs in the stack.
        return self.evaluate_expr(stack)
```

## Approach 2: Stack and No String Reversal

```python
class Solution:
    def calculate(self, s: str) -> int:

        stack = []
        operand = 0
        res = 0 # For the on-going result
        sign = 1 # 1 means positive, -1 means negative

        for ch in s:
            if ch.isdigit():

                # Forming operand, since it could be more than one digit
                operand = (operand * 10) + int(ch)

            elif ch == '+':

                # Evaluate the expression to the left,
                # with result, sign, operand
                res += sign * operand

                # Save the recently encountered '+' sign
                sign = 1

                # Reset operand
                operand = 0

            elif ch == '-':

                res += sign * operand
                sign = -1
                operand = 0

            elif ch == '(':

                # Push the result and sign on to the stack, for later
                # We push the result first, then sign
                stack.append(res)
                stack.append(sign)

                # Reset operand and result, as if new evaluation begins for the new sub-expression
                sign = 1
                res = 0

            elif ch == ')':

                # Evaluate the expression to the left
                # with result, sign and operand
                res += sign * operand

                # ')' marks end of expression within a set of parenthesis
                # Its result is multiplied with sign on top of stack
                # as stack.pop() is the sign before the parenthesis
                res *= stack.pop() # stack pop 1, sign

                # Then add to the next operand on the top.
                # as stack.pop() is the result calculated before this parenthesis
                # (operand on stack) + (sign on stack * (result from parenthesis))
                res += stack.pop() # stack pop 2, operand

                # Reset the operand
                operand = 0

        return res + sign * operand
```
