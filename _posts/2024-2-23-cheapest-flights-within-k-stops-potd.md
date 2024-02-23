---
layout: single
title: "Problem of The Day: Cheapest Flights Within K Stops"
date: 2024-2-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-787](/assets/images/2024-02-23_12-00-44-problem-787.png)](/assets/images/2024-02-23_12-00-44-problem-787.png)

>My approach is accepted by Leetcode Judge, but it is quite slow. Need to review the Editorial Solution for more efficient approaches.

## Intuition

The problem involves finding the cheapest price to reach the destination with at most k stops. A graph represents cities and flights between them, with associated prices. The intuition is to perform a modified BFS traversal, considering the constraints on the number of stops.

## Approach

I'll create a graph to represent the flights using a defaultdict of lists. Then, I'll use a deque for BFS traversal. During traversal, I'll keep track of the total cost and the number of cities visited so far. If the current city is the destination and the number of cities visited is within the limit, I'll update the result.

I'll use a defaultdict to keep track of the minimum cost to reach a city. If a city is already visited and the current cost is higher, I'll skip further exploration for that path.

## Complexity

- Time complexity:
O(E + V log V), where E is the number of flights and V is the number of cities. The log V factor is due to the priority queue operations in BFS.

- Space complexity:
O(V), where V is the number of cities, for storing the graph and visit information.

## Code

```python
class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        graph = defaultdict(list)

        for source, destination, price in flights:
            graph[source].append([destination, price])

        queue = deque()
        queue.append([src, 0, 1])
        res = float('inf')
        visit = defaultdict(int)
        visit[src] = 0

        while queue:
            city, total, num_cities = queue.popleft()
            visit[city] = total
            if city == dst and num_cities - 2 <= k:
                res = min(res, total)

            for dest, price in graph[city]:
                if dest in visit and visit[dest] < total + price:
                    continue
                if price > 0 and num_cities + 1 - 2 <= k:
                    queue.append([dest, total + price, num_cities + 1])


        return res if res != float('inf') else -1
```
