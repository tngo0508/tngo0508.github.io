---
layout: single
title: "Problem of The Day: Search Insert Position"
date: 2023-12-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Top 100 Liked
  - Problem of The Day
---
# Problem Statement
In this post, I aim to delve into an important topic for preparing technical interviews – Binary Search. The crux of Binary Search lies in the requirement that the input must be sorted or arranged in some order to leverage this algorithm. I tackled a problem from the Top 100 Liked List, and here is the problem description:
```
Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with O(log n) runtime complexity.
```

# My Explanation and Approach
As mentioned, the sorted nature of the array hints at the use of Binary Search. The additional constraint of O(log n) runtime complexity solidifies the choice of the Binary Search algorithm. The implementation is straightforward, involving two pointers: left (`l`) and right (`r`). The algorithm calculates the middle index or pivot using these pointers, then compares the value of the element at this middle index with the target.

If the target matches the value, the solution is found, and the middle index is returned. Otherwise, two scenarios need to be considered:

If the target is larger than the middle element, shift the left (`l`) pointer to the position next to the middle index (move to the right), discarding elements on the left.
If the target is smaller than the middle element, shift the right (`r`) pointer to the position next to the middle index (move to the left), discarding elements on the right.
A challenge I encountered was determining what to return when the target is not found in the input array. After debugging and refining my logic, I realized that if the target is absent, its position would coincide with the left pointer (`l`). The logic was fine-tuned to ensure acceptance by the LeetCode Judge.

Here is my solution for this straightforward yet crucial question.

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = l + (r - l) // 2
            if target == nums[mid]:
                return mid
            elif target > nums[mid]:
                l = mid + 1
            else:
                r = mid - 1
        return l
```