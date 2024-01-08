---
layout: single
title: "Problem of The Day: Maximum Profit in Job Scheduling"
date: 2024-1-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
![problem](/assets/images/2024-01-07_22-24-00-range-sum-of-bst.png)
See problem [here](https://leetcode.com/problems/range-sum-of-bst/?envType=daily-question&envId=2024-01-08).

# Intuition
The problem requires calculating the sum of values within a binary search tree (BST) that fall within a specified range. My initial thoughts involve performing a depth-first traversal of the BST, and for each node, checking if its value lies within the given range. If it does, I will include it in the sum, and then recursively explore its left and right subtrees.

# Approach
The approach involves a recursive depth-first traversal of the BST. Given a function `rangeSumBST` that takes a node, low, and high as parameters. Within this function:

- I handle the base case where the node is `None`, returning `0`.
If the value of the current node is within the specified range (`low` to `high` inclusive), I include it in the result and recursively call the function on its left and right children.
- If the value is less than `low`, I explore only the right subtree.
- If the value is greater than `high`, I explore only the left subtree.
The final result is the sum of values within the specified range.

# Complexity
- Time complexity:
O(n) - The algorithm traverses each node of the BST once.

- Space complexity:
O(h) - The space required by the recursive call stack is proportional to the height of the BST, where h is the height. In the worst case, when the tree is skewed, the space complexity is O(n).

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rangeSumBST(self, root: Optional[TreeNode], low: int, high: int) -> int:
        if not root:
            return 0
            
        result = 0
        
        if low <= root.val <= high:
            result += root.val + self.rangeSumBST(root.left, low, high) + self.rangeSumBST(root.right, low, high)
        else:
            if root.val < low:
                result += self.rangeSumBST(root.right, low, high)
            elif root.val > high:
                result += self.rangeSumBST(root.left, low, high)
    

        return result
```

# Editorial Solution
Iterative implementation
```python
class Solution:
    def rangeSumBST(self, root: Optional[TreeNode], low: int, high: int) -> int:
        ans = 0
        stack = [root]
        while stack:
            node = stack.pop()
            if node:
                if low <= node.val <= high:
                    ans += node.val
                if low < node.val:
                    stack.append(node.left)
                if node.val < high:
                    stack.append(node.right)
        return ans
```