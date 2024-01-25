---
layout: single
title: "Problem of The Day: Minimum Window Substring"
date: 2024-1-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given two strings s and t of lengths m and n respectively, return the minimum window 
substring
 of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".

The testcases will be generated such that the answer is unique.

 

Example 1:

Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.
Example 2:

Input: s = "a", t = "a"
Output: "a"
Explanation: The entire string s is the minimum window.
Example 3:

Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window.
Since the largest window of s only has one 'a', return empty string.
 

Constraints:

m == s.length
n == t.length
1 <= m, n <= 10^5
s and t consist of uppercase and lowercase English letters.
 

Follow up: Could you find an algorithm that runs in O(m + n) time?
```

# Intuition
My initial thought is to use a sliding window approach to find the minimum window in string s that contains all characters of string t.

# Approach
I maintain two counters (`counter` and `t_counter`) to keep track of characters in the current window and characters in string t. I also use sets (`letter_set` and `t_set`) to efficiently check if all characters from t are present in the current window. I slide the window from left to right and update the counters and sets accordingly.

# Complexity
- Time complexity:
O(m + n) where n is length of string `s` and m is length of string `t` because both `start` and `end` pointer traverse both strings once.

- Space complexity:
O(m). The space is used to store the counters and sets for string `t`.

# Code
```python
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        length = float('inf')
        res = ""
        t_counter = Counter(t)
        t_set = set(t)
        counter = Counter()
        letter_set = set()
        start = 0
        for end, c in enumerate(s):
            counter[c] += 1
            if counter[c] == t_counter[c]:
                letter_set.add(c)
            if letter_set == t_set:
                for c in t_counter:
                    if counter[c] < t_counter[c]:
                        break
                else:
                    while start <= end and letter_set == t_set:
                        if length >= end - start + 1:
                            length = end - start + 1
                            res = s[start:end + 1]

                        counter[s[start]] -= 1
                        if counter[s[start]] == 0:
                            del counter[s[start]]
                        
                        if counter[s[start]] < t_counter[s[start]]:
                            if s[start] in letter_set:
                                letter_set.remove(s[start])
                        
                        start += 1

        return res
```

# Cleanup Code
```python
from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        t_counter = Counter(t)
        t_set = set(t)
        counter = Counter()
        letter_set = set()
        start = 0
        length = float('inf')
        res = ""

        for end, c in enumerate(s):
            counter[c] += 1

            if counter[c] == t_counter[c]:
                letter_set.add(c)

            while letter_set == t_set:
                if length >= end - start + 1:
                    length = end - start + 1
                    res = s[start:end + 1]

                counter[s[start]] -= 1

                if counter[s[start]] == 0:
                    del counter[s[start]]

                if counter[s[start]] < t_counter[s[start]]:
                    letter_set.remove(s[start])

                start += 1

        return res


```

# Editorial Solution
```python
def minWindow(self, s, t):
    """
    :type s: str
    :type t: str
    :rtype: str
    """
    if not t or not s:
        return ""

    dict_t = Counter(t)

    required = len(dict_t)

    # Filter all the characters from s into a new list along with their index.
    # The filtering criteria is that the character should be present in t.
    filtered_s = []
    for i, char in enumerate(s):
        if char in dict_t:
            filtered_s.append((i, char))

    l, r = 0, 0
    formed = 0
    window_counts = {}

    ans = float("inf"), None, None

    # Look for the characters only in the filtered list instead of entire s. This helps to reduce our search.
    # Hence, we follow the sliding window approach on as small list.
    while r < len(filtered_s):
        character = filtered_s[r][1]
        window_counts[character] = window_counts.get(character, 0) + 1

        if window_counts[character] == dict_t[character]:
            formed += 1

        # If the current window has all the characters in desired frequencies i.e. t is present in the window
        while l <= r and formed == required:
            character = filtered_s[l][1]

            # Save the smallest window until now.
            end = filtered_s[r][0]
            start = filtered_s[l][0]
            if end - start + 1 < ans[0]:
                ans = (end - start + 1, start, end)

            window_counts[character] -= 1
            if window_counts[character] < dict_t[character]:
                formed -= 1
            l += 1    

        r += 1    
    return "" if ans[0] == float("inf") else s[ans[1] : ans[2] + 1]
```