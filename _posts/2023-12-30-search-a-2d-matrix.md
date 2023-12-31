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
To solve this problem, I used the Binary Search on the entire matrix due to the matrix is already in the sorted order. This will help me to achieve the O(log(m * n)) time complexity where m is the number of rows and n is the number columns. However, it is a bit tricky to apply the binary search on the entire matrix since it is a two dimensional array. To perform the search on the matrix, I realized that I could convert the middle index to row and column accordingly by using the following formulas:
```
row = middle // (number of columns) # floor the result
col = middle % (number of columns)
```

The intuition to come up with this idea is that I visualized and spread the matrix as a 1 dimensional array. When we divide the entire array into a chunk of `num_of_cols`, we can see that the equals above give us the exact row index and column index corresponding as if it present in the matrix.

For example, if we have a matrix like this
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