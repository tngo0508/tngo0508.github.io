---
layout: single
title: "Problem of The Day: Sum of Square Numbers"
date: 2024-6-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-633](/assets/images/2024-06-16_18-08-19-problem-633.png)

## Intuition

<!-- Describe your first thoughts on how to solve this problem. -->

The problem is to determine if a given number `c` can be expressed as the sum of two squares. This can be approached by checking each possible pair of squares up to the square root of `c`.

## Approach

<!-- Describe your approach to solving the problem. -->

1. Calculate the integer square root of `c`.
2. Create an array `arr` containing the squares of all integers from 0 to the square root of `c`.
3. Iterate through `arr` and use a set to keep track of seen squares.
4. For each square, calculate its complement with respect to `c`. If the complement is already in the set, return `True` since it means `c` can be expressed as the sum of two squares.
5. If no such pair is found, return `False`.

## Complexity

- Time complexity:  
  $$O(n)$$  
  Where `n` is the integer square root of `c`. The approach involves iterating up to the square root of `c` and performing set operations which are on average O(1).

- Space complexity:  
  $$O(n)$$  
  An array and a set are used to store the squares and seen numbers, respectively, up to the square root of `c`.

## Code

```python
class Solution:
    def judgeSquareSum(self, c: int) -> bool:
        mid = int(c ** (1/2))
        arr = []
        for i in range(mid + 1):
            arr.append(i ** 2)
            arr.append(i ** 2) # add this since same number can be reused

        seen = set()
        for i, num in enumerate(arr):
            complement = c - num
            if complement in seen:
                return True
            seen.add(num)

        return False

```

## From Discussion

```python
class Solution:
    def judgeSquareSum(self, c: int) -> bool:
        m = int(math.sqrt(c))
        l, r = 0, m
        while l<=r:
            s = l*l + r*r
            if s == c: return True
            elif s < c:
                l += 1
            else:
                r -= 1
        return False
```

## Editorial

## Brute Force - O(1) space

```java
public class Solution {
    public boolean judgeSquareSum(int c) {
        for (long a = 0; a * a <= c; a++) {
            int b =  c - (int)(a * a);
            int i = 1, sum = 0;
            while (sum < b) {
                sum += i;
                i += 2;
            }
            if (sum == b)
                return true;
        }
        return false;
    }
}
```

- time: O(c)
- space: O(1)

## Binary Search

```java
public class Solution {
    public boolean judgeSquareSum(int c) {
        for (long a = 0; a * a <= c; a++) {
            int b = c - (int)(a * a);
            if (binary_search(0, b, b))
                return true;
        }
        return false;
    }
    public boolean binary_search(long s, long e, int n) {
        if (s > e)
            return false;
        long mid = s + (e - s) / 2;
        if (mid * mid == n)
            return true;
        if (mid * mid > n)
            return binary_search(s, mid - 1, n);
        return binary_search(mid + 1, e, n);
    }
}
```

- time: O(sqrt(c) log c)
- space: O(log c)
