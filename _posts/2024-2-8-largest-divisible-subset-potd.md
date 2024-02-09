---
layout: single
title: "Problem of The Day: Perfect Squares"
date: 2024-2-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-368](/assets/images/2024-02-08_17-22-15-problem-368.png)

>Note: Need to review this again

## Brute Force Approach - TLE

My idea is to generate all possible combinations that satisfy the requirements asked in the question which is making sure that `nums[i] % nums[j] == 0 or nums[j] % nums[i] == 0`. This approach passes most of the basic cases, but soon it hits the Time Limit Exceeded on Leet Code with a large test case.

```python
class Solution:
    def largestDivisibleSubset(self, nums: List[int]) -> List[int]:
        def is_valid(arr):
            for i in range(len(arr)):
                for j in range(i + 1, len(arr)):
                    if not (arr[i] % arr[j] == 0 or arr[j] % arr[i] == 0):
                        return False
            return True

        N = len(nums)
        def dfs(idx, curr):
            if idx == N:
                if is_valid(curr):
                    return curr[:]
                return []
            res = []
            for i in range(idx, N):
                exclude = dfs(i + 1, curr)
                include = dfs(i + 1, curr + [nums[i]])
                if len(res) < len(exclude):
                    res = exclude[:]
                if len(res) < len(include):
                    res = include[:]
            
            return res

        return dfs(0, [])
```

- Time complexity: O(2^n) because in the recursion function call, we have two choices either include the number or skip it.
- Space complexity: O(n) because In the worst case, the maximum depth of the recursion stack is equal to the length of the input list 'n'.

## Intuition

My intuition is to iteratively build the subsets and efficiently track the largest one.

## Approach

My approach involves using a defaultdict to maintain a mapping between numbers and their corresponding subsets. I iterate through the sorted list of numbers and, for each number, check its divisibility against previously encountered numbers in the hashmap. I store the largest valid subset for each number. After processing all numbers, I select the subset with the maximum length as the result.

**Note:**
*The sorting of the `nums` array is crucial because it ensures that, during the iteration, we encounter smaller numbers before larger ones. This is essential for the efficiency of the algorithm.*

*By processing the numbers in ascending order, we can guarantee that when checking divisibility, we have already considered all possible factors for a given number. This helps in efficiently building the largest divisible subset for each number in a way that avoids redundant calculations and ensures that the resulting subsets are optimal. Sorting allows us to handle divisibility checks more effectively, contributing to the overall correctness and efficiency of the solution.*

## Complexity

- Time complexity:
O(n^2) due to nested loops that iterate over the list of numbers and the keys in the hashmap.

- Space complexity:
O(n) as we store subsets in the hashmap, and the maximum depth of the recursion stack is proportional to the length of the input list.

## Code

```python
class Solution:
    def largestDivisibleSubset(self, nums: List[int]) -> List[int]:
        hash_map = defaultdict(list)
        nums.sort()
        for num in nums:
            curr = []
            for k in hash_map.keys():
                if num % k == 0 and len(hash_map[k]) > len(curr):
                    curr = hash_map[k]
            hash_map[num].append(num)
            hash_map[num].extend(curr)
        
        res = []
        for arr in hash_map.values():
            res.append([len(arr), arr])
        
        print(hash_map)
        return max(res)[1]

```
