---
layout: single
title: "Problem of The Day: Search a 2D Matrix"
date: 2023-12-30
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
![problem](/assets/images/2023-12-30_19-05-22-search-a-2d-matrix.png)

# My Explanation and Approach
In tackling this problem, I opted for a Binary Search approach on the entire matrix, leveraging the fact that the matrix is inherently sorted. This approach allows me to achieve a time complexity of O(log(m * n)), where **m** is the number of rows and **n** is the number of columns.

However, applying Binary Search directly to a two-dimensional array can be somewhat challenging. To address this, I devised a method to convert the middle index into row and column values using the following formulas:
```
row = middle // (number of columns) # floor the result
col = middle % (number of columns)
```

The insight behind this approach stemmed from visualizing and conceptualizing the matrix as a one-dimensional array. By dividing the entire array into chunks of `num_of_cols`, these formulas yield the precise row and column indices as if they were present in the original matrix.

This visualization greatly simplifies the application of Binary Search on a two-dimensional structure, allowing for an elegant solution to the problem.

For example:
![explanation](/assets/images/2023-12-30_19-18-49.png)

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        rows = len(matrix)
        cols = len(matrix[0])
        left = 0
        right = (rows * cols) - 1
        while left <= right:
            mid = left + (right - left) // 2
            row = mid // cols
            col = mid % cols
            if matrix[row][col] == target:
                return True
            elif matrix[row][col] < target:
                left = mid + 1
            else:
                right = mid - 1
        return False
```
# Leet Code Solution