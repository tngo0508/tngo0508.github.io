---
layout: single
title: "Problem of The Day: Count and Say"
date: 2024-3-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-38](/assets/images/2024-03-25_20-50-19-prolem-38.png)

## Intuition

The problem requires generating the nth term of the "count and say" sequence. The sequence starts with "1" and each subsequent term describes the previous term. For example, the second term is "11" because there is one '1' in the first term. The third term is "21" because there are two '1's in the second term. My initial thought is to use recursion to generate each term based on the previous one.

## Approach

My approach involves implementing a recursive function to generate each term of the sequence. Starting with the base case where `n` equals 1, I return "1". For `n` greater than 1, I recursively call the function to obtain the (n-1)th term. Then, I iterate through the (n-1)th term to count consecutive digits and generate the nth term accordingly.

## Complexity

- Time complexity:
  O(2^n) - Each term requires iterating through the previous term, and the length of each term doubles in the worst case.

- Space complexity:
  O(2^n) - Each recursive call consumes additional space on the call stack, and the space required grows exponentially with each recursive call.

## Code

```python
class Solution:
    def countAndSay(self, n: int) -> str:
        if n == 1:
            return "1"
        curr = self.countAndSay(n - 1)
        start = end = 0
        res = []
        while end < len(curr):
            if curr[start] != curr[end]:
                length = end - start
                res.append(str(length))
                res.append(curr[start])
                start = end
            end += 1

        res.append(str(end - start))
        res.append(curr[start])
        return ''.join(res)
```
