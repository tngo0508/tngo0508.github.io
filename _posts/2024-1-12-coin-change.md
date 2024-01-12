---
layout: single
title: "Problem of The Day: Coin Change"
date: 2024-1-12
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
You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.

 

Example 1:

Input: coins = [1,2,5], amount = 11
Output: 3
Explanation: 11 = 5 + 5 + 1
Example 2:

Input: coins = [2], amount = 3
Output: -1
Example 3:

Input: coins = [1], amount = 0
Output: 0
 

Constraints:

1 <= coins.length <= 12
1 <= coins[i] <= 231 - 1
0 <= amount <= 104
```

My Note:
[![note](/assets/images/2024-01-12_13-56-34-coin-change-note.png)](/assets/images/2024-01-12_13-56-34-coin-change-note.png)

# Brute Force
## Intuition
The problem involves finding the minimum number of coins needed to make up a given amount. My initial thought is to explore all possible combinations of coins and identify the one with the minimum count.

## Approach
I employ a depth-first search (DFS) approach to iterate through the coin options. The function `dfs` takes the current index, remaining amount, and the current combination of coins as parameters. It explores all possible choices, updating the result whenever a combination is found that meets the target amount.

## Complexity
- Time complexity:
O(2^n) in the worst case, where n is the size of the input coins. The algorithm explores all possible combinations.

- Space complexity:
O(n), where n is the depth of the recursion stack. This is determined by the number of coins in the current combination.

## Code
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        N = len(coins)
        result = float('inf')

        def dfs(idx, amount, curr):
            nonlocal result
            if amount < 0:
                return
            if amount == 0:
                result = min(result, len(curr))
                return

            for i in range(idx, N):
                dfs(i, amount - coins[i], curr + [coins[i]])

        dfs(0, amount, [])
        return result if result != float('inf') else -1
```
# Brute force - different implementation
In previous brute force approach, I implemented the `dfs` function with three parameters because I wanted to accumulate the the current sum from the top-down and use a global variable `result` to track my final solution. Instead of doing that, I could implement the tail recursion. That means that I actually did not need to use the `curr` to track the current sum or accumulated sum. The core idea was that the final solution would be returned to the root node of recursion stack when a solution is found. Then, I use the `min` to keep track of the minimum coins for each path(one coin = one path).

I revised the implementation to focus on the number of coins needed for each path, where one coin represents one path. The `dfs` function now takes the current index and the remaining amount as parameters. The accumulated sum is tracked implicitly within the recursive calls. The `min` function is used to find the minimum number of coins for each path.
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        N = len(coins)

        def dfs(idx, curr_amount):
            if curr_amount == 0:
                return 0

            if curr_amount < 0:
                return float('inf')

            num_of_coins = []
            for i in range(idx, N):
                num_of_coins.append(dfs(i, curr_amount - coins[i]) + 1)
            
            return min(num_of_coins)


        result = dfs(0, amount)
        return result if result != float('inf') else -1
```

# Memoization
## Intuition
The brute force is too slow to solve the problem. To improve the time and space complexity, I used the memoization to improve the algorithm's runtime.

## Approach
I use a recursive approach with memoization. The dfs function takes the current index and remaining amount as parameters. I store the results in a memo dictionary to avoid redundant calculations. If the result for a specific combination of parameters is already computed, it is directly retrieved from the memo instead of recalculating.

## Complexity
- Time complexity:
O(N * amount), where N is the size of the input coins. The memoization technique reduces redundant computations, resulting in a more efficient solution.

- Space complexity:
O(N * amount), as the memo dictionary stores results for various combinations of parameters, and the depth of the recursion stack is proportional to the amount.

## Code
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        N = len(coins)
        memo = defaultdict()
        def dfs(idx, curr_amount):
            if curr_amount == 0:
                return 0

            if curr_amount < 0:
                return float('inf')
            
            if (idx, curr_amount) in memo:
                return memo[(idx, curr_amount)]

            num_of_coins = []
            for i in range(idx, N):
                num_of_coins.append(dfs(i, curr_amount - coins[i]) + 1)

            memo[(idx, curr_amount)] = min(num_of_coins)
            
            return memo[(idx, curr_amount)]


        result = dfs(0, amount)
        return result if result != float('inf') else -1
```

# Cleaner Memoization
In previous section of memoization, I used 2 parameters in the `dfs` function. However, I played around with the code and realize that I didn't actually need to pass in the `idx` variable. It's redundant. By removing that variable, I came up with a cleaner implementation.
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        memo = defaultdict()
        def dfs(curr_amount):
            if curr_amount == 0:
                return 0

            if curr_amount < 0:
                return float('inf')
            
            if curr_amount in memo:
                return memo[curr_amount]

            num_of_coins = []
            for coin in coins:
                num_of_coins.append(dfs(curr_amount - coin) + 1)

            memo[curr_amount] = min(num_of_coins)
            
            return memo[curr_amount]


        result = dfs(amount)
        return result if result != float('inf') else -1
```

# Dynamic Programming (DP)
## Intuition
Memoization approach is good enough to pass the Leet Code judge for my submission. To improve the space complexity further, I attempted to implement the bottom-up approach using Dynamic programming.

## Approach
I create a dynamic programming array `dp` of size `amount + 1` and initialize it with `float('inf')` for each entry, except for `dp[0]`, which is set to `0` since no coins are needed to make up `0` amount. I then iterate through each coin and update the corresponding entry in the `dp` array to `1`, as one coin is sufficient to make up that amount.

The next step involves iterating through the range of the amount and updating the `dp` array based on the minimum number of coins needed for each amount. This is done by considering each coin and checking if subtracting it from the current amount leads to a smaller number of coins.

The final result is stored in `dp[-1]`, representing the minimum number of coins needed to make up the given amount.

## Complexity
- Time complexity:
O(N * amount), where N is the size of the input coins. The nested loops iterate through each coin and each amount.

- Space complexity:
O(amount), as the dynamic programming array dp is of size `amount + 1`.

## Code
```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        if amount == 0:
            return 0
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for coin in coins:
            if coin < amount + 1:
                dp[coin] = 1
        for amnt in range(amount + 1):
            for coin in coins:
                if amnt - coin >= 0:
                    dp[amnt] =  min(dp[amnt], dp[amnt - coin] + dp[coin])
                
        
        return dp[-1] if dp[-1] != float('inf') else -1
```
# Editorial Solution
```python
# DP BOTTOM-UP APPROACH
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        
        for coin in coins:
            for x in range(coin, amount + 1):
                dp[x] = min(dp[x], dp[x - coin] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1 
```