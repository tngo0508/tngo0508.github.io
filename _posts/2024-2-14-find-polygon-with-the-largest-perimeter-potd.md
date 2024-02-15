---
layout: single
title: "Problem of The Day: Find Polygon With the Largest Perimeter"
date: 2024-2-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2971](/assets/images/2024-02-14_19-00-07-problem-2971.png)](/assets/images/2024-02-14_19-00-07-problem-2971.png)

My note:
[![note](/assets/images/2024-02-14_18-59-27-problem-2971-note.png)](/assets/images/2024-02-14_18-59-27-problem-2971-note.png)

## Intuition

The intuition here is that for a triangle with sides a, b, and c, the sum of any two sides must be greater than the third side. Therefore, to maximize the perimeter, we should try to select the three largest elements from the list.

## Approach

My approach is to sort the given list in ascending order. After sorting, I iterate through the list and check if the sum of the two smaller elements is greater than the third, larger element. If it is, I update the answer with the maximum perimeter found so far. This is done until we have considered all possible combinations of three elements.

## Complexity

- Time complexity:
  O(n log n) due to sorting

- Space complexity:
  O(1)

## Code

```python
class Solution:
    def largestPerimeter(self, nums: List[int]) -> int:
        if len(nums) < 3:
            return -1
        nums.sort()
        N = len(nums)
        curr_sum = 0
        ans = -1
        for i, num in enumerate(nums):
            if i >= 2 and curr_sum > num:
                ans = curr_sum + num
            curr_sum += num

        return ans
```
