---
layout: single
title: "Problem of The Day: Maximum Odd Binary Number"
date: 2024-2-29
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2864](/assets/images/2024-02-29_18-15-21-problem-2864.png)](/assets/images/2024-02-29_18-15-21-problem-2864.png)

## Intuition

The problem requires finding the maximum odd binary number by flipping at most one '0' bit. To maximize the value, it's intuitive to set the rightmost '1' bit and then try to set as many '1' bits to the left of it as possible.

## Approach

 begin by counting the occurrences of '1' in the given binary string `s` using a Counter. If there is at least one '1' in the string, I proceed to construct the maximum odd binary number.

I initialize a result list `res` of the same length as the input string, filled with '0'. I set the rightmost bit of `res` to '1' since it's the least significant bit in an odd binary number. I then iterate through the string to set as many '1' bits to the left as possible, reducing the count of available '1' bits in the Counter.

If there are no '1' bits in the string, I return the original string as it is already an even binary number

## Complexity

- Time complexity:
O(n), where n is the length of the input string `s`. The algorithm iterates through the string once.

- Space complexity:
O(n), where n is the length of the input string `s`. The space is used for the result list.

## Code

```python
class Solution:
    def maximumOddBinaryNumber(self, s: str) -> str:
        counter = Counter(s)
        if counter['1'] > 0:
            N = len(s)
            res = ['0'] * N
            res[-1] = '1'
            counter['1'] -= 1
            i = 0
            while counter['1'] > 0:
                res[i] = '1'
                counter['1'] -= 1
                i += 1
            return ''.join(res)
        return s
```
