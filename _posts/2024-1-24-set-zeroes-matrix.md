---
layout: single
title: "Problem of The Day: Set Matrix Zeroes"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/set-matrix-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to identify the cells containing zeros and then update entire rows and columns to zeros based on this information.

# Approach
I will iterate through the matrix, identify the positions of zero elements, and store them in a queue. After that, I will process the queue, updating entire rows and columns to zeros for each zero position.

# Complexity
- Time complexity:
O(m * n)

- Space complexity:
O(m + n)

# Code
```python
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        queue = deque()
        rows = len(matrix)
        cols = len(matrix[0])
        for row in range(rows):
            for col in range(cols):
                if matrix[row][col] == 0:
                    queue.append([row, col])
        
        while queue:
            row, col = queue.popleft()
            for c in range(cols):
                matrix[row][c] = 0
            for r in range(rows):
                matrix[r][col] = 0
        
        return matrix
```

# Editorial Solution
O(1) space approach
```python
class Solution(object):
    def setZeroes(self, matrix):
        """
        :type matrix: List[List[int]]
        :rtype: void Do not return anything, modify matrix in-place instead.
        """
        is_col = False
        R = len(matrix)
        C = len(matrix[0])
        for i in range(R):
            # Since first cell for both first row and first column is the same i.e. matrix[0][0]
            # We can use an additional variable for either the first row/column.
            # For this solution we are using an additional variable for the first column
            # and using matrix[0][0] for the first row.
            if matrix[i][0] == 0:
                is_col = True
            for j in range(1, C):
                # If an element is zero, we set the first element of the corresponding row and column to 0
                if matrix[i][j]  == 0:
                    matrix[0][j] = 0
                    matrix[i][0] = 0

        # Iterate over the array once again and using the first row and first column, update the elements.
        for i in range(1, R):
            for j in range(1, C):
                if not matrix[i][0] or not matrix[0][j]:
                    matrix[i][j] = 0

        # See if the first row needs to be set to zero as well
        if matrix[0][0] == 0:
            for j in range(C):
                matrix[0][j] = 0

        # See if the first column needs to be set to zero as well        
        if is_col:
            for i in range(R):
                matrix[i][0] = 0
```