---
layout: single
title: "Problem of The Day: Word Pattern"
date: 2024-2-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-290](/assets/images/2024-02-23_16-42-02-problem-290.png)](/assets/images/2024-02-23_16-42-02-problem-290.png)

## Brute force

```python
class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        ss = s.split()
        unique_words = []
        for word in ss:
            if word not in unique_words:
                unique_words.append(word)

        prev = ''
        hash_map = defaultdict()
        for c in pattern:
            if prev != c:
                prev = c
                if unique_words and c not in hash_map:
                    hash_map[c] = unique_words[0]
                    unique_words = unique_words[1:]

        res = []
        for c in pattern:
            if c not in hash_map:
                return False
            res.append(hash_map[c])

        return res == ss
```

- Time complexity: O(N + M), where N is the length of the pattern, and M is the number of words in `s`.
- Space complexity: O(W) where W represents for number of unique words in `s`.

## Different implementation - cleaner code

```python
class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        p_dict = defaultdict(list)
        s_dict = defaultdict(list)
        ss = s.split()

        for i, c in enumerate(pattern):
            p_dict[c].append(i)

        for i, w in enumerate(ss):
            s_dict[w].append(i)

        for i, c in enumerate(pattern):
            if i >= len(ss) or p_dict[c] != s_dict[ss[i]]:
                return False

        return True
```

- Time complexity: O(M + N)
- Space complexity: O(W)

## Editorial Solution

### Approach 1: Two Hash Maps

```python
class Solution:
    def wordPattern(self, pattern: str, s: str) -> bool:
        map_char = {}
        map_word = {}
        
        words = s.split(' ')
        if len(words) != len(pattern):
            return False
        
        for c, w in zip(pattern, words):
            if c not in map_char:
                if w in map_word:
                    return False
                else:
                    map_char[c] = w
                    map_word[w] = c
            else:
                if map_char[c] != w:
                    return False
        return True
```

- Time complexity: O(N + M) where N is length of `s` and M is length of `pattern`.
- Space complexity: O(W) where W represents for number of unique words in `s`.
