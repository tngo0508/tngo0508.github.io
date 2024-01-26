---
layout: single
title: "Problem of The Day: Largest Rectangle in Histogram"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/largest-rectangle-in-histogram/description/?envType=study-plan-v2&envId=top-100-liked)

>Idea: use monotonic increasing stack. Need to review this problem again.

# Solution
```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        maxArea = 0
        stack = []

        for index , height in enumerate(heights):
            start = index
            
            while start and stack[-1][1] > height:
                i , h = stack.pop()
                maxArea = max(maxArea , (index-i)*h)
                start = i
            stack.append((start , height))

        for index , height in stack:
            maxArea = max(maxArea , (len(heights)-index)*height)

        return maxArea    
```

# Other Solution
```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        heights = heights + [0]
        stk = [-1]
        res = 0
        for ind, h in enumerate(heights):
            while h < heights[stk[-1]]:
                cur_h = heights[stk.pop()]
                width = ind - 1 - stk[-1]
                res = max(res, cur_h * width)
            stk.append(ind)
        return res
```

# Editorial Solution
```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack = [-1]
        max_area = 0
        for i in range(len(heights)):
            while stack[-1] != -1 and heights[stack[-1]] >= heights[i]:
                current_height = heights[stack.pop()]
                current_width = i - stack[-1] - 1
                max_area = max(max_area, current_height * current_width)
            stack.append(i)

        while stack[-1] != -1:
            current_height = heights[stack.pop()]
            current_width = len(heights) - stack[-1] - 1
            max_area = max(max_area, current_height * current_width)
        return max_area
```