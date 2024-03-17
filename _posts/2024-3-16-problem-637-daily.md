---
layout: single
title: "Problem of The Day: Average of Levels in Binary Tree"
date: 2024-3-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-637](/assets/images/2024-03-16_21-55-07-problem637.png)](/assets/images/2024-03-16_21-55-07-problem637.png)

## Intuition

Use BFS to calculate the average at each level.

## Approach

To solve this problem, I'll use a queue to perform a level order traversal. I'll initialize an empty queue and enqueue the root node. Then, I'll traverse each level of the tree, computing the sum of node values and the count of nodes at each level. After traversing each level, I'll calculate the average and append it to the result list.

## Complexity

- Time complexity:
  O(n) where n is the number of nodes in the binary tree

- Space complexity:
  O(m) is the maximum number of nodes at any level in the binary tree. In the worst case, the maximum number of nodes could be n/2 for a perfectly balanced binary tree.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:
        if not root:
            return 0
        queue = deque()
        queue.append(root)
        res = []
        while queue:
            n = len(queue)
            curr_sum = 0
            for i in range(n):
                node = queue.popleft()
                if node:
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
                curr_sum += node.val

            res.append(curr_sum / (n * 1.0))

        return res

```
