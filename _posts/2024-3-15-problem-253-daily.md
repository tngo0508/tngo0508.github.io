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

## Editorial Solution

### Approach 1: Priority Queues

```python
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:

        # If there is no meeting to schedule then no room needs to be allocated.
        if not intervals:
            return 0

        # The heap initialization
        free_rooms = []

        # Sort the meetings in increasing order of their start time.
        intervals.sort(key= lambda x: x[0])

        # Add the first meeting. We have to give a new room to the first meeting.
        heapq.heappush(free_rooms, intervals[0][1])

        # For all the remaining meeting rooms
        for i in intervals[1:]:

            # If the room due to free up the earliest is free, assign that room to this meeting.
            if free_rooms[0] <= i[0]:
                heapq.heappop(free_rooms)

            # If a new room is to be assigned, then also we add to the heap,
            # If an old room is allocated, then also we have to add to the heap with updated end time.
            heapq.heappush(free_rooms, i[1])

        # The size of the heap tells us the minimum rooms required for all the meetings.
        return len(free_rooms)
```

### Approach 2: Chronological Ordering

```python
class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:

        # If there are no meetings, we don't need any rooms.
        if not intervals:
            return 0

        used_rooms = 0

        # Separate out the start and the end timings and sort them individually.
        start_timings = sorted([i[0] for i in intervals])
        end_timings = sorted(i[1] for i in intervals)
        L = len(intervals)

        # The two pointers in the algorithm: e_ptr and s_ptr.
        end_pointer = 0
        start_pointer = 0

        # Until all the meetings have been processed
        while start_pointer < L:
            # If there is a meeting that has ended by the time the meeting at `start_pointer` starts
            if start_timings[start_pointer] >= end_timings[end_pointer]:
                # Free up a room and increment the end_pointer.
                used_rooms -= 1
                end_pointer += 1

            # We do this irrespective of whether a room frees up or not.
            # If a room got free, then this used_rooms += 1 wouldn't have any effect. used_rooms would
            # remain the same in that case. If no room was free, then this would increase used_rooms
            used_rooms += 1
            start_pointer += 1

        return used_rooms
```
