---
layout: single
title: "Problem of The Day: Palindrome Partitioning"
date: 2023-12-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Top 100 Liked
  - Problem of The Day
---
# Problem Statement
This problem represents the final challenge within the Backtracking category among my Top 100 Liked problems. The objective is to generate all potential partitions of a given string such that each substring within the partitions is a palindrome. Here are a couple of examples illustrating this problem:

```
Example 1:

Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]

Example 2:

Input: s = "a"
Output: [["a"]]
```
# My Explanation and Approach
[![my notes](/assets/images/2023-12-27_17-40-45-palindrome-partitioning.png)](/assets/images/2023-12-27_17-40-45-palindrome-partitioning.png)

In approaching this problem, I visualized it as a tree structure initiated with the input string. I depicted this in the accompanying image. The fundamental idea behind my algorithm was to systematically examine each substring to determine whether it qualifies as a palindrome. If a substring is a palindrome, I partition it and add it to my final solution named result. If not, I explore further substrings, applying the same logic recursively until all potential substrings have been explored. Crucially, when reaching the end of a branch, I implemented backtracking to explore alternative paths or branches.

The algorithm revolves around traversing the tree structure, branching out into different paths, with each node indicating a potential partition substring. At each level of the tree, paths are branched out by partitioning the potential solution based on the length of a substring. For instance, the first node of the initial level has a length of 1 (a). The second node of the first level has a length of 2 (aa), and so on. As the algorithm progresses down a path, the input string is truncated by the substring displayed on the preceding node at the upper level. This process continues until the input string is empty, signifying the discovery of a solution.
Here is my notes when I attempted to solve this problem. I visualized it as a tree structure starting with the input string.

```python
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        def is_valid(substring):
            if not substring:
                return False
            l, r = 0, len(substring) - 1
            while l <= r:
                if substring[l] != substring[r]:
                    return False
                l += 1
                r -= 1
            return True
                
        def backtrack(s, result, curr):
            if not s:
                result.append(curr[:])
                return
                
            for i in range(len(s)):
                if is_valid(s[:i + 1]):
                    curr.append(s[:i + 1])
                    backtrack(s[i + 1:], result, curr)
                    curr.pop()


        result = []
        backtrack(s, result, [])
        return result
```
