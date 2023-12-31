---
layout: single
title: "Problem of The Day: Find First And Last Position of Element In Sorted Array"
date: 2023-12-29
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
```
Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

If target is not found in the array, return [-1, -1].

You must write an algorithm with O(log n) runtime complexity.

 

Example 1:

Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]
Example 2:

Input: nums = [5,7,7,8,8,10], target = 6
Output: [-1,-1]
Example 3:

Input: nums = [], target = 0
Output: [-1,-1]
```

# My Explanation and Approach
In my algorithm, I'm searching for a target value in the sorted list `nums` using a binary search approach to efficiently find the leftmost and rightmost occurrences of the target. I've crafted a helper function named `binary_search` to carry out the binary search, and it now takes an extra parameter, `left_most`, to determine whether I'm seeking the leftmost or rightmost occurrence. Beginning with the entire list, I progressively narrow down the search range until I locate the target. Ultimately, I return a list containing the indices of the leftmost and rightmost occurrences of the target in the original list. In the interest of simplicity, if the target is not found, I return [-1, -1]. Moreover, I've streamlined the code by consolidating the logic for both leftmost and rightmost searches within a single function, making it more concise and maintainable.

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def binary_search(nums, target, left_most = True):
            l, r = 0, len(nums) - 1
            found = False
            while l <= r:
                mid = l + (r - l) // 2
                
                if left_most:
                    if nums[mid] >= target:
                        r = mid - 1
                        re = mid
                    else:
                        l = mid + 1
                else:
                    if nums[mid] <= target:
                        l = mid + 1
                        re = mid
                    else:
                        r = mid - 1
                
                if nums[mid] == target:
                    found = True
            
            if found:
                return re
            return -1

        L = binary_search(nums, target, True)
        R = binary_search(nums, target, False)
        return [L, R]
```

# Leet Code Solution
```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        
        lower_bound = self.findBound(nums, target, True)
        if (lower_bound == -1):
            return [-1, -1]
        
        upper_bound = self.findBound(nums, target, False)
        
        return [lower_bound, upper_bound]
        
    def findBound(self, nums: List[int], target: int, isFirst: bool) -> int:
        
        N = len(nums)
        begin, end = 0, N - 1
        while begin <= end:
            mid = int((begin + end) / 2)    
            
            if nums[mid] == target:
                
                if isFirst:
                    # This means we found our lower bound.
                    if mid == begin or nums[mid - 1] < target:
                        return mid

                    # Search on the left side for the bound.
                    end = mid - 1
                else:
                    
                    # This means we found our upper bound.
                    if mid == end or nums[mid + 1] > target:
                        return mid
                    
                    # Search on the right side for the bound.
                    begin = mid + 1
            
            elif nums[mid] > target:
                end = mid - 1
            else:
                begin = mid + 1
        
        return -1
```