---
layout: single
title: "Problem of The Day: Two Sum II - Input Array Is Sorted"
date: 2024-2-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-167](/assets/images/2024-02-17_13-35-25-problem-167.png)](/assets/images/2024-02-17_13-35-25-problem-167.png)

## Intuition

My initial thought is to use a two-pointer approach since the array is sorted. Starting with two pointers at the beginning and end of the array, we can adjust the pointers based on the sum of the current pair.

## Approach

I will use two pointers, `l` and `r`, initialized at the beginning and end of the array, respectively. In each iteration, I will calculate the sum of the numbers at these pointers. If the sum is equal to the target, I will return the indices of the two numbers. If the sum is greater than the target, I will move the right pointer (`r`) to the left to decrease the sum. If the sum is less than the target, I will move the left pointer (`l`) to the right to increase the sum. This process will continue until the pointers meet or the target sum is found.

## Complexity

- Time complexity:
O(n) - The algorithm uses a two-pointer approach with a single pass through the array.

- Space complexity:
O(1) - The algorithm uses only a constant amount of extra space.

## Code

```python
class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            curr_sum = numbers[l] + numbers[r]
            if curr_sum == target:
                return [l + 1, r + 1]
            elif curr_sum > target:
                r -= 1
            else:
                l += 1
```
