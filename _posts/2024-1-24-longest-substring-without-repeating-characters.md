---
layout: single
title: "Problem of The Day: Longest Substring Without Repeating Characters"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given a string s, find the length of the longest 
substring
 without repeating characters.

 

Example 1:

Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
Example 2:

Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
Example 3:

Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
 

Constraints:

0 <= s.length <= 5 * 10^4
s consists of English letters, digits, symbols and spaces.
```
# Intuition
My initial thoughts revolve around using a sliding window approach to find the longest substring without repeating characters.

# Approach
I employ a sliding window technique where I maintain a set (`seen`) to keep track of unique characters within the current window. I iterate through the string, adjusting the window's start and end indices based on whether the current character is already in the set. The goal is to maximize the length of the unique substring.

# Complexity
- Time complexity:
O(n) where n is the length of the input string.

- Space complexity:
O(min(m, n)) where m is the size of the character set (26 letters in English). In the worst case, the set `seen` might store all characters in the current window.

# Code
```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = set()
        start = 0
        longest = 0
        for end, c in enumerate(s):
            while c in seen and start <= end:
                seen.remove(s[start])
                start += 1
            seen.add(c)
            longest = max(longest, end - start + 1)
        return longest

        
```

# Editorial Solution
## Approach 2: Sliding Window
```python
from collections import Counter
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        chars = Counter()

        left = right = 0

        res = 0
        while right < len(s):
            r = s[right]
            chars[r] += 1

            while chars[r] > 1:
                l = s[left]
                chars[l] -= 1
                left += 1

            res = max(res, right - left + 1)

            right += 1
        return res
```
## Approach 3: Sliding Window Optimized
```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        n = len(s)
        ans = 0
        # mp stores the current index of a character
        mp = {}

        i = 0
        # try to extend the range [i, j]
        for j in range(n):
            if s[j] in mp:
                i = max(mp[s[j]], i)

            ans = max(ans, j - i + 1)
            mp[s[j]] = j + 1

        return ans
```