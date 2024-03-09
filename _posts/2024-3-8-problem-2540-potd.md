---
layout: single
title: "Problem of The Day: Minimum Common Value"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2540](/assets/images/2024-03-08_16-44-20-problem-2540.png)](/assets/images/2024-03-08_16-44-20-problem-2540.png)

## Intuition

My first thought is to use two heaps in order to find the common smallest element.

## Approach

I approach the problem by first heapifying both input lists. Then, I use a loop to compare the smallest elements at the tops of both heaps. If they are equal, I update the result. If the element in the first heap is greater, I pop the element from the second heap, and vice versa. The loop continues until one of the heaps is empty or a common element is found.

## Complexity

- Time complexity:
  O(N log N), where N is the maximum of the lengths of nums1 and nums2. The heapification process takes O(N log N) time.

- Space complexity:
  O(1), as the heaps are modified in-place.

## Code

```python
class Solution:
    def getCommon(self, nums1: List[int], nums2: List[int]) -> int:
        heapq.heapify(nums1)
        heapq.heapify(nums2)
        res = -1
        while nums1 and nums2:
            if nums1[0] == nums2[0]:
                res =  nums1[0]
                break
            elif nums1[0] > nums2[0]:
                heapq.heappop(nums2)
            else:
                heapq.heappop(nums1)

        return res
```
