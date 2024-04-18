---
layout: single
title: "Problem of The Day: Island Perimeter"
date: 2024-4-17
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-463](/assets/images/2024-04-17_18-09-55-problem-463.png)

## Intuition

I'm thinking about how to efficiently calculate the perimeter of islands in the given grid. One way to approach this is to iterate through each cell in the grid and check if it's part of an island. If it is, I'll count how many sides of the cell are exposed to water, as those will contribute to the perimeter.

## Approach

My approach is to iterate through each cell in the grid. For each cell that represents land (value of 1), I'll add 4 to the perimeter count, as each cell initially contributes 4 sides to the perimeter. Then, I'll check the adjacent cells to see if they are also land. If they are, it means they share a side with the current cell, so I'll decrement the perimeter count by 1 for each adjacent land cell found.

## Complexity

- Time complexity:
  O(m \* n)

- Space complexity:
  O(n)

## Code

```python
class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        ROWS = len(grid)
        COLS = len(grid[0])
        res = 0
        for row in range(ROWS):
            for col in range(COLS):
                if grid[row][col] == 1:
                    res += 4
                    for x, y in [(1,0),(0,1),(-1,0),(0,-1)]:
                        r, c = row + x, col + y
                        if 0 <= r < ROWS and 0 <= c < COLS and grid[r][c] == 1:
                            res -= 1

        return res

```

## Editorial Solution

The `islandPerimeter` function calculates the perimeter of a grid representing an island. It iterates through each cell in the grid and adds 4 to the perimeter for each land cell found. If adjacent cells are also land cells, it subtracts 2 from the perimeter for each adjacency, accounting for shared edges. Finally, it returns the total perimeter.

what is the insight behind this logic?
The logic behind checking only the top and left neighboring cells is based on the observation that when traversing the grid row by row and column by column, checking only these two directions is sufficient to account for all possible adjacent land cells that could share an edge. This is because if a cell has a land cell above or to its left, it shares an edge with that cell, and counting both top and left ensures that shared edges are not double-counted. Checking other directions (bottom and right) would result in redundancy because those cells would already be counted when iterating over the subsequent rows and columns. Thus, checking only the top and left reduces unnecessary computation while accurately calculating the perimeter.

```python
class Solution:
    def islandPerimeter(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])

        result = 0

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    result += 4

                    if r > 0 and grid[r-1][c] == 1:
                        result -= 2

                    if c > 0 and grid[r][c-1] == 1:
                        result -= 2

        return result
```
