---
layout: single
title: "Problem of The Day: Longest Common Subsequence"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, "ace" is a subsequence of "abcde".
A common subsequence of two strings is a subsequence that is common to both strings.

 

Example 1:

Input: text1 = "abcde", text2 = "ace" 
Output: 3  
Explanation: The longest common subsequence is "ace" and its length is 3.
Example 2:

Input: text1 = "abc", text2 = "abc"
Output: 3
Explanation: The longest common subsequence is "abc" and its length is 3.
Example 3:

Input: text1 = "abc", text2 = "def"
Output: 0
Explanation: There is no such common subsequence, so the result is 0.
 

Constraints:

1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.
```

My note:
[![my note](/assets/images/2024-01-24_17-00-10-longest-common-subsequence-note.png)](/assets/images/2024-01-24_17-00-10-longest-common-subsequence-note.png)

# My solution
## Top-down approach with memoization
```python
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        memo = defaultdict()
        def dfs(i, j):
            if i == len(text1) or j == len(text2):
                return 0

            if (i, j) in memo:
                return memo[(i, j)]

            if text1[i] == text2[j]:
                return dfs(i + 1, j + 1) + 1

            result = max(dfs(i + 1, j), dfs(i, j + 1))
            memo[(i, j)] = result
            return result

        return dfs(0, 0)
```
- Time complexity: O(m * n) where m is the length of `text1` and n is the length of `text2` because there are m * n sub-problems.
- Space complexity: O(m * n)
I have already solved this question in the past. Please see this post for my [detailed explanation](2024-1-14-longest-common-subsequence.md).