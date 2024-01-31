---
layout: single
title: "Problem of The Day: First Missing Positive"
date: 2024-1-31
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an unsorted integer array nums, return the smallest missing positive integer.

You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.

 

Example 1:

Input: nums = [1,2,0]
Output: 3
Explanation: The numbers in the range [1,2] are all in the array.
Example 2:

Input: nums = [3,4,-1,1]
Output: 2
Explanation: 1 is in the array but 2 is missing.
Example 3:

Input: nums = [7,8,9,11,12]
Output: 1
Explanation: The smallest positive integer 1 is missing.

```

# Intuition
The intuition is to use the array itself as a way to keep track of which positive integers are present. We can do this by modifying the array in-place.


# Approach
*   First, check if 1 is present in the array. If not, the smallest missing positive integer is 1.
*   Iterate through the array and replace any non-positive or greater than `N` values with 1, as they won't affect the result.
*   Iterate through the array again and use the values as indices to mark the presence of positive integers. For each positive integer `val`, mark `nums[val]` as negative.
*   Iterate through the array starting from index 1. The first positive index encountered is the smallest missing positive integer.
*   If no positive index is encountered, the missing positive integer is `N + 1`.
*   If `nums[0]` is positive, return `N`, as it means `N` is the smallest missing positive integer.

# Complexity
- Time complexity:
O(n)

- Space complexity:
O(1)

# Code
```python
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        N = len(nums)
        if 1 not in nums:
            return 1
        
        for i in range(N):
            if nums[i] <= 0 or nums[i] > N:
                nums[i] = 1
        
        for i in range(N):
            val = abs(nums[i])
            if val == N:
                nums[0] = -abs(nums[0])
            else:
                nums[val] = -abs(nums[val])
        
        for i in range(1, N):
            if nums[i] > 0:
                return i

        if nums[0] > 0:
            return N
        
        return N + 1

```