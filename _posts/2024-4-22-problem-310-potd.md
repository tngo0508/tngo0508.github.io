---
layout: single
title: "Problem of The Day: Minimum Height Trees"
date: 2024-4-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-310](/assets/images/2024-04-22_19-53-43-problem-310.png)

## BFS Approach - TLE

```python
class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:
        graph = {i: [] for i in range(n)}
        for x, y in edges:
            graph[x].append(y)
            graph[y].append(x)

        def bfs(node):
            queue = deque([[node, 0]])
            height = float('-inf')
            visited = set()
            visited.add(node)
            while queue:
                curr, level = queue.popleft()
                isLeaf = True
                for nei in graph[curr]:
                    if nei not in visited:
                        queue.append([nei, level + 1])
                        visited.add(nei)
                        isLeaf = False
                if isLeaf:
                    height = max(height, level)

            return height

        heights = []
        for i in range(n):
            heights.append(bfs(i))

        res = []
        min_height = min(heights)
        for i, height in enumerate(heights):
            if height == min_height:
                res.append(i)
        return res
```

- Time: O(n^2)
- Space: O(n)

## Editorial Solution

Topological Sorting

```python
class Solution:
    def findMinHeightTrees(self, n: int, edges: List[List[int]]) -> List[int]:

        # edge cases
        if n <= 2:
            return [i for i in range(n)]

        # Build the graph with the adjacency list
        neighbors = [set() for i in range(n)]
        for start, end in edges:
            neighbors[start].add(end)
            neighbors[end].add(start)

        # Initialize the first layer of leaves
        leaves = []
        for i in range(n):
            if len(neighbors[i]) == 1:
                leaves.append(i)

        # Trim the leaves until reaching the centroids
        remaining_nodes = n
        while remaining_nodes > 2:
            remaining_nodes -= len(leaves)
            new_leaves = []
            # remove the current leaves along with the edges
            while leaves:
                leaf = leaves.pop()
                # the only neighbor left for the leaf node
                neighbor = neighbors[leaf].pop()
                # remove the only edge left
                neighbors[neighbor].remove(leaf)
                if len(neighbors[neighbor]) == 1:
                    new_leaves.append(neighbor)

            # prepare for the next round
            leaves = new_leaves

        # The remaining nodes are the centroids of the graph
        return leaves
```

- Time: O(V) where V is the number of nodes in graph
- Space: O(V)
