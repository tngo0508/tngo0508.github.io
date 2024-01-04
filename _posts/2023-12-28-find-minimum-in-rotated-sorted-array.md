---
layout: single
title: "Problem of The Day: Find Minimum in Rotated Sorted Array"
date: 2023-12-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Top 100 Liked
  - Problem of The Day
---
# Problem Statement
Here is the description for this [problem](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/?envType=study-plan-v2&envId=top-100-liked).

For this problem, we are given the sorted rotated array of unique number around a random pivot that we do not know. Our job is to find the minimum number within this array with the O(log n) runtime. 

# My Explanation and Approach
The approach utilizes a modified binary search to efficiently narrow down the search space. To determine which part of the array to discard during the binary search, the condition `nums[i - 1] > nums[i] and nums[i] < nums[i + 1]` is checked. This condition identifies the target number, which is the minimum value in the array due to the sorted and rotated nature.

Additionally, determining which portion of the array (left or right) to discard is crucial for achieving the desired runtime. The key insight is leveraging the knowledge of the portion that is sorted in the right order. If the right portion is sorted correctly and the rotation occurs on the left, there's no need to continue the search on the right. In such cases, the right pointer is moved to the position `mid - 1`, assuming `mid` is the calculated index using the left and right pointers.

Handling edge cases, such as when the upper bound (`i+1`) and lower bound (`i-1`) are out of range (e.g., `[2,1]`), is addressed by adjusting the upper and lower bounds to values less or greater than the middle element by 1.  

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        l, r = 0, len(nums) - 1
        if nums[l] <= nums[r]:
            return nums[l]

        while l <= r:
            mid = l + (r - l) // 2
            lower = nums[mid - 1] if mid - 1 >= 0 else nums[mid] - 1
            upper = nums[mid + 1] if mid + 1 < len(nums) else nums[mid] + 1
            if lower > nums[mid] and nums[mid] < upper:
                return nums[mid]
            if nums[mid] < nums[r]:
                r = mid - 1
            else:
                l = mid + 1
        return nums[l]
```