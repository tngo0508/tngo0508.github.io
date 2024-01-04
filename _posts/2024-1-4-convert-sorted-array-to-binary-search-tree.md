---
layout: single
title: "Problem of The Day: Convert Sorted Array to Binary Search Tree"
date: 2024-1-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Top 100 Liked
---
# Problem Statement
Given an integer array nums where the elements are sorted in ascending order, convert it to a height-balanced binary search tree.

Example 1:


Input: nums = [-10,-3,0,5,9]
Output: [0,-3,9,-10,null,5]
Explanation: [0,-10,5,null,-3,null,9] is also accepted:

Example 2:


Input: nums = [1,3]
Output: [3,1]
Explanation: [1,null,3] and [3,1] are both height-balanced BSTs.

See the [link](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to leverage a recursive approach to build a binary search tree (BST) from a sorted array. The key insight is that for a BST, the middle element of the sorted array becomes the root, and the left and right halves recursively form the left and right subtrees.

# Approach
I use a recursive `helper` function, `helper`, to build the BST. It takes a sorted array nums as input. In each recursive call, it calculates the middle index (`m`) of the array and creates a new `TreeNode` with the value at the middle index as the root. The left subtree is constructed by calling the `helper` function on the left half of the array (`nums[:m]`), and the right subtree is constructed using the right half of the array (`nums[m+1:]`).

The base case for the recursion is when the input array nums is empty, in which case, `None` is returned.

# Complexity
- Time complexity:
O(n), where n is the number of elements in the sorted array. Each element is processed once during the recursive construction of the BST.

- Space complexity:
O(n), where n is the number of elements in the sorted array. The space complexity is dominated by the recursive call stack.

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def helper(nums):
            if not nums:
                return
            l, r = 0, len(nums)
            m = (r + l) // 2
            root = TreeNode(nums[m])
            root.left = helper(nums[:m])
            root.right = helper(nums[m+1:])

            return root

        return helper(nums)
```

# Editorial Solution
```python
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> TreeNode:        
        def helper(left, right):
            if left > right:
                return None

            # always choose left middle node as a root
            p = (left + right) // 2

            # preorder traversal: node -> left -> right
            root = TreeNode(nums[p])
            root.left = helper(left, p - 1)
            root.right = helper(p + 1, right)
            return root
        
        return helper(0, len(nums) - 1)
```