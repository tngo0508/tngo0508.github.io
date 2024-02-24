---
layout: single
title: "Problem of The Day: Find All People With Secret"
date: 2024-2-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2092](/assets/images/2024-02-24_11-02-19-problem-2092.png)](/assets/images/2024-02-24_11-02-19-problem-2092.png)

## Intuition

I'll start by identifying the key elements in the problem. We need to find all people who attended the same meetings as the given first person. The meetings are represented as time intervals, and each meeting involves two people. We can track the attendees of each meeting over time and update the set of people with whom the given person shares a secret.

## Approach

I will use a `hash_map` to store the meetings at each time point. Then, I'll iterate through the time points and update the set of secrets by adding people who attended the meetings at that time. I'll continue this process until no further updates can be made.

>Note: This solution may not be the most efficient one, and further optimizations could be explored.

## Complexity

- Time complexity:
O(m * n) where n is the number of time points and m is the average number of attendees in a meeting.

- Space complexity:
O(n) where n is the number of time points.

## Code

```python
class Solution:
    def findAllPeople(self, n: int, meetings: List[List[int]], firstPerson: int) -> List[int]:
        secrets = {0, firstPerson}
        hash_map = defaultdict(list) # {time_i: {attendants}}

        for x, y, time in meetings:
            hash_map[time].append([x, y])
        
        max_time = max(hash_map.keys())

        for i in range(1, max_time + 1):
            if i not in hash_map:
                continue
            attendants = hash_map[i]
            while True:
                is_done = True
                for x, y in attendants:
                    if x in secrets or y in secrets:
                        if x not in secrets or y not in secrets:
                            secrets.update([x, y])
                            is_done = False
                
                if is_done:
                    break

        return list(secrets)
```

## Editorial Solution

### Approach 1: Breadth First Search

```python
class Solution:
    def findAllPeople(self, n: int, meetings: List[List[int]], firstPerson: int) -> List[int]:
        # For every person, store the time and label of the person met.
        graph = defaultdict(list)
        for x, y, t in meetings:
            graph[x].append((t, y))
            graph[y].append((t, x))
        
        # Earliest time at which a person learned the secret 
        # as per current state of knowledge. If due to some new information, 
        # the earliest time of knowing the secret changes, we will update it
        # and again process all the people whom he/she meets after the time
        # at which he/she learned the secret.
        earliest = [inf] * n
        earliest[0] = 0
        earliest[firstPerson] = 0

        # Queue for BFS. It will store (person, time of knowing the secret)
        q = deque()
        q.append((0, 0))
        q.append((firstPerson, 0))

        # Do BFS
        while q:
            person, time = q.popleft()
            for t, next_person in graph[person]:
                if t >= time and earliest[next_person] > t:
                    earliest[next_person] = t
                    q.append((next_person, t))
        
        # Since we visited only those people who know the secret,
        # we need to return indices of all visited people.
        return [i for i in range(n) if earliest[i] != inf]
```

### Approach 5: Union-Find with Reset

```python
class Solution:
    def findAllPeople(self, n: int, meetings: List[List[int]], firstPerson: int) -> List[int]:
        # Sort meetings in increasing order of time
        meetings.sort(key=lambda x: x[2])

        # Group Meetings in increasing order of time
        same_time_meetings = defaultdict(list)
        for x, y, t in meetings:
            same_time_meetings[t].append((x, y))
    
        # Create graph
        graph = UnionFind(n)
        graph.unite(firstPerson, 0)

        # Process in increasing order of time
        for t in same_time_meetings:
            # Unite two persons taking part in a meeting
            for x, y in same_time_meetings[t]:
                graph.unite(x, y)
            
            # If any one knows the secret, both will be connected to 0.
            # If no one knows the secret, then reset.
            for x, y in same_time_meetings[t]:
                if not graph.connected(x, 0):
                    # No need to check for y since x and y were united
                    graph.reset(x)
                    graph.reset(y)
        
        # Al those who are connected to 0 will know the secret
        return [i for i in range(n) if graph.connected(i, 0)]

class UnionFind:
    def __init__(self, nodes: int):
        # Initialize parent and rank arrays
        self.parent = [i for i in range(nodes)]
        self.rank = [0] * nodes

    def find(self, x: int) -> int:
        # Find the parent of node x. Use Path Compression
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def unite(self, x: int, y: int) -> None:
        # Unite two nodes x and y, if they are not already united
        px = self.find(x)
        py = self.find(y)
        if px != py:
            # Union by Rank Heuristic
            if self.rank[px] > self.rank[py]:
                self.parent[py] = px
            elif self.rank[px] < self.rank[py]:
                self.parent[px] = py
            else:
                self.parent[py] = px
                self.rank[px] += 1
    
    def connected(self, x: int, y: int) -> bool:
        # Check if two nodes x and y are connected or not
        return self.find(x) == self.find(y)
    
    def reset(self, x: int) -> None:
        # Reset the initial properties of node x
        self.parent[x] = x
        self.rank[x] = 0
```
