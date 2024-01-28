---
layout: single
title: "Problem of The Day: Single Number"
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
Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

 

Example 1:

Input: nums = [2,2,1]
Output: 1
Example 2:

Input: nums = [4,1,2,1,2]
Output: 4
Example 3:

Input: nums = [1]
Output: 1
```

# Intuition
There are multiple ways to solve this question. Two solutions are appealing to me are hash map and bit manipulation.
For this post, I utilize the XOR operation to find the single number in the array. The XOR operation cancels out duplicate numbers, leaving only the unique one.

# Approach
The approach involves using a variable 'res' initialized to 0. Iterate through the array and perform the XOR operation with each element. Since XORing a number with itself results in 0, the duplicate numbers cancel out, leaving only the unique number in 'res'.

# Complexity
- Time complexity:
O(n), where n is the length of the input array. The algorithm iterates through the entire array once.

- Space complexity:
The space complexity is O(1) as the algorithm uses a constant amount of space to store the 'res' variable without relying on additional data structures that scale with the input size.

# Code
```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for num in nums:
            res = res ^ num
        
        return res
```

# Hash Map Approach
```python
from collections import defaultdict
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        hash_table = defaultdict(int)
        for i in nums:
            hash_table[i] += 1
        
        for i in hash_table:
            if hash_table[i] == 1:
                return i
```
- Time complexity: O(n)
- Space complexity: O(n)