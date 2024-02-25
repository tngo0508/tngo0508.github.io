---
layout: single
title: "Problem of The Day: Greatest Common Divisor Traversal"
date: 2024-2-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2709](/assets/images/2024-02-24_18-23-00-problem-2709.png)](/assets/images/2024-02-24_18-23-00-problem-2709.png)

> Note: need to review this problem and figure out more efficient algorithm.

## My Approach

My first thought is to figure out how to construct the edges. To do this, we need to know how to calculate `gcd` by using the `Euclidean Algorithm`. Once we have that information, the problem is simplified to a simple graph problem which is checking if all nodes are connected or not. This can be easily done using `UnionFind` algorithm.

This approach passed the base cases, but it was failed by the Leetcode judge due to TLE

## UnionFind - Memory Limit Exceeded

```python
class UnionFind:
    def __init__(self, n):
        self.root = [i for i in range(n)]
        self.rank = [0] * n

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


class Solution:
    def canTraverseAllPairs(self, nums: List[int]) -> bool:
        def gcd(a, b): # Euclidean Algorithm
            while b:
                a, b = b, a % b
            return a

        edges = []
        N = len(nums)
        for i in range(N):
            for j in range(i + 1, N):
                if gcd(nums[i], nums[j]) > 1:
                    edges.append([i, j])

        uf = UnionFind(N)
        for x, y in edges:
            uf.union(x, y)

        for i in range(N):
            uf.find(i)


        return len(set(uf.root)) == 1
```

# UnionFind - Time Limit Exceeded

```python
class UnionFind:
    def __init__(self, n):
        self.root = [i for i in range(n)]
        self.rank = [0] * n

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


class Solution:
    def canTraverseAllPairs(self, nums: List[int]) -> bool:
        def gcd(a, b): # Euclidean Algorithm
            while b:
                a, b = b, a % b
            return a

        N = len(nums)
        uf = UnionFind(N)
        for i in range(N):
            for j in range(i + 1, N):
                if gcd(nums[i], nums[j]) > 1:
                    uf.union(i, j)

        for i in range(N):
            uf.find(i)


        return len(set(uf.root)) == 1
```
