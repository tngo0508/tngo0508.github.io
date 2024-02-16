---
layout: single
title: "Problem of The Day: Find Polygon With the Largest Perimeter"
date: 2024-2-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1481](/assets/images/2024-02-15_17-00-08-problem-1481.png)](/assets/images/2024-02-15_17-00-08-problem-1481.png)

## Intuition

My initial thought is to use a counter to keep track of the frequency of each number in the array.

## Approach

I'll start by creating a counter for the input array to get the frequency of each number. Then, I'll transform this counter into a list of tuples, where each tuple contains the frequency and the corresponding number. Sorting this list based on frequency allows me to prioritize removal of numbers with lower frequencies.

I'll iterate through the sorted list, deducting the frequency from k until I can't do so anymore. After that, I'll count the remaining unique integers with positive frequencies.

## Complexity

- Time complexity:
O(n * log(n)) due to the sorting step.

- Space complexity:
O(n) for storing the counter and the temporary list of tuples.

## Code

```python
class Solution:
    def findLeastNumOfUniqueInts(self, arr: List[int], k: int) -> int:
        counter = Counter(arr)
        temp = [(v, k) for k, v in counter.items()]
        temp.sort(key=lambda x:x[0])

        for freq, num in temp:
            if k < freq:
                break
            k -= freq
            counter[num] -= freq
        
        count = 0
        for k, v in counter.items():
            if v > 0:
                count += 1

        return count
```
