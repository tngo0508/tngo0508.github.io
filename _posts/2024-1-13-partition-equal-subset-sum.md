---
layout: single
title: "Problem of The Day: Partition Equal Subset Sum"
date: 2024-1-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.

 

Example 1:

Input: nums = [1,5,11,5]
Output: true
Explanation: The array can be partitioned as [1, 5, 5] and [11].
Example 2:

Input: nums = [1,2,3,5]
Output: false
Explanation: The array cannot be partitioned into equal sum subsets.
 

Constraints:

1 <= nums.length <= 200
1 <= nums[i] <= 100
```

>Need to review this problem

# Editorial solution
## Memoization
```python
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        @lru_cache(maxsize=None)
        def dfs(nums: Tuple[int], n: int, subset_sum: int) -> bool:
            # Base cases
            if subset_sum == 0:
                return True
            if n == 0 or subset_sum < 0:
                return False
            result = (dfs(nums, n - 1, subset_sum - nums[n - 1])
                    or dfs(nums, n - 1, subset_sum))
            return result

        # find sum of array elements
        total_sum = sum(nums)

        # if total_sum is odd, it cannot be partitioned into equal sum subsets
        if total_sum % 2 != 0:
            return False

        subset_sum = total_sum // 2
        n = len(nums)
        return dfs(tuple(nums), n - 1, subset_sum)
```

Note, the following is important -> when I attempted to implement this approach, I got the Time Limit Exceeded even though the implementation is about the same with the implementation above.
```
result = (dfs(nums, n - 1, subset_sum - nums[n - 1])
                    or dfs(nums, n - 1, subset_sum))
```

What I had in my code
```python
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        N = len(nums)
        if total % 2 != 0:
            return False
        @lru_cache(maxsize=None)
        def dfs(tuple_nums, i, curr_sum):
            if curr_sum == 0:
                return True
            if curr_sum < 0:
                return False
            if i == 0:
                return False
            
            # these cause TLE
            include = dfs(tuple_nums, i - 1, curr_sum - tuple_nums[i])
            exclude = dfs(tuple_nums, i - 1, curr_sum)
            result = include or exclude
            #
            return result
        
        max_sum = total // 2
        return dfs(tuple(nums), N - 1, max_sum)
```

## Dynamic Programming
Need to review again. I am still not fully clear how to come up with this induction rule for DP.
```python
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        # find sum of array elements
        total_sum = sum(nums)

        # if total_sum is odd, it cannot be partitioned into equal sum subsets
        if total_sum % 2 != 0:
            return False
        subset_sum = total_sum // 2
        n = len(nums)

        # construct a dp table of size (n+1) x (subset_sum + 1)
        dp = [[False] * (subset_sum + 1) for _ in range(n + 1)]
        dp[0][0] = True
        for i in range(1, n + 1):
            curr = nums[i - 1]
            for j in range(subset_sum + 1):
                if j < curr:
                    dp[i][j] = dp[i - 1][j]
                else:
                    dp[i][j] = dp[i - 1][j] or dp[i - 1][j - curr]
        return dp[n][subset_sum]
```