---
layout: single
title: "Problem of The Day: Surrounded Regions"
date: 2024-3-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-130](/assets/images/2024-03-20_16-40-24-problem-130.png)](/assets/images/2024-03-20_16-40-24-problem-130.png)

## Intuition

The intuition behind this solution is to utilize a Breadth-First Search (BFS) approach to solve the problem.

## Approach

Firstly, I initialize a deque to keep track of cells that are adjacent to the borders and are not supposed to be flipped. I iterate through the borders of the board, checking for 'O' cells, and add their coordinates to the deque.

Next, I run a BFS loop while there are still unprocessed cells in the deque. I pop a cell from the deque, mark it as '2' to indicate it's been visited, and explore its neighboring cells. If a neighboring cell is within the bounds of the board and is an 'O', I add it to the deque for further processing.

After marking all cells that should not be flipped, I iterate through the entire board again. For each cell, if it's an 'O', I change it to 'X', as it's surrounded by 'X' cells and should be flipped.

Finally, I iterate through the board once more. For cells marked as '2', I change them back to 'O', as they are originally 'O' cells adjacent to the border and should not be flipped.

## Complexity

- Time complexity:
  O(mn), where m is the number of rows and n is the number of columns in the board.

- Space complexity:
  O(mn), mainly due to the deque used for BFS traversal.

## Code

```python
class Solution:
    def solve(self, board: List[List[str]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        ROWS = len(board)
        COLS = len(board[0])
        not_flipped_cells = deque()
        for r in range(ROWS):
            if board[r][0] == "O":
                not_flipped_cells.append([r, 0])
            if board[r][COLS - 1] == "O":
                not_flipped_cells.append([r, COLS - 1])

        for c in range(COLS):
            if board[0][c] == "O":
                not_flipped_cells.append([0, c])
            if board[ROWS - 1][c] == "O":
                not_flipped_cells.append([ROWS-1, c])

        while not_flipped_cells:
            row, col = not_flipped_cells.popleft()
            if board[row][col] in ("X", "2"):
                continue
            board[row][col] = "2"
            for x, y in ([0,1],[1,0],[0,-1],[-1,0]):
                r, c = row + x, col + y
                if 0 <= r < ROWS and 0 <= c < COLS and board[r][c] == "O":
                    not_flipped_cells.append([r,c])


        for r in range(ROWS):
            for c in range(COLS):
                if board[r][c] == "O":
                    board[r][c] = "X"

        for r in range(ROWS):
            for c in range(COLS):
                if board[r][c] == "2":
                    board[r][c] = "O"
```
