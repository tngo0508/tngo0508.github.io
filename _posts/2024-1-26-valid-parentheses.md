---
layout: single
title: "Problem of The Day: Valid Parentheses"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-26_05-25-50-problem-20.png)](/assets/images/2024-01-26_05-25-50-problem-20.png)

# Intuition
My initial thought is to use a stack data structure to keep track of the opening parentheses as I encounter them, and then verify the closing ones against the last opened parentheses.

# Approach
I will iterate through the string, and whenever I encounter an opening parenthesis `('(', '{', or '[')`, I'll push it onto the stack. For closing parentheses, I'll check if the stack is not empty before popping. If the popped element does not match the corresponding opening parenthesis, I'll return False. After processing the entire string, if the stack is empty, the parentheses are valid.

# Complexity
- Time complexity:
O(n), where n is the length of the input string. We iterate through the string once.

- Space complexity:
O(n), in the worst case, when all characters in the string are opening parentheses, they will be pushed onto the stack.

# Code
```python
class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {
            ')': '(',
            '}': '{',
            ']': '[',
        }
        stack = []
        for c in s:
            if c in '({[':
                stack.append(c)
            else:
                if not stack:
                    return False
                top = stack.pop()
                if top != pairs[c]:
                    return False
        
        return len(stack) == 0
```

# Editorial Solution
```python
class Solution(object):
    def isValid(self, s):
        """
        :type s: str
        :rtype: bool
        """

        # The stack to keep track of opening brackets.
        stack = []

        # Hash map for keeping track of mappings. This keeps the code very clean.
        # Also makes adding more types of parenthesis easier
        mapping = {")": "(", "}": "{", "]": "["}

        # For every bracket in the expression.
        for char in s:

            # If the character is an closing bracket
            if char in mapping:

                # Pop the topmost element from the stack, if it is non empty
                # Otherwise assign a dummy value of '#' to the top_element variable
                top_element = stack.pop() if stack else '#'

                # The mapping for the opening bracket in our hash and the top
                # element of the stack don't match, return False
                if mapping[char] != top_element:
                    return False
            else:
                # We have an opening bracket, simply push it onto the stack.
                stack.append(char)

        # In the end, if the stack is empty, then we have a valid expression.
        # The stack won't be empty for cases like ((()
        return not stack
```