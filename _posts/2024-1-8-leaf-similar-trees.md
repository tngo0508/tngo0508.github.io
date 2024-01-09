---
layout: single
title: "Problem of The Day: Leaf-Similar Trees"
date: 2024-1-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---
See Problem [here](https://leetcode.com/problems/leaf-similar-trees/description/?envType=daily-question&envId=2024-01-09).

# Intuition
When initially approaching this problem, I thought about comparing the leaf sequences of two binary trees. The key idea was to traverse each tree, extract the sequences of leaf nodes, and then check if these sequences are equal.

# Approach
In my approach, Leetcode provides `leafSimilar` function that takes two binary tree roots (`root1` and `root2`). To obtain the leaf sequences, I used a helper function called `get_leaves`. This function recursively traverses the tree, appending the values of leaf nodes to a list. After obtaining the leaf sequences for both trees, I compared them to determine if they are similar or not.

The `get_leaves` function played a crucial role in this approach. It recursively explores the subtrees, collecting the values of leaf nodes and forming the leaf sequences.

# Complexity
- Time complexity:
O(n), where n is the total number of nodes in both trees. The function visits each node once during the traversal.

- Space complexity:
O(h1 + h2), where h1 and h2 are the heights of the two trees. The space complexity is influenced by the recursion depth during the traversal, reaching a maximum of the height of the taller tree in the worst case.

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def leafSimilar(self, root1: Optional[TreeNode], root2: Optional[TreeNode]) -> bool:
        l1 = self.get_leaves(root1)
        l2 = self.get_leaves(root2)

        if len(l1) != len(l2):
            return False

        for n1, n2 in zip(l1, l2):
            if n1 != n2:
                return False
        return True

    def get_leaves(self, node):
        if not node:
            return []

        if not node.left and not node.right:
            return [node.val]
        
        result = []
        result += self.get_leaves(node.left)
        result += self.get_leaves(node.right)
        return result

```

# Editorial Code
In the provided code, the `yield` keyword is used in the dfs (depth-first search) generator function. The `yield` statement is used to produce a series of values, one at a time, without fully terminating the function. It essentially allows the generator to pause its execution and produce a value, which can then be consumed by the caller.

>Notes: The **yield** statements allow the generator to produce values (leaf node values) one at a time and pause its execution until the next value is requested. This is particularly useful for scenarios where you don't want to generate all values at once, saving memory, and you can consume values as needed.

The basic idea is that `yield from` can be used to delegate the generation of values to another generator or iterable. Instead of manually iterating over the items in the other generator and yielding them one by one, `yield from`takes care of this process.

```python
class Solution:
    def leafSimilar(self, root1, root2):
        def dfs(node):
            if node:
                if not node.left and not node.right:
                    yield node.val
                yield from dfs(node.left)
                yield from dfs(node.right)

        return list(dfs(root1)) == list(dfs(root2))
```