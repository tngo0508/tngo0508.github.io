---
layout: single
title: "Problem of The Day: Word Break"
date: 2024-1-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
```
Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

 

Example 1:

Input: s = "leetcode", wordDict = ["leet","code"]
Output: true
Explanation: Return true because "leetcode" can be segmented as "leet code".
Example 2:

Input: s = "applepenapple", wordDict = ["apple","pen"]
Output: true
Explanation: Return true because "applepenapple" can be segmented as "apple pen apple".
Note that you are allowed to reuse a dictionary word.
Example 3:

Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: false

Constraints:

1 <= s.length <= 300
1 <= wordDict.length <= 1000
1 <= wordDict[i].length <= 20
s and wordDict[i] consist of only lowercase English letters.
All the strings of wordDict are unique.
```

My note:
[![note](/assets/images/2024-01-10_15-40-36-word-break-note.png)](/assets/images/2024-01-10_15-40-36-word-break-note.png)

# Brute Force - Time Limit Exceeded
## Intuition
My initial thoughts on solving this problem involve exploring all possible combinations of words from the wordDict to break down the input string.

## Approach
I have implemented a depth-first search (DFS) approach, where I recursively try different word combinations to see if they can form the original string. The function uses a base case to check if the current string matches the input string, and it explores all possibilities by appending words from the wordDict.

## Complexity
- Time complexity:
O(n ^ m)
N is the length of the input string, and M is the maximum length of a word in the wordDict.
In the worst case, the algorithm explores all possible combinations of words, resulting in exponential time complexity.

- Space complexity:
O(n)
The space complexity is determined by the depth of the recursion stack, which is proportional to the length of the input string. However, the algorithm does not use additional space structures like lists or dictionaries.

## Code
```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        def dfs(curr_str):
            if len(curr_str) >= len(s):
                if curr_str == s:
                    return True
                return False
            
            res = False
            for word in wordDict:
                if dfs(curr_str + word):
                    res = True
                    break
            
            return res

        return dfs("")

```

While the logic appears correct, there's a potential issue with the current implementation. It doesn't handle cases where a word from the wordDict can be used multiple times. In other words, it may miss valid combinations if the same word needs to be repeated to form the input string.

# Dynamic Programming
In order to avoid redundant calculation from the brute force approach, I applied the dynamic programming to improve time and space complexity.

## Intuition
The initial intuition to solve this problem involves dynamic programming to keep track of valid break points in the input string. The goal is to determine whether the given string can be broken into words from the provided wordDict.

## Approach
The approach utilizes dynamic programming with a boolean array `dp`, where `dp[i]` indicates whether the substring` s[:i]` can be broken into words from the wordDict. The algorithm iterates through each position in the string and checks if any valid word combinations lead to the current position. The presence of a valid break point is stored in the `dp` array.

## Complexity
- Time complexity:
O(n^2). The algorithm iterates through each position in the input string and performs a nested loop to check for valid word combinations. The inner loop has a maximum length of `N` where `N` is the length of the input string.

- Space complexity:
O(n). The algorithm uses a boolean array dp of size N+1 to store whether each substring can be broken into words. Additionally, other variables used have constant space complexity.

## Code
```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        N = len(s)
        dp = [False] * (N + 1)
        dp[0] = True  # An empty string is always breakable, so dp[0] is True
        start = 0

        # Iterate through each position in the string
        for i in range(1, N + 1):
            j = i - 1

            # Check all possible substrings ending at position i
            while j >= 0:
                curr = s[j:i]

                # If the current substring is in wordDict and the prefix (before the current substring) is breakable
                if curr in wordDict and dp[i - len(curr)]:
                    dp[i] = True  # Mark the current position as breakable
                    break

                j -= 1  # Move to the next smaller substring

        return dp[-1]  # The last element of dp indicates whether the entire string is breakable
```

# Editorial Solution
## Breadth-First Search (BFS)
[![bfs](/assets/images/2024-01-10_15-53-49-word-break-bfs.png)](/assets/images/2024-01-10_15-53-49-word-break-bfs.png)
```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        queue = deque([0])
        seen = set()
        
        while queue:
            start = queue.popleft()
            if start == len(s):
                return True
            
            for end in range(start + 1, len(s) + 1):
                if end in seen:
                    continue
                
                if s[start:end] in words:
                    queue.append(end)
                    seen.add(end)
                
        return False
```

## Top Down - DFS
The trick is to use `@cache` for memoization
```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        @cache
        def dp(i):
            if i < 0: 
                return True

            for word in wordDict:
                if s[i - len(word) + 1:i + 1] == word and dp(i - len(word)):
                    return True
            
            return False
        
        return dp(len(s) - 1)
```

## Dynamic Programming

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        dp = [False] * len(s)
        for i in range(len(s)):
            for word in wordDict:
                # Handle out of bounds case
                if i < len(word) - 1:
                    continue
                
                if i == len(word) - 1 or dp[i - len(word)]:
                    if s[i - len(word) + 1:i + 1] == word:
                        dp[i] = True
                        break

        return dp[-1]
```

## Trie Approach

```python
class TrieNode:
    def __init__(self):
        self.is_word = False
        self.children = {}

class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        root = TrieNode()
        for word in wordDict:
            curr = root
            for c in word:
                if c not in curr.children:
                    curr.children[c] = TrieNode()
                curr = curr.children[c]
            
            curr.is_word = True
            
        dp = [False] * len(s)
        for i in range(len(s)):
            if i == 0 or dp[i - 1]:
                curr = root
                for j in range(i, len(s)):
                    c = s[j]
                    if c not in curr.children:
                        # No words exist
                        break

                    curr = curr.children[c]
                    if curr.is_word:
                        dp[j] = True

        return dp[-1]
```