---
layout: single
title: "Problem of The Day: Convert an Array Into a 2D Array With Conditions"
date: 2024-1-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
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
In my approach, I took advantage of a hash map, specifically using Python's `Counter` from the `collections` library to count the frequency of numbers in the input array `nums`. The core of my algorithm involves obtaining the frequency of each number and using this information to construct a subarray inside the return matrix `result`. I initiated variables `n` and `N` to represent the number of subarrays in the matrix and the total number of elements in the input array nums, respectively. I then employed a `while` loop to iteratively build the subarrays within the return matrix until `n` equals `N`, signifying that all input elements have been converted into the matrix. In each iteration, I used the `counter` to track the frequency, sequentially going through the keys in the map and adding them to the `curr` array. As a number was utilized, its frequency was decreased by 1 until it could no longer be reduced. This way, I systematically created subarrays, ensuring that the matrix encapsulated all elements from the input array.

Here is the notes that I used to solve this problem. Hopefully, this will help to visualize my approach better.
[![note](/assets/images/2024-01-03_13-50-49-note.png)](/assets/images/2024-01-03_13-50-49-note.png)

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