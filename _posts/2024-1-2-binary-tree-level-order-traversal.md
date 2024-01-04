---
layout: single
title: "Problem of The Day: Binary Tree Level Order Traversal"
date: 2024-1-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Top 100 Liked
---

# Problem Statement
See the [link](https://leetcode.com/problems/binary-tree-level-order-traversal/description/?envType=study-plan-v2&envId=top-100-liked)

# My Explanation
In my implementation, I've created a function named `levelOrder` to conduct a level-order traversal of a binary tree. The function takes the root of the tree as a parameter. If the tree happens to be empty (with a None root), I immediately return `None`.

The core of this algorithm revolves around the utilization of a `deque`, referred to as queue, to handle nodes during the traversal process. Starting with the root node in the queue, I also initialize an empty list named result to store nodes at each level.

The traversal unfolds within a while loop, continuing as long as there are nodes present in the queue. Within each iteration, I determine the number of nodes at the current level and append an empty list to result to signify the initiation of a new level.

The subsequent steps involve processing each node at the current level. For every node, I dequeue it from the left side of the queue. If the node is not `None`, I append its value to the last sublist in `result`. Additionally, if the node has left and right children, I enqueue them to the right side of the queue.

This process repeats until the entire tree is traversed, with the final `result` being the populated result list. This list encapsulates sublists representing each level of the binary tree. To sum it up, my algorithm employs a deque to systematically traverse the tree in a level-order fashion, organizing nodes based on their levels and providing a structured representation of the tree's hierarchy.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return
        queue = deque([root])
        result = []
        while queue:
            n = len(queue)
            result.append([])
            for _ in range(n):
                node = queue.popleft()
                if node:
                    result[-1].append(node.val)
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
        return result
```

# Leet Code Solution
```python
class Solution:
    def levelOrder(self, root):
        """
        :type root: TreeNode
        :rtype: List[List[int]]
        """
        levels = []
        if not root:
            return levels
        
        def helper(node, level):
            # start the current level
            if len(levels) == level:
                levels.append([])

            # append the current node value
            levels[level].append(node.val)

            # process child nodes for the next level
            if node.left:
                helper(node.left, level + 1)
            if node.right:
                helper(node.right, level + 1)
            
        helper(root, 0)
        return levels
```