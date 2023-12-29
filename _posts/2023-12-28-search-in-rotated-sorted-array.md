---
layout: single
title: "Problem of The Day: Search In Rotated Sorted Array"
date: 2023-12-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
Today, I focused on practicing the Binary Search Topic. I tackled the problem called Search In Rotate Sorted Array. Even though, I had already attempted to solve and see the solution for this problem multiple times, I found myself still struggling really hard to implement the optimize solution for this problem. It took me more than 2 hours to implement and fine-tune my logic to bypass all the edge cases. I hope that after I finished writing my explanation and approach in this post. This problem will be in the back of pocket and I could articulate the solution in my head. So, let's get into it.

# Problem Statement
```
There is an integer array nums sorted in ascending order (with distinct values).

Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]] (0-indexed). For example, [0,1,2,4,5,6,7] might be rotated at pivot index 3 and become [4,5,6,7,0,1,2].

Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.

You must write an algorithm with O(log n) runtime complexity.

 

Example 1:

Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
Example 2:

Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
Example 3:

Input: nums = [1], target = 0
Output: -1
```

# My Explanation and Approach
As mentioned above, we are using the Binary Search algorithm to handle this problem. The tricky part about this problem is that the array is rotated and we do not know where the rotated pivot happened. It is very confusing to apply the Binary Search at the first sight. The basic idea to approach this problem is to modify the conditions of Binary Search to discard the left partition or right partition in order to narrow down the search space in O(log n) time efficiency. 

Basically, the algorithm employed the basic idea of the Binary Search using the left and right pointers to find the middle index. If we find the middle element is the target that we are looking for, we just simply return the middle index. Otherwise, we need to decide that if we want to search on the left or right of the input array. So the question is how do we pick the partition that we want to search? To answer this, first we need to find out which partition is in correct sorted order. Why? Because by doing this, it will help us to simplify our decision making to move our left and right pointers. In fact, we just need to know that if the target exist inside the sorted partition or not. If it does exists in the sorted partition, we simply apply the normal binary search on this partition. Otherwise, we need to reverse the logic to move the pointers properly.

Here is my thought process. When I look at the array, I use the condition `nums[mid] > nums[l]` to determine if my left partition is sorted. If it's sorted and the target inside this partition, then I want to discard the right partition by moving the right pointer toward the left. That means that I need to move the right pointer to `mid - 1` position. Otherwise, I need to move my left pointer to `mid + 1`. Likewise, I apply the same logic for the condition when my right partition is sorted and move the pointers to proper position.

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = l + (r - l) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] > nums[l]:
                if mid - 1 >= l and nums[l] <= target <= nums[mid - 1]:
                    r = mid - 1
                else:
                    l = mid + 1
            else:
                if mid + 1 <= r and nums[mid + 1] <= target <= nums[r]:
                    l = mid + 1
                else:
                    r = mid - 1 
        return -1
```