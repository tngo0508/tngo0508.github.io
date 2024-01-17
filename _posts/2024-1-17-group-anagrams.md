---
layout: single
title: "Problem of The Day:  Group Anagrams"
date: 2024-1-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

 

Example 1:

Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
Example 2:

Input: strs = [""]
Output: [[""]]
Example 3:

Input: strs = ["a"]
Output: [["a"]]
```

# Intuition
The problem involves grouping anagrams together. An anagram is a word or phrase formed by rearranging the letters of another. My initial thought is to utilize the property that anagrams will have the same sorted representation.


# Approach
I plan to iterate through the list of strings and sort each string. The sorted strings can then be used as keys in a hash_map, and the original strings can be grouped accordingly. This approach ensures that anagrams end up in the same group.

# Complexity
- Time complexity:
O(n * k * log(k)), where n is the number of strings and k is the maximum length of any string. The sorting operation is performed on each string.

- Space complexity:
O(n * k), as the hash_map stores the sorted representation of each string along with the original strings.

# Code
```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        hash_map = defaultdict(list)
        for s in strs:
            key = tuple(sorted(s))
            hash_map[key].append(s)
        
        return hash_map.values()
```