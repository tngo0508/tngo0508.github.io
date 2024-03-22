---
layout: single
title: "Problem of The Day: Contiguous Array"
date: 2024-3-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-525](/assets/images/2024-03-21_21-10-53-problem-525.png)

> need to review this problem again.

## Solution

### Using hash map

The approach involves traversing the input array and maintaining a running sum of zeros and ones encountered so far. We'll use a hash map to store the running sum along with the index at which it was first encountered. By checking if the current running sum has been encountered before, we can determine if a subarray with equal numbers of zeros and ones exists between the current index and the index stored in the hash map. If it does, we update the result accordingly by calculating the length of the subarray. Finally, we return the maximum length encountered.

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        hash_map = {0:-1}
        res = 0
        curr_sum = 0
        for i, num in enumerate(nums):
            curr_sum += (-1 if num == 0 else 1)
            if curr_sum in hash_map:
                res = max(res, i - hash_map[curr_sum])
            else:
                hash_map[curr_sum] = i
        return res
```

- Time complexity: O(n)
- Space complexity: O(n)

### Other Implementation

```python
class Solution:
    def findMaxLength(self, nums: List[int]) -> int:
        zero, one, max_len = 0, 0, 0
        num_dict = {0: -1} # {diff: index}
        for i in range(0, len(nums)):
            if nums[i] == 0:
                zero += 1
            else:
                one += 1
            diff = zero - one

            if diff in num_dict:
                max_len = max(i - num_dict[diff], max_len)
            else:
                num_dict[diff] = i

        return max_len
```
