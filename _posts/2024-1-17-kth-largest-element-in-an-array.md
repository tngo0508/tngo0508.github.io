---
layout: single
title: "Problem of The Day:  Kth Largest Element In An Array"
date: 2024-1-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an integer array nums and an integer k, return the kth largest element in the array.

Note that it is the kth largest element in the sorted order, not the kth distinct element.

Can you solve it without sorting?

 

Example 1:

Input: nums = [3,2,1,5,6,4], k = 2
Output: 5
Example 2:

Input: nums = [3,2,3,1,2,4,5,5,6], k = 4
Output: 4
```

# Intuition
The problem involves finding the kth largest element in an array. The intuition here is to use a min-heap to keep track of the k largest elements encountered so far. By maintaining a heap of size k, we ensure that it only contains the k largest elements at any given time.

# Approach
I use a min-heap to store the elements. As I iterate through the list of numbers, I push each element onto the heap. If the size of the heap exceeds k, I pop the smallest element, ensuring that the heap always contains the k largest elements. At the end, the root of the heap will be the kth largest element.

# Complexity
- Time complexity:
O(N log k) where N is the length of the input list 'nums'. The algorithm iterates through each element and performs heap operations which take O(log k)

- Space complexity:
O(k) as the min-heap contains at most k elements.

# Code
```python
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        min_heap = []
        for num in nums:
            heapq.heappush(min_heap, num)
            if len(min_heap) > k:
                heapq.heappop(min_heap)
        return min_heap[0]
```