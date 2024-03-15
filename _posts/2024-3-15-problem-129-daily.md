---
layout: single
title: "Problem of The Day: Sum Root to Leaf Numbers"
date: 2024-3-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-129](/assets/images/2024-03-15_14-51-27-problem-129.png)](/assets/images/2024-03-15_14-51-27-problem-129.png)

## Intuition

My first thought is to use depth-first search (DFS) to traverse the binary tree and keep track of the current path sum. As we traverse each node, we can update the current path sum by multiplying it by 10 and adding the value of the current node. When we reach a leaf node (a node with no children), we can add the current path sum to the result. By recursively traversing the tree and updating the current path sum, we can find the sum of all root-to-leaf paths.

## Approach

My approach is to define a recursive helper function `dfs` that takes a node and the current path sum as parameters. Within the `dfs` function, we'll update the current path sum by multiplying it by 10 and adding the value of the current node. If the current node is a leaf node, we'll add the current path sum to the result. Then, we'll recursively call the `dfs` function on the left and right child nodes, passing in the updated current path sum. Finally, we'll return the result.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the binary tree. This is because we visit each node once during the depth-first traversal.

- Space complexity:
  O(n), where n is the height of the binary tree in the worst case. This is because the recursive calls consume space on the call stack, and in the worst case, the height of the call stack is equal to the height of the tree.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        def dfs(node, curr):
            nonlocal res
            if not node:
                return
            if not node.left and not node.right:
                res += curr * 10 + node.val
                return
            dfs(node.left, curr * 10 + node.val)
            dfs(node.right, curr * 10 + node.val)


        res = 0
        dfs(root, 0)
        return res
```
