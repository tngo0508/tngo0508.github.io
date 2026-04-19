---
title: "Search a 2D Matrix in C#"
excerpt: "Explore multiple ways to search for a target value in a sorted 2D matrix, including the virtual 1D array and staircase search approaches."
date: 2026-04-18
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Binary Search
  - Matrix
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Search a 2D Matrix

The "Search a 2D Matrix" problem asks us to determine if a target value exists in an `m x n` integer matrix. The matrix has the following properties:
1. Each row is sorted in non-decreasing order.
2. The first integer of each row is greater than the last integer of the previous row.

> Given `matrix` and `target`, return `true` if `target` is in `matrix` or `false` otherwise.

### 2. The Intuition: Virtual 1D Array

Because the matrix is sorted such that the end of one row connects logically to the start of the next, we can treat the entire 2D structure as a single, long sorted array. 

To map a 1D index `mid` back to 2D coordinates `(row, col)`:
- `row = mid / cols`
- `col = mid % cols`

This allows us to navigate the matrix using pointers similar to a standard search.

### 3. Solution 1: Virtual 1D Array Approach

This implementation treats the matrix as a flattened 1D array. It calculates a midpoint and maps it back to 2D coordinates.

```csharp
public class Solution {
    public bool SearchMatrix(int[][] matrix, int target) {
        int rows = matrix.Length;
        int cols = matrix[0].Length;
        int left = 0, right = (rows * cols) - 1;
        int mid = 0;
        int col = 0, row = 0;
        while (left <= right) {
            mid = (left + right) / 2;
            col = mid % cols;
            row = mid / cols;
            if (target == matrix[row][col]) {
                return true;
            } else if (target > matrix[row][col]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return false;
    }
}
```

### 4. Solution 2: Staircase Search (NeetCode)

An alternative approach, often found on [NeetCode.io](https://neetcode.io), starts from the top-right corner of the matrix. Since each row and column is sorted, we can move down or left based on the comparison with the target.

```csharp
public class Solution {
    public bool SearchMatrix(int[][] matrix, int target) {
        int m = matrix.Length, n = matrix[0].Length;
        int r = 0, c = n - 1;

        while (r < m && c >= 0) {
            if (matrix[r][c] > target) {
                c--;
            } else if (matrix[r][c] < target) {
                r++;
            } else {
                return true;
            }
        }
        return false;
    }
}
```

### 5. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Virtual 1D** | **O(log(M * N))** | **O(1)** | Standard binary search logic is used to narrow down the search range exponentially. |
| **Staircase** | **O(M + N)** | **O(1)** | In each step, it either moves down one row or left one column. |

### 6. Summary

Whether treating the matrix as a flattened array or using a staircase search, both methods leverage the sorted properties of the matrix. The virtual 1D array approach using binary search provides logarithmic time complexity, making it highly efficient for large datasets.

### 7. Further Reading
- [Search a 2D Matrix (LeetCode 74)](https://leetcode.com/problems/search-a-2d-matrix/)
- [Binary Search Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Neetcode Roadmap - Binary Search](https://neetcode.io/roadmap)
