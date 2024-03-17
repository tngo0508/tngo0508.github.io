---
layout: single
title: "Problem of The Day: Binary Tree Maximum Path Sum"
date: 2024-3-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-124](/assets/images/2024-03-17_15-08-58-problem-124.png)](/assets/images/2024-03-17_15-08-58-problem-124.png)

## Intuition

I initially thought of using a depth-first search (DFS) approach to traverse the binary tree. At each node, I would calculate the maximum path sum considering the left and right subtrees while considering the current node's value.

## Approach

To solve the problem, I implemented a recursive DFS function. At each node, I computed the maximum path sum starting from that node and considered whether including the left and right subtrees would result in a higher sum. I maintained a global variable to track the maximum path sum encountered so far.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the binary tree. We visit each node once during the DFS traversal.

- Space complexity:
  O(h), where h is the height of the binary tree. This is the space used by the recursive function call stack during the DFS traversal.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        def dfs(node):
            nonlocal res
            if not node:
                return float('-inf')

            l = dfs(node.left)
            r = dfs(node.right)
            left = 0 if l < 0 else l
            right = 0 if r < 0 else r
            res = max(res, left + right + node.val)

            return max(node.val, node.val + max(l, r))

        res = float('-inf')
        dfs(root)
        return res
```
