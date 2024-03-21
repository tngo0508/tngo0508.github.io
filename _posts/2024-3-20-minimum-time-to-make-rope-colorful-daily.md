---
layout: single
title: "Problem of The Day: Minimum Time to Make Rope Colorful"
date: 2024-3-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-1578](/assets/images/2024-03-20_23-39-19-problem-1578.png)](/assets/images/2024-03-20_23-39-19-problem-1578.png)

## Intuition

My initial thought was to utilize the two pointers approach to identify contiguous sequences of duplicated colors. By doing so, I could efficiently iterate through the list of colors and identify consecutive segments where the colors are the same.

## Approach

To implement the approach, I utilized two pointers, `start` and `end`, to traverse the `colors` string. The `start` pointer indicates the beginning of a contiguous sequence of duplicated colors, while the `end` pointer moves forward to identify the end of this sequence.

Within each iteration, I checked if the colors at `start` and `end` are different. If they are the same, it implies that the sequence continues. I then accumulated the time needed to remove these duplicate colors, keeping track of the maximum time within this sequence. Once the contiguous sequence ends, I deducted the maximum time from the total time required.

After processing one contiguous sequence, I updated the `start` and `end` pointers to move to the next potential sequence.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(1)

## Code

```python
class Solution:
    def minCost(self, colors: str, neededTime: List[int]) -> int:
        res = 0
        N = len(colors)
        if N == 1:
            return res
        start, end = 0, 1
        while end < N:
            if colors[start] != colors[end]:
                start += 1
                end += 1
            else:
                max_time = neededTime[start]
                res += max_time
                while end < N and colors[end] == colors[start]:
                    res += neededTime[end]
                    max_time = max(neededTime[end], max_time)
                    end += 1
                res -= max_time
                start = end
                end += 1

        return res
```

## Editorial Solution

### Approach 1: Two pointers

```python
class Solution:
    def minCost(self, colors: str, neededTime: List[int]) -> int:
        # Initalize two pointers i, j.
        total_time = 0
        i, j = 0, 0

        while i < len(neededTime) and j < len(neededTime):
            curr_total = 0
            curr_max = 0

            # Find all the balloons having the same color as the
            # balloon indexed at i, record the total removal time
            # and the maximum removal time.
            while j < len(neededTime) and colors[i] == colors[j]:
                curr_total += neededTime[j]
                curr_max = max(curr_max, neededTime[j])
                j += 1

            # Once we reach the end of the current group, add the cost of
            # this group to total_time, and reset two pointers.
            total_time += curr_total - curr_max
            i = j

        return total_time
```

### Approach 2: Advanced 1-Pass

```python
class Solution:
    def minCost(self, colors: str, neededTime: List[int]) -> int:
        # totalTime: total time needed to make rope colorful;
        # currMaxTime: maximum time of a balloon needed in this group.
        total_time = 0
        curr_max_time = 0

        # For each balloon in the array:
        for i in range(len(colors)):
            # If this balloon is the first balloon of a new group
            # set the curr_max_time as 0.
            if i > 0 and colors[i] != colors[i - 1]:
                curr_max_time = 0

            # Increment total_time by the smaller one.
            # Update curr_max_time as the larger one.
            total_time += min(curr_max_time, neededTime[i])
            curr_max_time = max(curr_max_time, neededTime[i])

        # Return total_time as the minimum removal time.
        return total_time
```
