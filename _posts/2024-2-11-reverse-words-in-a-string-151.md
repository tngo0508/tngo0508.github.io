---
layout: single
title: "Problem of The Day: Reverse Words in a String"
date: 2024-2-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-151](/assets/images/2024-02-11_14-22-46-problem-151.png)](/assets/images/2024-02-11_14-22-46-problem-151.png)

## Intuition

I iterate through the given string in reverse order, identifying words and appending their reversed forms to a result list. This way, I can obtain the reversed words in the correct order.

## Approach

I initialize an empty list to store the result and another list to keep track of the characters of the current word. By iterating through the input string in reverse, I identify words and add their reversed forms to the result list. Finally, I will join the reversed words to form the reversed sentence.

## Complexity

- Time complexity:
  O(n) where n is the length of the input string. The algorithm iterates through the string once.

- Space complexity:
  O(n) where n is the length of the input string. The space is used to store the reversed words in the result list.

## Code

```python
class Solution:
    def reverseWords(self, s: str) -> str:
        res = []
        N = len(s)
        curr = []
        for i in reversed(range(N)):
            if not s[i].isalnum() and curr:
                res.append(''.join(curr[::-1]))
                curr = []

            if s[i].isalnum():
                curr.append(s[i])

        if curr:
            res.append(''.join(curr[::-1]))
        return ' '.join(res)
```

## Editorial Solution

### Approach 1: Built-in Split + Reverse

```python
class Solution:
    def reverseWords(self, s: str) -> str:
        return " ".join(reversed(s.split()))
```

### Approach 2: Reverse the Whole String and Then Reverse Each Word

```python
class Solution:
    def trim_spaces(self, s: str) -> list:
        left, right = 0, len(s) - 1
        # remove leading spaces
        while left <= right and s[left] == ' ':
            left += 1

        # remove trailing spaces
        while left <= right and s[right] == ' ':
            right -= 1

        # reduce multiple spaces to single one
        output = []
        while left <= right:
            if s[left] != ' ':
                output.append(s[left])
            elif output[-1] != ' ':
                output.append(s[left])
            left += 1

        return output

    def reverse(self, l: list, left: int, right: int) -> None:
        while left < right:
            l[left], l[right] = l[right], l[left]
            left, right = left + 1, right - 1

    def reverse_each_word(self, l: list) -> None:
        n = len(l)
        start = end = 0

        while start < n:
            # go to the end of the word
            while end < n and l[end] != ' ':
                end += 1
            # reverse the word
            self.reverse(l, start, end - 1)
            # move to the next word
            start = end + 1
            end += 1

    def reverseWords(self, s: str) -> str:
        # converst string to char array
        # and trim spaces at the same time
        l = self.trim_spaces(s)

        # reverse the whole string
        self.reverse(l, 0, len(l) - 1)

        # reverse each word
        self.reverse_each_word(l)

        return ''.join(l)
```

### Approach 3: Deque of Words

```python
from collections import deque
class Solution:
    def reverseWords(self, s: str) -> str:
        left, right = 0, len(s) - 1
        # remove leading spaces
        while left <= right and s[left] == ' ':
            left += 1

        # remove trailing spaces
        while left <= right and s[right] == ' ':
            right -= 1

        d, word = deque(), []
        # push word by word in front of deque
        while left <= right:
            if s[left] == ' ' and word:
                d.appendleft(''.join(word))
                word = []
            elif s[left] != ' ':
                word.append(s[left])
            left += 1
        d.appendleft(''.join(word))

        return ' '.join(d)
```
