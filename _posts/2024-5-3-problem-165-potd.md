---
layout: single
title: "Problem of The Day: Compare Version Numbers"
date: 2024-5-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![165](/assets/images/2024-05-03_15-50-59-problem-165.png)

## Intuition

Initially, I'll split both version strings into their components. Then, I'll iterate through each component simultaneously and compare them one by one.

## Approach

My approach involves splitting both version strings into arrays of their respective components. Then, I'll iterate through these arrays, comparing each component one by one. If a component is larger in one version than the other, I'll return the appropriate value (-1, 1). If they are equal, I'll move to the next component. If all components are equal, I'll return 0.

## Complexity

- Time complexity:
  O(n) where n is the length of longer version.

- Space complexity:
  O(n)

## Code

```python
class Solution:
    def compareVersion(self, version1: str, version2: str) -> int:
        v1 = version1.split('.')
        v2 = version2.split('.')
        i = 0
        max_len = max(len(v1), len(v2))
        while i < max_len:
            val1 = int(v1[i]) if i < len(v1) else 0
            val2 = int(v2[i]) if i < len(v2) else 0
            if val1 < val2:
                return -1
            elif val1 > val2:
                return 1
            i += 1
        return 0
```

## Editorial Solution

Approach 2: Two Pointers, One Pass

```python
class Solution:
    def get_next_chunk(self, version: str, n: int, p: int) -> List[int]:
        # If pointer is set to the end of the string, return 0
        if p > n - 1:
            return 0, p

        # Find the end of the chunk
        p_end = p
        while p_end < n and version[p_end] != ".":
            p_end += 1

        # Retrieve the chunk
        i = int(version[p:p_end]) if p_end != n - 1 else int(version[p:n])

        # Find the beginning of the next chunk
        p = p_end + 1

        return i, p

    def compareVersion(self, version1: str, version2: str) -> int:
        p1 = p2 = 0
        n1, n2 = len(version1), len(version2)

        # Compare versions
        while p1 < n1 or p2 < n2:
            i1, p1 = self.get_next_chunk(version1, n1, p1)
            i2, p2 = self.get_next_chunk(version2, n2, p2)
            if i1 != i2:
                return 1 if i1 > i2 else -1

        # The versions are equal
        return 0
```

- Time: O(max(n,m))
- Space: O(max(n,m))
