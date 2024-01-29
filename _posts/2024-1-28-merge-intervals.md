---
layout: single
title: "Problem of The Day: Merge Intervals"
date: 2024-1-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

 

Example 1:

Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
Example 2:

Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.
 

Constraints:

1 <= intervals.length <= 10^4
intervals[i].length == 2
0 <= starti <= endi <= 10^4
```

# Intuition
The problem seems to involve merging overlapping intervals, and my initial thoughts are to sort the intervals based on their start times. By doing so, we can efficiently merge overlapping intervals during a single pass through the sorted list.

# Approach
I will start by sorting the intervals based on their start times. Then, I will iterate through the sorted intervals, merging overlapping ones as needed. I will maintain a result list to store the non-overlapping merged intervals.

For each interval, I will compare its start time with the end time of the previous merged interval. If there is an overlap, I will update the end time of the previous interval. Otherwise, I will add the current interval to the result list.

# Complexity
- Time complexity:
O(nlogn) where n is the number of intervals. The dominant factor is the sorting operation.

- Space complexity:
O(1) (excluding the space needed for the input and output lists). The result list is modified in-place.

# Code
```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort()
        res = [intervals[0]]
        for start, end in intervals[1:]:
            _, prev_end = res[-1]
            if start <= prev_end:
                res[-1][1] = max(end, prev_end)
            else:
                res.append([start, end])
        
        return res
```

# Editorial Solution
Approach 2: Sorting
```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:

        intervals.sort(key=lambda x: x[0])

        merged = []
        for interval in intervals:
            # if the list of merged intervals is empty or if the current
            # interval does not overlap with the previous, simply append it.
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
            # otherwise, there is overlap, so we merge the current and previous
            # intervals.
                merged[-1][1] = max(merged[-1][1], interval[1])

        return merged
```