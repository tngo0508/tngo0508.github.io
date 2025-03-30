---
layout: single
title: "Problem of The Day: Partition Labels"
date: 2025-3-30
show_date: true
classes: wide
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2025-03-30_11-16-35-problem-763.jpg)

## Intuition

The goal is to partition the given string into as many non-overlapping segments as possible, where each character appears in only one segment. The key observation is that a partition should end when all occurrences of the characters in that segment are included.

## Approach

1. **Track Last Occurrences:**

   - First, iterate through the string to record the last index of each character in a dictionary (`last_occurrence`).
   - This helps us determine the furthest index a partition must extend to.

2. **Partition the String:**
   - Iterate through the string while maintaining the rightmost boundary (`end`) of the current partition.
   - If the current index reaches `end`, it signifies the completion of a partition. Add the partition length to the result list and update `start` to begin a new partition.

## Complexity

- **Time Complexity:**

  - The algorithm processes the string twice: once to build the `last_occurrence` dictionary and once to determine partitions.
  - This results in an overall time complexity of **O(n)**, where _n_ is the length of the string.

- **Space Complexity:**
  - The extra space used is for the `last_occurrence` dictionary, which stores at most 26 entries (for lowercase English letters).
  - Therefore, the worst-case space complexity is **O(1)** (constant space).

## Code

```python
from collections import defaultdict
from typing import List

class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last_occurrence = defaultdict(int)
        for i, c in enumerate(s):
            last_occurrence[c] = i

        start, end = 0, 0
        res = []
        for i, c in enumerate(s):
            end = max(end, last_occurrence[c])
            if i == end:
                res.append(end - start + 1)
                start = end + 1
        return res
```

## Other Approach - Merge

```python
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        N = len(s)
        res = []
        hash_map = OrderedDict()
        for i, c in enumerate(s):
            hash_map[c] = i

        start = end = 0
        for c, idx in hash_map.items():
            left_set = set(s[:idx])
            right_set = set(s[idx:])
            end = idx
            partition = True
            for ch in left_set:
                if ch != c and ch in right_set:
                    partition = False
                    break

            if partition:
                res.append(end - start + 1)
                start = end + 1
        return res
```
