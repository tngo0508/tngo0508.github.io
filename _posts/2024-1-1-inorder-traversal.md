---
layout: single
title: "Problem of The Day: Binary Tree Inorder Traversal"
date: 2024-1-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
```
Given the root of a binary tree, return the inorder traversal of its nodes' values.

 

Example 1:
1
 \
  2
 /
3


Input: root = [1,null,2,3]
Output: [1,3,2]
Example 2:

Input: root = []
Output: []
Example 3:

Input: root = [1]
Output: [1]
```

# My Explanation
I've written a method called `inorderTraversal` for dealing with a special type of tree called a binary tree. Imagine this tree as a structure where each element can have two branches, a left one and a right one. The goal of my code is to visit all the elements of this tree in a specific order and collect their values in a list.

To achieve this, I've created a helper function named `helper`. This function is like a little assistant that does the actual work of moving through the tree. It takes two things: a list called `result` where we'll store the values in order, and a `node` representing the current element we're looking at.

Now, the helper function does something interesting. If the current element (node) is empty (which means there's nothing there), it just stops and doesn't do anything. Otherwise, it keeps going.

It first calls itself for the left branch of the current element, ensuring we explore the left side of the tree first. Then, it adds the value of the current element to the result list. Finally, it calls itself again for the right branch, making sure we also check the right side of the tree.

In the main `inorderTraversal` method, I start with an empty list called result, and then I ask my helper function to start the process from the very top of the tree, which is the root. The result, after this journey through the tree, is a list containing all the values in a specific order. I then hand over this list as the final result of my method.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        def helper(result, node):
            if not node:
                return
            helper(result, node.left)
            result.append(node.val)
            helper(result, node.right)
        
        result = []
        helper(result, root)
        return result
```