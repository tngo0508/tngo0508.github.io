---
layout: single
title: "Problem of The Day:  Number of Islands"
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
Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

 

Example 1:

Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 1
Example 2:

Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
 

Constraints:

m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] is '0' or '1'.
```

# DFS Approach
## Intuition
My first thoughts on solving this problem involve identifying and counting the number of islands in a given grid. An island is defined as a connected group of '1's.

## Approach
To address this problem, I adopt a Depth-First Search (DFS) strategy. I iterate through each cell in the grid, and when I encounter a '1', I initiate a DFS to explore and mark all connected '1's as part of the same island. This involves recursively updating the grid by changing '1's to '0's to avoid counting the same island multiple times.

I maintain a count of the number of islands encountered during this process, and the final count represents the total number of islands in the grid.

## Complexity
- Time complexity:
The time complexity is O(rows * cols), where rows and cols denote the dimensions of the grid. This is because, in the worst case, we might have to traverse the entire grid to identify and explore each cell.

- Space complexity:
The space complexity is O(1) since I'm not using any additional data structures that scale with the input size. The recursive DFS utilizes the call stack, but it doesn't contribute to the space complexity in a significant way.

## Code
```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows = len(grid)
        cols = len(grid[0])

        def dfs(r, c):
            grid[r][c] = '0'
            for row, col in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)]:
                if 0 <= row < rows and 0 <= col < cols and grid[row][col] != '0':
                    dfs(row, col)
        
        num_of_islands = 0
        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == '1':
                    dfs(row, col)
                    num_of_islands += 1
        
        return num_of_islands
```

# Editorial Solution
## BFS
```cpp
class Solution {
public:
  int numIslands(vector<vector<char>>& grid) {
    int nr = grid.size();
    if (!nr) return 0;
    int nc = grid[0].size();

    int num_islands = 0;
    for (int r = 0; r < nr; ++r) {
      for (int c = 0; c < nc; ++c) {
        if (grid[r][c] == '1') {
          ++num_islands;
          grid[r][c] = '0'; // mark as visited
          queue<pair<int, int>> neighbors;
          neighbors.push({r, c});
          while (!neighbors.empty()) {
            auto rc = neighbors.front();
            neighbors.pop();
            int row = rc.first, col = rc.second;
            if (row - 1 >= 0 && grid[row-1][col] == '1') {
              neighbors.push({row-1, col}); grid[row-1][col] = '0';
            }
            if (row + 1 < nr && grid[row+1][col] == '1') {
              neighbors.push({row+1, col}); grid[row+1][col] = '0';
            }
            if (col - 1 >= 0 && grid[row][col-1] == '1') {
              neighbors.push({row, col-1}); grid[row][col-1] = '0';
            }
            if (col + 1 < nc && grid[row][col+1] == '1') {
              neighbors.push({row, col+1}); grid[row][col+1] = '0';
            }
          }
        }
      }
    }

    return num_islands;
  }
};
```