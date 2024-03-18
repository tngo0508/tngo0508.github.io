---
layout: single
title: "Problem of The Day: Minimum Absolute Difference in BST"
date: 2024-3-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-530](/assets/images/2024-03-18_14-10-11-problem-530.png)](/assets/images/2024-03-18_14-10-11-problem-530.png)

## Intuition

The problem requires finding the minimum absolute difference between values of any two nodes in a binary search tree (BST). Since a BST inherently stores values in sorted order, the minimum difference will likely occur between adjacent values during an in-order traversal.

## Approach

- Perform an in-order traversal of the BST to obtain a sorted array of its values.
- Iterate through the sorted array to find the minimum absolute difference between adjacent values.
- Return the minimum absolute difference found.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(n)

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        res = float('inf')
        arr = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            arr.append(node.val)
            dfs(node.right)

        dfs(root)

        for i in range(len(arr) - 1):
            res = min(res, abs(arr[i] - arr[i + 1]))

        return res
```

## Editorial Solution

### Approach 1: Depth First Search

```python
class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        nodeValues = []

        def dfs(node):
            if node is None:
                return
            nodeValues.append(node.val)
            dfs(node.left)
            dfs(node.right)

        dfs(root)

        nodeValues.sort()
        minDifference = 1e9
        for i in range(1, len(nodeValues)):
            minDifference = min(minDifference, nodeValues[i] - nodeValues[i-1])

        return minDifference
```

- Time complexity: O(n logn)
- Space complexity: O(n)

### Approach 2: In-order Traversal Using List

```python
class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        inorderNodes = []

        def inorder(node):
            if node is None:
                return
            inorder(node.left)
            inorderNodes.append(node.val)
            inorder(node.right)

        inorder(root)
        minDifference = 1e9
        for i in range(1, len(inorderNodes)):
            minDifference = min(minDifference, inorderNodes[i] - inorderNodes[i-1])

        return minDifference
```

- Time complexity: O(n)
- Space complexity: O(n)

### Approach 3: In-order Traversal Without List

```python
class Solution:
    def getMinimumDifference(self, root: Optional[TreeNode]) -> int:
        self.minDistance = 1e9
        # Initially, it will be null.
        self.prevNode = None

        def inorder(node):
            if node is None:
                return
            inorder(node.left)
            # Find the difference with the previous value if it is there.
            if self.prevNode is not None:
                self.minDistance = min(self.minDistance, node.val - self.prevNode)
            self.prevNode = node.val
            inorder(node.right)

        inorder(root)
        return self.minDistance
```

- Time complexity: O(n)
- Space complexity: O(n)