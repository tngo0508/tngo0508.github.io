---
layout: single
title: "Problem of The Day: Add Binary"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-67](/assets/images/2024-03-09_10-49-26-problem-67.png)](/assets/images/2024-03-09_10-49-26-problem-67.png)

## Intuition

he problem involves adding two binary numbers represented as strings.

## Approach

I approach the problem by first reversing both input strings and then iterating through them, performing binary addition digit by digit. I use a carry variable to handle cases where the sum exceeds 1. The result is constructed by appending the remainder of the sum to the result list. After the iteration, if there is a carry remaining, it is also added to the result. Finally, the result list is reversed to obtain the correct order.

## Complexity

- Time complexity:
  O(max(n, m)), where n and m are the lengths of the input binary strings a and b, respectively. The algorithm iterates through the longer string.

- Space complexity:
  O(max(n, m)), as the result list can have a length of max(n, m) + 1 in the worst case.

## Code

```python
class Solution:
    def addBinary(self, a: str, b: str) -> str:
        a = list(reversed(a))
        b = list(reversed(b))
        len_a = len(a)
        len_b = len(b)
        i = 0
        res = []
        carry = 0
        while i < max(len_a, len_b):
            val_a = int(a[i]) if i < len_a else 0
            val_b = int(b[i]) if i < len_b else 0
            curr_sum = val_a + val_b + carry
            carry = curr_sum // 2
            res.append(str(curr_sum % 2))
            i += 1

        if carry:
            res.append(str(carry))

        return ''.join(reversed(res))

```

## Editorial Solution

### Approach 1: Bit-by-Bit Computation

```python
class Solution:
    def addBinary(self, a, b) -> str:
        n = max(len(a), len(b))
        a, b = a.zfill(n), b.zfill(n)

        carry = 0
        answer = []
        for i in range(n - 1, -1, -1):
            if a[i] == '1':
                carry += 1
            if b[i] == '1':
                carry += 1

            if carry % 2 == 1:
                answer.append('1')
            else:
                answer.append('0')

            carry //= 2

        if carry == 1:
            answer.append('1')
        answer.reverse()

        return ''.join(answer)
```

### Approach 2: Bit Manipulation

```python
class Solution:
    def addBinary(self, a, b) -> str:
        x, y = int(a, 2), int(b, 2)
        while y:
            answer = x ^ y
            carry = (x & y) << 1
            x, y = answer, carry
        return bin(x)[2:]
```
