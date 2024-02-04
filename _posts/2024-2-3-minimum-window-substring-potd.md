---
layout: single
title: "Problem: Minimum Window Substring"
date: 2024-2-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2024-02-03_18-16-33-podm-problem-76.png)

## Intuition

The initial thoughts may involve using a sliding window approach to efficiently search for the minimum window.

## Approach

The approach uses two pointers, `start` and `end`, to represent the window. It also maintains a frequency counter for characters in both strings `s` and `t`. As the window slides through the string `s`, the frequency counter is updated. The `curr_chars` set keeps track of the current characters in the window. The goal is to find the minimum window that contains all characters from `t`.

## Complexity

- Time complexity:
O(m + n), where m is the length of string `t` (pattern) and n is the length of string `s` (input).

- Space complexity:
  - The space complexity is O(K), where K is the number of unique characters in string `t`.
  - The `counter_t` dictionary stores the frequency of each character in `t`, which has a maximum of K unique characters.
  - The `curr_chars` set and the `counter` dictionary also have a maximum size of K.

## Code

```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        counter_t = Counter(t)
        num_of_unique_chars = len(set(t))
        counter = Counter()
        curr_chars = set()
        max_length = float('inf')
        res = ''
        N = len(s)
        start = 0
        for end, c in enumerate(s):
            counter[c] += 1
            if c in counter_t and counter[c] >= counter_t[c]:
                curr_chars.add(c)
            while start <= end and len(curr_chars) == num_of_unique_chars:
                length = end - start + 1
                if length < max_length:
                    max_length = length
                    res = s[start:end + 1]
                
                counter[s[start]] -= 1
                if counter[s[start]] < counter_t[s[start]]:
                    curr_chars.remove(s[start])
                
                start += 1
        
        return res
```

> Look at this [Journal]({% post_url 2024-1-25-minimum-window-substring %}) for Editorial solution and other approaches or review.
