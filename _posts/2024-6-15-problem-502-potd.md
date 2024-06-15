---
layout: single
title: "Problem of The Day: IPO"
date: 2024-6-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-502](/assets/images/2024-06-15_11-16-21-problem-502.png)

## Heap Approach - TLE

```python
class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        max_capital = w
        max_heap = []
        for p, c in zip(profits, capital):
            heapq.heappush(max_heap, [p * -1, c])

        while k > 0:
            max_profit = 0
            temp = []
            while max_heap:
                p, c = heapq.heappop(max_heap)
                if c <= max_capital:
                    max_profit = p*-1
                    break
                temp.append([p, c])

            while temp:
                heapq.heappush(max_heap, temp.pop())

            max_capital += max_profit
            k -= 1

        return max_capital
```

## Intuition

The goal is to maximize the capital after completing at most `k` projects. Each project has a required capital to start and provides a certain profit. The idea is to prioritize projects with the highest profit that can be started with the current available capital.

## Approach

1. **Use Heaps**:
   - **Min-Heap**: To keep track of projects sorted by their capital requirements. This allows us to efficiently find all projects that can be started with the current capital.
   - **Max-Heap**: To keep track of available projects by their profit in descending order. This ensures that we always select the most profitable project available.
2. **Populate the Min-Heap**: Push all projects into the min-heap based on their capital requirements.
3. **Iterate up to `k` times**:
   - Move all projects that can be started with the current capital from the min-heap to the max-heap.
   - If no projects are available to start, break early.
   - Otherwise, start the most profitable project (pop from the max-heap) and increase the current capital by the profit of that project.
4. **Return the final capital** after completing up to `k` projects.

## Complexity

- **Time Complexity**: \(O(n \log n + k \log n)\)
  - \(O(n \log n)\) to push all `n` projects into the min-heap.
  - For each of the `k` iterations, moving projects from the min-heap to the max-heap and then popping the most profitable project takes \(O(\log n)\).
- **Space Complexity**: \(O(n)\)
  - The space required to store the `n` projects in the heaps.

## Code

```python
class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int], capital: List[int]) -> int:
        min_heap = []
        max_heap = []

        # Populate the min_heap with projects by their capital requirements
        for c, p in zip(capital, profits):
            heapq.heappush(min_heap, (c, p))

        # Iterate k times or until there are no more projects we can start
        for _ in range(k):
            # Move all projects that can be started with the current capital to the max_heap
            while min_heap and min_heap[0][0] <= w:
                c, p = heapq.heappop(min_heap)
                heapq.heappush(max_heap, -p)

            # If there are no projects that can be started, break early
            if not max_heap:
                break

            # Start the project with the highest profit
            w -= heapq.heappop(max_heap)

        return w

```

## Editorial

```python
class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: List[int],
                             capital: List[int]) -> int:
        n = len(profits)
        projects = list(zip(capital, profits))
        projects.sort()
        # heapq is a min heap, but we need a max heap
        # so we will store negated elements
        q = []
        ptr = 0
        for i in range(k):
            while ptr < n and projects[ptr][0] <= w:
                # push a negated element
                heappush(q, -projects[ptr][1])
                ptr += 1
            if not q:
                break
            # pop a negated element
            w += -heappop(q)
        return w
```
