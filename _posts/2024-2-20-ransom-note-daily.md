---
layout: single
title: "Problem of The Day: Ransom Note"
date: 2024-2-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-383](/assets/images/2024-02-20_00-21-52-problem-383.png)](/assets/images/2024-02-20_00-21-52-problem-383.png)

## Intuition

My initial thought is to count the occurrences of each character in the magazine and then check if we have enough occurrences of each character to form the ransom note.

## Approach

I will use an array `letters` of size 26 to represent the occurrences of each lowercase letter in the alphabet. I will iterate through the characters in the magazine, incrementing the corresponding count in the `letters` array. Then, I will iterate through the characters in the ransom note, decrementing the count in the `letters` array. If at any point the count becomes negative, it means we don't have enough occurrences of that character in the magazine, and we can return False. If we successfully iterate through the entire ransom note, we return True.

## Complexity

- Time complexity:
  O(m + n) where m is the length of the magazine and n is the length of the ransom note.

- Space complexity:
  O(1) since there are only 26 letters in English.

## Code

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
        letters = [0] * 26
        for c in magazine:
            i = ord(c) - ord('a')
            letters[i] += 1

        for c in ransomNote:
            i = ord(c) - ord('a')
            letters[i] -= 1
            if letters[i] < 0:
                return False

        return True
```

## Editorial Solution

```python
def canConstruct(self, ransomNote: str, magazine: str) -> bool:

    # Check for obvious fail case.
    if len(ransomNote) > len(magazine): return False

    # In Python, we can use the Counter class. It does all the work that the
    # makeCountsMap(...) function in our pseudocode did!
    letters = collections.Counter(magazine)

    # For each character, c, in the ransom note:
    for c in ransomNote:
        # If there are none of c left, return False.
        if letters[c] <= 0:
            return False
        # Remove one of c from the Counter.
        letters[c] -= 1
    # If we got this far, we can successfully build the note.
    return True
```

- Time complexity: O(m)
- Space complexity: O(1)
