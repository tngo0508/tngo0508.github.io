---
layout: single
title: "Problem of The Day: Minimum Number of Arrows to Burst Balloons"
date: 2024-3-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-452](/assets/images/2024-03-01_14-27-08-problem-452.png)](/assets/images/2024-03-01_14-27-08-problem-452.png)

## Intuition

Sorting the intervals based on their start points makes sense, as it allows us to easily identify overlapping intervals. The intuition is to iterate through the sorted intervals and keep track of the overlapping regions.

## Approach

The approach involves sorting the intervals based on their start points. Then, we initialize a result list with the first interval. We iterate through the sorted intervals and check for overlap with the last interval in the result list. If there is an overlap, we update the end point of the last interval in the result list. If there is no overlap, we add the current interval to the result list.

## Complexity

- Time complexity:
  O(n \* log(n)) due to the sorting step.

- Space complexity:
  O(n) for storing the result list.

## Code

```python
class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        points.sort()
        res = [points[0]]
        for start, end in points[1:]:
            _, prev_end = res[-1]
            if prev_end >= start:
                res[-1][0] = max(start, res[-1][0])
                res[-1][1] = min(end, res[-1][1])
            else:
                res.append([start, end])

        return len(res)
```

## Editorial Solution

### Approach 1: Greedy

```python
class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        if not points:
            return 0

        # sort by x_end
        points.sort(key = lambda x : x[1])

        arrows = 1
        first_end = points[0][1]
        for x_start, x_end in points:
            # if the current balloon starts after the end of another one,
            # one needs one more arrow
            if first_end < x_start:
                arrows += 1
                first_end = x_end

        return arrows
```

- Time complexity: O(nlogn)
- Space complexity: O(N)
