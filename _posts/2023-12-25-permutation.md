---
title: "Problem of the Day: Permutations"
date: 2023-12-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
Tonight, I continue working on the **Top 100 Liked** List. I am still reviewing the Backtracking topic. The today's problem is a classic problem called [Permutations](https://leetcode.com/problems/permutations/description/?envType=study-plan-v2&envId=top-100-liked). As stated in the name, the problem asked me to generate all the possible permutations given an input array `nums`. I have already solved this problem for a handsome amount of times. This time, I tried to put it into words so that I could test if it shrinks into my head.

# Problem
```

Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.

 

Example 1:

Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
Example 2:

Input: nums = [0,1]
Output: [[0,1],[1,0]]
Example 3:

Input: nums = [1]
Output: [[1]]
```

# My Explanation
This is my handwriting notes. This helps me to visualize the algorithm before I start implementing code.
![notes](../assets/images/2023-12-25_20-00-38-permutation.png)

As depicted in the figure above, I started with an empty array. As I go through each element in the input array, I visualized and added each number of the input into my `result` array one by one. Note that, my algorithm is not technically adding it. This figurative speaking is just an illustration of my thoughts on how to come to the final result. At each iteration, I perform a swap operation to make sure that I generate all possible permutations. To do this, I employ the backtrack algorithm to explore all the possible paths in my recursive tree. Once, I am done with one branch, I backtrack by re-swap the elements again back to normal state. That means that as once I go through the entire tree, I will get all the potential candidates in my final result.

Here is my solution
```python
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        def backtrack(index, curr, result, nums):
            if len(curr) == len(nums):
                result.append(curr[:])
                return


            for i in range(index, len(nums)):
                nums[i], nums[index] = nums[index], nums[i]
                backtrack(index + 1, curr + [nums[index]], result, nums)
                nums[i], nums[index] = nums[index], nums[i]


        result = []
        backtrack(0, [], result, nums)
        return result
```

# Solution Code
```python
# Leet code Solution
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        def backtrack(curr):
            if len(curr) == len(nums):
                ans.append(curr[:])
                return
        
            for num in nums:
                if num not in curr:
                    curr.append(num)
                    backtrack(curr)
                    curr.pop()
            
        ans = []
        backtrack([])
        return ans
```