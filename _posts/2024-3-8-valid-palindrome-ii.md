---
layout: single
title: "Problem of The Day: Valid Palindrome II"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-680](/assets/images/2024-03-08_09-20-48-problem-680.png)](/assets/images/2024-03-08_09-20-48-problem-680.png)

## Brute Force - Recursion - Accepted

### Intuition

My initial thought is to use a recursive approach to check whether it's possible to make the given string a palindrome by removing at most K characters.

### Approach

I approach the problem by defining a `helper` function that takes the left and right indices along with the remaining allowed removals (`K`). In each recursive call, I check if the characters at the current indices match. If they do, I proceed to the next pair of indices. If not, I have two choices: either remove a character from the left side or the right side, and I decrement the remaining allowed removals accordingly. The base cases handle scenarios where the indices cross each other or the allowed removals are exhausted.

### Complexity

- Time complexity:
  O(n^2), where n is the length of the input string. In the worst case, for each character mismatch, two recursive calls are made.

- Space complexity:
  O(n), as the recursion depth can go up to the length of the input string.

### Code

```python
class Solution:
    def validPalindrome(self, s: str) -> bool:
        K = 1
        left, right = 0, len(s) - 1

        def helper(l, r, k):
            if l > r:
                return True

            if k < 0:
                return False

            if s[l] == s[r] and k >= 0:
                return helper(l + 1, r - 1, k)
            else:
                return helper(l + 1, r, k - 1) or helper(l, r - 1, k - 1)

        return helper(left, right, K)
```

## Editorial Solution

Approach: Two Pointers

```python
class Solution:
    def validPalindrome(self, s: str) -> bool:
        def check_palindrome(s, i, j):
            while i < j:
                if s[i] != s[j]:
                    return False
                i += 1
                j -= 1

            return True

        i = 0
        j = len(s) - 1
        while i < j:
            # Found a mismatched pair - try both deletions
            if s[i] != s[j]:
                return check_palindrome(s, i, j - 1) or check_palindrome(s, i + 1, j)
            i += 1
            j -= 1

        return True
```
