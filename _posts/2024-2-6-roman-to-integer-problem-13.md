---
layout: single
title: "Problem of The Day: Roman to Integer"
date: 2024-2-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-13](/assets/images/2024-02-06_20-08-21-problem-13.png)

## Intuition

My initial thought is to iterate through the string and accumulate the corresponding numerical values based on the given mapping of Roman numerals to integers.

## Approach

I will use a hash map to store the values of each Roman numeral. Then, I'll iterate through the input string. If the current numeral has a greater or equal value than the next one, I'll add its value to the result. Otherwise, I'll subtract its value. Finally, I'll add the value of the last numeral in the string.

## Complexity

- Time complexity:
  O(n), where n is the length of the input string. We iterate through the string once.

- Space complexity:
  O(1), as we use a fixed-size hash map regardless of the input size.

## Code

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        hash_map = {
            'I': 1,  'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000
        }

        res = 0
        N = len(s)
        for i in range(N - 1):
            if hash_map[s[i]] >= hash_map[s[i + 1]]:
                res += hash_map[s[i]]
            else:
                res -= hash_map[s[i]]
        res += hash_map[s[-1]]
        return res
```
