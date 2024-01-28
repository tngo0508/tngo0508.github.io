---
layout: single
title: "Problem of The Day: Rotate Array"
date: 2024-1-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.

 

Example 1:

Input: nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]
Explanation:
rotate 1 steps to the right: [7,1,2,3,4,5,6]
rotate 2 steps to the right: [6,7,1,2,3,4,5]
rotate 3 steps to the right: [5,6,7,1,2,3,4]
Example 2:

Input: nums = [-1,-100,3,99], k = 2
Output: [3,99,-1,-100]
Explanation: 
rotate 1 steps to the right: [99,-1,-100,3]
rotate 2 steps to the right: [3,99,-1,-100]
```

# Intuition
The intuition for solving this problem is to perform a series of reversals on the array to achieve the desired rotation effect. By reversing the entire array, then reversing the first 'k' elements, and finally reversing the remaining elements, we effectively rotate the array to the right by 'k' steps. 

# Approach
The approach involves defining a helper function 'reverse' to reverse a subarray between indices 'l' and 'r'. Then, the main function first ensures that 'k' is within the bounds of the array length by taking the modulo operation. It then performs three reversals: first, reversing the entire array, second, reversing the first 'k' elements, and third, reversing the remaining elements. This sequence of reversals results in the desired array rotation.

# Complexity
- Time complexity:
O(n), where n is the length of the input array. The algorithm performs three reversals, each taking linear time.

- Space complexity:
O(1) as the algorithm uses a constant amount of extra space to perform the array rotations in-place without relying on additional data structures.

# Code
```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        def reverse(l, r, arr):
            l = 0 if l < 0 else l
            r = len(arr) - 1 if r >= len(arr) else r
            while l < r:
                arr[l], arr[r] = arr[r], arr[l]
                l += 1
                r -= 1
        
        l, r = 0, len(nums) - 1
        k = k % len(nums)
        reverse(l, r, nums)
        reverse(l, k - 1, nums)
        reverse(k, r, nums)
        
```

# Editorial Solution
## Approach 1: Brute Force
```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        # speed up the rotation
        k %= len(nums)

        for i in range(k):
            previous = nums[-1]
            for j in range(len(nums)):
                nums[j], previous = previous, nums[j]
```
- Time complexity: O(k * n)
## Approach 2: Using Extra Array
```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        a = [0] * n
        for i in range(n):
            a[(i + k) % n] = nums[i]
            
        nums[:] = a
```
## Approach 4: Using Reverse
```python
class Solution:
    def reverse(self, nums: list, start: int, end: int) -> None:
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start, end = start + 1, end - 1
                
    def rotate(self, nums: List[int], k: int) -> None:
        n = len(nums)
        k %= n

        self.reverse(nums, 0, n - 1)
        self.reverse(nums, 0, k - 1)
        self.reverse(nums, k, n - 1)
```