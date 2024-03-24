---
layout: single
title: "Problem of The Day: Snakes and Ladders"
date: 2024-3-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-909](/assets/images/2024-03-24_14-21-05-problem-909.png)

My notes:

- consider the following test cases

![note](/assets/images/2024-03-24_14-21-54-problem-909-note.png)

- > If encountering an off-by-one error, it's crucial to reconsider the arrangement of the if-statements during checks or determine the final result when executing the BFS traversal.

## Intuition

Upon reviewing the problem, I noticed that we need to traverse the board in a snake-like pattern, moving either left-to-right or right-to-left alternatively. My initial thought was to use a breadth-first search (BFS) approach to explore possible moves on the board.

## Approach

I devised an approach where I first created a mapping from the numbers on the board to their corresponding row and column indices. Then, I used BFS to traverse the board, keeping track of the current position and the number of moves made. I continued exploring possible moves until I either reached the end of the board or exhausted all possible moves.

## Complexity

- Time complexity:
  O(N^2), where N is the size of the board, as we may potentially visit each cell of the board once.

- Space complexity:
  O(N^2) as we use a hash map to store the mappings from numbers to their corresponding cell indices, and we also use a queue to perform BFS.

## Code

```python
from collections import defaultdict, deque
from typing import List

class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        N = len(board)

        # Function to map numbers to their corresponding cell indices
        def num_to_cell():
            hash_map = defaultdict()
            left_to_right = True
            number = 1
            for i in range(N - 1, -1, -1):
                if left_to_right:
                    for j in range(N):
                        hash_map[number] = (i, j)
                        number += 1
                else:
                    for j in range(N - 1, -1, -1):
                        hash_map[number] = (i, j)
                        number += 1
                left_to_right = not left_to_right
            return hash_map

        num_to_cell_map = num_to_cell()
        queue = deque()
        queue.append([1, 0])  # Start with cell 1 and 0 moves
        visited = set()  # Set to keep track of visited cells

        while queue:
            curr, moves = queue.popleft()

            # Explore possible moves from the current cell
            for next_num in range(curr + 1, min(curr + 6, N * N) + 1):
                r, c = num_to_cell_map[next_num]
                next_node = board[r][c] if board[r][c] != -1 else next_num

                # If we reach the end of the board, return the number of moves
                if next_node == N * N:
                    return moves + 1

                # If the next cell hasn't been visited, add it to the queue
                if next_node not in visited:
                    visited.add(next_node)
                    queue.append([next_node, moves + 1])

        # If we couldn't reach the end of the board, return -1
        return -1

```

## Editorial Solution

### Approach 1: Breadth-first search

```python
from collections import deque


class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        n = len(board)
        cells = [None] * (n**2 + 1)
        label = 1
        columns = list(range(0, n))
        for row in range(n - 1, -1, -1):
            for column in columns:
                cells[label] = (row, column)
                label += 1
            columns.reverse()
        dist = [-1] * (n * n + 1)
        q = deque([1])
        dist[1] = 0
        while q:
            curr = q.popleft()
            for next in range(curr + 1, min(curr + 6, n**2) + 1):
                row, column = cells[next]
                destination = (board[row][column] if board[row][column] != -1
                               else next)
                if dist[destination] == -1:
                    dist[destination] = dist[curr] + 1
                    q.append(destination)
        return dist[n * n]
```

Notes:

- In the above implementation, `dist` is an array representing the minimum number of moves required to reach each cell from the starting cell (cell 1). Setting `dist[1]` to 0 indicates that the starting cell itself is at distance 0. During BFS traversal, unvisited cells have `dist` set to -1. When visiting a cell, its `dist` value is updated to `dist[curr] + 1`, indicating the minimum number of moves to reach it from the current cell. This initialization ensures accurate distance calculation during BFS.

### Interesting implementation

This is from Leetcode submission.

```python
class Solution:
    def snakesAndLadders(self, board: List[List[int]]) -> int:
        length = len(board)
        board.reverse()
        def intToPos(square):
            r = (square - 1) // length
            c = (square - 1) % length
            if r % 2:
                c = length - 1 - c
            return [r,c]

        q = deque()
        q.append([1,0])  # [squares,moves]
        visit = set()
        while q:
            squares,moves = q.popleft()
            for i in range(1,7):
                nextSquare = squares + i
                r,c = intToPos(nextSquare)
                if board[r][c] != -1:
                    nextSquare = board[r][c]
                if nextSquare == length*length:
                    return moves + 1
                if nextSquare not in visit:
                    q.append([nextSquare,moves+1])
                    visit.add(nextSquare)
        return -1
```
