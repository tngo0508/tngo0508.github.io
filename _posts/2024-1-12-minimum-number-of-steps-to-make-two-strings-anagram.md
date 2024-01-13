---
layout: single
title: "Problem of The Day: Minimum Number of Steps to Make Two Strings Anagram"
date: 2024-1-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
You are given two strings of the same length s and t. In one step you can choose any character of t and replace it with another character.

Return the minimum number of steps to make t an anagram of s.

An Anagram of a string is a string that contains the same characters with a different (or the same) ordering.

 

Example 1:

Input: s = "bab", t = "aba"
Output: 1
Explanation: Replace the first 'a' in t with b, t = "bba" which is anagram of s.
Example 2:

Input: s = "leetcode", t = "practice"
Output: 5
Explanation: Replace 'p', 'r', 'a', 'i' and 'c' from t with proper characters to make t anagram of s.
Example 3:

Input: s = "anagram", t = "mangaar"
Output: 0
Explanation: "anagram" and "mangaar" are anagrams. 
 

Constraints:

1 <= s.length <= 5 * 104
s.length == t.length
s and t consist of lowercase English letters only.
```

My note:
[![note](/assets/images/2024-01-13_00-20-10-problem-of-the-day-note.png)](/assets/images/2024-01-13_00-20-10-problem-of-the-day-note.png)

# Intuition
I observe that the problem is asking for the minimum number of steps needed to make two strings anagrams. One way to approach this is by comparing the frequency of each character in both strings.

# Approach
I'll use an array to keep track of the frequency of each character in the two strings. The array will have indices corresponding to the characters ('a' to 'z'). I'll iterate through the first string, incrementing the frequency for each character encountered. Then, I'll iterate through the second string, decrementing the frequency for each character encountered. The remaining positive frequencies in the array will indicate the extra characters in one of the strings.

# Complexity
- Time complexity:
O(n), where n is the length of the strings.

- Space complexity:
O(1), as the array size is constant (26 characters).

# Code
```python
class Solution:
    def minSteps(self, s: str, t: str) -> int:
        num_of_chars = ord('z') - ord('a') + 1
        chars = [0] * num_of_chars
        for c in s:
            i = ord(c) - ord('a')
            chars[i] += 1

        for c in t:
            i = ord(c) - ord('a')
            chars[i] -= 1
        
        result = 0
        for freq in chars:
            """
            we don't care about the negative values 
            because we are looking for the characters that we need to replace. 
            The negative ones indicate the characters that we need to insert.
            """
            if freq >= 1:
                result += freq
        return result

```

# Editorial Solution
```cpp
class Solution {
public:
    int minSteps(string s, string t) {
        int count[26] = {0};
        // Storing the difference of frequencies of characters in t and s.
        for (int i = 0; i < s.size(); i++) {
            count[t[i] - 'a']++;
            count[s[i] - 'a']--;
        }

        int ans = 0;
        // Adding the difference where string t has more instances than s.
        // Ignoring where t has fewer instances as they are redundant and
        // can be covered by the first case.
        for (int i = 0; i < 26; i++) {
            ans += max(0, count[i]);
        }
        
        return ans;
    }
};
```