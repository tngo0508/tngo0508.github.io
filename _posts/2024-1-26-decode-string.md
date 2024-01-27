---
layout: single
title: "Problem of The Day: Decode String"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
[![394](/assets/images/2024-01-26_22-28-46-problem-394.png)](/assets/images/2024-01-26_22-28-46-problem-394.png)

# Intuition
My initial thoughts are to use a stack to keep track of the characters while iterating through the input string.

# Approach
I will iterate through the string and use a stack to keep track of characters. Whenever I encounter a `']'`, I will pop characters from the stack until I find the corresponding `'['`. This extracted substring represents the part of the encoded string that needs to be repeated. After that, I will pop the `'['` and the preceding numeric characters that represent the repetition count. I will then multiply the extracted substring by the repetition count and push it back onto the stack. This process continues until the entire string is processed.

# Complexity
- Time complexity:
O(n), where n is the length of the input string. We iterate through the string once.

- Space complexity:
O(n), where n is the length of the input string. In the worst case, the entire string could be pushed onto the stack.

# Code
```python
class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        for c in s:
            if c == ']':
                curr = ''
                while stack and stack[-1] != '[':
                    curr = stack.pop() + curr
                
                stack.pop()
                num_str = ''
                while stack and stack[-1].isdigit():
                    num_str = stack.pop() + num_str
                num = int(num_str)
                stack.append(num * curr)
            else:
                stack.append(c)
        
        return ''.join(stack)
        
```