---
layout: single
title: "Problem of The Day: Spiral Matrix"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/spiral-matrix/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to use a simulation approach where I iterate through the matrix in a specific order while keeping track of the visited elements.

# Approach
I will use four loops, each representing one side of the spiral: top, right, bottom, and left. In each loop, I will iterate through the corresponding elements and add them to the result list. After completing each side, I will update the boundaries to move to the inner layer of the matrix. I will continue this process until all elements are visited.

# Complexity
- Time complexity:
O(m * n) where m is number of rows and n is number of columns

- Space complexity:
O(1) as we are not using any additional space proportional to the input. The result list is not considered in space complexity analysis since it's part of the output.

# Code
```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        rows = len(matrix)
        cols = len(matrix[0])
        num_of_elems = rows * cols
        res = []
        row = col = 0
        while row < rows and col < cols:
            # top left -> top right
            for c in range(col, cols - col):
                res.append(matrix[row][c])
            
            if len(res) == num_of_elems:
                break

            # top right -> bottom right
            for r in range(row + 1, rows - row -1):
                res.append(matrix[r][cols - col - 1])


            # bottom right -> bottom left
            for c in range(cols - col - 1, col - 1, -1):
                res.append(matrix[rows - row - 1][c])

            if len(res) == num_of_elems:
                break

            # bottom left -> top left
            for r in range(rows - row - 2, row, -1):
                res.append(matrix[r][col])

            row += 1
            col += 1
        return res
```

# Clean Code
The code traverses a matrix in a spiral order. It starts by moving to the right, then downward, left, and finally upward, repeating this pattern until all elements are visited. It keeps track of the remaining rows and columns to traverse, switching direction after each completed horizontal and vertical traversal. The result list stores the visited elements in the desired order.
```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        rows = len(matrix)
        cols = len(matrix[0])
        direction = 1
        row = 0
        col = -1
        while rows > 0 and cols > 0:
            for _ in range(cols):
                col += direction
                result.append(matrix[row][col])
            rows -= 1

            for _ in range(rows):
                row += direction
                result.append(matrix[row][col])
            cols -= 1

            direction *= -1

        return result
```

# Editorial Solution
```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        result = []
        rows, columns = len(matrix), len(matrix[0])
        up = left = 0
        right = columns - 1
        down = rows - 1

        while len(result) < rows * columns:
            # Traverse from left to right.
            for col in range(left, right + 1):
                result.append(matrix[up][col])

            # Traverse downwards.
            for row in range(up + 1, down + 1):
                result.append(matrix[row][right])

            # Make sure we are now on a different row.
            if up != down:
                # Traverse from right to left.
                for col in range(right - 1, left - 1, -1):
                    result.append(matrix[down][col])

            # Make sure we are now on a different column.
            if left != right:
                # Traverse upwards.
                for row in range(down - 1, up, -1):
                    result.append(matrix[row][left])

            left += 1
            right -= 1
            up += 1
            down -= 1

        return result
```