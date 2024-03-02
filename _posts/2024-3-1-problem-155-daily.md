---
layout: single
title: "Problem of The Day: Min Stack"
date: 2024-3-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-155](/assets/images/2024-03-01_17-20-44-problem-155.png)

## My Solution

```python
class MinStack:

    def __init__(self):
        self.stack = []

    def push(self, val: int) -> None:
        if not self.stack:
            self.stack.append([val, val])
        else:
            _, curr_min = self.stack[-1]
            self.stack.append([val, min(val, curr_min)])


    def pop(self) -> None:
        self.stack.pop()


    def top(self) -> int:
        return self.stack[-1][0]


    def getMin(self) -> int:
        return self.stack[-1][1]



# Your MinStack object will be instantiated and called as such:
# obj = MinStack()
# obj.push(val)
# obj.pop()
# param_3 = obj.top()
# param_4 = obj.getMin()
```

