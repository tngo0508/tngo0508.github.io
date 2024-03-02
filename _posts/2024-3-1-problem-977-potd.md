---
layout: single
title: "Problem of The Day: Squares of a Sorted Array"
date: 2024-3-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-977](/assets/images/2024-03-01_16-58-41-problem-977.png)](/assets/images/2024-03-01_16-58-41-problem-977.png)

## Intuition

I see that this problem involves squaring each element in the input array and then sorting the squared values in non-decreasing order. The twist here is that the input array is already sorted, and I can take advantage of this property to optimize the solution.

## Approach

I'll use a two-pointer approach to iterate through the input array from both ends, comparing the absolute values. I'll square the larger absolute value and place it at the end of the result array. This way, I'll build the result array in a sorted order. I'll continue this process until the two pointers meet in the middle.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(n)

## Code

```python
class Solution:
    def sortedSquares(self, nums: List[int]) -> List[int]:
        N = len(nums)
        l, r = 0, N - 1
        res = [0] * N
        k = N - 1
        while l <= r:
            left = abs(nums[l])
            right = abs(nums[r])
            if left > right:
                res[k] = left * left
                l += 1
            else:
                res[k] = right * right
                r -= 1

            k -= 1

        return res

```
