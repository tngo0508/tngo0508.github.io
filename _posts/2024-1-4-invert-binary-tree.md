---
layout: single
title: "Problem of The Day: Invert Binary Tree"
date: 2024-1-4
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
[![problem](/assets/images/2024-01-04_14-42-35-invert-binary-tree.png)](/assets/images/2024-01-04_14-42-35-invert-binary-tree.png)

# Intuition
The idea is to invert a binary tree, swapping the left and right subtrees at each node. The intuition behind this is to reverse the hierarchical structure of the tree.

# Approach
I use a recursive approach to traverse the tree. The base case checks if the current node is None, and if so, it returns. Otherwise, it recursively inverts the left and right subtrees. Additionally, I swap the left and right child nodes of the current node.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the binary tree. Each node is processed once during the recursive traversal.

- Space complexity:
O(h), where h is the height of the binary tree. The space complexity is determined by the maximum height of the call stack during recursion. In the worst case (skewed tree), it is O(n), and in the best case (balanced tree), it is O(log n)

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return
        
        root.left = self.invertTree(root.left)
        root.right = self.invertTree(root.right)
        root.left, root.right = root.right, root.left
        return root
```

# Editorial Solution
```python
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        
        queue = collections.deque([root])
        while queue:
            current = queue.popleft()
            current.left, current.right = current.right, current.left
            
            if current.left:
                queue.append(current.left)
            
            if current.right:
                queue.append(current.right)
        
        return root
```