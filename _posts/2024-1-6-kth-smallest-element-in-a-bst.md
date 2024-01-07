---
layout: single
title: "Problem of The Day: Kth Smallest Element in a BST"
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
[![problem](/assets/images/2024-01-06_19-26-01-kth-smallest-element-in-a-bst.png)](/assets/images/2024-01-06_19-26-01-kth-smallest-element-in-a-bst.png)

See [problem](https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
I need to find the kth smallest element in a binary search tree (BST). Since it's a BST, I can utilize its properties to efficiently find the kth smallest element. Basically, I think it's an inorder traversal with a few minor changes in the code.

# Approach
I'll perform an in-order traversal of the BST while maintaining a count of visited nodes. When the count becomes equal to k, I'll return the value of the current node. This is possible because an in-order traversal of a BST visits nodes in ascending order.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the BST. In the worst case, I might need to traverse all nodes to find the kth smallest element.

- Space complexity:
O(h), where h is the height of the binary search tree. This is because the recursion stack's maximum depth is determined by the height of the tree during the in-order traversal.

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        count = 0
        def helper(node):
            nonlocal count
            if not node:
                return 0
            
            L = helper(node.left)
            count += 1
            if count == k:
                return node.val
            R = helper(node.right)
            return L or R

        return helper(root)
```

# Editorial Solution
```python
class Solution:
    def kthSmallest(self, root, k):
        """
        :type root: TreeNode
        :type k: int
        :rtype: int
        """
        def inorder(r):
            return inorder(r.left) + [r.val] + inorder(r.right) if r else []
    
        return inorder(root)[k - 1]
```