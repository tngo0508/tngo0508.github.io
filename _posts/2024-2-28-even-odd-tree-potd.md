---
layout: single
title: "Problem of The Day: Even Odd Tree"
date: 2024-2-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1609](/assets/images/2024-02-28_16-28-33-problem-1609.png)](/assets/images/2024-02-28_16-28-33-problem-1609.png)

## Intuition

Upon inspecting the problem, it seems like we need to check if the given binary tree is an "Even-Odd Tree." An Even-Odd Tree is a binary tree where at every level, the values of the nodes must follow certain rules:

* At even levels, the values should be strictly increasing and odd.
* At odd levels, the values should be strictly decreasing and even.

To check this, we can perform a level-order traversal and validate the conditions for each level.

## Approach

I will use a level-order traversal using a queue. For each level, I will check if the values meet the Even-Odd criteria. I will maintain a variable `is_even` to determine whether the current level is even or odd. Additionally, I will use a variable `prev` to keep track of the last visited node's value to ensure the ordering condition.

The helper function `is_valid` will take care of checking the conditions for a specific level.

## Complexity

* Time complexity:
O(n) where n is the number of nodes in the binary tree. We visited each node once.

* Space complexity:
O(m) where m is the maximum number of nodes at any level

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isEvenOddTree(self, root: Optional[TreeNode]) -> bool:
        def is_valid(queue, is_even = True):
            prev = float('-inf') if is_even else float('inf')
            for _ in range(n):
                node = queue.popleft()
                if is_even:
                    if node.val % 2 != 0 and node.val > prev:
                        prev = node.val
                    else:
                        return False
                else:
                    if node.val % 2 == 0 and node.val < prev:
                        prev = node.val
                    else:
                        return False
                if node:
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
            
            return True

        queue = deque()
        queue.append(root)
        level = 0
        while queue:
            n = len(queue)
            if level % 2 == 0:
                if not is_valid(queue):
                    return False
            else:
                if not is_valid(queue, is_even=False):
                    return False
            
            level += 1
        
        return True
```
