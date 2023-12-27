---
title: "Problem of The Day: Maximum Depth of Binary Tree"
date: 2023-12-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
  - Top 100 Liked
  - Problem of The Day
---

Today, I tackled a straightforward LeetCode question. Despite being on the go, I'm committed to daily problem-solving and documenting my explanations for effective communication during interviews.

# Problem Description:
Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

# My Explanation
I approached this using depth-first search in a recursive function. The base case returns 0 when reaching a leaf node. The recursive calls on the left and right subtrees determine their depths. The final depth of the current node is the maximum of the left and right subtree depths, plus 1.

# Python Solution:
```python
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        
        left_subtree_depth = self.maxDepth(root.left)
        right_subtree_depth = self.maxDepth(root.right)

        return max(left_subtree_depth, right_subtree_depth) + 1
```