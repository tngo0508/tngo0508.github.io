---
layout: single
title: "Problem of The Day: Find the Duplicate Number"
date: 2024-3-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-287](/assets/images/2024-03-24_10-46-00-problem-287.png)

My notes:

![problem-287-note](/assets/images/2024-03-24_10-39-41-problem-287-note.png)

>Need to review different approaches again. They maybe useful for other problems.

## Hash set

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        hash_set = set()
        for num in nums:
            if num in hash_set:
                return num
            hash_set.add(num)
        return -1
```

## slow and fast approach

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break

        slow = nums[0]
        while True:
            if slow == fast:
                return fast
            fast = nums[fast]
            slow = nums[slow]
```

## Editorial Solution

### Approach 7: Floyd's Tortoise and Hare (Cycle Detection)

```python
class Solution:
    def findDuplicate(self, nums):
        # Find the intersection point of the two runners.
        tortoise = hare = nums[0]
        while True:
            tortoise = nums[tortoise]
            hare = nums[nums[hare]]
            if tortoise == hare:
                break

        # Find the "entrance" to the cycle.
        tortoise = nums[0]
        while tortoise != hare:
            tortoise = nums[tortoise]
            hare = nums[hare]

        return hare
```

### Approach 4.2: Array as HashMap (Iterative)

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        while nums[0] != nums[nums[0]]:
            nums[nums[0]], nums[0] = nums[0], nums[nums[0]]
        return nums[0]
```
