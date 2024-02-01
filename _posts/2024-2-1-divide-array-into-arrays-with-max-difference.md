---
layout: single
title: "Problem of The Day: Divide Array Into Arrays With Max Difference"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
You are given an integer array nums of size n and a positive integer k.

Divide the array into one or more arrays of size 3 satisfying the following conditions:

Each element of nums should be in exactly one array.
The difference between any two elements in one array is less than or equal to k.
Return a 2D array containing all the arrays. If it is impossible to satisfy the conditions, return an empty array. And if there are multiple answers, return any of them.

 

Example 1:

Input: nums = [1,3,4,8,7,9,3,5,1], k = 2
Output: [[1,1,3],[3,4,5],[7,8,9]]
Explanation: We can divide the array into the following arrays: [1,1,3], [3,4,5] and [7,8,9].
The difference between any two elements in each array is less than or equal to 2.
Note that the order of elements is not important.
Example 2:

Input: nums = [1,3,3,2,7,3], k = 3
Output: []
Explanation: It is not possible to divide the array satisfying all the conditions.
```

# Intuition
The first thought was to use greedy algorithm to solve the problem. Sort and pick three elements and check for the constraint. If it does fit the constraint, return empty array.

# Approach
*   Sort the input array `nums`.
*   Iterate through the sorted array using a step of 3 (since each subarray can contain at most 3 elements).
*   For each iteration, start forming a subarray from the current position, and continue adding elements to it until the subarray has 3 elements or the difference between the last element and the current element is greater than `k`.
*   Check if the formed subarray satisfies the conditions. If it does, add it to the result.
*   Return the resulting list of subarrays.

# Complexity
- Time complexity:
O(n log n) due to the sorting operation.

- Space complexity:
O(1) as the additional space used is constant.

# Code
```python
class Solution:
    def divideArray(self, nums: List[int], k: int) -> List[List[int]]:
        nums.sort()
        res = []
        N = len(nums)

        for i in range(0, N, 3):
            arr = [nums[i]]
            j = i + 1
            while len(arr) < 3 and abs(nums[j] - arr[-1]) <= k:
                arr.append(nums[j])
                j += 1
            
            if len(arr) < 3:
                return []
            
            if abs(arr[0] - arr[-1]) > k:
                return []

            res.append(arr[:])        
        return res

```

# Editorial Solution
```python
class Solution:
    def divideArray(self, nums: List[int], k: int) -> List[List[int]]:
        nums.sort()
        ans = []
        for i in range(0, len(nums), 3):
            if nums[i + 2] - nums[i] > k:
                return []
            ans.append([nums[i], nums[i + 1], nums[i + 2]])
        return ans
```