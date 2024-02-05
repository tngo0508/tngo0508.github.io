---
layout: single
title: "Problem of The Day: First Unique Character in a String"
date: 2024-2-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2024-02-04_19-09-17-problem-387.png)

## Intuition

To solve this, we can iterate through the string and keep track of the frequency of each character. After that, we can iterate through the characters and find the first one with a frequency of 1.

## Approach

I'm using an `OrderedDict` to keep track of the order of characters in the string while maintaining their frequencies. The key is the character, and the value is a list containing the index of the character's first occurrence and its frequency.

1. Iterate through the string and update the `OrderedDict` with character frequencies.
2. Iterate through the values of the `OrderedDict` and find the first character with a frequency of 1. Return its index.
3. If no such character is found, return -1.

## Complexity

- Time complexity:
O(n) where n is the length of the input string. This is because we iterate through the string once to update the `OrderedDict` and once to find the first non-repeating character.

- Space complexity:
O(n) where n is the number of unique characters in the input string. In the worst case, all characters are unique, and we store information for each of them in the `OrderedDict`.

## Code

```python
class Solution:
    def firstUniqChar(self, s: str) -> int:
        hash_map = OrderedDict()
        for i, c in enumerate(s):
            if c not in hash_map:
                hash_map[c] = [i, 0]
            hash_map[c][1] += 1

        for i, count in hash_map.values():
            if count == 1:
                return i

        return -1
```

## Editorial Solution

```python
class Solution:
    def firstUniqChar(self, s: str) -> int:
        """
        :type s: str
        :rtype: int
        """
        # build hash map: character and how often it appears
        count = collections.Counter(s)
        
        # find the index
        for idx, ch in enumerate(s):
            if count[ch] == 1:
                return idx     
        return -1
```
