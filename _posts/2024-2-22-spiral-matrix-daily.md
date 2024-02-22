---
layout: single
title: "Problem of The Day: Valid Sudoku"
date: 2024-2-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-54](/assets/images/2024-02-22_14-48-48-problem-54.png)

>Need to review this again for clean code. Use this approach for the interview.

## Intuition

The problem seems to be a traversal problem, where we need to visit each element of the matrix in a spiral order. My initial thought is to iterate through the matrix while updating the current position based on the traversal direction.

## Approach

I've initialized variables to keep track of the current row, column, and traversal direction. Using a while loop, I iterate through the matrix, moving in the specified direction and appending the elements to the result list. I update the size of rows or columns after completing a traversal in one direction. The direction is reversed after completing a row or column traversal.

## Complexity

- Time complexity:
O(m * n), where m is the number of rows and n is the number of columns in the matrix. The algorithm traverses each element once.

- Space complexity:
O(m * n), as the result list stores all the elements of the matrix.

## Code

```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        ROWS = len(matrix)
        COLS = len(matrix[0])
        N = ROWS * COLS
        res = []
        row, col = 0, -1
        direction = 1
        while len(res) < N:
            for _ in range(COLS):
                col += direction
                res.append(matrix[row][col])
            ROWS -= 1

            for _ in range(ROWS):
                row += direction
                res.append(matrix[row][col])
            
            COLS -= 1

            direction *= -1

        return res
```
