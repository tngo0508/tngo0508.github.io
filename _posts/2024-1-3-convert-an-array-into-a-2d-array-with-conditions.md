---
layout: single
title: "Problem of The Day: Convert an Array Into a 2D Array With Conditions"
date: 2024-1-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
```
You are given an integer array nums. You need to create a 2D array from nums satisfying the following conditions:

The 2D array should contain only the elements of the array nums.
Each row in the 2D array contains distinct integers.
The number of rows in the 2D array should be minimal.
Return the resulting array. If there are multiple answers, return any of them.

Note that the 2D array can have a different number of elements on each row.

 

Example 1:

Input: nums = [1,3,4,1,2,3,1]
Output: [[1,3,4,2],[1,3],[1]]
Explanation: We can create a 2D array that contains the following rows:
- 1,3,4,2
- 1,3
- 1
All elements of nums were used, and each row of the 2D array contains distinct integers, so it is a valid answer.
It can be shown that we cannot have less than 3 rows in a valid array.
Example 2:

Input: nums = [1,2,3,4]
Output: [[4,3,2,1]]
Explanation: All elements of the array are distinct, so we can keep all of them in the first row of the 2D array.
```

# My Explanation and Approach
I approach this by utilizing the hash map. Specifically, I used the `Counter` from python standard library `collections` to help me count the frequency of number occurs in the input array `nums`. The core of my algorithm is to get the frequency of each number in the array, then leverage this information to construct the subarray inside the return matrix `result`. The idea is that I initialize the variable `n` and `N` representing the number of return matrix and total number of elements in the input array `nums` respectively. Then, use `while` loop to construct the sub-array inside return matrix iteratively until `n == N` which means all of input elements are converts into the matrix. For each iteration, I used `counter` to track for the frequency. The basic idea is to go through the keys in the map one by one and add those keys into the `curr` array. After a number is being used, the frequency of that number will be decreased by 1 until it cannot be reduced anymore. 

```python
from collections import Counter

class Solution:
    def findMatrix(self, nums: List[int]) -> List[List[int]]:
        counter = Counter(nums)
        result = []
        N = len(nums)
        n = 0
        while n < N:
            curr = []
            for k, v in counter.items():
                if v > 0:
                    curr.append(k)
                    counter[k] -= 1
            result.append(curr[:])
            n += len(curr)
        return result    
```
# Leet Code Solution
```cpp
class Solution {
public:
    vector<vector<int>> findMatrix(vector<int>& nums) {
        vector<int> freq(nums.size() + 1);
        
        vector<vector<int>> ans;
        for (int c : nums) {
            if (freq[c] >= ans.size()) {
                ans.push_back({});
            }
            
            // Store the integer in the list corresponding to its current frequency.
            ans[freq[c]].push_back(c);
            freq[c]++;
        }
        
        return ans;
    }
};
```