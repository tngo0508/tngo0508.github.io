---
layout: single
title: "Problem of The Day: Palindromic Substrings"
date: 2024-2-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-647](/assets/images/2024-02-09_16-28-07-problem-647.png)

## Intuition

To efficiently count these substrings, I plan to iterate through each character in the string and expand around it to check for both odd and even length palindromes.

## Approach

I'll define a helper function `is_palindromic` that takes two pointers and checks for palindromic substrings by expanding outward. Then, I'll iterate through each character in the string, considering it both as the center of an odd-length palindrome and as the left part of an even-length palindrome. The helper function will be called for each case, and the count of palindromic substrings will be updated accordingly.

## Complexity

- Time complexity:
  O(n^2) where n is the length of the input string. The nested expansion loop can take O(n) time for each character in the worst case.

- Space complexity:
  O(1) as we are using constant space for variables.

## Code

```python
class Solution:
    def countSubstrings(self, s: str) -> int:
        def is_palindromic(l, r):
            ans = 0
            while l >= 0 and r < len(s):
                if s[l] == s[r]:
                    ans += 1
                else:
                    break
                l -= 1
                r += 1
            return ans

        res = 0
        for i, c in enumerate(s):
            odd = is_palindromic(i, i)
            even = is_palindromic(i, i + 1)
            res += odd + even
        return res
```
