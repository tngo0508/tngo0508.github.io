---
layout: single
title: "Problem of The Day: Meeting Rooms III"
date: 2024-2-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2402](/assets/images/2024-02-17_19-03-07-problem-2402.png)](/assets/images/2024-02-17_19-03-07-problem-2402.png)

My note:

[![note](/assets/images/2024-02-17_19-07-02-potd-note1.png)](/assets/images/2024-02-17_19-07-02-potd-note1.png)

## Intuition

The goal is to find the most booked room based on a list of meetings and their start and end times. I'll need to organize the meetings and allocate them to rooms while minimizing the delays between consecutive meetings in the same room.

## Approach

I'll start by sorting the meetings based on their start times. Then, I'll iterate through each meeting and try to find a suitable room for it. If a room is available, I'll assign the meeting to that room; otherwise, I'll check for the next available room.

To minimize delays, I'll keep track of the end time of the last meeting in each room. If the current meeting can start immediately after the last one, I'll assign it to the same room without any delay. Otherwise, I'll add the necessary delay to the current meeting's start time.

I'll maintain a list of rooms, each represented as a list of meeting end times. After processing all meetings, I'll count the number of meetings in each room and find the room with the maximum number of bookings.

## Complexity

- Time complexity:
O(nlogn) due to the initial sorting of meetings, where n is the number of meetings.

- Space complexity:
O(n) for the list of rooms.

## Code

```python
class Solution:
    def mostBooked(self, n: int, meetings: List[List[int]]) -> int:
        meetings.sort()
        rooms = [[] for _ in range(n)]

        for i, meeting in enumerate(meetings):
            start, end = meeting
            available_room = [float('inf'), []]
            for room in rooms:
                if not room:
                    available_room[0] = end
                    available_room[1] = room
                    break
                elif room and start >= room[-1]:
                    available_room[0] = room[-1]
                    available_room[1] = room
                    break
                elif room and available_room[0] > room[-1]:
                    available_room[0] = room[-1]
                    available_room[1] = room
                
            
            prev_end, curr = available_room
            if not room:
                curr.append(end)
            else:
                delays = prev_end - start if prev_end - start > 0 else 0
                curr.append(end + delays)

        rooms = list(map(len, rooms))
        res = [0, 0]
        for i, num_of_meetings in enumerate(rooms):
            if res[0] < num_of_meetings:
                res[0] = num_of_meetings
                res[1] = i
        
        return res[1]
```
