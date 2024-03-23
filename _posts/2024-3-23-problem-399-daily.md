---
layout: single
title: "Problem of The Day: Evaluate Division"
date: 2024-3-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-399](/assets/images/2024-03-23_11-05-15-problem-399.png)

## Intuition

When initially approaching this problem, I recognized it as a graph problem involving traversing through equations and values to find the result of queries.

## Approach

My approach involves constructing a graph using a defaultdict of lists where each node represents a variable in the equation, and the edges contain the value of the division between two variables. Then, I use depth-first search (DFS) to traverse the graph and compute the result of queries.

## Complexity

- Time complexity:

  - Constructing the graph takes O(n) time, where nnn is the number of equations.
  - DFS for each query takes O(n) time in the worst case, where nnn is the number of variables. Overall, the time complexity is O(n^2).

- Space complexity:
  O(n), where n is the number of equations, as we store the graph and visited nodes.

## Code

```python
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:
        graph = defaultdict(list)
        res = []
        for i, [src, dest] in enumerate(equations):
            graph[src].append((dest, values[i]))
            graph[dest].append((src, 1 / values[i]))

        def dfs(src, dest, curr, visited):
            if src == dest:
                return curr
            if src in visited:
                return -1.0

            visited.add(src)
            res = -1.0
            for node, val in graph[src]:
                res = dfs(node, dest, curr *  val, visited)
                if res != -1.0:
                    return res

            return res

        for src, dest in queries:
            if src not in graph or dest not in graph:
                res.append(-1.0)
            elif src == dest:
                res.append(1.0)
            else:
                res.append(dfs(src, dest, 1, set()))

        return res
```
