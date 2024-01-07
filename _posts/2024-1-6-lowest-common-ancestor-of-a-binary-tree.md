---
layout: single
title: "Problem of The Day: Lowest Common Ancestor of a Binary Tree"
date: 2024-1-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-06_23-54-41-lca.png)](/assets/images/2024-01-06_23-54-41-lca.png)

see [link](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/?envType=study-plan-v2&envId=top-100-liked).

# Intuition
The problem involves finding the lowest common ancestor (LCA) of two nodes in a binary tree. The lowest common ancestor is the deepest node in the tree that has both nodes as descendants. My intuition is to use a recursive approach to traverse the tree and identify the LCA.

# Approach
I'll recursively traverse the binary tree starting from the root. During the traversal, I'll check if the current node is one of the given nodes (`p` or `q`). If it is, I'll set the `found` flag to true. I'll also recursively search for the nodes in the left and right subtrees.

To identify the LCA, I'll consider three cases:

1. If both nodes are found in the left and right subtrees, or one node is found in the current subtree and the other in either the left or right subtree, then the current node is the LCA.
2. If only one node is found in the current subtree, I'll return that node as a potential LCA.
3. If none of the above conditions is met, I'll return None.

My notes:
[![note](/assets/images/2024-01-06_23-53-31-lca-binary-tree-note.png)](/assets/images/2024-01-06_23-53-31-lca-binary-tree-note.png)

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the binary tree. In the worst case, I may need to traverse all nodes.

- Space complexity:
O(h), where h is the height of the binary tree. This is due to the recursion stack during the traversal.

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root:
            return None
        
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)

        found = root is p or root is q

        if (left and found) or (right and found) or (left and right):
            return root
        
        return left or right or found
```

# Editorial Solution
```python
class Solution:

    def __init__(self):
        # Variable to store LCA node.
        self.ans = None

    def lowestCommonAncestor(self, root, p, q):
        """
        :type root: TreeNode
        :type p: TreeNode
        :type q: TreeNode
        :rtype: TreeNode
        """
        def recurse_tree(current_node):

            # If reached the end of a branch, return False.
            if not current_node:
                return False

            # Left Recursion
            left = recurse_tree(current_node.left)

            # Right Recursion
            right = recurse_tree(current_node.right)

            # If the current node is one of p or q
            mid = current_node == p or current_node == q

            # If any two of the three flags left, right or mid become True.
            if mid + left + right >= 2:
                self.ans = current_node

            # Return True if either of the three bool values is True.
            return mid or left or right

        # Traverse the tree
        recurse_tree(root)
        return self.ans
```