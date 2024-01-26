---
layout: single
title: "Problem of The Day: Daily Temperatures"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-26_13-38-46-problem-739.png)](/assets/images/2024-01-26_13-38-46-problem-739.png)

My note
[![note](/assets/images/2024-01-26_13-45-56-739-note.png)](/assets/images/2024-01-26_13-45-56-739-note.png)

# Intuition
My initial thought is to use a stack to keep track of indices while traversing the temperatures array.

# Approach
I will iterate through the temperatures array and use a stack to store the indices of the temperatures for which we haven't found a warmer day yet. For each temperature, I'll compare it with the temperatures at the indices stored in the stack. If the current temperature is higher, I'll update the result for the corresponding index and pop that index from the stack. This process ensures that we find the nearest warmer day for each temperature.

# Complexity
- Time complexity:
O(n), where n is the length of the temperatures array. We iterate through the array once.

- Space complexity:
O(n), in the worst case, all temperatures could be stored in the stack.

# Code
```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        stack = []
        res = [0] * len(temperatures)
        for i, temp in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < temp:
                j = stack.pop()
                res[j] = i - j
                
            stack.append(i)
        return res
```