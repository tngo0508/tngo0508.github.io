---
layout: single
title: "Problem of The Day:  Rotting Oranges"
date: 2024-1-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
You are given an m x n grid where each cell can have one of three values:

0 representing an empty cell,
1 representing a fresh orange, or
2 representing a rotten orange.
Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.

Example 1:
Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4

Example 2:
Input: grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.

Example 3:
Input: grid = [[0,2]]
Output: 0
Explanation: Since there are already no fresh oranges at minute 0, the answer is just 0.
 

Constraints:

m == grid.length
n == grid[i].length
1 <= m, n <= 10
grid[i][j] is 0, 1, or 2.
```

# Intuition
My initial thoughts for solving this problem involve modeling the rotting process of oranges in a grid and determining the time it takes for all oranges to become rotten.

# Approach
I approach this problem using a breadth-first search (BFS) strategy. I iterate through the grid, identifying initially rotten oranges and enqueueing their positions. Additionally, I count the number of initially fresh oranges.

In each iteration of the BFS, I process all oranges in the queue, marking them as rotten and spreading the rot to adjacent fresh oranges. I keep track of the number of minutes elapsed. The process continues until all fresh oranges are rotten or no further spreading is possible.

The final result is the total number of minutes it takes for all oranges to become rotten. If there are still fresh oranges remaining after the BFS, it means they cannot be rotten, and I return -1.

# Complexity
- Time complexity:
The time complexity is O(rows * cols), where rows and cols are the dimensions of the grid. This is because, in the worst case, each cell in the grid may be processed during the BFS.

- Space complexity:
The space complexity is O(rows * cols) as well. The queue can potentially store all cells in the grid during the BFS, and the fresh count is also tracked.

# Code
```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        fresh = 0
        minute = 0
        queue = deque()
        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 2:
                    queue.append([row, col])
                elif grid[row][col] == 1:
                    fresh += 1

        while queue:
            length = len(queue)
            for _ in range(length):
                r, c = queue.popleft()
                if grid[r][c] == 1:
                    fresh -= 1
                if fresh == 0:
                    return minute
                grid[r][c] = 2
                for row, col in [(r+1,c),(r-1,c),(r,c+1),(r,c-1)]:
                    if 0 <= row < rows and 0 <= col < cols and grid[row][col] == 1:
                        queue.append([row, col])

            minute += 1

        return minute if fresh == 0 else -1
```