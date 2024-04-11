---
layout: single
title: "Problem of The Day: Remove K Digits"
date: 2024-4-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2024-04-10_18-14-45-problem-402.png)

> Note: Need to review this problem again

## My Approach - TLE

In my approach, I apply memoization to try all possible combinations efficiently. I start by defining a function to compare strings based on their lengths and digits, and another to remove leading zeroes. Then, within the main function, I use dynamic programming with memoization to explore all possible combinations of removing digits.

I recursively explore two options for each digit: either removing it or keeping it. I compare the results of these options using my comparison function and update the result accordingly. Finally, I remove any remaining placeholder characters (`x`) and leading zeroes from the result before returning it. This way, I ensure that I find the smallest possible number after removing `k` digits from the given string.

```python
class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        N = len(num)
        def compareStrings(s1, s2):
            if not s1:
                return s1
            if not s2:
                return s2
            if len(s1) < len(s2):
                return s1
            elif len(s1) > len(s2):
                return s2

            for c1, c2 in zip(s1, s2):
                if int(c1) < int(c2):
                    return s1
                if int(c1) > int(c2):
                    return s2

            return s1 or s2


        def trimZeroes(s):
            i = 0
            while i < len(s) and s[i] == '0':
                i += 1
            return s[i:] if s[i:] != '' else '0'

        @cache
        def dfs(i, count, num_str):
            if i >= N or count == 0:
                num_str = num_str.replace('x', '')
                return num_str
            for j in range(k):
                idx = i + j
                remove = dfs(i + 1, count - 1, num_str[:idx] + 'x' + num_str[idx + 1:])
                skip = dfs(i + 1, count, num_str)
                dfs.res = compareStrings(dfs.res, remove)
                dfs.res = compareStrings(dfs.res, skip)

            return dfs.res

        dfs.res = num
        dfs(0, k, num)
        dfs.res = trimZeroes(dfs.res)
        return str(dfs.res)
```

## Editorial Solution

Approach 2: Greedy with Stack

```python
class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        numStack = []

        # Construct a monotone increasing sequence of digits
        for digit in num:
            while k and numStack and numStack[-1] > digit:
                numStack.pop()
                k -= 1

            numStack.append(digit)

        # - Trunk the remaining K digits at the end
        # - in the case k==0: return the entire list
        finalStack = numStack[:-k] if k else numStack

        # trip the leading zeros
        return "".join(finalStack).lstrip('0') or "0"
```

- Time: O(n)
- Space: O(n)
