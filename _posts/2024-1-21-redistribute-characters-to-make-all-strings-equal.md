---
layout: single
title: "Problem of The Day: Redistribute Characters to Make All Strings Equal"
date: 2024-1-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---
# Problem Statement
```
You are given an array of strings words (0-indexed).

In one operation, pick two distinct indices i and j, where words[i] is a non-empty string, and move any character from words[i] to any position in words[j].

Return true if you can make every string in words equal using any number of operations, and false otherwise.

 

Example 1:

Input: words = ["abc","aabc","bc"]
Output: true
Explanation: Move the first 'a' in words[1] to the front of words[2],
to make words[1] = "abc" and words[2] = "abc".
All the strings are now equal to "abc", so return true.
Example 2:

Input: words = ["ab","a"]
Output: false
Explanation: It is impossible to make all the strings equal using the operation.
 

Constraints:

1 <= words.length <= 100
1 <= words[i].length <= 100
words[i] consists of lowercase English letters.
```

# Intuition
 My initial thought is to use a hash map to count the occurrences of each character across all words.

# Approach
I iterate through each word in the list and count the occurrences of each character using a hash map. After counting, I check if the count of each character is divisible by the total number of words in the list. If any character's count is not divisible, it means we cannot make the words equal by reordering, and I return False. Otherwise, I return True.

# Complexity
- Time complexity:
O(m * n) where n is the number of words in the list and m is the average length of the words. We iterate through each character in each word.

- Space complexity:
O(k) where k is the number of unique characters across all words. In the worst case, all characters are unique, leading to a space complexity proportional to the number of unique characters.

# Code
```python
class Solution:
    def makeEqual(self, words: List[str]) -> bool:
        hash_map = defaultdict(int)
        for word in words:
            for c in word:
                hash_map[c] += 1

        
        for v in hash_map.values():
            if v % len(words) != 0:
                return False
        
        return True

```