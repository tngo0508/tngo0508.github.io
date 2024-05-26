---
layout: single
title: "Problem of The Day: Student Attendance Record II"
date: 2024-5-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem552](/assets/images/2024-05-26_13-23-34-problem-552.png)

## Backtrack (Brute force) Approach - TLE

```python
class Solution:
    def checkRecord(self, n: int) -> int:
        status = ['A', 'L', 'P']
        MOD_CONST = 10**9 + 7
        self.not_eligible_records = 0

        def check(curr):
            counter = Counter(curr)
            if counter['A'] >= 2:
                return True
            for i in range(len(curr)):
                count = 0
                j = i
                while j < len(curr) and curr[j] == 'L':
                    count += 1
                    j += 1
                if count == 3:
                    return True

            return False


        def dfs(curr):
            if len(curr) == n:
                if check(curr):
                    self.not_eligible_records += 1
                return

            for j in range(3):
                dfs(curr + [status[j]])

        dfs([])
        return 3 ** (n % MOD_CONST) - self.not_eligible_records
```
