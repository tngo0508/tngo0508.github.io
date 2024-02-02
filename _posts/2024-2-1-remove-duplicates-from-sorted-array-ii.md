---
layout: single
title: "Problem: Remove Duplicates from Sorted Array II"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

# Problem Statement
```
Given an integer array nums sorted in non-decreasing order, remove some duplicates in-place such that each unique element appears at most twice. The relative order of the elements should be kept the same.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the first part of the array nums. More formally, if there are k elements after removing the duplicates, then the first k elements of nums should hold the final result. It does not matter what you leave beyond the first k elements.

Return k after placing the final result in the first k slots of nums.

Do not allocate extra space for another array. You must do this by modifying the input array in-place with O(1) extra memory.

Example 1:

Input: nums = [1,1,1,2,2,3]
Output: 5, nums = [1,1,2,2,3,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 1, 1, 2, 2 and 3 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).
Example 2:

Input: nums = [0,0,1,1,1,1,2,3,3]
Output: 7, nums = [0,0,1,1,2,3,3,_,_]
Explanation: Your function should return k = 7, with the first seven elements of nums being 0, 0, 1, 1, 2, 3 and 3 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).
```

# Intuition
use two pointers and a counter to keep track of the requirements and replacements.

# Approach
I used two pointers, `k` and `i`, to iterate through the array. The pointer `k` points to the current position where the modified array is being constructed, and `i` is used for traversal. I also maintained a `count` variable to track the number of occurrences of the current element.

I iterated through the array, and whenever I encountered a new element or the current element's count exceeded two, I adjusted the array accordingly by copying the required number of occurrences. This ensured that the modified array satisfied the condition of having at most two occurrences of each unique element.

# Complexity
- Time complexity:
O(n) where n is the length of the input array.

- Space complexity:
O(1) as the modification is done in-place without using any additional space.

# Code
```python
class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        k = 0
        count = 0
        for i in range(len(nums)):
            val = nums[i]
            if nums[k] != nums[i]:
                count = count if count < 3 else 2
                while count > 0:
                    k += 1
                    nums[k] = nums[k - 1]
                    count -= 1
                count = 0
            nums[k] = val
            count += 1

        count = count if count < 3 else 2
        while count > 0:
            k += 1
            if k - 1 < 0 or k >= len(nums):
                break
            nums[k] = nums[k - 1]
            count -= 1
        return k
```

# Editorial Solution
```python
class Solution(object):
    def removeDuplicates(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        
        # Initialize the counter and the second pointer.
        j, count = 1, 1
        
        # Start from the second element of the array and process
        # elements one by one.
        for i in range(1, len(nums)):
            
            # If the current element is a duplicate, 
            # increment the count.
            if nums[i] == nums[i - 1]:
                count += 1
            else:
                # Reset the count since we encountered a different element
                # than the previous one
                count = 1
            
            # For a count <= 2, we copy the element over thus
            # overwriting the element at index "j" in the array
            if count <= 2:
                nums[j] = nums[i]
                j += 1
                
        return j
```
