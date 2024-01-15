---
layout: single
title: "Problem of The Day:  Longest Common Subsequence"
date: 2024-1-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

For example, "ace" is a subsequence of "abcde".
A common subsequence of two strings is a subsequence that is common to both strings.

 

Example 1:

Input: text1 = "abcde", text2 = "ace" 
Output: 3  
Explanation: The longest common subsequence is "ace" and its length is 3.
Example 2:

Input: text1 = "abc", text2 = "abc"
Output: 3
Explanation: The longest common subsequence is "abc" and its length is 3.
Example 3:

Input: text1 = "abc", text2 = "def"
Output: 0
Explanation: There is no such common subsequence, so the result is 0.
 

Constraints:

1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.
```

# Intuition
My initial approach involves using recursion to explore all possible combinations and generate the common subsequence. Once a subsequence is found, I keep track of its length and compare it to the final result. Drawing from my experience with dynamic programming problems, I tend to start with a brute force approach and then intuitively improve it using memoization (top-down approach). Finally, I attempted to use memoization approach to produce the induction rules to build the dynamic programming approach from bottom-up.

# Approach
I'm using a recursive approach with memoization to solve this problem. The idea is to compare characters at corresponding positions in both strings. If they match, I increment the count of the common subsequence and move on to the next characters. If they don't match, I explore two possibilities: moving ahead in text1 and staying at the current position in text2, or vice versa. The maximum count from these possibilities is stored in a memoization table to avoid redundant calculations.

I'm also handling the case where the lengths of text1 and text2 are different by making sure that text1 is always the longer string.

# Complexity
- Time complexity:
The time complexity is O(m * n), where m and n are the lengths of text1 and text2, respectively. This is because, in the worst case, we may have to explore all possible combinations of characters in both strings.

- Space complexity:
The space complexity is also O(m * n) due to the memoization table, which stores the results of subproblems to avoid redundant calculations.

# Code - Memoization Approach
```python
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        if len(text1) < len(text2):
            return self.longestCommonSubsequence(text2, text1)

        t1 = text1
        t2 = text2
        memo = {}
        def dfs(t1_idx, t2_idx):
            if t1_idx == len(text1):
                return 0
            if t2_idx == len(text2):
                return 0

            if (t1_idx, t2_idx) in memo:
                return memo[(t1_idx, t2_idx)]

            if t1[t1_idx] == t2[t2_idx]:
                return dfs(t1_idx + 1, t2_idx + 1) + 1
            
            result = max(dfs(t1_idx + 1, t2_idx), dfs(t1_idx, t2_idx + 1))
            memo[(t1_idx, t2_idx)] = result
            return result

        return dfs(0, 0)
```

# Editorial Solution
Dynamic Programming

The following notes are from Leet Code Editorial section. I used this to help me understand the problem solved by DP.

![notes](</assets/images/Screenshot 2024-01-15 at 11.00.10 AM.png>)

![notes-1](</assets/images/Screenshot 2024-01-15 at 11.02.15 AM.png>)

example:
![dp-note](</assets/images/Screenshot 2024-01-15 at 10.56.02 AM-dp-lcs.png>)

Putting this all together, we iterate over each column in reverse, starting from the last column (we could also do rows, the final result will be the same). For a cell (row, col), we look at whether or not `text1.charAt(row) == text2.charAt(col)` is true. if it is, then we set `grid[row][col] = 1 + grid[row + 1][col + 1]`. Otherwise, we set `grid[row][col] = max(grid[row + 1][col], grid[row][col + 1])`.

For ease of implementation, we add an extra row of zeroes at the bottom, and an extra column of zeroes to the right.

## Code
```python
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        
        # Make a grid of 0's with len(text2) + 1 columns 
        # and len(text1) + 1 rows.
        dp_grid = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]
        
        # Iterate up each column, starting from the last one.
        for col in reversed(range(len(text2))):
            for row in reversed(range(len(text1))):
                # If the corresponding characters for this cell are the same...
                if text2[col] == text1[row]:
                    dp_grid[row][col] = 1 + dp_grid[row + 1][col + 1]
                # Otherwise they must be different...
                else:
                    dp_grid[row][col] = max(dp_grid[row + 1][col], dp_grid[row][col + 1])
        
        # The original problem's answer is in dp_grid[0][0]. Return it.
        return dp_grid[0][0]
```
Time Complexity: O(m * n) since we solved m * n subproblems
Space Complexity: O(m * n)