---
layout: single
title: "Problem of The Day: Largest Substring Between Two Equal Characters"
date: 2024-1-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---
# Problem Statement
```
Given a string s, return the length of the longest substring between two equal characters, excluding the two characters. If there is no such substring return -1.

A substring is a contiguous sequence of characters within a string.

 

Example 1:

Input: s = "aa"
Output: 0
Explanation: The optimal substring here is an empty substring between the two 'a's.
Example 2:

Input: s = "abca"
Output: 2
Explanation: The optimal substring here is "bc".
Example 3:

Input: s = "cbzxy"
Output: -1
Explanation: There are no characters that appear twice in s.
 

Constraints:

1 <= s.length <= 300
s contains only lowercase English letters.
```

# Intuition
My initial thought is to use a hash map to keep track of the index of the first occurrence of each character. As we iterate through the string, we can update the result by comparing the current index with the stored index for each character.

# Approach
I initialize a variable start to keep track of the starting index, and res to store the maximum distance. I use a defaultdict to store the index of the first occurrence of each character. As I iterate through the string, I check if the current character is already in the hash map. If not, I store its index. If it's already in the hash map, I update the result by calculating the distance between the current index and the stored index for that character. I keep track of the maximum distance encountered so far.

# Complexity
- Time complexity:
O(n) where n is the length of the input string. We iterate through the string once.

- Space complexity:
O(1) since there are only 26 letters in English alphabet.

# Code
```python
class Solution:
    def maxLengthBetweenEqualCharacters(self, s: str) -> int:
        start = 0
        res = float('-inf')
        hash_map = defaultdict(int)
        for i, c in enumerate(s):
            if c not in hash_map:
                hash_map[c] = i
            else:
                res = max(res, i - hash_map[c] - 1)

        return res if res != float('-inf') else -1
```

# Editorial Solution
```python
class Solution:
    def maxLengthBetweenEqualCharacters(self, s: str) -> int:
        first_index = {}
        ans = -1
        
        for i in range(len(s)):
            if s[i] in first_index:
                ans = max(ans, i - first_index[s[i]] - 1)
            else:
                first_index[s[i]] = i

        return ans
```
- Time Complexity: O(n)
- Space complexity: O(1)