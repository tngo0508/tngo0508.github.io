---
layout: single
title: "Problem of The Day: Substring with Concatenation of All Words"
date: 2024-2-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-30](/assets/images/2024-02-20_16-27-35-problem-30.png)](/assets/images/2024-02-20_16-27-35-problem-30.png)

My note:

- My brute force approach is accepted. But it's quite slow.
- Need to review the editorial solution again.

## Intuition

My initial thought is to use a sliding window approach to iterate through the string and check for valid substrings.

## Approach

I'll use a sliding window of the same length as the concatenated words to move through the given string. At each step, I'll check if the substring is a valid concatenation by counting the occurrences of each word in the substring. If the counts match the expected counts from the given list of words, I'll consider it a valid substring and add its starting index to the result.

To optimize the process of checking validity, I'll use a Counter to keep track of the expected counts of words from the given list.

## Complexity

- Time complexity:
  O(N \* M \* K), where N is the length of the string, M is the number of words, and K is the average length of each word.

- Space complexity:
  O(M \* K), where M is the number of words and K is the average length of each word.

## Code

```python
class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        counter = Counter(words)
        res = []
        length = len(words[0])
        words_length = len(words) * length
        N = len(s)

        def isValid(curr_s):
            i = 0
            curr_counter = Counter()
            while i < len(curr_s):
                word = curr_s[i:i+length]
                curr_counter[word] += 1
                if curr_counter[word] > counter[word]:
                    return False
                i += length

            return True

        for start in range(N - words_length + 1):
            curr = s[start:start+words_length]
            first_word = curr[:length]
            if first_word in words and isValid(curr):
                res.append(start)
        return res
```

## Editorial Solution

### Approach 1: Check All Indices Using a Hash Table

```python
class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        n = len(s)
        k = len(words)
        word_length = len(words[0])
        substring_size = word_length * k
        word_count = collections.Counter(words)

        def check(i):
            # Copy the original dictionary to use for this index
            remaining = word_count.copy()
            words_used = 0

            # Each iteration will check for a match in words
            for j in range(i, i + substring_size, word_length):
                sub = s[j : j + word_length]
                if remaining[sub] > 0:
                    remaining[sub] -= 1
                    words_used += 1
                else:
                    break

            # Valid if we used all the words
            return words_used == k

        answer = []
        for i in range(n - substring_size + 1):
            if check(i):
                answer.append(i)

        return answer
```

### Approach 2: Sliding Window

```python
class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        n = len(s)
        k = len(words)
        word_length = len(words[0])
        substring_size = word_length * k
        word_count = collections.Counter(words)

        def sliding_window(left):
            words_found = collections.defaultdict(int)
            words_used = 0
            excess_word = False

            # Do the same iteration pattern as the previous approach - iterate
            # word_length at a time, and at each iteration we focus on one word
            for right in range(left, n, word_length):
                if right + word_length > n:
                    break

                sub = s[right : right + word_length]
                if sub not in word_count:
                    # Mismatched word - reset the window
                    words_found = collections.defaultdict(int)
                    words_used = 0
                    excess_word = False
                    left = right + word_length # Retry at the next index
                else:
                    # If we reached max window size or have an excess word
                    while right - left == substring_size or excess_word:
                        # Move the left bound over continously
                        leftmost_word = s[left : left + word_length]
                        left += word_length
                        words_found[leftmost_word] -= 1

                        if words_found[leftmost_word] == word_count[leftmost_word]:
                            # This word was the excess word
                            excess_word = False
                        else:
                            # Otherwise we actually needed it
                            words_used -= 1

                    # Keep track of how many times this word occurs in the window
                    words_found[sub] += 1
                    if words_found[sub] <= word_count[sub]:
                        words_used += 1
                    else:
                        # Found too many instances already
                        excess_word = True

                    if words_used == k and not excess_word:
                        # Found a valid substring
                        answer.append(left)

        answer = []
        for i in range(word_length):
            sliding_window(i)

        return answer
```
