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
# Editorial Solution
```cpp
#define LL long long
class Solution {
public:
    int n;
    int ans;
    void dfs(int dep, vector<int>& A, vector<LL> cur) {
        if (dep == n) {
            if (cur.size() < 3) {
                return;
            }
            for (int i = 1; i < cur.size(); i++) {
                if (cur[i] - cur[i - 1] != cur[1] - cur[0]) {
                    return;
                }
            }
            ans ++;
            return;
        }
        dfs(dep + 1, A, cur);
        cur.push_back(A[dep]);
        dfs(dep + 1, A, cur);
    }
    int numberOfArithmeticSlices(vector<int>& A) {
        n = A.size();
        ans = 0;
        vector<LL> cur;
        dfs(0, A, cur);
        return (int)ans;
    }
};
```