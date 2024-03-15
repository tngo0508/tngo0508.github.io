---
layout: single
title: "Problem of The Day: Meeting Room II"
date: 2024-3-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-253](/assets/images/2024-03-15_14-02-18-problem-253.png)](/assets/images/2024-03-15_14-02-18-problem-253.png)

## Intuition

My initial thought is to sort the meetings by their start times and then use a min-heap to keep track of the end times of ongoing meetings. This way, I can efficiently determine the minimum number of meeting rooms required at any given time.

## Approach

I will sort the meetings by their start times. Then, I'll initialize a min-heap to keep track of the end times of ongoing meetings. I'll iterate through the sorted meetings, pushing the end time of each meeting into the heap. If the start time of the current meeting is greater than or equal to the earliest end time in the heap, it means one of the ongoing meetings has ended, so I'll pop that end time from the heap. I'll continue this process until all meetings are processed, and finally, return the size of the heap, which represents the minimum number of meeting rooms required.

## Complexity

- Time complexity:

  - Sorting the meetings takes O(n log n) time.
  - Pushing and popping elements from the heap takes O(log n) time for each meeting.
  - Overall, the time complexity is O(n log n).

- Space complexity:

  - We use a min-heap to store the end times of ongoing meetings, which can have at most n elements.
  - Thus, the space complexity is O(n).

## Code

```python
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        intervals.sort()
        min_heap = []
        heapq.heappush(min_heap, intervals[0][1])
        for start, end in intervals[1:]:
            if min_heap and start >= min_heap[0]:
                heapq.heappop(min_heap)
            heapq.heappush(min_heap, end)

        return len(min_heap)
```
