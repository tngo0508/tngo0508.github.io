---
layout: single
title: "Problem of The Day: Count Elements With Maximum Frequency"
date: 2024-3-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-3005](/assets/images/2024-03-07_21-10-59-problem-3005.png)

## Intuition

My initial thoughts are to iterate through the list, keep track of the frequency of each element, and find the maximum frequency.

## Approach

I'll use a `defaultdict` to store the frequency of each element. While iterating through the list, I'll update the frequency count. After that, I'll find the maximum frequency and iterate through the frequency dictionary again to count the number of elements with that frequency.

## Complexity

- Time complexity:
  O(n) where n is the length of the input list. We iterate through the list once to calculate frequencies and then again to find elements with the maximum frequency.

- Space complexity:
  O(n) as we use a defaultdict to store the frequency of each element.

## Code

```python
class Solution:
    def maxFrequencyElements(self, nums: List[int]) -> int:
        freq = defaultdict(int)
        curr_max = 0
        for num in nums:
            freq[num] += 1
            curr_max = max(freq[num], curr_max)


        res = 0
        for value in freq.values():
            if value == curr_max:
                res += value
        return res
```
