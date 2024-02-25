---
layout: single
title: "Problem of The Day: Contains Duplicate II"
date: 2024-2-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-219](/assets/images/2024-02-25_14-53-37-problem-219.png)](/assets/images/2024-02-25_14-53-37-problem-219.png)

## Intuition

My initial thoughts are to use a hash map to keep track of the indices of the numbers in the list. This way, we can quickly check if a number has been seen before and if the difference in indices is within the allowed range.

## Approach

I will iterate through the list of numbers, and for each number, I will check if it is already in the hash map. If it is, I will calculate the difference between the current index and the index stored in the hash map. If this difference is less than or equal to k, I will return True, as we have found two indices that satisfy the conditions. Otherwise, I will update the hash map with the current index for the current number.

If the loop completes without finding such indices, I will return False.

## Complexity

- Time complexity:
O(n) - We iterate through the list once.

- Space complexity:
O(n) - The space complexity is determined by the size of the hash map, which can have at most n entries.

## Code

```python
class Solution:
    def containsNearbyDuplicate(self, nums: List[int], k: int) -> bool:
        hash_map = defaultdict(int)
        for i, num in enumerate(nums):
            if num in hash_map and i - hash_map[num] <= k:
                return True
            hash_map[num] = i
        return False
```
