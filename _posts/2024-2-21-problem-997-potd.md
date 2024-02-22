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
