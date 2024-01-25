---
layout: single
title: "Problem of The Day: Repeated DNA Sequences"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
The DNA sequence is composed of a series of nucleotides abbreviated as 'A', 'C', 'G', and 'T'.

For example, "ACGAATTCCG" is a DNA sequence.
When studying DNA, it is useful to identify repeated sequences within the DNA.

Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule. You may return the answer in any order.

 

Example 1:

Input: s = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"
Output: ["AAAAACCCCC","CCCCCAAAAA"]
Example 2:

Input: s = "AAAAAAAAAAAAA"
Output: ["AAAAAAAAAA"]
 

Constraints:

1 <= s.length <= 10^5
s[i] is either 'A', 'C', 'G', or 'T'.
```
# Intuition
My initial thoughts on solving this problem involved using a sliding window approach to identify repeated DNA sequences within the given string. 

# Approach
I implemented a sliding window with a length of 10 characters, moving through the string and updating a hash map to keep track of the frequency of encountered substrings. Whenever a substring was of length 10, I added it to the hash map. At the end, I collected the substrings that appeared more than once. 

# Complexity
- Time complexity:
O(n), where n is the length of the input string s. This is because I iterate through the string once, and the operations within the loop take constant time.

- Space complexity:
O(m), where m is the number of distinct 10-character substrings in the input string. In the worst case, all substrings are distinct, leading to a hash map of size m. 

# Code
```python
class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        res = []
        hash_map = defaultdict(int)
        start = 0
        for end in range(len(s)):
            if end - start + 1 >= 10:
                curr_str = s[start:end + 1]
                hash_map[curr_str] += 1
                start += 1

        return [strg for strg, v in hash_map.items() if v > 1]

        
```

# Editorial Solution
```python
class Solution:
    def findRepeatedDnaSequences(self, s: str) -> List[str]:
        L, n = 10, len(s)     
        seen, output = set(), set()

        # iterate over all sequences of length L
        for start in range(n - L + 1):
            tmp = s[start:start + L]
            if tmp in seen:
                output.add(tmp[:])
            seen.add(tmp)
        return output
```