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

## Accepted Solution

The following solution is inspired from `Editorial Solution` and [NeetCodeIO](https://www.youtube.com/watch?v=jZ-RVp5CVYY)

### Intuition

The problem involves checking whether it is possible to traverse all pairs of indices in the given list, where traversal is allowed only if the corresponding numbers at those indices share a common prime factor.

### Approach

1. We use Union-Find (Disjoint Set Union) to keep track of connected components.
2. For each number in the list, we find its prime factors and connect the indices corresponding to those factors.
3. The Union-Find data structure helps us determine the number of connected components.
4. If there is only one connected component, it means we can traverse all pairs of indices.

### Complexity

- Time complexity:
O(N * sqrt(M)), where N is the length of the input list and M is the maximum number in the list.
  - The while loop inside the union-find operations contributes to the sqrt(M) factor.

- Space complexity:
O(N), for the Union-Find data structure.

### Code

```python
class UnionFind:
    def __init__(self, n):
        self.root = [i for i in range(n)]
        self.rank = [0] * n
        self.num_of_components = n

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

            self.num_of_components -= 1        

class Solution:
    def canTraverseAllPairs(self, nums: List[int]) -> bool:
        prime_factor = defaultdict(int) # map prime number to index
        N = len(nums)
        uf = UnionFind(N)
        for i, num in enumerate(nums):
            f = 2

            # find all the prime numbers given a number
            while f * f <= num: # this equivalent to f < sqrt(num)
                if num % f == 0:
                    if f in prime_factor:
                        uf.union(i, prime_factor[f])
                    else:
                        prime_factor[f] = i

                    while num % f == 0:
                        num //= f

                f += 1

            if num > 1:
                if num in prime_factor:
                    uf.union(i, prime_factor[num])
                else:
                    prime_factor[num] = i
        
        # print(prime_factor)
        # print(uf.root)
        # print(uf.num_of_components)
        return uf.num_of_components == 1
```
