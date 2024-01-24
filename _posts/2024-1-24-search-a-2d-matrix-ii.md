---
layout: single
title: "Problem of The Day: Search a 2D Matrix II"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/search-a-2d-matrix-ii/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
I initially thought about leveraging the properties of the matrix, particularly the sorted order in both rows and columns, to efficiently locate the target element.

# Approach
My approach is to start from the bottom-left corner of the matrix and iteratively move either up or right based on the comparison of the current element with the target. This way, I can navigate through the matrix while eliminating rows or columns that cannot contain the target.

# Complexity
- Time complexity:
O(m + n). In each step, either a row or a column is eliminated.

- Space complexity:
O(1)

# Code
```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m = len(matrix)
        n = len(matrix[0])
        row = m - 1
        col = 0
        while row >= 0 and col < n:
            if matrix[row][col] == target:
                return True
            elif matrix[row][col] > target:
                row -= 1
            else:
                col += 1
        return False

```