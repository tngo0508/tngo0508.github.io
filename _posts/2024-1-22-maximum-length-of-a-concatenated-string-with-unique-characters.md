---
layout: single
title: "Problem of The Day: Maximum Length of a Concatenated String with Unique Characters"
date: 2024-1-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
You are given an array of strings arr. A string s is formed by the concatenation of a subsequence of arr that has unique characters.

Return the maximum possible length of s.

A subsequence is an array that can be derived from another array by deleting some or no elements without changing the order of the remaining elements.

 

Example 1:

Input: arr = ["un","iq","ue"]
Output: 4
Explanation: All the valid concatenations are:
- ""
- "un"
- "iq"
- "ue"
- "uniq" ("un" + "iq")
- "ique" ("iq" + "ue")
Maximum length is 4.
Example 2:

Input: arr = ["cha","r","act","ers"]
Output: 6
Explanation: Possible longest valid concatenations are "chaers" ("cha" + "ers") and "acters" ("act" + "ers").
Example 3:

Input: arr = ["abcdefghijklmnopqrstuvwxyz"]
Output: 26
Explanation: The only string in arr has all 26 characters.
 

Constraints:

1 <= arr.length <= 16
1 <= arr[i].length <= 26
arr[i] contains only lowercase English letters.
```

# Intuition
My initial thoughts are to use a recursive approach where I explore different combinations of strings to find the maximum possible length of a string without repeating characters.

# Approach
I will define a recursive function (`dfs`) that takes the current index (`idx`) and the current combination of strings (`curr`). At each step, I will check if adding the string at the current index to the current combination results in a valid string (no repeating characters). If it is valid, I will explore both scenarios: including the current string and excluding it.

To check for validity, I will use a helper function (`isValid`) that converts the current combination to a string and verifies if its length is equal to the number of unique characters.

I will continue this recursive exploration until I reach the end of the array (`idx == N`). Finally, I will return the maximum length obtained during the exploration.

# Complexity
- Time complexity:
O(2^n), where n is the number of strings in the array. In the worst case, we explore two possibilities (including or excluding each string) for each string.

- Space complexity:
O(n), where n is the depth of the recursion stack. The space complexity is determined by the maximum depth of the recursion.


# Code
```python
class Solution:
    def maxLength(self, arr: List[str]) -> int:
        N = len(arr)
        def isValid(curr):
            curr_str = ''.join(curr)
            return len(curr_str) == len(set(curr_str))

        def dfs(idx, curr):
            if not isValid(curr):
                return 0

            if idx == N:
                return len(''.join(curr))
            
            return max(dfs(idx + 1, curr + [arr[idx]]), dfs(idx + 1, curr))

        return dfs(0, [])
```