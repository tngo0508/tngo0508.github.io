---
layout: single
title: "Problem of The Day:  Best Time to Buy and Sell Stock"
date: 2024-1-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

 

Example 1:

Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
Example 2:

Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
 

Constraints:

1 <= prices.length <= 10^5
0 <= prices[i] <= 10^4
```

# Intuition
My initial thought is to keep track of the minimum price encountered so far and the maximum profit achievable. By iterating through the prices and updating these values, we can find the maximum profit.

# Approach
I will iterate through the `prices` array, updating the minimum price and the maximum profit at each step. For each price, I will check if it is a new minimum. If so, update the minimum price. Then, calculate the profit by subtracting the minimum price from the current price. Update the maximum profit if the calculated profit is greater. This way, we ensure that we always consider the best buying and selling points.

# Complexity
- Time complexity:
O(n) where n is the number of prices. We iterate through the prices array once.

- Space complexity:
O(1) as we use constant space to store variables like min_price, max_price, and profit.

# Code
```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_price = float('-inf')
        profit = 0
        for price in prices:
            min_price = min(min_price, price)
            max_price = max(min_price, price)
            profit = max(profit, max_price - min_price)
        return profit
```

# Editorial Solution
```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for i in range(len(prices)):
            if prices[i] < min_price:
                min_price = prices[i]
            elif prices[i] - min_price > max_profit:
                max_profit = prices[i] - min_price
                
        return max_profit
```