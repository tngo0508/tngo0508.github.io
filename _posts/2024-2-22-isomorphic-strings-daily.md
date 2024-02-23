---
layout: single
title: "Problem of The Day: Isomorphic Strings"
date: 2024-2-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-205](/assets/images/2024-02-22_16-11-59-problem-205.png)](/assets/images/2024-02-22_16-11-59-problem-205.png)

My note:

[![note](/assets/images/2024-02-22_16-14-41-problem-205-note.png)](/assets/images/2024-02-22_16-14-41-problem-205-note.png)

## Intuition

My initial thought is to use dictionaries to track the occurrences of characters and their indices in both strings.

## Approach

I've used defaultdict to create dictionaries (`s_index_occurrence` and `t_index_occurrence`) that map characters to lists of their occurrences in the respective strings. I iterate through both strings, recording the indices of each character. After creating these dictionaries, I compare the values of the dictionaries for each character. If the occurrences differ, the strings are not isomorphic.

## Complexity

- Time complexity:
O(n), where n is the length of the input strings. Both strings are traversed once to create the dictionaries, and then their values are compared.

- Space complexity:
O(n), as additional space is used to store the dictionaries. The space complexity is linear with respect to the length of the input strings.

## Code

```python
class Solution:
    def isIsomorphic(self, s: str, t: str) -> bool:
        s_index_occurrence = defaultdict(list)
        t_index_occurrence = defaultdict(list)

        for i, c in enumerate(s):
            s_index_occurrence[c].append(i)
        
        for i, c in enumerate(t):
            t_index_occurrence[c].append(i)

        s_values = s_index_occurrence.values()
        t_values = t_index_occurrence.values()
        for list_val in s_values:
            if list_val not in t_values:
                return False
        
        return True
        
```
