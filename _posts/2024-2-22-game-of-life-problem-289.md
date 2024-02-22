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
