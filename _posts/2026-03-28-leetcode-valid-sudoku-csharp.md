---
title: "Solving Valid Sudoku in C#"
excerpt: "Learn how to validate a 9x9 Sudoku board efficiently by checking rows, columns, and sub-boxes using HashSets."
date: 2026-03-28
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Array
  - Hash Set
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Valid Sudoku

The "Valid Sudoku" problem requires us to determine if a 9x9 Sudoku board is valid based on three specific rules.

> Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:
>
> 1. Each row must contain the digits 1-9 without repetition.
> 2. Each column must contain the digits 1-9 without repetition.
> 3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.

Only the filled cells (represented by digits '1'-'9') need to be checked. Empty cells are represented by '.'.

### 2. The Intuition: Hash Sets for Validation

To validate the Sudoku board, we must ensure no duplicate digits exist within any row, column, or 3x3 sub-box.

A `HashSet<char>` is ideal for this purpose because it provides **O(1)** average time complexity for both insertions and lookups. By iterating through the board, we can track seen digits for each constraint:

- **Rows**: Reset the set for each row and ensure digits don't repeat.
- **Columns**: Similarly, reset the set for each column.
- **Sub-boxes**: Each 3x3 sub-box can be identified by a group number. A common formula for mapping a cell `(i, j)` to a sub-box index (0-8) is `(i / 3) * 3 + (j / 3)`.

### 3. Implementation: Modular Approach

This implementation breaks down the validation into three helper methods for clarity and modularity.

```csharp
public class Solution {
    public bool IsValidSudoku(char[][] board) {
        // 1. Validate rows, columns, and sub-boxes independently
        return IsRowValid(board) && IsColumnValid(board) && IsSubBoxValid(board);
    }

    private bool IsRowValid(char[][] board) {
        // 2. Iterate through each row and check for uniqueness
        for (int i = 0; i < 9; i++) {
            var seen = new HashSet<char>();
            for (int j = 0; j < 9; j++) {
                char curr = board[i][j];
                if (curr == '.') continue;
                
                if (seen.Contains(curr)) return false;
                seen.Add(curr);
            }
        }
        return true;
    }

    private bool IsColumnValid(char[][] board) {
        // 3. Iterate through each column and check for uniqueness
        for (int j = 0; j < 9; j++) {
            var seen = new HashSet<char>();
            for (int i = 0; i < 9; i++) {
                char curr = board[i][j];
                if (curr == '.') continue;
                
                if (seen.Contains(curr)) return false;
                seen.Add(curr);
            }
        }
        return true;
    }

    private bool IsSubBoxValid(char[][] board) {
        // 4. Use a dictionary of sets to track digits in each of the nine 3x3 boxes
        var boxes = new Dictionary<int, HashSet<char>>();
        for (int i = 0; i < 9; i++) boxes[i] = new HashSet<char>();

        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char curr = board[i][j];
                if (curr == '.') continue;

                // Map the cell to one of the 9 sub-boxes (0-8)
                int boxIndex = (i / 3) * 3 + (j / 3);
                if (boxes[boxIndex].Contains(curr)) return false;
                boxes[boxIndex].Add(curr);
            }
        }
        return true;
    }
}
```

### 4. Implementation: Iterative Approach (NeetCode IO)

This alternative implementation performs the same validation logic but uses nested loops to check each row, column, and 3x3 sub-box iteratively without helper methods.

```csharp
public class Solution {
    public bool IsValidSudoku(char[][] board) {
        // 1. Validate rows using a fresh set for each
        for (int row = 0; row < 9; row++) {
            HashSet<char> seen = new HashSet<char>();
            for (int i = 0; i < 9; i++) {
                if (board[row][i] == '.') continue;
                if (seen.Contains(board[row][i])) return false;
                seen.Add(board[row][i]);
            }
        }

        // 2. Validate columns using a fresh set for each
        for (int col = 0; col < 9; col++) {
            HashSet<char> seen = new HashSet<char>();
            for (int i = 0; i < 9; i++) {
                if (board[i][col] == '.') continue;
                if (seen.Contains(board[i][col])) return false;
                seen.Add(board[i][col]);
            }
        }

        // 3. Validate nine 3x3 sub-boxes
        for (int square = 0; square < 9; square++) {
            HashSet<char> seen = new HashSet<char>();
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    // Map the square index and cell indices (0-2) to the board coordinates
                    int row = (square / 3) * 3 + i;
                    int col = (square % 3) * 3 + j;
                    if (board[row][col] == '.') continue;
                    if (seen.Contains(board[row][col])) return false;
                    seen.Add(board[row][col]);
                }
            }
        }

        return true;
    }
}
```

### 5. Step-by-Step Breakdown

#### Step 1: Validate Rows
We iterate through each of the 9 rows. For every row, we create a fresh `HashSet`. If we encounter a digit that already exists in the set, the board is invalid.

#### Step 2: Validate Columns
We perform a similar check for columns by swapping the iteration order (iterating through columns first, then rows). This ensures each column contains unique digits.

#### Step 3: Validate Sub-boxes
To check the 3x3 sub-grids, we use a mapping formula: `(row / 3) * 3 + (col / 3)`. This divides the 9x9 grid into nine 3x3 blocks indexed 0 through 8.

**How the Formula Works:**
The 9x9 grid has 9 sub-boxes. To map any cell `(i, j)` to a box index from 0 to 8:
- `i / 3`: Determines the **row-block** (0, 1, or 2).
- `j / 3`: Determines the **column-block** (0, 1, or 2).
- `(i / 3) * 3 + (j / 3)`: Maps the 2D block coordinates to a linear index. 

For example, cell `(4, 5)` is in row-block `4 / 3 = 1` and column-block `5 / 3 = 1`. The box index is `(1 * 3) + 1 = 4`. We track digits within these blocks to ensure no duplicates.

#### Step 4: Final Verification
The `IsValidSudoku` method returns `true` only if all three validation checks (rows, columns, and sub-boxes) pass.

### 6. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(1)** | Since the board size is fixed at 9x9, the number of operations is constant. More generally, it is **O(N²)** where N is the board dimension. |
| **Space Complexity** | **O(1)** | We use a fixed amount of additional space for the hash sets (max 81 entries). In general terms, this is **O(N²)**. |

### 7. Summary

Validating a Sudoku board is a classic application of hashing for frequency or existence checks. By separating the logic into row, column, and sub-box validations, we maintain a clean and readable implementation while adhering to the **O(N²)** time requirement.

### 8. Further Reading
- [HashSet<T> Class (System.Collections.Generic)](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1)
- [Neetcode - Valid Sudoku](https://neetcode.io/problems/valid-sudoku)
- [LeetCode Problem 36](https://leetcode.com/problems/valid-sudoku/)
