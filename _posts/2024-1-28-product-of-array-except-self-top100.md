---
layout: single
title: "Problem of The Day: Product of Array Except Self"
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
Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.

 

Example 1:

Input: nums = [1,2,3,4]
Output: [24,12,8,6]
Example 2:

Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
```

# Intuition
The initial thought is to compute the product of all elements to the left and all elements to the right for each element in the array. By multiplying these two products, the algorithm can find the product of all elements except the one at the current position.

# Approach
The approach involves creating an array 'products' to store the products. The algorithm first populates 'products' with the products of all elements to the left of each position. It then iterates in reverse, updating the products by multiplying them with the products of all elements to the right. This two-pass approach efficiently computes the final product of all elements except the one at the current position. 

# Complexity
- Time complexity:
O(n), where n is the length of the input array. The algorithm performs two passes through the array, each taking linear time.

- Space complexity:
O(n) as the algorithm uses an additional array 'products' of the same length as the input array to store the intermediate products. 

# Code
```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        N = len(nums)
        products = nums[:]
        for i in range(1, N - 1):
            products[i] = products[i] * products[i - 1]
        
        curr = 1
        for i in reversed(range(N)):
            products[i] = (products[i - 1] if i - 1 >= 0 else 1) * curr 
            curr *= nums[i]
        
        return products
```

# Other Implementation - use 2 arrays left and right
```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        L = [1]
        for num in nums:
            L.append(L[-1] * num)

        R = [1]
        for num in reversed(nums):
            R.append(R[-1] * num)

        R.reverse()

        res = []
        for i in range(len(nums)):
            res.append(L[i] * R[i + 1])
        return res
```