---
layout: single
title: "Problem of The Day: Find All Duplicates in an Array"
date: 2024-3-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-442](/assets/images/2024-03-24_18-59-14-problem-442.png)

My notes:

[![notes](/assets/images/2024-03-24_18-59-30-problem-442-notes.png)](/assets/images/2024-03-24_18-59-30-problem-442-notes.png)

## Intuition

Upon reviewing the problem, my initial thought was to utilize the given array to mark the presence of elements. Since the array consists of positive integers ranging from 1 to n, we can utilize the indices to mark the presence of elements and identify duplicates.

## Approach

My approach involves iterating through the array and using the values as indices to access elements. For each element `num`, I check if the element at index `num - 1` is negative. If it is negative, it means that `num` has appeared before, and it is a duplicate. In such cases, I append `num` to the result list. If it is positive, I mark the element at index `num - 1` as negative to indicate its presence.

## Complexity

- Time complexity:
  O(n), where n is the length of the input array nums. We traverse the array once.

- Space complexity:
  O(1)

## Code

```python
class Solution:
    def findDuplicates(self, nums: List[int]) -> List[int]:
        res = []
        for i, num in enumerate(nums):
            idx = abs(num) - 1
            if nums[idx] < 0:
                res.append(abs(num))
            else:
                nums[idx] = -nums[idx]

        return res
```
