---
layout: single
title: "Problem of The Day: Search Insert Position"
date: 2023-12-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
# Problem Statement
For this post, I wanted to explore another important topic to prepare for technical interviews. This topic is Binary Search. The essential idea to use the Binary Search is that the input has be sorted or the array has to be in some kinds of order to employ this algorithm. Again, I attempted to solve this problem from the Top 100 Liked List. And the following is the description of the problem.
```
Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with O(log n) runtime complexity.
```

# My Explanation and Approach
As mentioned above, since the array is sorted, the first thought comes to my mind is to utilize the Binary Search to solve the problem. In addition, the second hint that strengthen my confidence to use Binary Search is that the algorithm has to be implemented in `O(log n) runtime complexity`. And, this is fit perfectly in the case of Binary Search algorithm. The implementation for Binary Search is very straight forward. We need the two pointers: left(`l`) and right (`r`). First, we need to calculate the middle index or pivot using these two pointers. Then, we compare the value of element on this middle index with target. If the target is equal to the value, we know that we have reach the solution. So, we simply return this middle index as the result. Otherwise, we have two scenarios left to check:
1. If the target is larger than the middle element, we need to move our left (`l`) pointer to the position next to the middle index to the right. That means that we discard all elements on the left of the middle index.
2. If the target is smaller than the middle element, we need to move our right (`r`) pointer to the position next to the middle index to the left. That means that we discard all elements on the right of the middle index.

The tricky part that I encountered when solving this problem is about what I should return when I cannot find target inside the input array. I spent sometime to debug and fine-tune my logic to get my submission accepted by Leet Code Judge. Soon, I realized that if there is no target present inside the input array, the target's position would end up at the left pointer (`l`). How do I know that? Well, I need to trace the pointers by hand.

With that said, here is my solution for this easy question.

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