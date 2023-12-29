---
layout: single
title: "Problem of The Day: Search In Rotated Sorted Array"
date: 2023-12-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
Today, my primary focus was on honing my skills in Binary Search, and I decided to tackle the problem known as "Search in Rotated Sorted Array." Despite making multiple attempts to solve and even reviewing the solution, I still encountered significant challenges in implementing the optimized solution. It took me over 2 hours to refine my logic and address all the edge cases.

I am hopeful that, after completing this post and thoroughly explaining my approach, I will be able to internalize the solution. Ideally, I aim to have this problem stored in the back of my mind, allowing me to articulate the solution confidently. So, let's delve into it.

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
As previously mentioned, we are applying the Binary Search algorithm to address the challenges posed by the "Search in Rotated Sorted Array" problem. The complexity arises from the array being rotated, making it initially unclear how to apply Binary Search effectively. The fundamental approach involves adapting the Binary Search conditions to eliminate either the left or right partition, thereby efficiently narrowing down the search space in O(log n) time.

The algorithm follows the basic Binary Search idea, utilizing left and right pointers to determine the middle index. If the middle element is the target, we simply return the middle index. Otherwise, we must decide whether to search the left or right side of the input array. The key question is how to choose the partition for the search. To answer this, we first identify which partition is correctly sorted. Knowing this helps simplify the decision-making process for moving the left and right pointers. Essentially, we only need to ascertain whether the target exists within the sorted partition or not. If it does, we can proceed with a regular binary search on this partition. Otherwise, we adjust the logic to move the pointers appropriately.

My thought process involves examining the array and using the condition `nums[mid] > nums[l]` to determine if the left partition is sorted. If it is sorted and the target is within this partition, we discard the right partition by moving the right pointer to the left `mid - 1`. Otherwise, we move the left pointer to `mid + 1`. The same logic is applied when the right partition is sorted, adjusting the pointers accordingly.

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