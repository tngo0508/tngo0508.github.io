---
layout: single
title: "Problem of The Day: Find the Index of the First Occurrence in a String"
date: 2024-1-31
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.

 

Example 1:

Input: haystack = "sadbutsad", needle = "sad"
Output: 0
Explanation: "sad" occurs at index 0 and 6.
The first occurrence is at index 0, so we return 0.
Example 2:

Input: haystack = "leetcode", needle = "leeto"
Output: -1
Explanation: "leeto" did not occur in "leetcode", so we return -1.
 

Constraints:

1 <= haystack.length, needle.length <= 10^4
haystack and needle consist of only lowercase English characters.
```

# Intuition
I'm going to iterate through the characters of the `haystack` string and check if there is a potential match for the `needle` starting from each position. For every potential match, I'll compare the characters of `haystack` and `needle` until either the entire `needle` is matched or a mismatch is found. If the entire `needle` is matched, I'll return the starting index; otherwise, I'll continue the search.

# Approach
I'll use a nested loop where the outer loop iterates through the characters of `haystack`, and the inner loop compares characters of `haystack` and `needle`. If a match is found for the entire `needle`, I'll return the starting index. The time complexity of this approach is O(m \* n), where m is the length of `haystack` and n is the length of `needle`.

# Complexity
- Time complexity:
O(m * n)

- Space complexity:
O(1)

# Code
```python
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        for i in range(len(haystack)):
            h = i
            n = 0
            while h < len(haystack) and n < len(needle) and haystack[h] == needle[n]:
                h += 1
                n += 1
            
            if n == len(needle):
                return i
        return -1
```