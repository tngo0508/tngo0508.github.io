---
layout: single
title: "Problem: Diameter of Binary Tree"
date: 2024-1-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Top 100 Liked
---
# Problem Statement
# Intuition
The problem aims to find the diameter of a binary tree, which is the length of the longest path between any two nodes in a tree. My initial intuition is to use recursion to traverse the tree and maintain the depth of each subtree.

# Approach
I employ a recursive approach to find the depth of each subtree while keeping track of the diameter during traversal. The `find_depth` function calculates the depth of a subtree and updates the result with the maximum diameter encountered. The depth of a subtree is the maximum depth between its left and right subtrees. The diameter at each node is the sum of the depths of its left and right subtrees.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the binary tree. Each node is visited once during the recursive traversal.

- Space complexity:
O(h), where h is the height of the binary tree. The space complexity is determined by the maximum height of the call stack during recursion. In the worst case (skewed tree), it is O(n), and in the best case (balanced tree), it is O(log n)

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        def find_depth(node):
            if not node:
                return 0
            
            left_sub_tree = find_depth(node.left)
            right_sub_tree = find_depth(node.right)
            
            find_depth.result = max(left_sub_tree + right_sub_tree, find_depth.result)

            return max(left_sub_tree, right_sub_tree) + 1

        find_depth.result = 0
        find_depth(root)
        return find_depth.result
```

# Alternative Approach
The alternative approach separates the DFS logic into a standalone function, providing modularity and clarity.
```python
def dfs(root):
  if not root:
    return 0, 0

  diameter, left_depth = dfs(root.left)
  diameter, right_depth = dfs(root.right)
  return (max(diameter, left_depth + right_depth), max(left_depth, right_depth) + 1)

def diameter_of_binaryTree(root):
  diameter, depth = dfs(root)
  return diameter
```

# Editorial Solution
```python
class Solution:
    def diameterOfBinaryTree(self, root: TreeNode) -> int:
        diameter = 0

        def longest_path(node):
            if not node:
                return 0
            nonlocal diameter
            # recursively find the longest path in
            # both left child and right child
            left_path = longest_path(node.left)
            right_path = longest_path(node.right)

            # update the diameter if left_path plus right_path is larger
            diameter = max(diameter, left_path + right_path)

            # return the longest one between left_path and right_path;
            # remember to add 1 for the path connecting the node and its parent
            return max(left_path, right_path) + 1

        longest_path(root)
        return diameter
```