---
layout: single
title: "Problem of The Day: Most Profit Assigning Work"
date: 2024-6-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![826](/assets/images/2024-06-17_18-39-42-prob-826.png)

## Max Heap - TLE

```python
class Solution:
    def maxProfitAssignment(self, difficulty: List[int], profit: List[int], worker: List[int]) -> int:
        res = 0
        for w in worker:
            max_heap = []
            for diff, prof in zip(difficulty, profit):
                heappush(max_heap, [prof * -1, diff])
            while max_heap:
                p, d = heappop(max_heap)
                p *= -1
                if w >= d:
                    res += p
                    break

        return res

```

## Brute Force - Accepted

```python
class Solution:
    def maxProfitAssignment(self, difficulty: List[int], profit: List[int], worker: List[int]) -> int:
        res = 0
        arr = []
        for d, p in zip(difficulty, profit):
            arr.append([p, d])

        arr.sort(reverse=True)
        for w in worker:
            for p, d in arr:
                if w >= d:
                    res += p
                    break

        return res
```

## Editorial

### Approach 1: Binary Search and Greedy (Sort by Job Difficulty)

```python
class Solution:
    def maxProfitAssignment(
        self, difficulty: List[int], profit: List[int], worker: List[int]
    ) -> int:
        job_profile = [(0, 0)]
        for i in range(len(difficulty)):
            job_profile.append((difficulty[i], profit[i]))
        # Sort by difficulty values in increasing order.

        job_profile.sort()
        for i in range(len(job_profile) - 1):
            job_profile[i + 1] = (
                job_profile[i + 1][0],
                max(job_profile[i][1], job_profile[i + 1][1]),
            )
        net_profit = 0
        for i in range(len(worker)):
            ability = worker[i]

            # Find the job with just smaller or equal difficulty than ability.

            l, r = 0, len(job_profile) - 1
            job_profit = 0
            while l <= r:
                mid = (l + r) // 2
                if job_profile[mid][0] <= ability:
                    job_profit = max(job_profit, job_profile[mid][1])
                    l = mid + 1
                else:
                    r = mid - 1
            # Increment profit of current worker to total profit.

            net_profit += job_profit
        return net_profit
```

### Approach 2: Binary Search and Greedy (Sort by profit)

```python
class Solution:
    def maxProfitAssignment(
        self, difficulty: List[int], profit: List[int], worker: List[int]
    ) -> int:
        job_profile = [(0, 0)]
        for i in range(len(difficulty)):
            job_profile.append((profit[i], difficulty[i]))

        # Sort in decreasing order of profit.
        job_profile.sort(reverse=True)
        for i in range(len(job_profile) - 1):
            job_profile[i + 1] = (
                job_profile[i + 1][0],
                min(job_profile[i][1], job_profile[i + 1][1]),
            )

        net_profit = 0
        for ability in worker:
            # Maximize profit using binary search.
            l, r = 0, len(job_profile) - 1
            job_profit = 0
            while l <= r:
                mid = (l + r) // 2
                if job_profile[mid][1] <= ability:
                    job_profit = max(job_profit, job_profile[mid][0])
                    r = mid - 1
                else:
                    l = mid + 1
            # Add profit of each worker to total profit.
            net_profit += job_profit

        return net_profit
```

### Approach 3: Greedy and Two-Pointers

```python
class Solution:
    def maxProfitAssignment(
        self, difficulty: List[int], profit: List[int], worker: List[int]
    ) -> int:
        job_profile = [
            (difficulty[i], profit[i]) for i in range(len(difficulty))
        ]

        # Sort both worker and job_profile arrays

        worker.sort()
        job_profile.sort()

        net_profit, max_profit, index = 0, 0, 0
        for ability in worker:
            # While the index has not reached the end and worker can pick a job
            # with greater difficulty move ahead.

            while index < len(difficulty) and ability >= job_profile[index][0]:
                max_profit = max(max_profit, job_profile[index][1])
                index += 1
            net_profit += max_profit
        return net_profit
```
