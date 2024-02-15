---
layout: single
title: "Problem of The Day: Text Justification"
date: 2024-2-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-68](/assets/images/2024-02-15_14-44-31-problem-68.png)](/assets/images/2024-02-15_14-44-31-problem-68.png)

## Intuition

The idea is to simulate the process of justifying text by greedily packing as many words as possible into one line. While adding words to a line, a whitespace is also added between words. Special attention is given to handling available spaces and addressing edge cases where additional whitespace may not be needed.

## Approach

I first created a hash_map to store the length of each word for quick access. Then, I iterated through the words to form lines. For each word, I checked if adding it to the current line would exceed the maximum width. If it didn't, I added the word to the current line and adjusted the available spaces. If adding the word would exceed the width, I started a new line.

After forming the lines, I went through each line and distributed the spaces between words to justify the line. I calculated the number of spaces needed and distributed them evenly. If there were remaining spaces, I added them to the leftmost words.

## Complexity

- Time complexity:
O(n), where n is the total number of characters in the words list.

- Space complexity:
O(n), as I used a hash_map to store the lengths of the words and created lists to store the lines and final result.

## Code

```python
class Solution:
    def fullJustify(self, words: List[str], maxWidth: int) -> List[str]:
        hash_map = defaultdict(int)
        for word in words:
            hash_map[word] = len(word)
        
        res = []
        curr = []
        available_spaces = maxWidth
        for word in words:
            if available_spaces - hash_map[word] == 0:
                available_spaces -= hash_map[word]
            else:
                available_spaces -= (hash_map[word] + 1)

            if available_spaces >= 0:
                curr.append(word)
            else:
                if curr:
                    res.append(curr[:])
                available_spaces = maxWidth
                available_spaces -= (hash_map[word] + 1)
                curr = [word]
        
        if curr:
            res.append(curr[:])

        for i in range(len(res) - 1):
            arr = res[i]
            num_of_chars = 0
            num_of_words = len(arr)
            for s in arr:
                num_of_chars += hash_map[s]
            
            spaces = maxWidth - num_of_chars
            spaces_in_between = spaces // (num_of_words - 1) if num_of_words > 1 else 0
            spaces_left = spaces % (num_of_words - 1) if num_of_words > 1 else 0
            for j in range(spaces_left):
                arr[j] = ''.join(list(arr[j]) + [' '])
            
            if spaces_in_between > 0:
                delimiter = ' ' * spaces_in_between
                res[i] = str(delimiter.join(arr))
            else:
                res[i] = str(''.join(arr))
                if len(res[i]) < maxWidth:
                    res[i] += ' ' * (maxWidth - len(res[i]))

        
        if res:
            res[-1] = str(' '.join(res[-1]))
            if len(res[-1]) < maxWidth:
                res[-1] += ' ' * (maxWidth - len(res[-1]))

        return res

```
