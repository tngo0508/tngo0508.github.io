---
layout: single
title: "Problem of The Day: Move Zeroes"
date: 2024-1-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.

Note that you must do this in-place without making a copy of the array.

 

Example 1:

Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]
Example 2:

Input: nums = [0]
Output: [0]
```

# Intuition
My initial thoughts on how to solve this problem revolve around efficiently moving non-zero elements to the beginning of the array while keeping track of the count of zeros encountered.

# Approach
My approach involves iterating through the array, maintaining two pointers (start and end). I use the start pointer to place non-zero elements at the beginning of the array. As I encounter zero elements, I increment a count variable to keep track of the number of zeros. After the first pass, I iterate again to fill the remaining positions with zeros based on the count.

# Complexity
- Time complexity:
O(n), where n is the length of the input array. This is because we perform two passes through the array, and each pass involves constant time operations.

- Space complexity:
O(1) as we modify the input array in-place without using any additional space that scales with the input size. 

# Code
```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        start = end = 0
        count = 0
        for end in range(len(nums)):
            if nums[end] == 0:
                count += 1
                continue
            nums[start] = nums[end]
            start += 1
        
        i = -1
        while count > 0:
            nums[i] = 0
            i -= 1
            count -= 1
            

```

# Clean and Optimized Solution
```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        idx=0
        for i in range(len( nums)):
            if nums[i]!=0:
                nums[i],nums[idx]=nums[idx],nums[i]
                idx+=1
        return nums
```