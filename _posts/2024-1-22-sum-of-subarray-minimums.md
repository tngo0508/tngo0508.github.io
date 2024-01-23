---
layout: single
title: "Problem of The Day: Sum of Subarray Minimums"
date: 2024-1-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
Given an array of integers arr, find the sum of min(b), where b ranges over every (contiguous) subarray of arr. Since the answer may be large, return the answer modulo 109 + 7.

 

Example 1:

Input: arr = [3,1,2,4]
Output: 17
Explanation: 
Subarrays are [3], [1], [2], [4], [3,1], [1,2], [2,4], [3,1,2], [1,2,4], [3,1,2,4]. 
Minimums are 3, 1, 2, 4, 1, 1, 2, 1, 1, 1.
Sum is 17.
Example 2:

Input: arr = [11,81,94,43,3]
Output: 444
 

Constraints:

1 <= arr.length <= 3 * 10^4
1 <= arr[i] <= 3 * 10^4
```

>Need to review this problem again in the future

# Brute Force - TLE
I attempted to use brute force solve the problem, O(n^2) is too slow for runtime compplexity to be accepted by Leet code Judge
```python
class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        N = len(arr)
        res = 0
        for i in range(N):
            for j in range(i, N):
                res += min(arr[i:j + 1])
        return res % (10**9 + 7)
```

Then, I attempted to use DP to solve, but still ended up with O(n^2) runtime.
```python
class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        N = len(arr)
        dp = [0] * N
        dp[0] = arr[0]
        for i in range(1, N):
            dp[i] += dp[i - 1]
            curr_min = arr[i]
            for j in range(i, -1, -1):
                curr_min = min(curr_min, arr[j])
                dp[i] += curr_min
                
        # print(dp)
        return dp[-1] % (10**9 + 7)
```

# Editorial Solution
The idea to solve this problem efficiently is to use monotonic increasing stack. Basically, we flip the way of approach the problem. Instead of finding the minimum values within ranges, we focus on finding the contribution of each element to the final result. The trick for this question is to calculate the contribution of each element by using the following formula.
```
element * count of subarrays where it is smallest
```

To understand the formula better, it's suggested to read the editorial solution for this problem. It provides the clear explanation the intuitiion for that.

## Explanation
This algorithm uses a monotonic stack to efficiently compute the sum of minimum values for all possible subarrays in a given array. The stack keeps track of the indices of elements in the array, maintaining a non-decreasing order.

The algorithm iterates through each element of the array, and for each element, it processes the stack. If the current element is greater than or equal to the element at the top of the stack, it means that the stack's elements contribute to the minimum value for subarrays ending at the current element.

As it processes the stack, it calculates the count of subarrays where the element at the top of the stack is the minimum. The count is determined by the difference in indices between the current element, the element at the top of the stack, and the element just before the top of the stack. This count is then multiplied by the corresponding element's value and added to the total sum of minimums.

The algorithm continues this process until it completes the iteration through the array. Finally, it returns the sum of minimum values modulo a large constant (MOD) to prevent overflow. This approach efficiently handles the computation of minimum values for all subarrays using a monotonic stack and contributes to an optimized solution for the problem.

```python

class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        MOD = 10 ** 9 + 7
        stack = []
        sum_of_minimums = 0

        for i in range(len(arr) + 1):
            
            # when i reaches the array length, it is an indication that
            # all the elements have been processed, and the remaining
            # elements in the stack should now be popped out.

            while stack and (i == len(arr) or arr[stack[-1]] >= arr[i]):

                # Notice the sign ">=", This ensures that no contribution
                # is counted twice. right_boundary takes equal or smaller 
                # elements into account while left_boundary takes only the
                # strictly smaller elements into account

                mid = stack.pop()
                left_boundary = -1 if not stack else stack[-1]
                right_boundary = i

                # count of subarrays where mid is the minimum element
                count = (mid - left_boundary) * (right_boundary - mid)
                sum_of_minimums += (count * arr[mid])

            stack.append(i)
        
        return sum_of_minimums % MOD
 
```

- Time complexity: O(n)
- Space complexity: O(n)

## Dynamic Programing + Monotonic Stack
```python

class Solution:
    def sumSubarrayMins(self, arr: List[int]) -> int:
        MOD = 10 ** 9 + 7

        # monotonic increasing stack
        stack = []

        # make a dp array of the same size as the input array
        dp = [0] * len(arr)

        # populate monotonically increasing stack
        for i in range(len(arr)):
            # before pushing an element, make sure all
            # larger and equal elements in the stack are
            # removed
            while stack and arr[stack[-1]] >= arr[i]:
                stack.pop()

            # calculate the sum of minimums of all subarrays
            # ending at index i
            if stack:
                previousSmaller = stack[-1]
                dp[i] = dp[previousSmaller] + (i - previousSmaller) * arr[i]
            else:
                dp[i] = (i + 1) * arr[i]
            stack.append(i)

        # add all the elements of dp to get the answer
        return sum(dp) % MOD

```

- Time complexity: O(n)
- Space complexity: O(n)