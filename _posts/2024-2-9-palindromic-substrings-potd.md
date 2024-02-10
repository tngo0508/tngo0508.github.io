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

## Editorial Solution

### Approach 1: Check All Substrings

```python
def is_palindrome(l, r, s):
    while l <= r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True

def count_palindromic_substrings(s):
    count = 0
    for i, c in enumerate(s):
        for j in range(i + 1):
            count += is_palindrome(j, i, s)

    return count
```

- Time complexity: O(n^3)
- Space complexity: O(1)

### Approach 2: Dynamic Programming

```python
def count_palindromic_substrings(s):
    count = 0

    # Initialize a lookup table of dimensions len(s) * len(s)
    dp = [[False for i in range(len(s))] for i in range(len(s))]

    # Base case: A string with one letter is always a palindrome
    for i in range(len(s)):
        dp[i][i] = True
        count += 1

    # Base case: Substrings of two letters
    for i in range(len(s)-1):
        dp[i][i + 1] = (s[i] == s[i + 1])
        # A boolean value is added to the count where True means 1 and False means 0
        count += dp[i][i + 1]

    # Substrings of lengths greater than 2
    for length in range(3, len(s)+1):
        i = 0
        # Checking every possible substring of any specific length
        for j in range(length - 1, len(s)):
            dp[i][j] = dp[i + 1][j - 1] and (s[i] == s[j])
            count += dp[i][j]
            i += 1

    return count
```
