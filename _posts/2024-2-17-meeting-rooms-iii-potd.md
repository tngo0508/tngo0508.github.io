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

## Editorial Solution

### Approach 1: Sorting and Counting

```python
class Solution:
    def mostBooked(self, n: int, meetings: List[List[int]]) -> int:
        room_availability_time = [0] * n
        meeting_count = [0] * n
        for start, end in sorted(meetings):
            min_room_availability_time = inf
            min_available_time_room = 0
            found_unused_room = False
            for i in range(n):
                if room_availability_time[i] <= start:
                    found_unused_room = True
                    meeting_count[i] += 1
                    room_availability_time[i] = end
                    break
                if min_room_availability_time > room_availability_time[i]:
                    min_room_availability_time = room_availability_time[i]
                    min_available_time_room = i
            if not found_unused_room:
                room_availability_time[min_available_time_room] += end - start
                meeting_count[min_available_time_room] += 1

        return meeting_count.index(max(meeting_count))
```

### Approach 2: Sorting, Counting using Priority Queues

```python
class Solution:
    def mostBooked(self, n: int, meetings: List[List[int]]) -> int:
        unused_rooms, used_rooms = list(range(n)), []
        heapify(unused_rooms)
        meeting_count = [0] * n
        for start, end in sorted(meetings):
            while used_rooms and used_rooms[0][0] <= start:
                _, room = heappop(used_rooms)
                heappush(unused_rooms, room)
            if unused_rooms:
                room = heappop(unused_rooms)
                heappush(used_rooms, [end, room])
            else:
                room_availability_time, room = heappop(used_rooms)
                heappush(
                    used_rooms,
                    [room_availability_time + end - start, room]
                )
            meeting_count[room] += 1
        return meeting_count.index(max(meeting_count))
```
