---
layout: single
title: "Problem of The Day: Maximum Product Subarray"
date: 2024-1-11
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
You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

 

Example 1:

Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3).
Total amount you can rob = 1 + 3 = 4.
Example 2:

Input: nums = [2,7,9,3,1]
Output: 12
Explanation: Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1).
Total amount you can rob = 2 + 9 + 1 = 12.
 

Constraints:

1 <= nums.length <= 100
0 <= nums[i] <= 400
```
# Brute Force
## Intuition
The problem at hand is a variant of the classic "House Robber" problem, where we need to find the maximum amount that can be robbed without robbing adjacent houses. My initial thoughts were to use a recursive approach to explore all possible combinations of robbing and not robbing houses.

## Approach
I chose a depth-first search (DFS) approach to explore the decision tree of robbing or not robbing each house. The `dfs` function takes the current index `i` and the current accumulated sum `curr`. It explores two options: robbing the current house (`rob_curr_house`) and not robbing the current house (`rob_next_house`). The maximum of these two options is returned for each recursive call.

## Complexity
- Time complexity:
The time complexity is exponential, specifically O(2^n), where n is the number of houses. This is because, for each house, the algorithm explores two possibilities (rob or not rob), leading to an exponential number of recursive calls.

- Space complexity:
The space complexity is O(n), where n is the maximum recursion depth. This is due to the recursive nature of the algorithm, and the maximum depth of the recursion is determined by the number of houses. However, note that the actual space used during the recursion is less than O(n) due to shared computation between recursive calls.

## Code
```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        def dfs(i, curr):
            if i >= len(nums):
                return curr
            
            rob_curr_house = dfs(i + 2, curr + nums[i])
            rob_next_house = dfs(i + 1, curr)
            return max(rob_curr_house, rob_next_house)

        return dfs(0, 0)
```

# Memoization
# Intuition
Recognizing the exponential time complexity of the initial brute force approach, my intuition led me to apply memoization to reduce redundant calculations. Memoization helps store and retrieve previously computed results, preventing the algorithm from revisiting the same subproblems.

# Approach
I extended the initial recursive approach by introducing a `memo` dictionary to store the results of already computed subproblems. Before performing a recursive call, the algorithm checks if the result for the current state (represented by `(i, curr)`) is already present in the memoization table. If found, it directly retrieves the result; otherwise, it calculates the result, updates the `memo` table, and returns the maximum value.

This memoization technique optimizes the algorithm by avoiding the reevaluation of overlapping subproblems, significantly reducing both time and space complexity.

# Complexity
- Time complexity:
With memoization, the time complexity is improved to O(n), where n is the number of houses. This is because each subproblem is computed only once, and subsequent calls retrieve the result from the memoization table in constant time.

- Space complexity:
The space complexity is O(n) due to the memoization table, which stores the results of subproblems. The maximum depth of the recursion is determined by the number of houses, and the space required for memoization is proportional to this depth. The shared computation between recursive calls reduces the actual space usage compared to the brute force approach.

# Code
```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        # Memoization table
        memo = {}

        def dfs(i, curr):
            if i >= len(nums):
                return curr
            
            # Check if the result for the current subproblem is already computed
            if (i, curr) in memo:
                return memo[(i, curr)]

            rob_curr_house = dfs(i + 2, curr + nums[i])
            rob_next_house = dfs(i + 1, curr)

            # Update memoization table with the result for the current subproblem
            memo[(i, curr)] = max(rob_curr_house, rob_next_house)

            return memo[(i, curr)]

        return dfs(0, 0)
```
# Dynamic Programming
```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]
        N = len(nums)
        dp = [0] * N
        dp[0] = nums[0]
        dp[1] = max(nums[0], nums[1])
        for i in range(2, N):
            dp[i] = max(dp[i - 2] + nums[i], dp[i - 1])

        return dp[-1]
```

- Time complexity: The time complexity is O(n), where n is the number of houses. The algorithm iterates through the list of houses once, and at each step, it performs constant-time operations.

- Space complexity: The space complexity is O(n). The algorithm uses a 1D array dp of size n to store the maximum amount of money that can be robbed up to each house.

# Editorial Solution
## Memoization

```python
class Solution:
    
    def __init__(self):
        self.memo = {}
    
    def rob(self, nums: List[int]) -> int:
        
        self.memo = {}
        
        return self.robFrom(0, nums)
    
    def robFrom(self, i, nums):
        
        
        # No more houses left to examine.
        if i >= len(nums):
            return 0
        
        # Return cached value.
        if i in self.memo:
            return self.memo[i]
        
        # Recursive relation evaluation to get the optimal answer.
        ans = max(self.robFrom(i + 1, nums), self.robFrom(i + 2, nums) + nums[i])
        
        # Cache for future use.
        self.memo[i] = ans
        return ans
```

## Dynamic Programming

```python
class Solution:
    
    def rob(self, nums: List[int]) -> int:
        
        # Special handling for empty case.
        if not nums:
            return 0
        
        N = len(nums)
        
        rob_next_plus_one = 0
        rob_next = nums[N - 1]
        
        # DP table calculations.
        for i in range(N - 2, -1, -1):
            
            # Same as recursive solution.
            current = max(rob_next, rob_next_plus_one + nums[i])
            
            # Update the variables
            rob_next_plus_one = rob_next
            rob_next = current
            
        return rob_next
```