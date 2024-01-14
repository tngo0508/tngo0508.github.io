---
layout: single
title: "Problem of The Day: Minimum Number of Steps to Make Two Strings Anagram"
date: 2024-1-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement

Two strings are considered close if you can attain one from the other using the following operations:

Operation 1: Swap any two existing characters.
For example, abcde -> aecdb
Operation 2: Transform every occurrence of one existing character into another existing character, and do the same with the other character.
For example, aacabb -> bbcbaa (all a's turn into b's, and all b's turn into a's)
You can use the operations on either string as many times as necessary.

Given two strings, word1 and word2, return true if word1 and word2 are close, and false otherwise.

 

Example 1:

Input: word1 = "abc", word2 = "bca"
Output: true
Explanation: You can attain word2 from word1 in 2 operations.
Apply Operation 1: "abc" -> "acb"
Apply Operation 1: "acb" -> "bca"
Example 2:

Input: word1 = "a", word2 = "aa"
Output: false
Explanation: It is impossible to attain word2 from word1, or vice versa, in any number of operations.
Example 3:

Input: word1 = "cabbba", word2 = "abbccc"
Output: true
Explanation: You can attain word2 from word1 in 3 operations.
Apply Operation 1: "cabbba" -> "caabbb"
Apply Operation 2: "caabbb" -> "baaccc"
Apply Operation 2: "baaccc" -> "abbccc"
 

Constraints:

1 <= word1.length, word2.length <= 105
word1 and word2 contain only lowercase English letters.

# Intuition
My initial thought is to compare the sets of characters in both words to check if they contain the same set of characters. Additionally, I need to compare the frequency distribution of characters in both words to see if they have the same count for each character.

# Approach
I will start by checking if the lengths of the two words are equal. If not, they cannot be transformed into each other, so I return False. Next, I'll create sets of characters for both words and compare them. If they are not equal, it means the character sets are different, and I return False. Finally, I'll use Counter to get the frequency distribution of characters in both words, and I'll compare the sorted list of counts for each word. If they match, the words can be transformed into each other, and I return True; otherwise, I return False. 

# Complexity
- Time complexity:
The time complexity is dominated by the sorting operation on the counts, which is O(k * log(k)), where k is the number of unique characters in the words. Therefore, the overall time complexity is O(n * log(k)), where n is the length of the words.

- Space complexity:
The space complexity is O(k), where k is the number of unique characters in the words. This is due to the space required for the sets and counters. 

# Code
```python
class Solution:
    def closeStrings(self, word1: str, word2: str) -> bool:
        if len(word1) != len(word2):
            return False

        w1_set = set(word1)
        w2_set = set(word2)
        if w1_set != w2_set:
            return False

        w1_counter = Counter(word1)
        w2_counter = Counter(word2)

        values1 = w1_counter.values()
        values2 = w2_counter.values()

        return sorted(values1) == sorted(values2)

```