---
layout: single
title: "Problem of The Day: Evaluate Reverse Polish Notation"
date: 2024-1-29
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
see [problem](https://leetcode.com/problems/evaluate-reverse-polish-notation/description/?envType=daily-question&envId=2024-01-30)

# Intuition
The intuition is to use a stack to evaluate the Reverse Polish Notation (RPN) expression. The stack keeps track of operands, and when an operator is encountered, the top operands are popped, and the result of the operation is pushed back onto the stack.

# Approach
The approach involves iterating through the tokens and using a stack to evaluate the RPN expression. If a token is an operand, it is pushed onto the stack. If it is an operator, the top two operands are popped from the stack, and the result of the operation is pushed back onto the stack. The process continues until all tokens are processed. The final result is the only remaining element on the stack.

# Complexity
- Time complexity:
O(n), where n is the number of tokens. The algorithm processes each token once. 

- Space complexity:
O(n), where n is the number of tokens. The stack stores operands during the evaluation process.

# Code
```python
class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        map_func = {
            '+': lambda x, y: x + y,
            '-': lambda x, y: x - y,
            '*': lambda x, y: x * y,
            '/': lambda x, y: int(x / y),  # Convert the result to an integer after division
        }
        stack = []
        for token in tokens:
            val = token
            if token in map_func:
                num1 = int(stack.pop())
                num2 = int(stack.pop())
                val = str(map_func[token](num2, num1))
            stack.append(val)

        return int(stack[0])

    
```