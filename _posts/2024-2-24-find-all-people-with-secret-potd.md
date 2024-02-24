---
layout: single
title: "Problem of The Day: Find All People With Secret"
date: 2024-2-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2092](/assets/images/2024-02-24_11-02-19-problem-2092.png)](/assets/images/2024-02-24_11-02-19-problem-2092.png)

## Intuition

I'll start by identifying the key elements in the problem. We need to find all people who attended the same meetings as the given first person. The meetings are represented as time intervals, and each meeting involves two people. We can track the attendees of each meeting over time and update the set of people with whom the given person shares a secret.

## Approach

I will use a `hash_map` to store the meetings at each time point. Then, I'll iterate through the time points and update the set of secrets by adding people who attended the meetings at that time. I'll continue this process until no further updates can be made.

>Note: This solution may not be the most efficient one, and further optimizations could be explored.

## Complexity

- Time complexity:
O(m * n) where n is the number of time points and m is the average number of attendees in a meeting.

- Space complexity:
O(n) where n is the number of time points.

## Code

```python
class Solution:
    def findAllPeople(self, n: int, meetings: List[List[int]], firstPerson: int) -> List[int]:
        secrets = {0, firstPerson}
        hash_map = defaultdict(list) # {time_i: {attendants}}

        for x, y, time in meetings:
            hash_map[time].append([x, y])
        
        max_time = max(hash_map.keys())

        for i in range(1, max_time + 1):
            if i not in hash_map:
                continue
            attendants = hash_map[i]
            while True:
                is_done = True
                for x, y in attendants:
                    if x in secrets or y in secrets:
                        if x not in secrets or y not in secrets:
                            secrets.update([x, y])
                            is_done = False
                
                if is_done:
                    break

        return list(secrets)
```
