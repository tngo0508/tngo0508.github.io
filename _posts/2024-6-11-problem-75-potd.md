---
layout: single
title: "Problem of The Day: Sort Colors"
date: 2024-6-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-75](/assets/images/2024-06-11_18-25-36-problem-75.png)

## Intuition

My first thought for solving this problem was to use the Dutch National Flag algorithm. This approach allows us to sort the array in a single pass by using three pointers to partition the array into three sections: one for 0s, one for 1s, and one for 2s. This way, we can sort the colors with a linear time complexity.

## Approach

I will use three pointers: `l` for the left boundary of the 0s, `m` for the current element being examined, and `r` for the right boundary of the 2s. Initially, all pointers will be set at the start, middle, and end of the list respectively.

I will iterate through the list with the `m` pointer. If the current element is 0, I'll swap it with the element at the `l` pointer, and increment both `l` and `m`. If the current element is 2, I'll swap it with the element at the `r` pointer and decrement `r`. If the current element is 1, I'll simply move the `m` pointer to the next element.

## Complexity

- Time complexity: \(O(n)\)
  - Each element is processed at most once, leading to linear time complexity.
- Space complexity: \(O(1)\)
  - The sorting is done in-place, so the space complexity is constant.

## Code

```python
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        l, r = 0, len(nums) - 1
        m = 0
        while m <= r:
            if nums[m] == 2:
                nums[m], nums[r] = nums[r], nums[m]
                r -= 1
            elif nums[m] == 0:
                nums[m], nums[l] = nums[l], nums[m]
                m += 1
                l += 1
            else:
                m += 1

```
