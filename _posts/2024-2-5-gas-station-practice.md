---
layout: single
title: "Problem of The Day: Gas Station"
date: 2024-2-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:

- Problem of The Day

---

## Problem Statement

![problem-134](/assets/images/2024-02-05_19-00-30-problem-134.png)

## Brute Force - TLE

```python
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        if sum(gas) - sum(cost) < 0:
            return -1
        diff = []
        stations = len(gas)
        for i in range(stations):
            diff.append(gas[i] - cost[i])

        for i in range(stations):
            curr = i
            d = 0
            while d >= 0:
                d += diff[curr]
                curr = (curr + 1) % stations
                if curr == i:
                    return i
```

- Time complexity: O(n^2)
- Space complexity: O(n)

## Editorial Solution

>Greedy Approach

The idea of this algorithm is to find a starting gas station from which a circular tour can be completed. It uses two variables, `total_gain` and `curr_gain`, to keep track of the overall gain and the current gain while traversing the gas stations in a loop. If at any point the `curr_gain` becomes negative, it means that the current starting point cannot be the solution, and the algorithm resets the starting point to the next gas station.

The algorithm iterates through all gas stations, accumulating gains and checking for negative values. If the `total_gain` at the end is non-negative, it means there exists a circular tour, and the algorithm returns the starting index. Otherwise, it returns -1, indicating that no such circular tour is possible.

```python
class Solution:
    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:
        total_gain = 0
        curr_gain = 0
        answer = 0
        
        for i in range(len(gas)):
            # gain[i] = gas[i] - cost[i]
            total_gain += gas[i] - cost[i]
            curr_gain += gas[i] - cost[i]

            # If we meet a "valley", start over from the next station
            # with 0 initial gas.
            if curr_gain < 0:
                curr_gain = 0
                answer = i + 1
        
        return answer if total_gain >= 0 else -1
```

- Time complexity: O(n)
- Space complexity: O(1)
