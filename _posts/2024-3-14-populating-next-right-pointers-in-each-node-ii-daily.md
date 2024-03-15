---
layout: single
title: "Problem of The Day: Populating Next Right Pointers in Each Node II"
date: 2024-3-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-117](/assets/images/2024-03-14_19-26-34-problem-117.png)](/assets/images/2024-03-14_19-26-34-problem-117.png)

## Intuition

I'm going to use a breadth-first search (BFS) approach here. The idea is to traverse the tree level by level, and for each node, link it to its next node on the same level.

## Approach

I'll start by initializing a queue with the root node. Then, I'll iterate through the queue until it's empty. For each level, I'll determine the next node in the queue and link the current node's `next` pointer to it. Finally, I'll enqueue the children of the current node if they exist.

## Complexity

- Time complexity:
  O(n) where n is the number of nodes in the tree. We visit each node once

- Space complexity:
  O(m) where m is the maximum number of nodes at any levels in the tree.

## Code

```python
"""
# Definition for a Node.
class Node:
    def __init__(self, val: int = 0, left: 'Node' = None, right: 'Node' = None, next: 'Node' = None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next
"""

class Solution:
    def connect(self, root: 'Node') -> 'Node':
        queue = deque()
        queue.append(root)
        while queue:
            N = len(queue)
            for i in range(N):
                node = queue.popleft()
                next_node = queue[0] if i < N - 1 else None
                if node:
                    node.next = next_node
                    if node.left:
                        queue.append(node.left)
                    if node.right:
                        queue.append(node.right)
        return root

```
