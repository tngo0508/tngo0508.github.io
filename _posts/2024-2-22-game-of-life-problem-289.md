---
layout: single
title: "Problem of The Day: Game of Life"
date: 2024-2-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-289](/assets/images/2024-02-22_02-20-34-problem-289.png)](/assets/images/2024-02-22_02-20-34-problem-289.png)

## Intuition

My initial thought is to iterate through each cell, count its live neighbors, and update the cell's state accordingly.

## Approach

I'll use a clone of the board to store the updated states without affecting the original board during the iteration. I'll iterate through each cell, count its live neighbors, and update its state based on the rules of the Game of Life. After the iteration, I'll copy the updated states from the clone back to the original board.

## Complexity

- Time complexity:
  O(m \* n), where m is the number of rows and n is the number of columns in the board.

- Space complexity:
  O(m \* n) for the clone board. We are using additional space to store the updated states.

## Code

```python
class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        queue = deque()
        hash_set = set()
        ROWS = len(board)
        COLS = len(board[0])
        clone = [[board[r][c] for c in range(COLS)] for r in range(ROWS)]

        for r in range(ROWS):
            for c in range(COLS):
                total = 0
                for x, y in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
                    row = r + x
                    col = c + y
                    if 0 <= row < ROWS and 0 <= col < COLS:
                        total += board[row][col]

                if total == 3:
                    clone[r][c] = 1
                elif total < 2 or total > 3:
                    clone[r][c] = 0


        for r in range(ROWS):
            for c in range(COLS):
                board[r][c] = clone[r][c]


```

## Other implementation

```python
class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        queue = deque()
        hash_set = set()
        ROWS = len(board)
        COLS = len(board[0])

        for r in range(ROWS):
            for c in range(COLS):
                board[r][c] = [board[r][c], board[r][c]]

        for r in range(ROWS):
            for c in range(COLS):
                total = 0
                for x, y in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
                    row = r + x
                    col = c + y
                    if 0 <= row < ROWS and 0 <= col < COLS:
                        val, _ = board[row][col]
                        total += val

                board[r][c][1] = total

        for r in range(ROWS):
            for c in range(COLS):
                old, total = board[r][c]
                if total < 2 or total > 3:
                    board[r][c] = 0
                elif total == 3:
                    board[r][c] = 1
                else:
                    board[r][c] = old
```

## Editorial Solution

O(1) space

```python
class Solution:
    def gameOfLife(self, board: List[List[int]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        # Neighbors array to find 8 neighboring cells for a given cell
        neighbors = [(1,0), (1,-1), (0,-1), (-1,-1), (-1,0), (-1,1), (0,1), (1,1)]

        rows = len(board)
        cols = len(board[0])

        # Iterate through board cell by cell.
        for row in range(rows):
            for col in range(cols):

                # For each cell count the number of live neighbors.
                live_neighbors = 0
                for neighbor in neighbors:

                    # row and column of the neighboring cell
                    r = (row + neighbor[0])
                    c = (col + neighbor[1])

                    # Check the validity of the neighboring cell and if it was originally a live cell.
                    if (r < rows and r >= 0) and (c < cols and c >= 0) and abs(board[r][c]) == 1:
                        live_neighbors += 1

                # Rule 1 or Rule 3
                if board[row][col] == 1 and (live_neighbors < 2 or live_neighbors > 3):
                    # -1 signifies the cell is now dead but originally was live.
                    board[row][col] = -1
                # Rule 4
                if board[row][col] == 0 and live_neighbors == 3:
                    # 2 signifies the cell is now live but was originally dead.
                    board[row][col] = 2

        # Get the final representation for the newly updated board.
        for row in range(rows):
            for col in range(cols):
                if board[row][col] > 0:
                    board[row][col] = 1
                else:
                    board[row][col] = 0
```
