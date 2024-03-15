---
layout: single
title: "Problem of The Day: Count Complete Tree Nodes"
date: 2024-3-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-222](/assets/images/2024-03-15_15-02-11-problem-222.png)](/assets/images/2024-03-15_15-02-11-problem-222.png)

## Intuition

My initial thought is to use a recursive approach to count the nodes in the binary tree. Since each node contributes to the total count, we can recursively count the nodes in the left subtree, recursively count the nodes in the right subtree, and then add 1 to account for the current node.

## Approach

I will define a recursive function `countNodes` that takes a TreeNode `root` as input. If the `root` is `None`, indicating an empty subtree, we return 0. Otherwise, we recursively count the nodes in the left subtree by calling `countNodes(root.left)` and recursively count the nodes in the right subtree by calling `countNodes(root.right)`. We then add 1 to account for the current node and return the total count.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the binary tree. This is because we visit each node exactly once during the recursive traversal.

- Space complexity:
  O(n), where n is the height of the binary tree. This is because the recursive calls consume space on the call stack, and in the worst case, the height of the call stack is equal to the height of the tree.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return self.countNodes(root.left) + self.countNodes(root.right) + 1

```
