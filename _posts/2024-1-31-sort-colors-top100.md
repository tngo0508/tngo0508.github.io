---
layout: single
title: "Problem of The Day: Sort Colors"
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
Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

 

Example 1:

Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]
Example 2:

Input: nums = [2,0,1]
Output: [0,1,2]
 

Constraints:

n == nums.length
1 <= n <= 300
nums[i] is either 0, 1, or 2.
 

Follow up: Could you come up with a one-pass algorithm using only constant extra space?
```

# Intuition
The problem is known as the Dutch National Flag problem, where you are required to sort an array containing only three distinct values (0, 1, and 2). The intuition here is to use three pointers, representing the positions for the current red, white, and blue elements.

# Approach
*   Initialize three pointers: `r` for red, `w` for white, and `b` for blue.
*   Iterate through the array using the index `i`.
*   If `nums[i]` is equal to RED (0), swap it with the element at position `r`, and increment both `r` and `i`.
*   If `nums[i]` is equal to BLUE (2), swap it with the element at position `b`, and decrement `b`.
*   If `nums[i]` is equal to WHITE (1), increment `i` and `w`.
*   Continue this process until `i` crosses the position of the blue pointer.
*   At the end, the array will be sorted in the required order.

# Complexity
- Time complexity:
O(n)

- Space complexity:
O(1)

# Code
```python
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        RED, WHITE, BLUE = 0, 1, 2
        r, w, b = -1, -1,len(nums)
        i = 0
        while i < len(nums) and i < b:
            if nums[i] == RED:
                r += 1
                nums[i], nums[r] = nums[r], nums[i]
                i += 1
            elif nums[i] == BLUE:
                b -= 1
                nums[i], nums[b] = nums[b], nums[i]
            else:
                w += 1
                i += 1
```