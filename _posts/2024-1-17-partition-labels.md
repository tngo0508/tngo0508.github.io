---
layout: single
title: "Problem of The Day:  Partition Labels"
date: 2024-1-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part.

Note that the partition is done so that after concatenating all the parts in order, the resultant string should be s.

Return a list of integers representing the size of these parts.

 

Example 1:

Input: s = "ababcbacadefegdehijhklij"
Output: [9,7,8]
Explanation:
The partition is "ababcbaca", "defegde", "hijhklij".
This is a partition so that each letter appears in at most one part.
A partition like "ababcbacadefegde", "hijhklij" is incorrect, because it splits s into less parts.
Example 2:

Input: s = "eccbbbbdec"
Output: [10]
 

Constraints:

1 <= s.length <= 500
s consists of lowercase English letters.
```

# Intuition
The problem requires partitioning a string into as many parts as possible, where each letter appears in at most one part. The intuition is to iterate through the string, keeping track of the last occurrence index of each character. Whenever a character is encountered, check if all the characters between the current start and end indices have their last occurrence after the current character's index. If so, it forms a valid partition.

# Approach
I maintain an OrderedDict to store the last occurrence index of each character in the string. Then, I iterate through the string, updating the end index whenever a character is encountered. For each character, I check if all the characters between the current start and end indices have their last occurrence after the current character's index. If yes, it's a valid partition, and I update the start index accordingly. The length of each valid partition is appended to the result list.

# Complexity
- Time complexity:
O(n), where n is the length of the input string. The algorithm iterates through the string once.

- Space complexity:
O(n), as the OrderedDict stores the last occurrence index of each character in the string.

# Code
```python
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        N = len(s)
        res = []
        hash_map = OrderedDict()
        for i, c in enumerate(s):
            hash_map[c] = i

        start = end = 0
        for c, idx in hash_map.items():
            left_set = set(s[:idx])
            right_set = set(s[idx:])
            end = idx
            partition = True
            for ch in left_set:
                if ch != c and ch in right_set:
                    partition = False
                    break
            
            if partition:
                res.append(end - start + 1)
                start = end + 1
        return res
```

# Editorial Solution
```python
class Solution(object):
    def partitionLabels(self, S):
        last = {c: i for i, c in enumerate(S)}
        j = anchor = 0
        ans = []
        for i, c in enumerate(S):
            j = max(j, last[c])
            if i == j:
                ans.append(i - anchor + 1)
                anchor = i + 1
            
        return ans
```

- Time Complexity: O(n)
- Space Complexity: O(1)