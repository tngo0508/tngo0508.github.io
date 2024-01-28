---
layout: single
title: "Problem of The Day: Majority Element"
date: 2024-1-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an array nums of size n, return the majority element.

The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.

 

Example 1:

Input: nums = [3,2,3]
Output: 3
Example 2:

Input: nums = [2,2,1,1,1,2,2]
Output: 2
 

Constraints:

n == nums.length
1 <= n <= 5 * 10^4
-10^9 <= nums[i] <= 10^9

```

# Intuition
The initial thought is to use a hash map to keep track of the frequency of each number in the array. By maintaining the maximum frequency and the corresponding number, the algorithm can identify the majority element. 

# Approach
The approach involves creating a `defaultdict` to store the frequency of each number. Iterate through the array, updating the frequency in the hash map. Keep track of the maximum frequency and the corresponding number. The final result is the number with the maximum frequency, representing the majority element.

# Complexity
- Time complexity:
O(n), where n is the length of the input array. The algorithm iterates through the entire array once. 

- Space complexity:
O(n) as the hash_map can potentially store all distinct numbers in the array along with their frequencies. 

# Code
```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        hash_map = defaultdict(int)
        max_freq = 0
        res = nums[0]
        for num in nums:
            hash_map[num] += 1
            if max_freq < hash_map[num]:
                max_freq = hash_map[num]
                res = num
        return res
        
```

# Boyer-Moore Voting Algorithm - Most optimized solution
```python
class Solution:
    def majorityElement(self, nums):
        count = 0
        candidate = None

        for num in nums:
            if count == 0:
                candidate = num
            count += (1 if num == candidate else -1)

        return candidate
```

- Time complexity: O(n)
- Space complexity: O(1)