---
layout: single
title: "Problem of The Day: Unique Number of Occurrences"
date: 2024-1-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
Given an array of integers arr, return true if the number of occurrences of each value in the array is unique or false otherwise.

 

Example 1:

Input: arr = [1,2,2,1,1,3]
Output: true
Explanation: The value 1 has 3 occurrences, 2 has 2 and 3 has 1. No two values have the same number of occurrences.
Example 2:

Input: arr = [1,2]
Output: false
Example 3:

Input: arr = [-3,0,1,-3,1,1,1,-3,10,0]
Output: true
 

Constraints:

1 <= arr.length <= 1000
-1000 <= arr[i] <= 1000
```

# Intuition
We can use Python's Counter to count the occurrences of each element, and then check if the count values themselves are unique.

# Approach
The approach is straightforward. First, create a Counter object to count the occurrences of each element in the input list. Then, extract the count values and check if the number of unique count values is equal to the total number of count values.

# Complexity
- Time complexity:
O(n) where n is the length of the input list. Creating the Counter and performing set operations both have linear time complexity.

- Space complexity:
O(n) as we store the count values in a separate list.

# Code
```python
class Solution:
    def uniqueOccurrences(self, arr: List[int]) -> bool:
        counter = Counter(arr)
        values = counter.values()
        return len(values) == len(set(values))
```