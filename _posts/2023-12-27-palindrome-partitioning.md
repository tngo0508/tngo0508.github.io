---
layout: single
title: "Problem of The Day: Palindrome Partitioning"
date: 2023-12-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
This is the last problem on the backtrack topic on my Top 100 Liked. Basically, the problem asked to generate all possible partition substrings that are palindrome given an input string. Here are a few examples for this problem.

```
Example 1:

Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]

Example 2:

Input: s = "a"
Output: [["a"]]
```
# My Explanation and Approach
Here is my notes when I attempted to solve this problem. I visualized it as a tree structure starting with the input string.
![my notes](/assets/images/2023-12-27_17-40-45-palindrome-partitioning.png)

The basic idea of my algorithm is that I tried to check each substring to see whether or not it is a palindrome. If it is the palindrome, I partition it and add to my final solution `result`. Otherwise, I move on to the substring and keep use the same logic to generate more partition until all of the substrings are explored. The key point is that when I reached the end of a branch, I wanted to backtrack to explore other path or branch.

As you can see in my picture, I drew the tree structure and the root node is depicted as the input string. As the tree is branched out into different paths, each node in the paths indicates the potential partition substring. At each level of the tree, I branched out the paths by partitioning the potential solution based on length of a substring. For example, the first node of the first level of the tree has the length of 1 (`a`). The second node of the first level has the length of 2 (`aa`) and so on. When we go down the path, we truncate the input string by the substring shown on the previous node of the upper level. We keep truncating the input string until it becomes empty. That means that we have reached the solution.


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
