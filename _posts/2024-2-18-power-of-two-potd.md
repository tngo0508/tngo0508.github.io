---
layout: single
title: "Problem of The Day: Power of Two"
date: 2024-2-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-231](/assets/images/2024-02-18_20-53-38-problem-231.png)](/assets/images/2024-02-18_20-53-38-problem-231.png)

>The problem is easy for while-loop or recursion, but the trick here is to learn about the bitwise operation that can run in O(1) time complexity

## Brute force

```python
class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        while n > 1:
            n = n / 2
        return n == 1
```

## No loop/recursion with library

```python
class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        if n < 0:
            return False
        return bin(n).count("1") == 1
```

## Approach 1: Bitwise Operators: Get the Rightmost 1-bit

The important idea is that `x & (-x)` is a way to keep the rightmost 1-bit and to set all the other bits to 0. This works because of [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement). One can interpret this statement as the followings. Note `~`
means negate the number.

```text
-x is equivalent to ~x + 1. 
```

This operation reverts all bits of x except the rightmost 1-bit.

Explanation:

* The expression x & (-x) isolates the rightmost 1-bit in the binary representation of x.
* In two's complement notation, -x is equivalent to ~x + 1. So, x & (-x) essentially keeps only the rightmost 1-bit and sets all other bits to 0.
* This is because adding 1 to ~x in binary representation carries the 1-bit to the rightmost 0-bit in ~x, effectively preserving the rightmost 1-bit in x.

Detection of Power of Two:

* A power of two contains only one 1-bit in its binary representation.
* Therefore, if x & (-x) equals x, it implies that x has only one 1-bit, indicating it is a power of two.

```python
class Solution(object):
    def isPowerOfTwo(self, n):
        if n == 0:
            return False
        return n & (-n) == n
```

## Approach 2: Bitwise operators: Turn off the Rightmost 1-bit

**Explanation:**

* When you subtract 1 from a number x, it changes the rightmost 1-bit in x to 0 and sets all the lower bits to 1.
* Using the AND operator with x and (x - 1) will turn off the rightmost 1-bit because 1 & 0 results in 0. Additionally, all lower bits are set to 0 due to the subtraction.

**Detection of Power of Two:**

* A power of two has only one 1-bit in its binary representation.
* If x & (x - 1) equals 0, it means the rightmost 1-bit has been turned off.
* Thus, x is a power of two.

```python
class Solution(object):
    def isPowerOfTwo(self, n):
        if n == 0:
            return False
        return n & (n - 1) == 0
```
