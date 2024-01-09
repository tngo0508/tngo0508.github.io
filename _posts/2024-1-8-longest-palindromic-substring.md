---
layout: single
title: "Problem of The Day: Longest Palindromic Substring"
date: 2024-1-8
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
Given a string s, return the longest palindromic substring in s.

Example 1:

Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
Example 2:

Input: s = "cbbd"
Output: "bb"
 

Constraints:

1 <= s.length <= 1000
s consist of only digits and English letters.
```

See [Problem](https://leetcode.com/problems/longest-palindromic-substring/description/?envType=study-plan-v2&envId=top-100-liked).

# Intuition
The initial approach involves utilizing two pointers to expand around a center and checking for palindromes. Additionally, the strategy explores both even and odd lengths for palindromes in order to identify the longest one.

My Notes:
[![note](/assets/images/2024-01-08_15-50-45-longest-palindromic-substring.png)](/assets/images/2024-01-08_15-50-45-longest-palindromic-substring.png)

# Approach
I employed a two-pointer approach to expand around each character in the string, considering both even and odd lengths for palindromes. The `find_length` function determines the length of the palindromic substring by expanding outward from a center character or between two characters. The result is updated whenever a longer palindromic substring is found during the iteration.

# Complexity
- Time complexity:
O(n^2) as each character in the string is considered a potential center, and for each center, the expansion involves linear traversal in the worst case.

- Space complexity:
O(1) as the algorithm uses constant space to store variables like `result`, `max_length`, and `indices`.

# Code
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        N = len(s)
        
        # Helper function to find the length of a palindrome by expanding around a center
        def find_length(l, r):
            while l >= 0 and r < N and s[l] == s[r]:
                l -= 1
                r += 1
            return r - l - 1

        result = ""
        max_length = 0

        # Iterate through each character in the string
        for i in range(N):
            # Calculate the length of palindromes with even and odd lengths
            even = find_length(i, i + 1)
            odd = find_length(i, i)
            length = max(even, odd)

            # Update result if a longer palindrome is found
            if max_length < length:
                max_length = length
                half_way = length // 2

                # Determine the substring based on even or odd length
                if length % 2 == 0:  # even
                    result = s[i - half_way + 1:i + half_way + 1]
                else:  # odd
                    result = s[i - half_way:i + half_way + 1]
        
        return result
```
## Cleaner Code
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        def getPalindromeLength(l, r):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return s[l+1:r]

        result = ""
        curr_length = 0
        for i in range(len(s)):
            t1 = getPalindromeLength(i, i)
            t2 = getPalindromeLength(i, i + 1)
            t1 = t2 if len(t2) > len(t1) else t1
            if len(t1) > curr_length:
                result = t1
                curr_length = len(t1)
        
        return result
```

# Editorial Code
## Dynamic Programming
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        dp = [[False] * n for _ in range(n)]
        ans = [0, 0]
        
        for i in range(n):
            dp[i][i] = True
        
        for i in range(n - 1):
            if s[i] == s[i + 1]:
                dp[i][i + 1] = True
                ans = [i, i + 1]

        for diff in range(2, n):
            for i in range(n - diff):
                j = i + diff
                if s[i] == s[j] and dp[i + 1][j - 1]:
                    dp[i][j] = True
                    ans = [i, j]

        i, j = ans
        return s[i:j + 1]
```
|   | b | a | b | a | d |
|---|---|---|---|---|---|
| b | T | F | T | F | F |
| a |   | T | F | T | F |
| b |   |   | T | F |   |
| a |   |   |   | T |   |
| d |   |   |   |   | T |


## Expand From Centers
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(i, j):
            left = i
            right = j
            
            while left >= 0 and right < len(s) and s[left] == s[right]:
                left -= 1
                right += 1
                
            return right - left - 1
        
        ans = [0, 0]

        for i in range(len(s)):
            odd_length = expand(i, i)
            if odd_length > ans[1] - ans[0] + 1:
                dist = odd_length // 2
                ans = [i - dist, i + dist]

            even_length = expand(i, i + 1)
            if even_length > ans[1] - ans[0] + 1:
                dist = (even_length // 2) - 1
                ans = [i - dist, i + 1 + dist]
                
        i, j = ans
        return s[i:j + 1]
```