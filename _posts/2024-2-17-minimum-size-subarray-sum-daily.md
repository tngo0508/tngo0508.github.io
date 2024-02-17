---
layout: single
title: "Problem of The Day: Minimum Size Subarray Sum"
date: 2024-2-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-209](/assets/images/2024-02-17_14-22-03-problem-209.png)](/assets/images/2024-02-17_14-22-03-problem-209.png)

## Intuition

The idea is to maintain a window (subarray) and move it from the beginning to the end of the array while keeping track of the sum of elements within the window. By adjusting the window based on the current sum, we can find the minimum length of a subarray whose sum is at least the target.

## Approach

I initialized two pointers, `start` and `end`, both pointing to the beginning of the array. I also kept track of the current sum of the elements in the window using the variable `curr_sum`. The `res` variable is used to store the minimum length of a subarray with a sum at least the target.

I iterated through the array using the `end` pointer, adding elements to the current sum. Whenever the sum became greater than or equal to the target, I entered a while loop to update the minimum length and move the `start` pointer to the right, reducing the size of the window.

I continued this process until the `end` pointer reached the end of the array. The result is the minimum length of a subarray with a sum at least the target, or 0 if no such subarray exists.

## Complexity

- Time complexity:
O(n) since we only traverse each element twice.

- Space complexity:
O(1)

## Code

```python
class Solution:
    def minSubArrayLen(self, target: int, nums: List[int]) -> int:
        start = 0
        N = len(nums)
        curr_sum = 0
        res = float('inf')
        for end in range(N):
            curr_sum += nums[end]
            while start <= end and curr_sum >= target:
                if curr_sum >= target:
                    res = min(res, end - start + 1)
                curr_sum -= nums[start]
                start += 1
        
        return res if res != float('inf') else 0
```
