---
layout: single
title: "Problem of The Day: Arithmetic Slices II - Subsequence"
date: 2024-1-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
```
Given an integer array nums, return the number of all the arithmetic subsequences of nums.

A sequence of numbers is called arithmetic if it consists of at least three elements and if the difference between any two consecutive elements is the same.

For example, [1, 3, 5, 7, 9], [7, 7, 7, 7], and [3, -1, -5, -9] are arithmetic sequences.
For example, [1, 1, 2, 5, 7] is not an arithmetic sequence.
A subsequence of an array is a sequence that can be formed by removing some elements (possibly none) of the array.

For example, [2,5,10] is a subsequence of [1,2,1,2,4,1,5,10].
The test cases are generated so that the answer fits in 32-bit integer.

 

Example 1:

Input: nums = [2,4,6,8,10]
Output: 7
Explanation: All arithmetic subsequence slices are:
[2,4,6]
[4,6,8]
[6,8,10]
[2,4,6,8]
[4,6,8,10]
[2,4,6,8,10]
[2,6,10]
Example 2:

Input: nums = [7,7,7,7,7]
Output: 16
Explanation: Any subsequence of this array is arithmetic.
```

# Intuition
The problem is asking to find the number of arithmetic slices in a given list of numbers (`nums`). An arithmetic slice is a sequence of numbers in which the difference between consecutive elements is the same. My intuition is to use a depth-first search (DFS) approach to explore all possible slices and count the valid arithmetic slices.

# Approach
I will use a recursive DFS function (`dfs`) to explore different combinations of slices. The function takes three parameters: `index` (current index in nums), `nums` (the input list), and `curr` (the current slice being considered). At each step, I have two options: skip the current number or include it in the current slice. I'll explore both options recursively.

For each valid slice found during the exploration, I'll increment a result variable (`dfs.result`). A slice is considered valid if its length is at least 3 and all elements have the same arithmetic difference.

# Complexity
- Time complexity: O(2^n), where n is the length of the input list nums. This is because, for each number in nums, we have two choices (take or skip), resulting in an exponential number of recursive calls.
- Space complexity: O(n), where n is the length of the input list nums. This is the maximum depth of the recursion stack.

# Brute Force
```python
# TIME LIMIT EXCEEDED
class Solution:
    def numberOfArithmeticSlices(self, nums: List[int]) -> int:
        N = len(nums)

        def dfs(index, nums, curr):
            # Base case: If the current index reaches the end of the list,
            # check if the current slice is a valid arithmetic slice.
            if index == N:
                if len(curr) < 3:
                    return

                # Check the arithmetic difference for the current slice.
                diff = curr[1] - curr[0]
                for i in range(2, len(curr)):
                    if curr[i] - curr[i - 1] != diff:
                        return

                # If the slice is valid, increment the result.
                dfs.result += 1
                return

            # Recursive case:
            # Option 1: Skip the current number and move to the next index.
            dfs(index + 1, nums, curr)

            # Option 2: Take the current number and add it to the current slice.
            dfs(index + 1, nums, curr + [nums[index]])

        # Initialize the result variable.
        dfs.result = 0

        # Start the DFS from index 0 with an empty current slice.
        dfs(0, nums, [])

        # Return the final result.
        return dfs.result
```

# Optimized Solution
## Intuition
The key insight for optimizing this problem is to utilize dynamic programming with a bottom-up or tabulation approach. The intuition behind this algorithm is to efficiently count the number of arithmetic slices by maintaining a dynamic programming table. This table keeps track of the count of arithmetic slices ending at each index with a specific difference. The goal is to build on the information obtained from previous indices to calculate the count for the current index in a systematic manner.

## Approach
1. Initialize a dynamic programming table to store the count of arithmetic slices for each index and difference.
2. Iterate through the given list of numbers from left to right, calculating and updating the counts based on the differences between elements.
3. Utilize the information from previous indices to efficiently calculate the count for the current index, forming a bottom-up approach.
4. The final result is the sum of all counts in the dynamic programming table, representing the total number of arithmetic slices.

## Complexity
- Time Complexity: O(n^2) where n is the length of the input list. The algorithm involves nested loops over the elements, resulting in a quadratic time complexity.
- Space Complexity: O(n^2) where n is the length of the input list. The dynamic programming table is a 2D structure with dimensions proportional to the length of the input list.

```python
from collections import defaultdict
from typing import List

class Solution:
    def numberOfArithmeticSlices(self, nums: List[int]) -> int:
        res = 0
        # Initialize a 2D array 'dp' to store the count of arithmetic slices with different differences.
        dp = [defaultdict(int) for i in range(len(nums))]
		
        # Iterate over each element in the input list starting from the second element.
        for i in range(1, len(nums)):
            # Iterate over the elements before the current element.
            for j in range(i):
                # Calculate the difference between the current element and the previous element.
                dif = nums[i] - nums[j]
                # Increment the count for the current difference at index 'i'.
                dp[i][dif] += 1
                # Accumulate the count for the current difference at index 'i' with the count at index 'j'.
                dp[i][dif] += dp[j][dif]
                # Add the count at index 'j' for the current difference to the final result.
                res += dp[j][dif]

        # The final result 'res' represents the total number of arithmetic slices.

        # The conditions below ensure that at least three elements form a valid arithmetic slice:
        # - dp[i][dif] contributes to the count of subsequences ending at index 'i' with the common difference 'dif'.
        # - dp[j][dif] contributes to the count of subsequences ending at index 'j' with the common difference 'dif'.
        # - res accumulates the count of valid arithmetic slices.

        return res

```

# Editorial Solution
This approach utilizes the Dynamic Programming

```cpp
#define LL long long
class Solution {
public:
    int numberOfArithmeticSlices(vector<int>& A) {
        int n = A.size();
        LL ans = 0;
        vector<map<LL, int>> cnt(n);
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                LL delta = (LL)A[i] - (LL)A[j];
                int sum = 0;
                if (cnt[j].find(delta) != cnt[j].end()) {
                    sum = cnt[j][delta];
                }
                cnt[i][delta] += sum + 1;
                ans += sum;
            }
        }

        return (int)ans;
    }
};
```
Complexity Analysis

Time complexity : OO(n ^ 2). We can use double loop to enumerate all possible states.

Space complexity : O(n ^ 2), For each i, we need to store at most n distinct common differences, so the total space complexity is O(n ^ 2)