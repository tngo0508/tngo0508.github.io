---
layout: single
title: "Problem of The Day: Subarray Sum Equals K"
date: 2024-1-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.

A subarray is a contiguous non-empty sequence of elements within an array.

 

Example 1:

Input: nums = [1,1,1], k = 2
Output: 2
Example 2:

Input: nums = [1,2,3], k = 3
Output: 2

```

>Note: think about the case when arr = [0,0,0,0,0] when apply prefix sum

# Brute Force - TLE
```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        N = len(nums)
        res = 0
        for i in range(N):
            curr_sum = 0
            for j in range(i, N):
                curr_sum += nums[j]
                if curr_sum == k:
                    res += 1
        return res
```

- Time Complexity: O(N^2)
- Space Complexity: O(N)

# Intuition
The problem involves finding the number of subarrays in a given list of integers whose sum equals a given target value 'k'. The intuition here is to use a prefix sum approach to efficiently compute the cumulative sum up to each index. By keeping track of the frequency of prefix sums encountered so far, we can identify subarrays with the desired sum.



# Approach
I use a hash map to store the cumulative sum up to each index along with its frequency. While iterating through the list of numbers, I update the prefix sum and check if the difference between the current prefix sum and the target 'k' exists in the hash map. If it does, I add the frequency of that prefix sum to the result. This accounts for subarrays with the required sum. Additionally, if the current prefix sum equals 'k', I increment the result.

# Complexity
- Time complexity:
O(N) where N is the length of the input list 'nums'. The algorithm iterates through the list once.

- Space complexity:
O(N) as the hash map can store at most N distinct prefix sums.

# Code
```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        N = len(nums)
        res = 0
        prefix_sum = 0
        hash_map = defaultdict(int)
        for i, num in enumerate(nums):
            prefix_sum += num
            if prefix_sum == k:
                res += 1
            if prefix_sum - k in hash_map:
                res += hash_map[prefix_sum - k]

            hash_map[prefix_sum] += 1

        return res
```

# Editorial Solution
```java
public class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0, sum = 0;
        HashMap < Integer, Integer > map = new HashMap < > ();
        map.put(0, 1);
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
            if (map.containsKey(sum - k))
                count += map.get(sum - k);
            map.put(sum, map.getOrDefault(sum, 0) + 1);
        }
        return count;
    }
}
```