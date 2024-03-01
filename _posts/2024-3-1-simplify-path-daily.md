---
layout: single
title: "Problem of The Day: Simplify Path"
date: 2024-3-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-71](/assets/images/2024-03-01_15-06-36-problem-71.png)](/assets/images/2024-03-01_15-06-36-problem-71.png)

## Intuition

My initial thoughts are to handle the various cases like ".", "..", and the normal directory names. We need to eliminate unnecessary "/" characters and appropriately navigate through the path.

## Approach

The approach I took begins by using a regular expression to replace consecutive "/" characters with a single "/". Then, I strip leading and trailing "/" characters and split the path into a list of directory names. I use a stack to keep track of the valid directory names, handling cases like ".", "..", and normal names appropriately. Finally, I join the stack elements to form the simplified path.

## Complexity

- Time complexity:
  O(n), where n is the length of the input path. The regular expression and string manipulation are linear operations.

- Space complexity:
  O(n), as we use additional space for the `stack` and `path_list`.

## Code

```python
class Solution:
    def simplifyPath(self, path: str) -> str:
        import re
        path = re.sub(r'\/+', '/', path)
        path = path.strip('/')
        path_list = path.split('/')
        stack = []
        for s in path_list:
            if s == '.':
                continue
            if s == '..':
                if stack:
                    stack.pop()
            else:
                stack.append(s)
        return '/' + '/'.join(stack)
```
