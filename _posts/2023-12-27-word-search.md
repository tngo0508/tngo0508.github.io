---
layout: single
title: "Problem of The Day: Word Search"
date: 2023-12-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Top 100 Liked
  - Problem of The Day
---
Today, I tackled the [Word Search](https://leetcode.com/problems/word-search/?envType=study-plan-v2&envId=top-100-liked) problem within the backtrack section of the Top 100 Liked on LeetCode. After engaging with several backtrack problems, I gained increased confidence and efficiency in devising solutions and translating them into code. This particular problem revolves around determining whether a given word can be found within a matrix. 

# My Explanation and Approach
In addressing the Word Search problem, I employed the backtrack algorithm within the Top 100 Liked section. My strategy involved traversing the matrix using two nested `for` loops and invoking a helper function, `backtrack`, whenever the current cell contained the first character of the search word.

To streamline navigation through the matrix, I leveraged an array, `[(1, 0), (0, 1), (-1, 0), (0, -1)]`, representing the four possible directions: up, down, left, and right. The recursive aspect of the solution unfolded within the `backtrack` function, where exploration occurred based on these directions. I ensured that the exploration stayed within the matrix bounds and verified matching characters. In case of a mismatch, the branch was promptly terminated, optimizing the search process.

The base case, denoted by `index == len(word)`, signaled the successful completion of the word search, as it indicated that all characters in the search word had been successfully matched.

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        result = []
        rows = len(board)
        cols = len(board[0])

        def backtrack(index, board, r, c, word):
            if index == len(word):
                return True
            temp = board[r][c]
            board[r][c] = '*'
            for x, y in [(1,0),(0,1),(-1,0),(0,-1)]:
                row, col = r - x, c - y
                if 0 <= row < rows and 0 <= col < cols and board[row][col] == word[index]:
                    if backtrack(index + 1, board, row, col, word):
                        return True

            board[r][c] = temp
            return False

        for row in range(rows):
            for col in range(cols):
                if board[row][col] == word[0]:
                    if backtrack(1, board, row, col, word):
                        return True
        
        return False
```
# Leet Code Solution
```python
class Solution(object):
    def exist(self, board, word):
        """
        :type board: List[List[str]]
        :type word: str
        :rtype: bool
        """
        self.ROWS = len(board)
        self.COLS = len(board[0])
        self.board = board

        for row in range(self.ROWS):
            for col in range(self.COLS):
                if self.backtrack(row, col, word):
                    return True

        # no match found after all exploration
        return False


    def backtrack(self, row, col, suffix):
        # bottom case: we find match for each letter in the word
        if len(suffix) == 0:
            return True

        # Check the current status, before jumping into backtracking
        if row < 0 or row == self.ROWS or col < 0 or col == self.COLS \
                or self.board[row][col] != suffix[0]:
            return False

        ret = False
        # mark the choice before exploring further.
        self.board[row][col] = '#'
        # explore the 4 neighbor directions
        for rowOffset, colOffset in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            ret = self.backtrack(row + rowOffset, col + colOffset, suffix[1:])
            # break instead of return directly to do some cleanup afterwards
            if ret: break

        # revert the change, a clean slate and no side-effect
        self.board[row][col] = suffix[0]

        # Tried all directions, and did not find any match
        return ret

```