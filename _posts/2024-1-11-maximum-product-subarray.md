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
Given an integer array nums, find a 
subarray
 that has the largest product, and return the product.

The test cases are generated so that the answer will fit in a 32-bit integer.

 

Example 1:

Input: nums = [2,3,-2,4]
Output: 6
Explanation: [2,3] has the largest product 6.
Example 2:

Input: nums = [-2,0,-1]
Output: 0
Explanation: The result cannot be 2, because [-2,-1] is not a subarray.
 

Constraints:

1 <= nums.length <= 2 * 104
-10 <= nums[i] <= 10
The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.
```

>I strongly recommend referring to LeetCode's Approach 2 for a hand-trace debug session to gain a clearer understanding of the algorithm. This process will provide valuable insights into the intricacies of the solution and enhance your comprehension of the underlying logic.


# Brute Force - Time Limit Exceeded
## Intuition
The initial intuition to solve this problem involves exploring all possible subarrays and calculating their products to find the maximum product.

## Approach
The approach uses a nested loop to iterate over each element in the array and computes the product of all possible subarrays starting from that element. The maximum product is updated as the algorithm iterates through the array.

## Complexity
- Time complexity:
O(n^2). The algorithm uses a nested loop to explore all possible subarrays, resulting in quadratic time complexity.

- Space complexity:
O(1). The algorithm uses a constant amount of space, regardless of the input size. The only variables used are integers to store the result and the current product.

## Code
```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        N = len(nums)
        res = float('-inf')
        for i in range(N):
            res = max(res, nums[i])
            curr_product = nums[i]
            for j in range(i + 1, N):
                curr_product *= nums[j]
                res = max(res, curr_product)
        
        return res
```

# Dynamic Programming
This question posed a significant challenge, and despite multiple attempts, I struggled to grasp the intuition and devise an effective approach on my own. It wasn't until I carefully reviewed the provided solution that I gained a clearer understanding. For tackling similar questions in the future, I would strongly recommend thorough review and memorization of the approach and algorithm, as this can prove instrumental in preparing for interviews.

## Approach
The approach uses dynamic programming to keep track of both the maximum and minimum products ending at each position. By considering the current element and the products from the previous position, the algorithm updates the maximum and minimum products. The overall result is updated with the maximum product encountered during the iteration.
## Complexity
- Time complexity:
O(N). The algorithm iterates through the array once, performing constant-time operations at each step.

- Space complexity:
O(1). The algorithm uses a constant amount of space for variables (maxproduct, minproduct, result) regardless of the input size.

## Code
```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        # Initialize variables to store the maximum product, minimum product, and overall result
        maxproduct, minproduct, result = nums[0], nums[0], nums[0]

        # Iterate through the array starting from the second element
        for i in nums[1:]:
            # Calculate the potential products for the current element
            temp = [i, i * maxproduct, i * minproduct]

            # Update the maximum and minimum products based on the calculated values
            maxproduct = max(temp)
            minproduct = min(temp)

            # Update the overall result with the maximum product
            result = max(result, maxproduct)

        # Return the final result
        return result

```

# Editorial Solution

## Intuition
The idea is to view the problem as a task of finding the highest combo chain. A combo chain is essentially a sequence of numbers that builds on top of the previous ones. The main challenges come from encountering zeros and negative numbers during the traversal of the array.

## Handling Zeroes:
Zeros reset the combo chain. The algorithm keeps track of the maximum product so far (`max_so_far`) and the minimum product so far (`min_so_far`). If a zero is encountered, the current combo chain is disrupted, and the algorithm restarts the calculation of `max_so_far` and `min_so_far`.

## Handling Negative Numbers:
A single negative number can flip a combo chain to a very small number. However, if another negative number is encountered, there's a chance to save the combo chain. The algorithm uses `min_so_far` as an antidote to the disruption caused by negative numbers.

## Updating `max_so_far` and min_so_far:
- `max_so_far` is updated by taking the maximum value among the current number, the product of the last `max_so_far` and the current number, and the product of the last min_so_far and the current number. This allows handling positive numbers and disruptions caused by zeros and negative numbers.
- `min_so_far` is updated similarly by taking the minimum among the same three numbers.

The algorithm dynamically updates `max_so_far` and `min_so_far` as it traverses the array, handling disruptions caused by zeros and negative numbers. This approach ensures that the algorithm keeps track of the highest combo chain, taking into account the special cases introduced by zeros and negative numbers. The animation demonstrates how negative numbers disrupt and potentially save a combo chain.

## Code
```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        if len(nums) == 0:
            return 0

        max_so_far = nums[0]
        min_so_far = nums[0]
        result = max_so_far

        for i in range(1, len(nums)):
            curr = nums[i]
            temp_max = max(curr, max_so_far * curr, min_so_far * curr)
            min_so_far = min(curr, max_so_far * curr, min_so_far * curr)

            max_so_far = temp_max

            result = max(max_so_far, result)

        return result
```

# For Future Me
>"Embrace the challenges, for they are the stepping stones on the path to your success. With each hurdle, you grow stronger and wiser. Keep moving forward, for the journey itself is an invaluable teacher, shaping you into the person you are destined to become."