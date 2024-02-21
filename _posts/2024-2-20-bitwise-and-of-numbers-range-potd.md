---
layout: single
title: "Problem of The Day: Bitwise AND of Numbers Range"
date: 2024-2-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-201](/assets/images/2024-02-20_23-53-37-problem-201.png)](/assets/images/2024-02-20_23-53-37-problem-201.png)

>Need to review this problem again.

## Brute Force - TLE

```python
# Brute force - TLE
class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        res = left
        while left < right:
            left += 1
            res &= left
            if res == 0:
                return 0
        return res
```

## Approach 1: Bit Shift

```python
class Solution:
    def rangeBitwiseAnd(self, m: int, n: int) -> int:
        shift = 0   
        # find the common 1-bits
        while m < n:
            m = m >> 1
            n = n >> 1
            shift += 1
        return m << shift
```

## Approach 2: Brian Kernighan's Algorithm

```python
class Solution:
    def rangeBitwiseAnd(self, m: int, n: int) -> int:
        while m < n:
            # turn off rightmost 1-bit
            n = n & (n - 1)
        return m & n
```
