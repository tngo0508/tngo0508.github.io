---
layout: single
title: "Problem of The Day: Flatten Binary Tree to Linked List"
date: 2024-1-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
![problem](/assets/images/2024-01-05_18-36-21-flatten-binary-tree.png)
# Intuition
My initial thought to solve this problem is to perform a recursive depth-first traversal of the binary tree. I want to flatten the tree in a way that preserves the original order of nodes. The idea is to move to the right subtree whenever possible, and if there's a left subtree, move the rightmost node of the left subtree to the right, making the left subtree the new right subtree.

# Approach
I approach this problem using recursion. If the current node has no left child, I recursively flatten its right subtree. Otherwise, I find the rightmost node of the left subtree, make it the new right subtree, and then recursively flatten the modified right subtree. This process is repeated until the entire tree is flattened in-place.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the binary tree. The algorithm visits each node once.

- Space complexity:
O(n), where n is the height of the binary tree. This represents the maximum recursion stack space used during the traversal.

# Code
```python 
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        if not root:
            return

        if not root.left:
            self.flatten(root.right)
        else:
            node = root.left
            while node and node.right:
                node = node.right
            
            node.right = root.right
            root.right, root.left = root.left, None
            self.flatten(root.right)
            
```

# Alternative Approach - O(1) space solution
>Follow up: Can you flatten the tree in-place (with O(1) extra space)?

Instead of employing recursion to address this problem, I endeavored to transform the implementation into an iterative style to tackle the subsequent question.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        if not root:
            return

        while root:
            right_most = root.left
            while right_most and right_most.right:
                right_most = right_most.right
            
            if right_most:
                right_most.right = root.right
                root.right, root.left = root.left, None
            root = root.right
```
# Editorial Solution
```python
class Solution:
    
    def flatten(self, root: TreeNode) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        
        # Handle the null scenario
        if not root:
            return None
        
        node = root
        while node:
            
            # If the node has a left child
            if node.left:
                
                # Find the rightmost node
                rightmost = node.left
                while rightmost.right:
                    rightmost = rightmost.right
                
                # rewire the connections
                rightmost.right = node.right
                node.right = node.left
                node.left = None
            
            # move on to the right side of the tree
            node = node.right
```