---
layout: single
title: "Problem of The Day: Pascal's Triangle"
date: 2024-1-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
  - Top 100 Liked
---
# Problem Statement
[![problem](/assets/images/2024-01-08_14-19-18-pascal.png)](/assets/images/2024-01-08_14-19-18-pascal.png)

# Intuition
The initial idea was to emulate Pascal's Triangle to generate the desired patterns for each row. The approach involves simulating the process described in the problem statement. Initially, I considered creating a matrix to mimic the generation process. However, I later recognized that I could enhance space efficiency by utilizing the previous row instead of the entire matrix.

My notes:
[![note](/assets/images/2024-01-08_14-45-53-pascal-note.png)](/assets/images/2024-01-08_14-45-53-pascal-note.png)

# Approach
To generate each row, I initialized the result with the first row `[1]`. Then, in each iteration, I created a new row by appending `1` at the end and updating the values in between based on the sum of the corresponding values in the previous row. This process was repeated for the specified number of rows.

# Complexity
- Time complexity:
 O(numRows^2) as each row requires calculating and updating its values based on the previous row.

- Space complexity:
O(numRows^2) as the result list stores each row, and the number of elements in the result is proportional to the square of the number of rows.

# Code
```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        result = [[1]]
        for i in range(1, numRows):
            prev = result[-1]
            curr = prev[:]
            curr.append(1)
            for j in range(1, len(prev)):
                curr[j] = prev[j - 1] + prev[j]
            result.append(curr[:])
        
        return result
```

# Editorial Code
```python
class Solution:
    def generate(self, num_rows: int) -> List[List[int]]:
        triangle = []

        for row_num in range(num_rows):
            # The first and last row elements are always 1.
            row = [None for _ in range(row_num + 1)]
            row[0], row[-1] = 1, 1

            # Each triangle element is equal to the sum of the elements
            # above-and-to-the-left and above-and-to-the-right.
            for j in range(1, len(row) - 1):
                row[j] = triangle[row_num - 1][j - 1] + triangle[row_num - 1][j]

            triangle.append(row)

        return triangle
```