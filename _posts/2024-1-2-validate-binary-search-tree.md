---
layout: single
title: "Problem of The Day: Validate Binary Search Tree"
date: 2024-1-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Top 100 Liked
---
# Problem Statement
See [link](https://leetcode.com/problems/validate-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

# My Explanation
To solve this question, I defined the function `helper` to traverse the tree recursively. At every node, I check if the the value of the node is valid or not. To do this, I deliberately passed the `inf` and `-inf` value to the helper function representing the lower bound and upper bound. This helps me to validate whether the subtree satisfies the condition of a Binary Search Tree which is left subtree contains only node less than the current node's value and right subtree contains only node greater than current node's value. 

For the base case, I checked if the node is Null or not. If it is Null, then I assume it's a valid Binary Search Tree (BST). Also, I added the check for the value of the current node as well. Since node's value cannot be smaller then lower bound and greater than upper bound. I simply wrote the condition `lowerbound < node.val < upperbound` to verify this requirement.

For the recursive case, I check if the left subtree and right subtree are also valid. To achieve this, I modified the passing arguments for lower bound and upper bound accordingly. For left subtree, the children nodes should not larger than its root which is the current node's value that I would pass as the upper bound. For right subtree, the children nodes should never smaller than the current node's value.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def helper(node, lowerbound, upperbound):
            if not node:
                return True

            if not (lowerbound < node.val < upperbound):
                return False
            
            return helper(node.left, lowerbound, node.val) and helper(node.right, node.val, upperbound)
            

        return helper(root, float('-inf'), float('inf'))
```


# Leet Code Solution