---
layout: single
title: "Problem of The Day: Sum of Left Leaves"
date: 2024-4-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Intuition

When tackling this problem, my initial thought is to traverse the binary tree while keeping track of whether a node is a left leaf node. If a node is a left leaf node, I'll add its value to a running sum.

## Approach

I'll start by initializing a stack with the root node and a variable to hold the sum of left leaf nodes. Then, I'll traverse the tree using a while loop that continues until the stack is empty. In each iteration, I'll pop a node from the stack and check if it has a right child. If it does, I'll push the right child onto the stack. Then, I'll move to the left child of the current node. While traversing left, if I encounter a leaf node with no children, I'll add its value to the sum. I'll repeat this process until all nodes are visited.

## Complexity

- Time complexity:
  O(n) where n is the number of nodes in binary trees

- Space complexity:
  O(h) where h is the height of the binary tree. In the worst case, the stack could contain all the nodes of the longest path from the root to a leaf node.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def sumOfLeftLeaves(self, root: Optional[TreeNode]) -> int:
        stack = [root]
        sumVal = 0
        while stack:
            curr = stack.pop()
            if curr.right:
                stack.append(curr.right)
            curr = curr.left
            while curr:
                if curr.right:
                    stack.append(curr.right)
                if not curr.left and not curr.right:
                    sumVal += curr.val
                curr = curr.left
        return sumVal
```
