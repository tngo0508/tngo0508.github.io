---
layout: single
title: "Problem of The Day: Unique Paths"
date: 2024-1-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
See problem description [here](https://leetcode.com/problems/unique-paths/description/?envType=study-plan-v2&envId=top-100-liked).

# Intuition
The problem involves finding the number of unique paths from the top-left corner to the bottom-right corner of a grid. This is a classic problem that can be solved using dynamic programming. The intuition is to fill the matrix with the number of unique paths for each cell, considering that you can only move right or down.

# Approach
The approach is to initialize a matrix of size `m x n` and fill it iteratively. We start by setting the values in the first row and first column to `1`, as there is only one way to reach any cell in the first row or first column (by moving right or down). Then, for each cell in the remaining rows and columns, we calculate the number of unique paths to that cell by summing the paths from the cell above and the cell to the left.

My note:
[![note](/assets/images/2024-01-09_14-20-40-path-sum.png)](/assets/images/2024-01-09_14-20-40-path-sum.png)

# Complexity
- Time complexity:
O(m x n). We fill in each cell of the matrix once using two nested loops.

- Space complexity:
O(m x n). We use a matrix of size m x n to store the intermediate results.

# Code
```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        matrix = [[0] * n for _ in range(m)]
        
        # Initialize the first row and first column
        for col in range(n):
            matrix[0][col] = 1
        for row in range(m):
            matrix[row][0] = 1
        
        # Fill in the matrix iteratively
        for row in range(1, m):
            for col in range(1, n):
                matrix[row][col] = matrix[row - 1][col] + matrix[row][col - 1]
        
        return matrix[-1][-1]
```

# Cleaner code
```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
      matrix = [[1 for _ in range(m)] for _ in range(n)]
      for row in range(1, n):
        for col in range(1, m):
          matrix[row][col] = matrix[row - 1][col] + matrix[row][col - 1]
      
      return matrix[-1][-1]
```

# Editorial Code
Dynamic Programming
```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        d = [[1] * n for _ in range(m)]

        for col in range(1, m):
            for row in range(1, n):
                d[col][row] = d[col - 1][row] + d[col][row - 1]

        return d[m - 1][n - 1]
```

Brute force
```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        if m == 1 or n == 1:
            return 1
        
        return self.uniquePaths(m - 1, n) + self.uniquePaths(m, n - 1)
```