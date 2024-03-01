---
layout: single
title: "Problem of The Day: Insert Interval"
date: 2024-2-29
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-57](/assets/images/2024-02-29_19-37-53-problem-57.png)](/assets/images/2024-02-29_19-37-53-problem-57.png)

## Intuition

The problem requires inserting a new interval into a sorted list of non-overlapping intervals. My initial thought is to iterate through the intervals and find the correct position to insert the new interval. Once inserted, I need to merge overlapping intervals if any.

## Approach

I'll iterate through the existing intervals and determine the correct position to insert the new interval. After insertion, I'll merge any overlapping intervals by updating the last interval in the result list. This can be done by comparing the end of the last interval in the result with the start of the current interval.

## Complexity

- Time complexity:
O(n), where n is the number of intervals. We iterate through the intervals once.

- Space complexity:
O(n), as we may need to store the merged intervals in the result list.

## Code

```python
class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        res = []
        idx = 0
        N = len(intervals)
        
        # Find the correct position to insert newInterval
        for i in range(N):
            start, end = intervals[i]
            if end < newInterval[0]:
                res.append([start, end])
                idx += 1
            else:
                idx = i
                break
        
        # Insert newInterval
        res.append(newInterval)

        # Merge overlapping intervals
        for j in range(idx, N):
            prev_start, prev_end = res[-1]
            start, end = intervals[j]
            if prev_end >= start:
                res[-1][0] = min(prev_start, start)
                res[-1][1] = max(prev_end, end)
            else:
                res.append([start, end])
        
        return res

```

## Disscussion Solutions

```python
class Solution:
    def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
        result = []
        i = 0

        while i < len(intervals) and intervals[i][1] < newInterval[0]:
            result.append(intervals[i])
            i += 1

        while i < len(intervals) and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1

        result.append(newInterval)

        while i < len(intervals):
            result.append(intervals[i])
            i += 1

        return result
```

Clean solution - two pointers

```python
def insert(self, intervals: List[List[int]], newInterval: List[int]) -> List[List[int]]:
    l, r = [], []
    for interval in intervals:
        if interval[1] < newInterval[0]:
            l.append(interval)
        elif interval[0] > newInterval[1]:
            r.append(interval)
        else:
            newInterval = (min(interval[0], newInterval[0]), \
                            max(interval[1], newInterval[1]))
    return l + [newInterval] + r
```
