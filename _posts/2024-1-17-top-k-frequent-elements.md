---
layout: single
title: "Problem of The Day: Top K Frequent Elements"
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
Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.

 

Example 1:

Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
Example 2:

Input: nums = [1], k = 1
Output: [1]
 

Constraints:

1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4
k is in the range [1, the number of unique elements in the array].
It is guaranteed that the answer is unique.
```

# Intuition
The problem involves finding the k most frequent elements in an array. The intuition is to use a min-heap to keep track of the k most frequent elements encountered so far. By maintaining a heap of size k, we ensure that it only contains the k elements with the highest frequencies.

# Approach
I use a min-heap to store pairs of (frequency, element). As I iterate through the list of numbers, I count the frequency of each element using a Counter. For each element, I push its frequency and the element onto the heap. If the size of the heap exceeds k, I pop the element with the smallest frequency, ensuring that the heap always contains the k most frequent elements. At the end, I extract the elements from the heap and return them.

# Complexity
- Time complexity:
O(N log k) where N is the length of the input list 'nums'. The algorithm iterates through each element and performs heap operations which take O(log k)

- Space complexity:
O(k) as the min-heap contains at most k elements.

# Code
```python
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        min_heap = []
        num_freq = Counter(nums)
        for num, freq in num_freq.items():
            heapq.heappush(min_heap, (freq, num))
            if len(min_heap) > k:
                heapq.heappop(min_heap)
        return [num for _, num in min_heap]
                
```