---
layout: single
title: "Problem of The Day: Valid Word Abbreviation"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-408](/assets/images/2024-03-08_08-47-43-problem-408.png)](/assets/images/2024-03-08_08-47-43-problem-408.png)

## Intuition

I observed that the problem involves checking whether a given abbreviation is valid for a given word. The abbreviation can contain both letters and numbers, where numbers represent the count of consecutive letters to be skipped in the word.

## Approach

I approached the problem by iterating through the abbreviation and constructing an array of substrings, each representing either a letter or a numeric count. Then, I iterated through this array, comparing each element with the corresponding part of the word and updating the position accordingly. Finally, I checked if the pointers reached the end of both the word and the abbreviation.

## Complexity

- Time complexity:
  O(n), where n is the length of the abbreviation.

- Space complexity:
  O(n), as the array stores substrings extracted from the abbreviation.

## Code

```python
class Solution:
    def validWordAbbreviation(self, word: str, abbr: str) -> bool:
        arr = []
        length_str = ""
        for c in abbr:
            if c.isalpha():
                if len(length_str) > 0:
                    arr.append(length_str)
                arr.append(c)
                length_str = ""
            else:
                if length_str == "" and c == '0':
                    return False
                length_str += c

        if len(length_str) > 0:
            arr.append(length_str)

        start = 0
        for elem in arr:
            if elem.isalpha():
                if start >= len(word) or elem != word[start]:
                    return False
                start += 1
            else:
                skip = int(elem)
                start += skip
                if start > len(word):
                    return False

        return start >= len(word)
```

## Cleaner Code

```python
class Solution:
    def validWordAbbreviation(self, word: str, abbr: str) -> bool:
        i, j = 0, 0
        while i < len(word) and j < len(abbr):
            num = 0
            if word[i].isalpha() and abbr[j].isalpha():
                if word[i] != abbr[j]:
                    return False
                i += 1
                j += 1
            elif abbr[j] == '0':
                return False
            else:
                while j < len(abbr) and abbr[j].isdigit():
                    num = num * 10 + int(abbr[j])
                    j += 1
                i += num
        return i == len(word) and j == len(abbr)
```
