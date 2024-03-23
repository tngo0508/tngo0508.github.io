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

## Editorial Solution

### Approach 1: Path Search in Graph

```python
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:

        graph = defaultdict(defaultdict)

        def backtrack_evaluate(curr_node, target_node, acc_product, visited):
            visited.add(curr_node)
            ret = -1.0
            neighbors = graph[curr_node]
            if target_node in neighbors:
                ret = acc_product * neighbors[target_node]
            else:
                for neighbor, value in neighbors.items():
                    if neighbor in visited:
                        continue
                    ret = backtrack_evaluate(
                        neighbor, target_node, acc_product * value, visited)
                    if ret != -1.0:
                        break
            visited.remove(curr_node)
            return ret

        # Step 1). build the graph from the equations
        for (dividend, divisor), value in zip(equations, values):
            # add nodes and two edges into the graph
            graph[dividend][divisor] = value
            graph[divisor][dividend] = 1 / value

        # Step 2). Evaluate each query via backtracking (DFS)
        #  by verifying if there exists a path from dividend to divisor
        results = []
        for dividend, divisor in queries:
            if dividend not in graph or divisor not in graph:
                # case 1): either node does not exist
                ret = -1.0
            elif dividend == divisor:
                # case 2): origin and destination are the same node
                ret = 1.0
            else:
                visited = set()
                ret = backtrack_evaluate(dividend, divisor, 1, visited)
            results.append(ret)

        return results
```

### Approach 2: Union-Find with Weights

> Need to review this approach again to understand it more

```python
class Solution:
    def calcEquation(self, equations: List[List[str]], values: List[float], queries: List[List[str]]) -> List[float]:

        gid_weight = {}

        def find(node_id):
            if node_id not in gid_weight:
                gid_weight[node_id] = (node_id, 1)
            group_id, node_weight = gid_weight[node_id]
            # The above statements are equivalent to the following one
            #group_id, node_weight = gid_weight.setdefault(node_id, (node_id, 1))

            if group_id != node_id:
                # found inconsistency, trigger chain update
                new_group_id, group_weight = find(group_id)
                gid_weight[node_id] = \
                    (new_group_id, node_weight * group_weight)
            return gid_weight[node_id]

        def union(dividend, divisor, value):
            dividend_gid, dividend_weight = find(dividend)
            divisor_gid, divisor_weight = find(divisor)
            if dividend_gid != divisor_gid:
                # merge the two groups together,
                # by attaching the dividend group to the one of divisor
                gid_weight[dividend_gid] = \
                    (divisor_gid, divisor_weight * value / dividend_weight)

        # Step 1). build the union groups
        for (dividend, divisor), value in zip(equations, values):
            union(dividend, divisor, value)

        results = []
        # Step 2). run the evaluation, with "lazy" updates in find() function
        for (dividend, divisor) in queries:
            if dividend not in gid_weight or divisor not in gid_weight:
                # case 1). at least one variable did not appear before
                results.append(-1.0)
            else:
                dividend_gid, dividend_weight = find(dividend)
                divisor_gid, divisor_weight = find(divisor)
                if dividend_gid != divisor_gid:
                    # case 2). the variables do not belong to the same chain/group
                    results.append(-1.0)
                else:
                    # case 3). there is a chain/path between the variables
                    results.append(dividend_weight / divisor_weight)
        return results
```
