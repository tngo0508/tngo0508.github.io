---
layout: single
title: "Problem of The Day: Find All Groups of Farmland"
date: 2024-4-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-1992](/assets/images/2024-04-19_22-03-06-problem-1992.png)

## Intuition

The problem seems to involve finding farmland in a grid represented by a 2D array. Each farmland is represented by the coordinates of its top-left and bottom-right corners. Initially, I'm thinking of traversing the grid and identifying the top-left corner of each farmland.

## Approach

To solve this problem, I plan to iterate over each cell in the grid. For each cell, if it's part of a farmland (i.e., has the value 1) and its top-left corner hasn't been visited yet, I'll perform a depth-first search (DFS) to find the bottom-right corner of the farmland. During the DFS, I'll mark visited cells as 0 to avoid revisiting them.

I'll define helper functions to check if a cell is a valid top-left corner and to perform DFS. Then, I'll iterate over all cells in the grid, and whenever I find a valid top-left corner, I'll perform DFS to find the bottom-right corner.

## Complexity

- Time complexity:
  O(m \* n) where m is the number of the rows and n is the number of columns in the grid

- Space complexity:
  O(m \* n)

## Code

```python
class Solution:
    def findFarmland(self, land: List[List[int]]) -> List[List[int]]:
        ROWS = len(land)
        COLS = len(land[0])
        res = []
        def isValidTopLeftCorner(row, col):
            for x, y in [(-1,0),(0,-1)]:
                r, c = row + x, col + y
                val = land[r][c] if 0 <= r < ROWS and 0 <= c < COLS else 0
                if val == 1:
                    return False
            return True


        def dfs(row, col):
            nonlocal r2
            nonlocal c2
            if row >= ROWS or col >= COLS:
                r2 = max(r2, row - 1)
                c2 = max(c2, col - 1)
                return
            if land[row][col] == 0:
                r2 = max(r2, row - 1)
                c2 = max(c2, col - 1)
                return
            land[row][col] = 0
            dfs(row, col + 1)
            dfs(row + 1, col)

        for r1 in range(ROWS):
            for c1 in range(COLS):
                if land[r1][c1] == 1 and isValidTopLeftCorner(r1, c1):
                    r2, c2 = r1, c1
                    dfs(r1, c1)
                    res.append([r1, c1, r2, c2])

        return res
```
