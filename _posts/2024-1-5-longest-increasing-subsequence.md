---
layout: single
title: "Problem of The Day: Longest Increasing Subsequence"
date: 2024-1-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
![problem](/assets/images/2024-01-04_23-35-25-longest-increasing-subsequence.png)
# Intuition
When approaching the problem of finding the length of the Longest Increasing Subsequence (LIS), my initial thoughts revolved around leveraging dynamic programming to efficiently compute and store the lengths of increasing subsequences at each index.

# Approach
I adopted a dynamic programming approach, initializing an array `dp` to store the length of the LIS ending at each index. For each element in the input array `nums`, I iterated through the previous elements, updating the `dp` array based on the condition that the current element is greater than the previous one. This way, I accumulated the lengths of increasing subsequences.

# Complexity
- Time complexity:
The time complexity is O(n^2) due to the nested loop, where 'n' is the length of the input array.

- Space complexity:
The space complexity is O(n) for the dynamic programming array 'dp'.

# Code
```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        N = len(nums)
        dp = [1] * N
        for i in range(1, N):
            j = i - 1
            while j >= 0:
                if nums[i] > nums[j]:
                    dp[i] = max(dp[i], dp[j] + 1)
                j -= 1
        
        return max(dp)

```

# Optimized Code
The approach here is to use an array called `tails` to keep track of the end elements of active lists (subsequences). We iterate through each element in nums and perform a binary search within the tails array to find the correct position to update. By efficiently maintaining and updating the active lists, we achieve a time complexity of `O(n log n)`.

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tails = [0] * len(nums)
        size = 0

        for num in nums:
            left, right = 0, size

            while left < right:
                mid = left + (right - left) // 2
                if tails[mid] < num:
                    left = mid + 1
                else:
                    right = mid

            tails[left] = num
            if left == size:
                size += 1

        return size

```

Consider the input array: nums = [10, 9, 2, 5, 3, 7, 101, 18]

We initialize two arrays:

tails: An array to store the smallest tail elements of all increasing subsequences.
size: A variable to keep track of the current size of the increasing subsequence.
Now, let's process each element in nums:

Element 10:
tails = [10], size = 1
We start with an empty subsequence and add the first element.

Element 9:
tails = [9], size = 1
We replace 10 with 9 because we want to minimize the elements in the subsequence while maintaining the increasing order.

Element 2:
tails = [2], size = 1
We replace 9 with 2, as we aim to keep the subsequence as small as possible.

Element 5:
tails = [2, 5], size = 2
We extend the subsequence since 5 is greater than the current tail (2).

Element 3:
tails = [2, 3], size = 2
We replace 5 with 3, creating a subsequence [2, 3].

Element 7:
tails = [2, 3, 7], size = 3
We extend the subsequence to [2, 3, 7].

Element 101:
tails = [2, 3, 7, 101], size = 4
We extend the subsequence with a larger element.

Element 18:
tails = [2, 3, 7, 18], size = 4
We replace 101 with 18.

At the end, the longest increasing subsequence is [2, 3, 7, 18], and its length is 4. This corresponds to the final value of size. The algorithm efficiently maintains and updates the subsequence to achieve the longest increasing subsequence length.

# Editorial Solution
## Intelligently Build a Subsequence
The intuition behind the algorithm is to construct the longest increasing subsequence (LIS) from the given array. It starts with an empty subsequence and sequentially processes each element in the array. For each element, it decides whether to include it in the subsequence or not.

The decision is based on comparing the current element with the elements already present in the subsequence. If the current element is greater than the largest element in the subsequence, it is added to extend the increasing sequence. Otherwise, a linear scan is performed through the subsequence to find the first element greater than or equal to the current one. This element is then replaced by the current element, allowing for potential future elements to be included.

By following this strategy, the algorithm dynamically adjusts the subsequence to maximize its length, ultimately providing the length of the longest increasing subsequence in the array. The focus is on continuously updating the subsequence to capture the increasing trend in the input array.
```python

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        sub = [nums[0]]
        
        for num in nums[1:]:
            if num > sub[-1]:
                sub.append(num)
            else:
                # Find the first element in sub that is greater than or equal to num
                i = 0
                while num > sub[i]:
                    i += 1
                sub[i] = num

        return len(sub)
```
## Improve With Binary Search
>In Python, the [bisect](https://docs.python.org/3/library/bisect.html) module provides super handy functions that does binary search for us.
```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        sub = []
        for num in nums:
            i = bisect_left(sub, num)

            # If num is greater than any element in sub
            if i == len(sub):
                sub.append(num)
            
            # Otherwise, replace the first element in sub greater than or equal to num
            else:
                sub[i] = num
        
        return len(sub)
```