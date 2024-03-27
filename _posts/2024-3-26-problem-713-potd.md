---
layout: single
title: "Problem of The Day: Subarray Product Less Than K"
date: 2024-3-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-713](/assets/images/2024-03-26_21-56-08-problem-713.png)

## Intuition

I'm considering a sliding window approach to solve this problem. The idea is to maintain a window where the product of its elements is less than the given threshold k. By expanding and contracting this window appropriately, I can count the number of subarrays that satisfy the condition.

## Approach

I'll initialize two pointers, `start` and `end`, both pointing to the beginning of the array initially. Then, I'll iterate through the array while expanding the window by moving `end` pointer. While the product of elements within the window exceeds kkk, I'll contract the window by moving the `start` pointer and updating the product accordingly. During this process, I'll keep track of the count of valid subarrays.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(1)

## Code

```python
class Solution:
    def numSubarrayProductLessThanK(self, nums: List[int], k: int) -> int:
        N = len(nums)
        start = end = 0
        curr = 1
        res = 0
        while end < N:
            curr *= nums[end]
            while start <= end and curr >= k:
                curr //= nums[start]
                start += 1
            res += end - start + 1
            end += 1

        return res
```
