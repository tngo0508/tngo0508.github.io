---
layout: single
title: "Problem of The Day: Binary Tree Maximum Path Sum"
date: 2024-1-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-07_21-16-51-binary-tree-maximum-path-sum.png)](/assets/images/2024-01-07_21-16-51-binary-tree-maximum-path-sum.png)

See [Link](https://leetcode.com/problems/binary-tree-maximum-path-sum/description/?envType=study-plan-v2&envId=top-100-liked).

# Intuition
The problem involves finding the maximum path sum in a binary tree. The idea is to traverse the tree in a depth-first manner while keeping track of the maximum path sum encountered so far.

# Approach
In order to tackle the problem of finding the maximum path sum in a binary tree, I employ a recursive depth-first search (DFS) approach. The basic idea of the solution lies in a helper function named `dfs`, which takes a node as its input. Within this function, I address the base case where the node is `None`, returning `negative infinity` to signify that there is no contribution from this non-existent node. Subsequently, I recursively compute the maximum path sum for both the left and right subtrees. To maximize the path sum, I handle scenarios where the contributions from the left and right subtrees are negative by treating them as zero. I then calculate the maximum path sum, considering the current node, and update the global maximum if necessary. The `dfs` function returns the maximum path sum that can be extended from the current node to its parent. The main function, `maxPathSum`, initializes a global result variable and invokes the `dfs` function on the root of the binary tree. The final maximum path sum is then returned by the main function.

# Complexity
- Time complexity:
O(n) - The algorithm traverses each node of the binary tree once.

- Space complexity:
O(h) - The recursion stack space is proportional to the height of the binary tree, where h is the height. In the worst case, when the tree is skewed, the space complexity is O(n).

# Code
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
            if not node:
                return float('-inf')

            left = dfs(node.left)
            right = dfs(node.right)
            left = 0 if left < 0 else left
            right = 0 if right < 0 else right
            include_node = left + right + node.val
            dfs.result = max(dfs.result, include_node)
            return max(left + node.val, right + node.val)

        if not root:
            return 0

        dfs.result = float('-inf')
        dfs(root)
        return dfs.result

```
# Editorial Solution
```python
class Solution:
    def max_path_sum(self, root: Optional[TreeNode]) -> int:
        max_path = -float('inf')

        # post order traversal of subtree rooted at `node`
        def gain_from_subtree(node: Optional[TreeNode]) -> int:
            nonlocal max_path

            if not node:
                return 0

            # add the gain from the left subtree. Note that if the
            # gain is negative, we can ignore it, or count it as 0.
            # This is the reason we use `max` here.
            gain_from_left = max(gain_from_subtree(node.left), 0)

            # add the gain / path sum from right subtree. 0 if negative
            gain_from_right = max(gain_from_subtree(node.right), 0)

            # if left or right gain are negative, they are counted
            # as 0, so this statement takes care of all four scenarios
            max_path = max(max_path, gain_from_left + gain_from_right + node.val)

            # return the max sum for a path starting at the root of subtree
            return max(
                gain_from_left + node.val,
                gain_from_right + node.val
            )

        gain_from_subtree(root)
        return max_path
```