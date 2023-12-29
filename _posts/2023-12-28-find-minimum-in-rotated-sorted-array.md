---
layout: single
title: "Problem of The Day: Find Minimum in Rotated Sorted Array"
date: 2023-12-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
# Problem Statement
https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked

For this problem, we are given the sorted rotated array of unique number around a random pivot that we do not know. Our job is to find the minimum number within this array with the O(log n) runtime. 

# My Explanation and Approach
The idea of my approach is to use a modified version of Binary Search to cut the array in half and discard the unnecessary portion. The tricky part of the problem is how to figure out which part of the array to discard when applying the Binary Search algorithm. By observation, we see that the target number which is the minimum value will be the value between the two larger numbers exists in the input array. In order to find this number, we have to check for the condition `nums[i - 1] > nums[i] and nums[i] < nums[i + 1]` because the array is sorted and rotated. In addition, we also want to know which portion of the array (left or right) needs to be discard in order to achieve the desired runtime. To do this, we need to find which portion is in the sorted order and use this knowledge for our advantage. The key idea is that the portion sorted in the right order will tell us how to move our pointers to the correct position. For example, if we know the right portion of the array is in the right order and the rotation happens on the left portion, this tells us that there is no need to run our search on the right portion anymore since our goal is to find the minimum value in the array. It would be fruitless to perform the search on the larger portion of the array. That means that we need to move the right pointer to the position `mid - 1` assume that we calculated the `mid` index using left pointer and right pointer.

Besides, when I attempted to submit my solution, I ran into some edge cases such as `[2,1]` where the upper bound (`i+1`) and lower bound (`i-1`) are out of range. To handle these situation, I use the simple trick to set my upper bound and lower bound to value less or greater than my middle element by 1.  

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        l, r = 0, len(nums) - 1
        if nums[l] <= nums[r]:
            return nums[l]

        while l <= r:
            mid = l + (r - l) // 2
            lower = nums[mid - 1] if mid - 1 >= 0 else nums[mid] - 1
            upper = nums[mid + 1] if mid + 1 < len(nums) else nums[mid] + 1
            if lower > nums[mid] and nums[mid] < upper:
                return nums[mid]
            if nums[mid] < nums[r]:
                r = mid - 1
            else:
                l = mid + 1
        return nums[l]
```