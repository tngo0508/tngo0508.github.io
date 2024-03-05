---
layout: single
title: "Problem of The Day: Minimum Length of String After Deleting Similar Ends"
date: 2024-3-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1750](/assets/images/2024-03-04_20-05-18-problem-1750.png)](/assets/images/2024-03-04_20-05-18-problem-1750.png)

## Intuition

My initial thoughts are to use two pointers, starting from both ends of the string, and iteratively move towards the center while checking for symmetry.

## Approach

I'll use two pointers, `l` starting from the beginning and `r` starting from the end of the string. I'll iterate through the string, checking if the characters at these pointers are the same. If they are, I'll keep moving towards the center, updating the length of the substring to be removed. This process will continue until the pointers no longer point to the same character or have crossed each other.

## Complexity

- Time complexity:
  O(n) where n is the length of the input string. The two pointers traverse the string once.

- Space complexity:
  O(1) as we are using a constant amount of extra space.

## Code

```python
class Solution:
    def minimumLength(self, s: str) -> int:
        N = len(s)
        l, r = 0, N - 1
        length = N
        while l < r and s[l] == s[r]:
            ch = s[l]
            while l <= r and s[l] == ch:
                l += 1
            while r > l and s[r] == ch:
                r -= 1

            length = min(length, r - l + 1)
        return length
```

## Editorial Solution

### Approach 1: Two Pointers

```python
class Solution:
    def minimumLength(self, s: str) -> int:
        begin = 0
        end = len(s) - 1

        # Delete similar ends until the ends differ or they meet in the middle
        while begin < end and s[begin] == s[end]:
            c = s[begin]

            # Delete consecutive occurrences of c from prefix
            while begin <= end and s[begin] == c:
                begin += 1

            # Delete consecutive occurrences of c from suffix
            while end > begin and s[end] == c:
                end -= 1

        # Return the number of remaining characters
        return end - begin + 1
```

### Approach 2: Tail Recursion

```python
class Solution:
    def minimumLength(self, s: str) -> int:
        return self.delete_similar_ends(s, 0, len(s) - 1)

    # Deletes similar ends and returns remaining length
    def delete_similar_ends(self, s: str, begin: int, end: int) -> int:
        # The ends differ or meet in the middle
        if begin >= end or s[begin] != s[end]:
            return end - begin + 1
        else:
            c = s[begin]

            # Delete consecutive occurrences of c from prefix
            while begin <= end and s[begin] == c:
                begin += 1

            # Delete consecutive occurrences of c from suffix
            while end > begin and s[end] == c:
                end -= 1

            return self.delete_similar_ends(s, begin, end)
```

- Time complexity: O(n)
- Space complexity: O(1)
