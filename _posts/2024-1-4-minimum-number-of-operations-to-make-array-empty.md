---
layout: single
title: "Problem of The Day: Minimum Number of Operations to Make Array Empty"
date: 2024-1-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
```
You are given a 0-indexed array nums consisting of positive integers.

There are two types of operations that you can apply on the array any number of times:

Choose two elements with equal values and delete them from the array.
Choose three elements with equal values and delete them from the array.
Return the minimum number of operations required to make the array empty, or -1 if it is not possible.

 

Example 1:

Input: nums = [2,3,3,2,2,4,2,3,4]
Output: 4
Explanation: We can apply the following operations to make the array empty:
- Apply the first operation on the elements at indices 0 and 3. The resulting array is nums = [3,3,2,4,2,3,4].
- Apply the first operation on the elements at indices 2 and 4. The resulting array is nums = [3,3,4,3,4].
- Apply the second operation on the elements at indices 0, 1, and 3. The resulting array is nums = [4,4].
- Apply the first operation on the elements at indices 0 and 1. The resulting array is nums = [].
It can be shown that we cannot make the array empty in less than 4 operations.
Example 2:

Input: nums = [2,1,2,2,3,3]
Output: -1
Explanation: It is impossible to empty the array.
```

# Intuition
The intuition behind the solution seems to involve calculating the minimum number of operations to reduce the occurrences of each element in the array to a certain number (either n-3 or n-2), where n is the frequency of the element in the array.

# Approach
The solution utilizes a recursive function helper(n) with memoization using @lru_cache. This function calculates the minimum number of operations needed to reduce n to either `n-3` or `n-2`.
The main function iterates through the unique values in the array using a `Counter`.
For each unique value, it calculates the minimum operations needed using the helper function and adds it to the result.
If any value results in an infinite number of operations (indicated by float('inf')), the function returns -1. That means that it is impossible to reduce the array to empty

# Complexity
Time complexity:
Assuming the range of values is within a reasonable limit, the time complexity is expected to be approximately O(n), where n is the number of unique values in the Counter.

Space complexity:
Assuming a reasonable limit on the number of unique values, the space complexity is approximately O(n), where n is the number of unique values in the Counter.

# Code
```python
class Solution:
    def minOperations(self, nums: List[int]) -> int:
        @lru_cache(maxsize=None)
        def helper(n):
            if n < 0:
                return float('inf')
            if n == 0:
                return 0
            
            first = helper(n - 3) + 1
            second = helper(n - 2) + 1
            return min(first, second)

        counter = Counter(nums)
        result = 0
        for v in counter.values():
            val = helper(v)
            if val == float('inf'):
                return -1
            result += helper(v)
        return result
```

# Editorial Solution
```python
class Solution:
    def minOperations(self, nums: List[int]) -> int:
        counter = Counter(nums)
        ans = 0
        for c in counter.values():
            if c == 1: 
                return -1
            ans += ceil(c / 3)
        return ans
```