---
layout: single
title: "Problem of The Day: Binary Subarrays With Sum"
date: 2024-3-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-930](/assets/images/2024-03-13_19-01-52-problem-930.png)](/assets/images/2024-03-13_19-01-52-problem-930.png)

## Brute Force - TLE

```python
class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        N = len(nums)
        res = 0
        for i in range(N):
            curr_sum = 0
            for j in range(i, N):
                curr_sum += nums[j]
                if curr_sum == goal:
                    res += 1

        return res
```

- Time complexity: O(n^2)
- Space complexity: O(1)

## Prefix Sum/Hash map Approach

### Intuition

My thought is to utilize a sliding window approach combined with prefix sums to efficiently count the number of subarrays with a given sum.

### Approach

I'll maintain a running sum as I iterate through the array. At each step, I'll check if the current sum equals the target sum. If it does, I'll increment the count of valid subarrays. Additionally, I'll keep track of the frequency of prefix sums encountered so far. If the difference between the current sum and the target sum has been seen before, I'll add the corresponding frequency to the count of valid subarrays.

### Complexity

- Time complexity:
  O(n) where n is the length of the input array. We traverse the array once.

- Space complexity:
  O(n) where n is the length of the input array. We use a dictionary to store the frequency of prefix sums encountered.

### Code

```python
class Solution:
    def numSubarraysWithSum(self, nums: List[int], goal: int) -> int:
        N = len(nums)
        res = 0
        curr_sum = 0
        prefix_sum = defaultdict(int)
        for i, num in enumerate(nums):
            curr_sum += num
            if curr_sum == goal:
                res += 1
            if curr_sum - goal in prefix_sum:
                res += prefix_sum[curr_sum - goal]
            prefix_sum[curr_sum] += 1

        return res
```
