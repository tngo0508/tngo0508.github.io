---
layout: single
title: "Problem of The Day: Min Stack"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-26_22-40-30-problem-155.png)](/assets/images/2024-01-26_22-40-30-problem-155.png)

# Intuition
My initial thoughts are to maintain two stacks: one for the main elements and another for the minimum elements seen so far.

# Approach
I will use two stacks, `main_stack` and `min_stack`. When pushing a value onto the main stack, I will also push the current minimum onto the `min_stack` if it is the first element or if the new value is smaller than the current minimum. When popping elements, I will ensure that both stacks are updated accordingly. The `top` and `getMin` operations can then be performed by looking at the top elements of their respective stacks.

# Complexity
- Time complexity:
Push: O(1)
Pop: O(1)
Top: O(1)
getMin: O(1)

- Space complexity:
O(n), where n is the number of elements in the stack.

# Code
```python
class MinStack:

    def __init__(self):
        self.main_stack = []
        self.min_stack = []

    def push(self, val: int) -> None:
        self.main_stack.append(val)
        if not self.min_stack or self.min_stack[-1] > val:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self) -> None:
        self.main_stack.pop()
        self.min_stack.pop()

    def top(self) -> int:
        return self.main_stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
        


# Your MinStack object will be instantiated and called as such:
# obj = MinStack()
# obj.push(val)
# obj.pop()
# param_3 = obj.top()
# param_4 = obj.getMin()
```