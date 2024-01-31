---
layout: single
title: "Problem of The Day: Next Permutation"
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
A permutation of an array of integers is an arrangement of its members into a sequence or linear order.

For example, for arr = [1,2,3], the following are all the permutations of arr: [1,2,3], [1,3,2], [2, 1, 3], [2, 3, 1], [3,1,2], [3,2,1].
The next permutation of an array of integers is the next lexicographically greater permutation of its integer. More formally, if all the permutations of the array are sorted in one container according to their lexicographical order, then the next permutation of that array is the permutation that follows it in the sorted container. If such arrangement is not possible, the array must be rearranged as the lowest possible order (i.e., sorted in ascending order).

For example, the next permutation of arr = [1,2,3] is [1,3,2].
Similarly, the next permutation of arr = [2,3,1] is [3,1,2].
While the next permutation of arr = [3,2,1] is [1,2,3] because [3,2,1] does not have a lexicographical larger rearrangement.
Given an array of integers nums, find the next permutation of nums.

The replacement must be in place and use only constant extra memory.

 

Example 1:

Input: nums = [1,2,3]
Output: [1,3,2]
Example 2:

Input: nums = [3,2,1]
Output: [1,2,3]
Example 3:

Input: nums = [1,1,5]
Output: [1,5,1]
 

Constraints:

1 <= nums.length <= 100
0 <= nums[i] <= 100
```

# Intuition
The intuition is to find the rightmost pair of adjacent elements such that `nums[i] < nums[i+1]`. Once this pair is found, swap `nums[i]` with the smallest element in the subarray `nums[i+1:]` that is greater than `nums[i]`. Finally, sort the subarray `nums[i+1:]` in ascending order to get the smallest possible lexicographically greater permutation.

# Approach
*   Find the rightmost pair of adjacent elements such that `nums[i] < nums[i+1]`.
*   If no such pair is found, it means the array is in descending order, and we should reverse the entire array to get the smallest lexicographically permutation.
*   Otherwise, find the smallest element in the subarray `nums[i+1:]` that is greater than `nums[i]` and swap them.
*   Sort the subarray `nums[i+1:]` to get the smallest possible lexicographically greater permutation.

# Complexity
- Time complexity:
O(nlogn), where nnn is the length of the input list `nums`. The dominating factor is the sorting operation.

- Space complexity:
O(1), as the algorithm modifies the input list in-place and uses only a constant amount of extra space.

# Code
```python
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        N = len(nums)
        end  = N - 1
        while end > 0 and nums[end] <= nums[end - 1]:
            end -= 1
        
        start = end
        while start < N and nums[start] > nums[end - 1]:
            start += 1
        
        # print(nums, start, end)
        nums[start - 1], nums[end - 1] = nums[end - 1], nums[start - 1]
        nums[end:] = sorted(nums[end:])

        
```