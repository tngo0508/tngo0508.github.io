---
layout: single
title: "Problem of The Day:  Jump Game"
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
You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.

Return true if you can reach the last index, or false otherwise.

 

Example 1:

Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
Example 2:

Input: nums = [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.
 

Constraints:

1 <= nums.length <= 104
0 <= nums[i] <= 105
```

# Brute Force - TLE
## Intuition
I initially recognize that this problem involves determining whether it's possible to reach the last index of an array by jumping through its elements. My intuition tells me that a depth-first search (DFS) approach could be a way to solve this problem.

## Approach
The approach here is to use DFS with memoization to avoid redundant calculations. The function `canJump` takes the input array nums and initializes a memoization dictionary. The recursive function `dfs` is defined to explore possible jumps from the current index. If the last index is reached or surpassed, the function returns `True`. It iterates over possible steps and recursively calls itself to check if it's possible to reach the end from the next index.

## Complexity
- Time complexity:
O(n^2). In the worst case, the algorithm might explore all possible jumps for each index, resulting in a quadratic time complexity.

- Space complexity:
O(n). The space complexity is determined by the memoization dictionary, which stores results for each index to avoid redundant calculations.

## Code
```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        N = len(nums)
        memo = {}
        def dfs(index):
            if index >= N - 1:
                return True

            if index in memo:
                return memo[index]

            steps = nums[index]
            result = False
            for step in range(steps, 0, -1):
                if dfs(index + step):
                    result = True
                    break
            
            memo[index] = result
            return result

        return dfs(0)
```