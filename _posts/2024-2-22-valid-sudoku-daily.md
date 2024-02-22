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

[![problem-36](/assets/images/2024-02-22_14-21-31-problem-36.png)](/assets/images/2024-02-22_14-21-31-problem-36.png)

My note:

[![note](/assets/images/2024-02-22_14-22-44-problem-36-note.png)](/assets/images/2024-02-22_14-22-44-problem-36-note.png)

## Intuition

The problem requires checking whether a given 9x9 Sudoku board is valid. A valid Sudoku board should satisfy the rules that each row, each column, and each of the 9 sub-grids that compose the board should contain all of the digits from 1 to 9 without repetition.

## Approach

I've defined three helper functions (`check_rows`, `check_cols`, and `check_grids`) to check the validity of rows, columns, and sub-grids, respectively. Each function iterates through the corresponding elements and uses a set to keep track of seen digits. If a digit is encountered more than once in a row, column, or sub-grid, the board is considered invalid.

The main function `isValidSudoku` then calls these three helper functions and returns the logical AND of their results. If all three conditions are met (rows, columns, and sub-grids are valid), the Sudoku board is considered valid.

## Complexity

- Time complexity:
O(n^2), where n is the size of the Sudoku board (9x9). The function iterates through each cell in the board to check rows, columns, and sub-grids.

- Space complexity:
O(n), as additional space is used to store sets for checking each row, column, and sub-grid.

## Code

```python
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        ROWS = COLS = 9

        def check_rows(mat):
            for r in range(ROWS):
                seen = set()
                for c in range(COLS):
                    if mat[r][c] != "." and mat[r][c] in seen:
                        return False
                    seen.add(mat[r][c])
            
            return True
        

        def check_cols(mat):
            for c in range(COLS):
                seen = set()
                for r in range(ROWS):
                    if mat[r][c] != "." and mat[r][c] in seen:
                        return False
                    seen.add(mat[r][c])

            return True

        
        def check_grids(mat):
            grid = defaultdict(set)
            for r in range(ROWS):
                for c in range(COLS):
                    idx = 3*(r//3) + (c//3)
                    if mat[r][c] != "." and mat[r][c] in grid[idx]:
                        return False
                    grid[idx].add(mat[r][c])
            return True

        return check_rows(board) and check_cols(board) and check_grids(board)
```

## Editorial Solution

clean code

```python
class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        N = 9

        # Use hash set to record the status
        rows = [set() for _ in range(N)]
        cols = [set() for _ in range(N)]
        boxes = [set() for _ in range(N)]

        for r in range(N):
            for c in range(N):
                val = board[r][c]
                # Check if the position is filled with number
                if val == ".":
                    continue

                # Check the row
                if val in rows[r]:
                    return False
                rows[r].add(val)

                # Check the column
                if val in cols[c]:
                    return False
                cols[c].add(val)

                # Check the box
                idx = (r // 3) * 3 + c // 3
                if val in boxes[idx]:
                    return False
                boxes[idx].add(val)

        return True
```
