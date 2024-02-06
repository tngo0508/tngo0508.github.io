---
layout: single
title: "Problem of The Day: Group Anagrams"
date: 2024-2-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2024-02-05_17-01-41-problem-49.png)

## Intuition

My initial thought is to leverage the property that anagrams will have the same sorted representation of their characters. By sorting the characters in each string and using the sorted version as a key in a hash map, we can group anagrams together.

## Approach

I would create a defaultdict where the keys are tuples of sorted characters, and the values are lists of strings that share the same sorted representation. Then, I iterate through the input list of strings, sort each string, and use the sorted version as a key to append the original string to the corresponding list in the hash map.

## Complexity

- Time complexity:
O(n * mlogm), where nnn is the number of strings and mmm is the maximum length of the strings. Sorting each string takes O(mlog⁡m) time, and we do this for each of the nnn strings.

- Space complexity:
O(m * n) as we store the sorted representation of each string in the hash map.

## Code

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        hash_map = defaultdict(list)
        for s in strs:
            hash_map[tuple(sorted(s))].append(s)
        
        return hash_map.values()
```

## Editorial Solution

```python
class Solution:
    def groupAnagrams(self, strs):
        ans = collections.defaultdict(list)
        for s in strs:
            count = [0] * 26
            for c in s:
                count[ord(c) - ord('a')] += 1
            ans[tuple(count)].append(s)
        return ans.values()
```