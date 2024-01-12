---
layout: single
title: "Problem of The Day: Maximum Difference Between Node and Ancestor"
date: 2024-1-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---

# Brute Force
## Problem Statement
[![problem](/assets/images/2024-01-11_11-54-58-maximum-difference-between-node-and-ancestor.png)](/assets/images/2024-01-11_11-54-58-maximum-difference-between-node-and-ancestor.png)

## Intuition
The problem asks us to find the maximum absolute difference between any two nodes in a binary tree such that one is an ancestor of the other. The initial idea is to perform a depth-first traversal of the tree and, for each node, compare its value with the values of its ancestors to find the maximum difference.

## Approach
I decided to use a depth-first traversal approach, where a helper function is used to compare the current node's value with its ancestors and update the result with the maximum difference found so far. The main function, `maxAncestorDiff`, initiates the traversal by calling a depth-first search (dfs) function.

The helper function takes two parameters: the current node (`curr_node`) and the value of its ancestor (`ancestor_val`). It compares the absolute difference between the current node's value and its ancestor's value with the current result and updates it if a larger difference is found. Then, it recursively calls itself for the left and right children of the current node.

## Complexity
- Time complexity:
The time complexity of the provided solution is O(n), where n is the number of nodes in the binary tree. Here's why:
  - The `dfs` function is called once for each node in the tree. In the worst case, every node is visited once.
  - Inside the `dfs` function, the `helper` function is called for each node, and it compares the node's value with its ancestors. The work done for each node is constant (`O(1)`) within the `helper` function.
  - As a result, the overall time complexity is proportional to the number of nodes in the tree, making it O(n).

- Space complexity:
O(h), where h is the height of the tree. This is due to the recursive nature of the depth-first traversal, and the maximum recursion depth is determined by the height of the tree.

## Code
```python
class Solution:
    def maxAncestorDiff(self, root: Optional[TreeNode]) -> int:
        result = 0
        def helper(curr_node, ancestor_val):
            nonlocal result
            if not curr_node:
                return
            result = max(result, abs(ancestor_val - curr_node.val))
            helper(curr_node.left, ancestor_val)
            helper(curr_node.right, ancestor_val)

        def dfs(node):
            if not node:
                return

            helper(node, node.val)
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return result
```

# Improve Algorithm
## Intuition
The problem requires finding the maximum absolute difference between any two nodes in a binary tree such that one is an ancestor of the other. The initial approach is to perform a depth-first traversal while keeping track of the current minimum and maximum values encountered along the path to each node.

## Approach
The solution introduces a `dfs` function that takes three parameters: the current node (`node`), the current minimum value along the path (`curr_min`), and the current maximum value along the path (`curr_max`). The function updates `curr_min` and `curr_max` based on the current node's value, calculates the absolute difference between them, and updates the result if a larger difference is found.

By updating the minimum and maximum values as we traverse the tree, we avoid the need for a separate helper function and eliminate the requirement for two depth-first searches. This optimization reduces the redundancy in the algorithm.

## Complexity
- Time complexity:
The time complexity is O(n), where n is the number of nodes in the binary tree. Each node is visited exactly once, and the work done for each node is constant.

- Space complexity:
The space complexity is O(h), where h is the height of the tree. This is due to the recursive nature of the depth-first traversal, and the maximum recursion depth is determined by the height of the tree. The space used for each recursive call is constant.

## Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxAncestorDiff(self, root: Optional[TreeNode]) -> int:
        result = 0
        def dfs(node, curr_min, curr_max):
            nonlocal result
            if not node:
                return
            
            curr_min = min(curr_min, node.val)
            curr_max = max(curr_max, node.val)
            result = max(result, abs(curr_max - curr_min))
            dfs(node.left, curr_min, curr_max)
            dfs(node.right, curr_min, curr_max)

        dfs(root, root.val, root.val)
        return result
```