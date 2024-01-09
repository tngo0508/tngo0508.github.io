---
layout: single
title: "Problem of The Day: Longest Valid Parentheses"
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
[![problem](/assets/images/2024-01-08_23-45-27-longest-valid-parenthese.png)](/assets/images/2024-01-08_23-45-27-longest-valid-parenthese.png)

# Intuition
The problem requires finding the length of the longest valid parentheses substring. A valid parentheses substring is one in which each open parenthesis `'('` has a corresponding close parenthesis `')'`, and the parentheses are properly nested.

# Approach
The brute-force approach uses a recursive function (`dfs`) to explore all possible combinations of parentheses substrings. The function keeps track of the number of open and close parentheses and updates the result when a valid substring is found.

# Complexity
- Time complexity:
O(2^n) - Exponential time complexity due to the recursive exploration of all possible combinations.

- Space complexity:
O(n) - The depth of the recursion is proportional to the length of the input string.

>**This brute-force approach is not efficient and results in Time Limit Exceeded for larger inputs.**

# Brute Force - TIME LIMIT EXCEEDED
```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        N = len(s)
        memo = defaultdict()
        
        def dfs(i, open_count, close_count):
            if close_count > open_count:
                return

            if i == N:
                return

            if s[i] == '(':
                open_count += 1
            else:
                close_count += 1
            
            if open_count == close_count:
                dfs.result = max(dfs.result, open_count * 2) 
            dfs(i + 1, open_count, close_count)
        
        dfs.result = 0
        for i in range(N):
            if s[i] == '(':
                dfs(i, 0, 0)
        return dfs.result
```

# Improved Approach - Using Stack
To improve efficiency, we can use a stack-based approach. The stack helps keep track of the indices of unmatched parentheses, allowing us to calculate the length of valid substrings more efficiently.

## Complexity
- Time complexity: 
O(N) - Single pass through the input string.

-Space complexity: 
O(N) - Stack can have at most N elements.

## Stack-based Approach
```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack = [-1]  # Initialize stack with a sentinel value -1
        max_len = 0

        # Iterate through the characters of the input string
        for i in range(len(s)):
            # If the current character is '(', push its index onto the stack
            if s[i] == '(':
                stack.append(i)
            else:
                # If the current character is ')', pop the top element from the stack
                stack.pop()
                if not stack:
                    # If the stack is empty after the pop, push the current index onto the stack
                    stack.append(i)
                else:
                    # Calculate the length of the valid parentheses substring using the current index and the top element of the stack
                    max_len = max(max_len, i - stack[-1])

        # Return the maximum length of the valid parentheses substring
        return max_len
```

# Editorial Code - Dynamic Programming Approach
**Note: I need to review this approach again**
```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        # Get the length of the input string
        n = len(s)
        
        # Initialize an array to store the length of valid parentheses substrings ending at each position
        dp = [0] * n
        
        # Variable to keep track of the maximum valid length
        max_len = 0

        # Iterate through the input string starting from the second character
        for i in range(1, n):
            # Check if the current character is ')'
            if s[i] == ')':
                # Case 1: If the previous character is '(', update dp[i] based on the length of the valid substring ending at i-2 (if i >= 2)
                if s[i - 1] == '(':
                    dp[i] = dp[i - 2] + 2 if i >= 2 else 2
                # Case 2: If the previous character is ')' and there is a valid substring ending at i-1, consider its length as well
                elif i - dp[i - 1] > 0 and s[i - dp[i - 1] - 1] == '(':
                    dp[i] = dp[i - 1] + 2 + (dp[i - dp[i - 1] - 2] if i - dp[i - 1] >= 2 else 0)
                
                # Update max_len with the current maximum length
                max_len = max(max_len, dp[i])

        # Return the final result, which is the maximum valid length
        return max_len
```

# Editorial - Most Optimized Code - Two pointer without extra space
**Note: I need to review this approach again**
```python
class Solution:
    def longestValidParentheses(self, s: str) -> int:
        left, right = 0, 0
        max_len = 0

        # Left-to-right pass
        for char in s:
            if char == '(':
                left += 1
            elif char == ')':
                right += 1

            if left == right:
                max_len = max(max_len, 2 * right)
            elif right > left:
                left, right = 0, 0

        left, right = 0, 0

        # Right-to-left pass
        for char in reversed(s):
            if char == '(':
                left += 1
            elif char == ')':
                right += 1

            if left == right:
                max_len = max(max_len, 2 * left)
            elif left > right:
                left, right = 0, 0

        return max_len

```