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
In addressing this problem, I designed the helper function to navigate the tree through recursive exploration. At each node, I systematically verify the validity of its value within the context of a Binary Search Tree (BST). To facilitate this, I intentionally employ `inf` and `-inf` to represent the upper and lower bounds, respectively, as reference points. These bounds play a crucial role in ensuring that the subtree adheres to the fundamental BST condition: the left subtree comprises only nodes with values less than the current node, and the right subtree contains nodes with values greater than the current node.

In handling the base case, I ascertain the absence of a node by checking if it is Null. In such instances, I consider the subtree to be a valid BST. Additionally, I include a check for the current node's value to ensure it falls within the acceptable range, avoiding scenarios where the node value is smaller than the lower bound or greater than the upper bound.

For the recursive scenarios, I extend the validation process to the left and right subtrees. Adjusting the bounds accordingly, I maintain the integrity of the BST conditions. In the left subtree, I limit the maximum allowable value to the current node's value (upper bound). Conversely, in the right subtree, I set the minimum acceptable value as the current node's value (lower bound).

In essence, my approach meticulously examines each node, validating its value with respect to the BST criteria. Through recursive exploration and careful adjustment of bounds, I ensure that both the left and right subtrees adhere to the fundamental principles of a Binary Search Tree. If this validation process holds true for the entire tree, the algorithm confidently confirms its status as a valid BST.

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
```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        if not root:
            return True

        stack = [(root, -math.inf, math.inf)]
        while stack:
            root, lower, upper = stack.pop()
            if not root:
                continue
            val = root.val
            if val <= lower or val >= upper:
                return False
            stack.append((root.right, val, upper))
            stack.append((root.left, lower, val))
        return True
```