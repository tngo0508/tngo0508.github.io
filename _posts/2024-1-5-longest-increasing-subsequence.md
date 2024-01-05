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

Walk through an example with the input array nums = [10, 9, 2, 5, 3, 7, 101, 18]

**Initialization:**

- tails: [0, 0, 0, 0, 0, 0, 0, 0]
- size: 0 (initial length of the active lists)

**Iteration 1 (num = 10):**

- Binary Search: Determine the correct position for 10 in `tails`.
- Since` tails[0]` is 0, we update` tails[0]` with 10.
- Increment `size` to 1.

Current State:
- tails: [10, 0, 0, 0, 0, 0, 0, 0]
- size: 1
  
**Iteration 2 (num = 9):**

- Binary Search: Determine the correct position for 9 in `tails`.
- Since `tails[0]` is 10, we update `tails[0]` with 9.
- No change in `size`.

Current State:
- tails: [9, 0, 0, 0, 0, 0, 0, 0]
- size: 1

**Iteration 3 (num = 2):**

- Binary Search: Determine the correct position for 2 in tails.
- Update` tails[0]` with 2.
- No change in size.

Current State:
- tails: [2, 0, 0, 0, 0, 0, 0, 0]
- size: 1

**Iteration 4 (num = 5):**

- Binary Search: Determine the correct position for 5 in `tails`.
- Update `tails[1]` with 5.
- No change in `size`.
  
Current State:
- tails: [2, 5, 0, 0, 0, 0, 0, 0]
- size: 2

**Iteration 5 (num = 3):**
- Binary Search: Determine the correct position for 3 in `tails`.
- Update` tails[1]` with 3.
- No change in `size`.
  
Current State:
- tails: [2, 3, 0, 0, 0, 0, 0, 0]
- size: 2

**Iteration 6 (num = 7):**
- Binary Search: Determine the correct position for 7 in `tails`.
- Update `tails[2]` with 7.
- No change in `size`.

Current State:

- tails: [2, 3, 7, 0, 0, 0, 0, 0]
- size: 3

**Iteration 7 (num = 101):**
- Binary Search: Determine the correct position for 101 in `tails`.
- Update `tails[3]` with 101.
- Increment `size` to 4.

Current State:
- tails: [2, 3, 7, 101, 0, 0, 0, 0]
- size: 4

**Iteration 8 (num = 18):**
- Binary Search: Determine the correct position for 18 in `tails`.
- Update `tails[3]` with 18.
- No change in `size`.

Final State:
tails: [2, 3, 7, 18, 0, 0, 0, 0]
size: 4 (Length of Longest Increasing Subsequence)

The algorithm efficiently updates and maintains the active lists, resulting in the length of the Longest Increasing Subsequence, which is 4 in this example.

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