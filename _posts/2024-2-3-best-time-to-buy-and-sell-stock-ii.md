---
layout: single
title: "Problem: Best Time to Buy and Sell Stock II"
date: 2024-2-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem](/assets/images/2024-02-03_18-06-19-problem-122.png)

## TLE Approaches

### Memoization

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        N = len(prices)
        memo = defaultdict()

        def dfs(i):
            if i == N:
                return 0

            if i in memo:
                return memo[i]

            res = 0
            curr_profit = 0
            for j in range(i, N):
                curr_profit = max(curr_profit, prices[j] - prices[i])
                res = max(res, curr_profit + dfs(j + 1))

            memo[i] = res
            return res

        return dfs(0)
```

### Dynamic Programming

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        N = len(prices)
        dp = [0] * N
        for i in range(1, N):
            for j in range(i):
                profit = prices[i] - prices[j]
                profit = profit if profit > 0 else 0
                dp[i] = max(dp[i - 1], dp[j] + profit)
        
        return dp[-1]
```

- Time complexity: O(n^2)
- Space complexity: O(n)

## Intuition

My initial thoughts on solving this problem are to iterate through the prices, keeping track of the minimum price encountered so far. At each step, calculate the potential profit by subtracting the minimum price from the current price. Keep updating the maximum profit by considering both buying and selling scenarios.

## Approach

My approach involves using two variables, `min_price` and `min_so_far`, to track the minimum prices encountered. I iterate through the prices, updating `min_price` and calculating potential profits. I also consider a selling scenario by tracking `min_so_far`. The maximum profit is updated accordingly.

## Complexity

- Time complexity:
O(n), where n is the length of the prices array. We iterate through the array once.

- Space complexity:
O(1) as we use a constant amount of space, regardless of the input size. We only use a few variables to store intermediate results.

## Code

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        min_so_far = float('inf')
        max_profit = 0
        for i, price in enumerate(prices):
            min_price = min(min_price, price)
            max_profit = max(max_profit, price - min_price, max_profit + price - min_so_far)
            if price - min_price > 0:
                min_so_far = float('inf')
            min_so_far = min(min_so_far, price)
        return max_profit
```

## Editorial Solution

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        res = 0

        # checking if the number current stock is greater than previous, just add the difference
        for i in range(1,len(prices)):
            if (prices[i] > prices[i-1]):
                res += prices[i] - prices[i-1]
        return res
```
