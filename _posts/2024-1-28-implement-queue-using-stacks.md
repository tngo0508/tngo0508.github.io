---
layout: single
title: "Problem of The Day: Implement Queue using Stacks"
date: 2024-1-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
see [problem](https://leetcode.com/problems/implement-queue-using-stacks/description/?envType=daily-question&envId=2024-01-29)

# Intuition
My initial thoughts are to use two stacks to simulate the behavior of a queue. The key idea is to reverse the order of elements when moving them from the first stack to the second stack, allowing for the proper FIFO (First-In-First-Out) order.

# Approach
I'll use two stacks, `s1` and `s2`, to represent the front and rear of the queue, respectively. The `push` operation will append elements to `s1`, and the `pop` operation will transfer elements from `s1` to `s2` in reversed order, then pop from `s2`. The `peek` operation will simply return the front element in `s1`. The `empty` operation checks if `s1` is empty.

# Complexity
- Time complexity:
*   Push operation: O(1)
*   Pop operation: O(n)
*   Peek and Empty operations: O(1)

- Space complexity:
O(n) where n is the number of elements in the queue (stored in both stacks combined).

# Code
```python
class MyQueue:

    def __init__(self):
        self.s1 = []
        self.s2 = []

    def push(self, x: int) -> None:
        self.s1.append(x)

    def pop(self) -> int:
        while self.s1:
            self.s2.append(self.s1.pop())
        val = self.s2.pop()
        while self.s2:
            self.s1.append(self.s2.pop())
        
        return val

    def peek(self) -> int:
        return self.s1[0]

    def empty(self) -> bool:
        return len(self.s1) == 0


# Your MyQueue object will be instantiated and called as such:
# obj = MyQueue()
# obj.push(x)
# param_2 = obj.pop()
# param_3 = obj.peek()
# param_4 = obj.empty()
```