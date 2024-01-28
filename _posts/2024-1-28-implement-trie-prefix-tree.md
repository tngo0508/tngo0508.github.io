---
layout: single
title: "Problem of The Day: Implement Trie (Prefix Tree)"
date: 2024-1-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/implement-trie-prefix-tree/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
To implement the trie, we need a dictionary or hash map to represent for a container storing the children node. At the end of each word, we need to have a flag indicating the node is the last node in a word.

# Approach
The approach involves designing a Trie class with insert, search, and startsWith methods. The TrieNode class represents each node in the trie, containing children nodes and a flag indicating whether it represents a complete word. The insert method inserts a word into the trie by creating nodes for each character. The search method checks if a complete word exists in the trie. The startsWith method checks if a given prefix exists in the trie.

# Complexity
- Time complexity:
The time complexity for insert, search, and startsWith methods is `O(L)`, where L is the length of the word or prefix being processed. This is because each character in the word or prefix requires constant time for node traversal.

- Space complexity:
The space complexity is `O(N * L)`, where N is the total number of characters in all inserted words, and L is the average length of the words. The trie structure stores the characters of each word, and the number of nodes in the trie is proportional to the total number of characters. 

# Code
```python
class TrieNode:
    def __init__(self):
        self.children = defaultdict()
        self.is_word = False

class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr.children:
                curr.children[c] = TrieNode()
            curr = curr.children[c]
        curr.is_word = True

    def search(self, word: str) -> bool:
        curr = self.root
        for c in word:
            if c not in curr.children:
                return False
            curr = curr.children[c]
        return curr.is_word
        

    def startsWith(self, prefix: str) -> bool:
        curr = self.root
        for c in prefix:
            if c not in curr.children:
                return False
            curr = curr.children[c]
        return True
        


# Your Trie object will be instantiated and called as such:
# obj = Trie()
# obj.insert(word)
# param_2 = obj.search(word)
# param_3 = obj.startsWith(prefix)
```

# Solution without creating TrieNode
```python
class Trie:

    def __init__(self):
        self.data = {}
        

    def insert(self, word: str) -> None:
        root = self.data
        for c in word:
            if c not in root:
                root[c] = {}
            root = root[c]

        root['final'] = True


    def search(self, word: str) -> bool:
        root = self.data

        for c in word:
            if c not in root:
                return False
            root = root[c]
        
        return 'final' in root.keys()
        

    def startsWith(self, prefix: str) -> bool:
        root = self.data

        for c in prefix:
            if c not in root:
                return False
            root = root[c]
        
        return True


# Your Trie object will be instantiated and called as such:
# obj = Trie()
# obj.insert(word)
# param_2 = obj.search(word)
# param_3 = obj.startsWith(prefix)
```