---
layout: single
title: "Problem of The Day: Container With Most Water"
date: 2024-1-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Problem](https://leetcode.com/problems/container-with-most-water/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thoughts on how to solve this problem revolve around using two pointers to efficiently explore different container sizes formed by the given heights.

# Approach
My approach involves using two pointers, initially pointing to the leftmost and rightmost elements of the array. I move the pointers towards each other while calculating the area formed by the heights at the pointers. The width of the container is determined by the difference in indices of the pointers, and the height is the minimum of the heights at the pointers. I update the maximum area as I iterate through the array. 

# Complexity
- Time complexity:
O(n), where n is the length of the input array. The two-pointer approach allows us to explore different container sizes in a single pass through the array. 

- Space complexity:
O(1) as we use a constant amount of space to store variables (max_area, l, r, h, w) without relying on additional data structures.

# Code
```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        max_area = 0
        l, r = 0, len(height) - 1
        while l < r:
            h = 0
            if height[l] < height[r]:
                h = height[l]
                l += 1
            else:
                h = height[r]
                r -= 1
            
            w = r - l + 1
            area = h * w
            max_area = max(max_area, area)
        
        return max_area

```