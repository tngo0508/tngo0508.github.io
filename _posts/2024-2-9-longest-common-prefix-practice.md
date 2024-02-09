---
layout: single
title: "Problem of The Day: Longest Common Prefix"
date: 2024-2-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-14](/assets/images/2024-02-09_11-42-03-problem-14.png)

## Intuition

I will start by finding the minimum length among the given strings and the corresponding string itself. This is because the common prefix cannot be longer than the shortest string. Then, I will iterate through the characters at each position in the minimum string and compare them with the corresponding characters in other strings. If I find a mismatch, I will return the common prefix found so far.

## Approach

- Find the minimum length and the corresponding string among the given strings.
- Iterate through the characters at each position in the minimum string.
- Compare the current character with the corresponding characters in other strings.
- If a mismatch is found, return the common prefix found so far.
- If no mismatch is found, continue the iteration until the end of the minimum string.
- Return the common prefix.

## Complexity

- Time complexity:
O(n * m) where n is the number of strings and m is the minimum length among them.

- Space complexity:
O(m) where m is the minimum length among the strings.

## Code

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        i = 0
        min_length, min_str = min(map(lambda s: (len(s), s), strs))
        while i < min_length:
            c = min_str[i]
            for s in strs:
                if s[i] != c:
                    return min_str[:i]

            i += 1

        return min_str[:i]
```
