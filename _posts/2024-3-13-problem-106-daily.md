---
layout: single
title: "Problem of The Day: Construct Binary Tree from Inorder and Postorder Traversal"
date: 2024-3-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-106](/assets/images/2024-03-13_14-01-54-problem-106.png)](/assets/images/2024-03-13_14-01-54-problem-106.png)

## Intuition

I'll be constructing a binary tree using the given inorder and postorder traversals. The postorder traversal provides the root of the tree, and the inorder traversal helps determine the left and right subtrees. By recursively dividing the inorder list based on the root from postorder, I can build the entire binary tree.

## Approach

I'll reverse the postorder list to make it easier to pop the elements from the end. Then, I'll define a recursive helper function, `build`, which takes a sublist of the inorder traversal. In each recursive call, I'll pop the last element from the reversed postorder list, find its index in the current sublist of inorder, and use that to split the inorder list into left and right subtrees. I'll repeat this process until the entire tree is constructed.

## Complexity

- Time complexity:
  O(n) where n is the number of nodes in the tree. Each node is processed once.

- Space complexity:
  O(n) as the recursive call stack can go up to the height of the tree, and in the worst case, the tree can be skewed.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def buildTree(self, inorder: List[int], postorder: List[int]) -> Optional[TreeNode]:
        N = len(inorder)
        postorder.reverse()


        def build(arr):
            if build.index >= N or not arr:
                return
            val = postorder[build.index]
            i = arr.index(val)
            root = TreeNode(val)
            build.index += 1
            root.right = build(arr[i+1:])
            root.left = build(arr[:i])
            return root

        build.index = 0
        return build(inorder)
```
