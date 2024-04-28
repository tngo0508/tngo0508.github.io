---
layout: single
title: "Problem of The Day: Number of Islands II"
date: 2024-4-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-305](/assets/images/2024-04-27_17-30-37-problem-305.png)

## Intuition

When approaching this problem, I first thought about utilizing the Union-Find data structure to efficiently keep track of connected components in the grid. Since we're dealing with islands, which are essentially connected regions of land, Union-Find seems like a suitable choice for this problem.

## Approach

My approach involves implementing a Union-Find class to manage the connected components and then iterating through the given positions to add lands and merge connected components accordingly. For each position, I'll also check neighboring positions to merge connected components if they are adjacent. Finally, I'll keep track of the number of distinct islands after each addition of land.

## Complexity

- Time complexity:
  O(m \* n + l) where l is the size of position list

- Space complexity:
  O(m \* n)

## Code

```python
class UnionFind:
    def __init__(self, n):
        self.root = [-1 for _ in range(n)]
        self.rank = [1] * n
        self.num_components = 0

    def addLand(self, x):
        if self.root[x] >= 0:
            return
        self.root[x] = x
        self.num_components += 1

    def isLand(self, x):
        return self.root[x] >= 0

    def find(self, x):
        if x == self.root[x]:
            return x
        self.root[x] = self.find(self.root[x])
        return self.root[x]

    def union(self, x, y):
        rootX = self.find(x)
        rootY = self.find(y)
        if rootX != rootY:
            if self.rank[rootX] < self.rank[rootY]:
                self.root[rootX] = rootY
            elif self.rank[rootX] > self.rank[rootY]:
                self.root[rootY] = rootX
            else:
                self.root[rootY] = rootX
                self.rank[rootX] += 1
            self.num_components -= 1


class Solution:
    def numIslands2(self, m: int, n: int, positions: List[List[int]]) -> List[int]:
        N = m * n
        uf = UnionFind(N)
        res = []
        for i, [r, c] in enumerate(positions):
            landPos = r * n + c # flatten index
            uf.addLand(landPos)
            for x,y in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                row, col = r + x, c + y
                if 0 <= row < m and 0 <= col < n:
                    neiPos = row * n + col
                    if uf.isLand(neiPos):
                        uf.union(landPos, neiPos)
            res.append(uf.num_components)

        return res

```
