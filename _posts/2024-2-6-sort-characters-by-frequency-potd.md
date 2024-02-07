---
layout: single
title: "Problem of The Day: Sort Characters By Frequency"
date: 2024-2-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-451](/assets/images/2024-02-06_19-21-10-problem-451.png)

## Intuition

My initial thought is to utilize a frequency-based sorting approach. By counting the frequency of each character in the string, I can then sort them based on their frequencies in descending order.

## Approach

To solve the problem, I'll start by counting the frequency of each character in the given string using a `Counter`. Then, I'll transform the counter items into a list of list, where each list contains the character and its frequency. After that, I'll sort this list in descending order based on the frequencies. Finally, I'll reconstruct the string by concatenating characters according to their frequencies in the sorted list.

## Complexity

- Time complexity:

  - Counting the frequency of characters takes O(n) time.
  - Sorting the list of tuples takes O(n log n) time.
  - Constructing the result string takes O(n) time.
  - Hence, the overall time complexity is O(n log n).

- Space complexity:
  O(n), where n is the length of the input string. This is because we're storing the frequency of each character and constructing the result string.

## Code

```python
class Solution:
    def frequencySort(self, s: str) -> str:
        counter_s = Counter(s)
        arr = []
        for c, freq in counter_s.items():
            arr.append([freq, c])

        arr.sort(reverse=True)
        res = []
        for freq, c in arr:
            res.append(c * freq)

        return ''.join(res)
```
