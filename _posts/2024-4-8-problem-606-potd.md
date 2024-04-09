---
layout: single
title: "Problem of The Day: Construct String from Binary Tree"
date: 2024-4-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-606](/assets/images/2024-04-08_20-03-08-problem-606.png)

## Intuition

When looking at the problem, my initial thought is to traverse the binary tree using depth-first search (DFS). During traversal, we can construct the string representation of the tree by recursively concatenating node values along with parentheses to represent the structure.

## Approach

I'll implement a depth-first search function (`dfs`) that takes a node as input. Within this function, I'll handle the base cases where the node is empty or if it's a leaf node (having no children). For non-empty nodes with children, I'll recursively traverse the left and right subtrees, constructing the string representation accordingly.

## Complexity

- Time complexity:
  Since each node is visited once, the time complexity is O(n), where n is the number of nodes in the binary tree.

- Space complexity:
  The space complexity is also O(n) due to the recursive nature of the depth-first search function.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def tree2str(self, root: Optional[TreeNode]) -> str:
        def dfs(node):
            if not node:
                return ""
            if not node.left and not node.right:
                return str(node.val)
            res = str(node.val)
            L = '(' + dfs(node.left) + ')'
            R = '(' + dfs(node.right) + ')'
            res += L
            res += R if R != '()' else ""
            return res

        return dfs(root)
```
