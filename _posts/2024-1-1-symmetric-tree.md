---
layout: single
title: "Problem of The Day: Symmetric Tree"
date: 2024-1-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Top 100 Liked
---
# Problem Statement
```
Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

Example 1:

         1
       /  \
      2    2
     / \  / \
    3  4 4   3

Input: root = [1,2,2,3,4,4,3]
Output: true

Example 2:
         1
       /  \
      2    2
      \     \
       3     3

Input: root = [1,2,2,null,3,null,3]
Output: false
```
# My Explanation
The task at hand is to determine whether a given binary tree is symmetric around its center. To achieve this, I've implemented a recursive function named `helper` within the `isSymmetric` method. This function takes in two nodes, `node1` and `node2`, representing two corresponding nodes in the tree.

The base case is checked first: if both `node1` and `node2` are null, indicating the end of the tree branch, then I return True as it is symmetric. If only one of them is null while the other is not, the symmetry is broken, so I return False.

If neither node is null, I proceed to compare their values. For a symmetric structure, the values of node1 and node2 should be equal. Additionally, the left subtree of `node1` should be symmetric to the right subtree of `node2`, and vice versa. This is where the recursive calls come into play.

I make two recursive calls within the return statement, one comparing the left subtree of `node1` with the right subtree of `node2`, and the other comparing the right subtree of `node1` with the left subtree of `node2`. This recursive approach traverses the entire tree, checking the symmetry of each pair of corresponding nodes.

Finally, I initiate the process by calling the helper function with the root of the tree twice, effectively checking the symmetry from the root itself. The result of this overall comparison is then returned as the final answer for whether the entire binary tree is symmetric or not.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        def helper(node1, node2):
            if not node1 and not node2:
                return True
            if node1 and not node2:
                return False
            if not node1 and node2:
                return False
            return node1.val == node2.val and helper(node1.left, node2.right) and helper(node1.right, node2.left)

        return helper(root, root)
```