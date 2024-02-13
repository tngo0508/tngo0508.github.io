---
layout: single
title: "Problem of The Day: Find First Palindromic String in the Array"
date: 2024-2-12
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2108](/assets/images/2024-02-12_18-27-16-problem-2108.png)](/assets/images/2024-02-12_18-27-16-problem-2108.png)

## Intuition

My initial thought is to iterate through the words, checking each one for palindrome property, and returning the first palindrome encountered.

## Approach

I'll loop through each word in the list and use string slicing (`word[::-1]`) to reverse the word. If the reversed word is the same as the original, it's a palindrome, and I'll return it. If no palindrome is found, I'll return an empty string.

## Complexity

- Time complexity:
  O(m \* n) where n is the number of words and mmm is the maximum length of a word. This is because, for each word, we may need to compare up to m characters.

- Space complexity:
  O(1) as we are not using any additional space that scales with the input.

## Code

```python
class Solution:
    def firstPalindrome(self, words: List[str]) -> str:
        for word in words:
            if word == word[::-1]:
                return word
        return ""
```

## Other Approach: Check for Palindrome using two pointers

```python
class Solution:
    def is_palindromic(self, word):
        l, r = 0, len(word) - 1
        while l < r:
            if word[l] != word[r]: return False
            l += 1
            r -= 1
        return True

    def firstPalindrome(self, words: List[str]) -> str:
        for word in words:
            if self.is_palindromic(word):
                return word
        return ""
```
