---
layout: single
title: "Problem of The Day: Happy Number"
date: 2024-2-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-228](/assets/images/2024-02-26_18-41-17-problem-228.png)](/assets/images/2024-02-26_18-41-17-problem-228.png)

## Intuition

The idea is likely to iterate through the list and identify consecutive ranges of numbers.

## Approach

My approach is to iterate through the list of numbers while keeping track of the start and end of each range. If the current number is not consecutive to the previous one, I'll add the range to the result list. I'll handle the case where a range has only one element separately.

## Complexity

- Time complexity:
O(n)

- Space complexity:
O(n)

## Code

```python
class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        if not nums:
            return []
        res = []
        N = len(nums)
        start = 0
        end = 1
        for end in range(1, N):
            if nums[end] != nums[end - 1] + 1:
                if start != end - 1:
                    res.append(str(nums[start]) + "->" + str(nums[end - 1]))
                else:
                    res.append(str(nums[start]))
                start = end
        
        if start != end and end < len(nums):
            res.append(str(nums[start]) + "->" + str(nums[end]))
        else:
            res.append(str(nums[start]))
        return res

```

## Editorial Solution

Approach: Fix Left Bound

```python
class Solution:
    def summaryRanges(self, nums: List[int]) -> List[str]:
        ranges = []     
        i = 0 
        
        while i < len(nums): 
            start = nums[i]  
            while i + 1 < len(nums) and nums[i] + 1 == nums[i + 1]: 
                i += 1 
            
            if start != nums[i]: 
                ranges.append(str(start) + "->" + str(nums[i]))
            else: 
                ranges.append(str(nums[i]))
            
            i += 1

        return ranges
```

- Time complexity: O(n)
- Space complexity: O(n)
