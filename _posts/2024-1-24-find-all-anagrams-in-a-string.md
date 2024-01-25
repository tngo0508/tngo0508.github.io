---
layout: single
title: "Problem of The Day: Find All Anagrams in a String"
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
Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

 

Example 1:

Input: s = "cbaebabacd", p = "abc"
Output: [0,6]
Explanation:
The substring with start index = 0 is "cba", which is an anagram of "abc".
The substring with start index = 6 is "bac", which is an anagram of "abc".
Example 2:

Input: s = "abab", p = "ab"
Output: [0,1,2]
Explanation:
The substring with start index = 0 is "ab", which is an anagram of "ab".
The substring with start index = 1 is "ba", which is an anagram of "ab".
The substring with start index = 2 is "ab", which is an anagram of "ab".
 

Constraints:

1 <= s.length, p.length <= 3 * 10^4
s and p consist of lowercase English letters.
```
# Intuition
My initial thoughts on solving this problem revolved around utilizing a sliding window approach to efficiently find anagrams in a given string.

# Approach
My approach involved maintaining counters for both the pattern string (p) and the current window in the input string (s). I iterated through the string, updating the window's counter and adjusting the window boundaries accordingly. When the counters matched, it indicated the presence of an anagram, and I recorded the starting index of the anagram.

# Complexity
- Time complexity:
O(n), where n is the length of the input string s. This is because I iterate through the string once, and the operations within the loop take constant time. 

- Space complexity:
O(1), as the size of the counter dictionaries is constant and independent of the input size. (only 26 characters in English)

# Code
```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        res = []
        counter_p = Counter(p)
        counter = Counter()
        start = end = 0
        for end in range(len(s)):
            counter[s[end]] += 1
            
            while counter[s[end]] > counter_p[s[end]]:
                counter[s[start]] -= 1
                if counter[s[start]] <= 0:
                    del counter[s[start]]
                start += 1
            
            if counter == counter_p:
                res.append(start)
        
        return res

```

# Editorial Solution
## Approach 1: Sliding Window with HashMap
```python
from collections import Counter
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        ns, np = len(s), len(p)
        if ns < np:
            return []

        p_count = Counter(p)
        s_count = Counter()
        
        output = []

        # sliding window on the string s
        for i in range(ns):
            # Add one more letter 
            # on the right side of the window
            s_count[s[i]] += 1

            # Remove one letter 
            # from the left side of the window
            if i >= np:
                if s_count[s[i - np]] == 1:
                    del s_count[s[i - np]]
                else:
                    s_count[s[i - np]] -= 1

            # Compare array in the sliding window
            # with the reference array
            if p_count == s_count:
                output.append(i - np + 1)
        
        return output
```
## Approach 2: Sliding Window with Array
```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        ns, np = len(s), len(p)
        if ns < np:
            return []

        p_count, s_count = [0] * 26, [0] * 26
        # build reference array using string p
        for ch in p:
            p_count[ord(ch) - ord('a')] += 1
        
        output = []
        # sliding window on the string s
        for i in range(ns):
            # add one more letter 
            # on the right side of the window
            s_count[ord(s[i]) - ord('a')] += 1
            # remove one letter 
            # from the left side of the window
            if i >= np:
                s_count[ord(s[i - np]) - ord('a')] -= 1
            # compare array in the sliding window
            # with the reference array
            if p_count == s_count:
                output.append(i - np + 1)
        
        return output
```