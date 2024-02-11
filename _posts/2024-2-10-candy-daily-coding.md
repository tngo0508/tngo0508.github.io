---
layout: single
title: "Problem of The Day: Candy"
date: 2024-2-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-135](/assets/images/2024-02-10_18-23-06-problem-135.png)](/assets/images/2024-02-10_18-23-06-problem-135.png)

## Intuition

My initial thoughts are to iterate through the ratings twice to ensure that we consider both left and right neighbors for each child while determining the number of candies they should receive.

## Approach

I will use dynamic programming to keep track of the number of candies each child should receive. I will iterate through the ratings twice: once from left to right, and then from right to left. At each step, I will compare the current child's rating with its neighbors and update the number of candies accordingly. This two-pass approach ensures that each child considers both left and right neighbors.

## Complexity

- Time complexity:
O(n). We iterate through the ratings twice, and each iteration takes linear time.

O(n). We use an array of size N to store the number of candies for each child.

## Code

```python
class Solution:
    def candy(self, ratings: List[int]) -> int:
        N = len(ratings)
        dp = [1] * N
        for i in range(N):
            l = i - 1 if i > 0 else i
            r = i + 1 if i + 1 < N else i
            if ratings[i] > ratings[l]:
                dp[i] = max(dp[i], dp[l] + 1)
            if ratings[i] > ratings[r]:
                dp[i] = max(dp[i], dp[r] + 1)
        
        for i in reversed(range(N)):
            l = i - 1 if i > 0 else i
            r = i + 1 if i + 1 < N else i
            if ratings[i] > ratings[l]:
                dp[i] = max(dp[i], dp[l] + 1)
            if ratings[i] > ratings[r]:
                dp[i] = max(dp[i], dp[r] + 1)
        return sum(dp)
```
