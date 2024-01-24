---
layout: single
title: "Problem of The Day: Rotate Image"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Rotate Image](https://leetcode.com/problems/rotate-image/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to rotate the matrix layer by layer. First, I'll swap the elements horizontally in each row. Then, I'll swap the elements diagonally, considering both the primary and secondary diagonals.

# Approach
My approach involves implementing two functions: swap_horizontal() and swap_diagonal(). The swap_horizontal() function iterates through each row and swaps elements symmetrically around the center column. The swap_diagonal() function swaps elements along the primary and secondary diagonals. I use a helper function, helper(), to identify the elements along the diagonals for swapping. I apply these swaps layer by layer to achieve the rotation. 

# Complexity
- Time complexity:
O(N^2), where N is the number of rows or columns in the matrix. The operations involve iterating through the matrix elements and performing swaps.

- Space complexity:
O(1) as I perform the rotations in-place without using additional space that scales with the input size. 

# Code
```python
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        N = len(matrix)
        def swap_horizontal():
            for row in range(N):
                l, r = 0, N - 1
                while l < r:
                    matrix[row][l], matrix[row][r] = matrix[row][r], matrix[row][l]
                    l += 1
                    r -= 1

        def swap_diagonal():
            swap_diagonal_helper(row=True)
            swap_diagonal_helper(row=False)

        def helper(row, col):
            temp = []
            while row < N and col < N:
                temp.append([row, col])
                row += 1
                col += 1
                
            l, r = 0, len(temp) - 1
            while l < r:
                l_row, l_col = temp[l]
                r_row, r_col = temp[r]
                matrix[l_row][l_col], matrix[r_row][r_col] = matrix[r_row][r_col], matrix[l_row][l_col]
                l += 1
                r -= 1

        def swap_diagonal_helper(row=True):
            if row:
                for col in range(N):
                    helper(0, col)
            else:
                for row in range(1, N):
                    helper(row, 0)

        swap_horizontal()
        swap_diagonal()

        return matrix

```

# Editorial Solution
Approach 1: Rotate Groups of Four Cells
```python
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix[0])
        for i in range(n // 2 + n % 2):
            for j in range(n // 2):
                tmp = matrix[n - 1 - j][i]
                matrix[n - 1 - j][i] = matrix[n - 1 - i][n - j - 1]
                matrix[n - 1 - i][n - j - 1] = matrix[j][n - 1 -i]
                matrix[j][n - 1 - i] = matrix[i][j]
                matrix[i][j] = tmp
```
Approach 2: Reverse on the Diagonal and then Reverse Left to Right
```python
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        self.transpose(matrix)
        self.reflect(matrix)
    
    def transpose(self, matrix):
        n = len(matrix)
        for i in range(n):
            for j in range(i + 1, n):
                matrix[j][i], matrix[i][j] = matrix[i][j], matrix[j][i]

    def reflect(self, matrix):
        n = len(matrix)
        for i in range(n):
            for j in range(n // 2):
                matrix[i][j], matrix[i][-j - 1] = matrix[i][-j - 1], matrix[i][j]

```