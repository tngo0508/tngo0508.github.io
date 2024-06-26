---
layout: single
title: "Problem of The Day: Pseudo-Palindromic Paths in a Binary Tree"
date: 2024-1-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
see [Pseudo-Palindromic Paths in a Binary Tree](https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/description/?envType=daily-question&envId=2024-01-24)

# Intuition
My initial thoughts on this problem involve using depth-first search (DFS) to traverse the binary tree and keeping track of the frequency of each node's value in a `hash_map`.

# Approach
I would use a recursive DFS approach to traverse the binary tree. At each node, I update the hash_map with the frequency of the current node's value. When reaching a leaf node, I check if it forms a pseudo-palindromic path by ensuring that at most one character has an odd frequency.

# Complexity
- Time complexity:
O(n) - where n is the number of nodes in the binary tree. We visit each node once.

- Space complexity:
O(h) - where h is the height of the binary tree. The space is used for the hash_map, and in the worst case, it's proportional to the height of the tree.

# Code
```python
# use deep copy - accepted but slow
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pseudoPalindromicPaths (self, root: Optional[TreeNode]) -> int:
        def helper(node, hash_map):
            if not node:
                return 0

            hash_map[node.val] += 1
            if node and (not node.left and not node.right):
                odd = 0
                for v in hash_map.values():
                    if v % 2 != 0:
                        odd += 1
                        if odd > 1:
                            return 0
                return 1
           
            L = helper(node.left, copy.deepcopy(hash_map))
            R = helper(node.right, copy.deepcopy(hash_map))
            return L + R

        return helper(root, defaultdict(int))
```

```python
# create a shallow copy of the hash_map only when needed for recursive calls, addressing the optimization concern. 
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def pseudoPalindromicPaths(self, root: Optional[TreeNode]) -> int:
        def helper(node, hash_map):
            if not node:
                return 0

            hash_map[node.val] += 1
            if node and (not node.left and not node.right):
                odd = 0
                for v in hash_map.values():
                    if v % 2 != 0:
                        odd += 1
                        if odd > 1:
                            return 0
                return 1

            L = helper(node.left, hash_map.copy())
            R = helper(node.right, hash_map.copy())
            
            return L + R

        return helper(root, defaultdict(int))

```

# Backtracking Approach
```python
from collections import defaultdict
from typing import Optional

# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

class Solution:
    def pseudoPalindromicPaths(self, root: Optional[TreeNode]) -> int:
        def is_pseudo_palindrome(hash_map):
            odd_count = sum(1 for v in hash_map.values() if v % 2 != 0)
            return odd_count <= 1

        def dfs(node, hash_map):
            if not node:
                return 0

            hash_map[node.val] += 1

            if not node.left and not node.right:
                result = 1 if is_pseudo_palindrome(hash_map) else 0
            else:
                result = dfs(node.left, hash_map) + dfs(node.right, hash_map)

            # Backtrack - remove the frequency of the current node's value
            hash_map[node.val] -= 1

            return result

        return dfs(root, defaultdict(int))

```

# Editorial Solution
```python
# Recursion
class Solution:
    def pseudoPalindromicPaths (self, root: TreeNode) -> int:
        def preorder(node, path):
            nonlocal count
            if node:
                # compute occurences of each digit 
                # in the corresponding register
                path = path ^ (1 << node.val)
                # if it's a leaf, check if the path is pseudo-palindromic
                if node.left is None and node.right is None:
                    # check if at most one digit has an odd frequency
                    if path & (path - 1) == 0:
                        count += 1
                else:                    
                    preorder(node.left, path)
                    preorder(node.right, path) 
        
        count = 0
        preorder(root, 0)
        return count
```

```python
# Iterative
class Solution:
    def pseudoPalindromicPaths (self, root: TreeNode) -> int:
        count = 0
        
        stack = [(root, 0) ]
        while stack:
            node, path = stack.pop()
            if node is not None:
                # compute occurences of each digit 
                # in the corresponding register
                path = path ^ (1 << node.val)
                # if it's a leaf, check if the path is pseudo-palindromic
                if node.left is None and node.right is None:
                    # check if at most one digit has an odd frequency
                    if path & (path - 1) == 0:
                        count += 1
                else:
                    stack.append((node.right, path))
                    stack.append((node.left, path))
        
        return count
```