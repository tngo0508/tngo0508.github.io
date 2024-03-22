---
layout: single
title: "Problem of The Day: Clone Graph"
date: 2024-3-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-133](/assets/images/2024-03-22_15-34-01-problem-113.png)

## Intuition

My first thought to solve this problem is to traverse the original graph using a depth-first search (DFS) or breadth-first search (BFS) approach. During traversal, I'll create a new node for each node encountered in the original graph and maintain a mapping between original nodes and their corresponding clones.

## Approach

I'll use a queue (for BFS) to traverse the original graph. As I traverse each node, I'll create a clone for it and store it in a dictionary where the original node is the key and its clone is the value. This ensures that we don't create duplicate clones for the same node.

After traversing and cloning all nodes, I'll iterate through the dictionary again to update the neighbors of each clone. For each original node, I'll iterate through its neighbors and add the corresponding clones of those neighbors to the clone's neighbor list.

Finally, I'll return the clone of the input node (if it exists) from the dictionary. If the input node is None or not in the clones dictionary, I'll return None.

## Complexity

- Time complexity:
  O(V + E) where V is the number of vertices (nodes) and E is the number of edges in the graph.

- Space complexity:
  O(V), where V is the number of vertices in the graph.

## Code

```python
"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""

from typing import Optional
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        clones = defaultdict(Node)
        queue = deque([node])
        while queue:
            curr_node = queue.popleft()
            if curr_node and curr_node not in clones:
                clones[curr_node] = Node(curr_node.val)
                for nei in curr_node.neighbors:
                    queue.append(nei)


        for k, v in clones.items():
            for nei in k.neighbors:
                v.neighbors.append(clones[nei])

        return clones[node] if node in clones else None
```
