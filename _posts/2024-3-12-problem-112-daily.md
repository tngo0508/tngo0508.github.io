---
layout: single
title: "Problem of The Day: Path Sum"
date: 2024-3-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-112](/assets/images/2024-03-14_19-42-56-problem-112.png)](/assets/images/2024-03-14_19-42-56-problem-112.png)

## Intuition

My initial thought to solve this problem is to use depth-first search (DFS) traversal. The idea is to traverse the tree recursively and at each node, subtract the node's value from the target sum. If we reach a leaf node and the remaining target sum equals zero, then we've found a path with the given sum.

## Approach

I'll define a recursive function `dfs` that takes a node and the remaining target sum as arguments. Within this function, I'll check if the current node is a leaf node and if the remaining target sum equals the node's value. If both conditions are met, I'll return True, indicating that a path with the given sum exists. Otherwise, I'll recursively call the `dfs` function for the left and right child nodes, subtracting the node's value from the remaining target sum. If any of these recursive calls return True, then I'll propagate True up the call stack. If none of the paths satisfy the condition, I'll return False.

## Complexity

- Time complexity:
  O(n) where n is the number of nodes in the tree. We visit each node once.

- Space complexity:
  O(h) where h is the height of the binary tree. In the worst case, the space could be O(n) if the tree is skewed

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:
        def dfs(node, target):
            if node and not node.left and not node.right:
                return target - node.val == 0
            return (node and node.left and dfs(node.left, target - node.val)) or \
                (node and node.right and dfs(node.right, target - node.val))

        return dfs(root, targetSum)
```
