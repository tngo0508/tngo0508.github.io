---
layout: single
title: "Problem of The Day: Count Complete Tree Nodes"
date: 2024-3-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-222](/assets/images/2024-03-15_15-02-11-problem-222.png)](/assets/images/2024-03-15_15-02-11-problem-222.png)

## Intuition

My initial thought is to use a recursive approach to count the nodes in the binary tree. Since each node contributes to the total count, we can recursively count the nodes in the left subtree, recursively count the nodes in the right subtree, and then add 1 to account for the current node.

## Approach

I will define a recursive function `countNodes` that takes a TreeNode `root` as input. If the `root` is `None`, indicating an empty subtree, we return 0. Otherwise, we recursively count the nodes in the left subtree by calling `countNodes(root.left)` and recursively count the nodes in the right subtree by calling `countNodes(root.right)`. We then add 1 to account for the current node and return the total count.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the binary tree. This is because we visit each node exactly once during the recursive traversal.

- Space complexity:
  O(n), where n is the height of the binary tree. This is because the recursive calls consume space on the call stack, and in the worst case, the height of the call stack is equal to the height of the tree.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def countNodes(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return self.countNodes(root.left) + self.countNodes(root.right) + 1

```

## Editorial Solution

### Approach 1: Linear Time

```python
class Solution:
    def countNodes(self, root: TreeNode) -> int:
        return 1 + self.countNodes(root.right) + self.countNodes(root.left) if root else 0
```

- Time complexity: O(n)
- Space complexity: O(d) = (log n) to keep the recursive stack, where d is the tree depth.

### Approach 2: Binary search

```python
class Solution:
    def compute_depth(self, node: TreeNode) -> int:
        """
        Return tree depth in O(d) time.
        """
        d = 0
        while node.left:
            node = node.left
            d += 1
        return d

    def exists(self, idx: int, d: int, node: TreeNode) -> bool:
        """
        Last level nodes are enumerated from 0 to 2**d - 1 (left -> right).
        Return True if last level node idx exists.
        Binary search with O(d) complexity.
        """
        left, right = 0, 2**d - 1
        for _ in range(d):
            pivot = left + (right - left) // 2
            if idx <= pivot:
                node = node.left
                right = pivot
            else:
                node = node.right
                left = pivot + 1
        return node is not None

    def countNodes(self, root: TreeNode) -> int:
        # if the tree is empty
        if not root:
            return 0

        d = self.compute_depth(root)
        # if the tree contains 1 node
        if d == 0:
            return 1

        # Last level nodes are enumerated from 0 to 2**d - 1 (left -> right).
        # Perform binary search to check how many nodes exist.
        left, right = 1, 2**d - 1
        while left <= right:
            pivot = left + (right - left) // 2
            if self.exists(pivot, d, root):
                left = pivot + 1
            else:
                right = pivot - 1

        # The tree contains 2**d - 1 nodes on the first (d - 1) levels
        # and left nodes on the last level.
        return (2**d - 1) + left
```

- Time complexity: O(d^2) = O(log^2 N)
- Space complexity: O(1)
