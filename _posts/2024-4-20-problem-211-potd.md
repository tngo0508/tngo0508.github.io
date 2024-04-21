---
layout: single
title: "Problem of The Day: Design Add and Search Words Data Structure"
date: 2024-4-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-211](/assets/images/2024-04-20_19-26-40-problem-211.png)

## Intuition

Upon seeing this problem, I think a trie data structure would be a suitable choice. It's efficient for storing and searching words with a common prefix. However, the challenge here is dealing with wildcard characters ('.'). We'll need to implement a search function that handles these wildcards appropriately.

## Approach

I'll use a trie to store the words. When adding a word, I'll traverse the trie character by character, creating nodes as needed. For searching, I'll recursively traverse the trie while handling wildcards by exploring all possible branches at each wildcard encountered.

## Complexity

- Time complexity:

* For adding a word: O(n), where n is the length of the word.
* For searching:
  - Worst-case without wildcards: O(m), where m is the length of the word being searched.
  - With wildcards: It depends on the number of wildcard characters and the branching factor of the trie. It can be quite high, possibly exponential in the worst case.

- Space complexity:
  O(n) where n here is the number of characters in all words combinedß

## Code

```python
class WordDictionary:

    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr:
                curr[c] = {}
            curr = curr[c]
        curr['#'] = True

    def search(self, word: str) -> bool:
        curr = self.root
        for i, c in enumerate(word):
            if c == '.':
                for node in curr.keys():
                    if node == '#':
                        continue
                    if self.search(word[:i] + node + word[i+1:]):
                        return True
            if c not in curr:
                return False
            curr = curr[c]
        return '#' in curr


# Your WordDictionary object will be instantiated and called as such:
# obj = WordDictionary()
# obj.addWord(word)
# param_2 = obj.search(word)
```

## Editorial Solution

Approach 1: Trie

```python
class WordDictionary:

    def __init__(self):
        """
        Initialize your data structure here.
        """
        self.trie = {}


    def addWord(self, word: str) -> None:
        """
        Adds a word into the data structure.
        """
        node = self.trie

        for ch in word:
            if not ch in node:
                node[ch] = {}
            node = node[ch]
        node['$'] = True

    def search(self, word: str) -> bool:
        """
        Returns if the word is in the data structure. A word could contain the dot character '.' to represent any letter.
        """
        def search_in_node(word, node) -> bool:
            for i, ch in enumerate(word):
                if not ch in node:
                    # if the current character is '.'
                    # check all possible nodes at this level
                    if ch == '.':
                        for x in node:
                            if x != '$' and search_in_node(word[i + 1:], node[x]):
                                return True

                    # If no nodes lead to an answer
                    # or the current character != '.'
                    return False

                # If the character is found
                # go down to the next level in trie
                else:
                    node = node[ch]
            return '$' in node

        return search_in_node(word, self.trie)
```
