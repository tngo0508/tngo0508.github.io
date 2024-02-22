---
layout: single
title: "Problem of The Day: Find the Town Judge"
date: 2024-2-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-997](/assets/images/2024-02-21_17-05-19-problem-997.png)](/assets/images/2024-02-21_17-05-19-problem-997.png)

## Intuition

The goal of this problem is to find the town judge based on trust relationships. The judge is someone who is trusted by everyone else but trusts no one.

## Approach

To approach this problem, I used a hash map to keep track of how many times a person is trusted. Additionally, I maintained a set of people who are not judges, as judges are those who are trusted by everyone else.

I iterated through the trust relationships and updated the trust count for each person. Simultaneously, I kept track of people who are not judges.

After processing the trust relationships, I checked for a person who is not in the set of not-judges and has been trusted by everyone else (trust count equal to n-1, where n is the total number of people). If such a person is found, they are considered the judge.

## Complexity

- Time complexity:
O(n) where n is the total number of people. We iterate through the trust relationships and then through the set of people.

- Space complexity:
O(n) where n is the total number of people. The `hash_map` and `not_judges` set store information for each person.

## Code

```python
class Solution:
    def findJudge(self, n: int, trust: List[List[int]]) -> int:
        hash_map = defaultdict(int)
        not_judges = set()
        for person, trusted_person in trust:
            hash_map[trusted_person] += 1
            not_judges.add(person)
        
        for i in range(1, n + 1):
            if i not in not_judges and hash_map[i] == n - 1:
                return i
        return -1
```

## Editorial Solution

### Approach 1: Two Arrays

This is a simple graph problem. Here, we do not need to construct the graph. We only need to recognize that we should calculate the `indegree` and `outdegree` to solve this problem.

```python
def findJudge(self, N: int, trust: List[List[int]]) -> int:
    
    if len(trust) < N - 1:
        return -1
    
    indegree = [0] * (N + 1)
    outdegree = [0] * (N + 1)
    
    for a, b in trust:
        outdegree[a] += 1
        indegree[b] += 1
        
    for i in range(1, N + 1):
        if indegree[i] == N - 1 and outdegree[i] == 0:
            return i
    return -1
```

- Time complexity: O(E) where E is the number of edges in the directed graph.
- Space complexity: O(N) since we need to allocate two arrays

### Approach 2: One Array

```python
def findJudge(self, N: int, trust: List[List[int]]) -> int:

    if len(trust) < N - 1:
        return -1

    trust_scores = [0] * (N + 1)

    for a, b in trust:
        trust_scores[a] -= 1
        trust_scores[b] += 1
    
    for i, score in enumerate(trust_scores[1:], 1):
        if score == N - 1:
            return i
    return -1
```

- Time complexity: O(E)
- Space complexity: O(N)
