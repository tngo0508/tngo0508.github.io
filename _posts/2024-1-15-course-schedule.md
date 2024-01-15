---
layout: single
title: "Problem of The Day:  Course Schedule"
date: 2024-1-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.

For example, the pair [0, 1], indicates that to take course 0 you have to first take course 1.
Return true if you can finish all courses. Otherwise, return false.

 

Example 1:

Input: numCourses = 2, prerequisites = [[1,0]]
Output: true
Explanation: There are a total of 2 courses to take. 
To take course 1 you should have finished course 0. So it is possible.
Example 2:

Input: numCourses = 2, prerequisites = [[1,0],[0,1]]
Output: false
Explanation: There are a total of 2 courses to take. 
To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.
 

Constraints:

1 <= numCourses <= 2000
0 <= prerequisites.length <= 5000
prerequisites[i].length == 2
0 <= ai, bi < numCourses
All the pairs prerequisites[i] are unique.
```

# Topological Sort Approach
## Intuition
My initial approach to solving this problem involves utilizing topological sort to determine if it's possible to finish all courses based on the given prerequisites.

## Approach
I construct a directed graph, where each node represents a course, and the edges indicate prerequisites. Additionally, I maintain an in-degree dictionary to keep track of the number of incoming edges for each course. The queue is initialized with courses that have no prerequisites (in-degree is 0).

I perform a modified topological sort by continually dequeuing courses with in-degree 0, updating the in-degree of their neighbors, and enqueueing courses with no incoming edges. If the queue becomes empty before all courses are processed, it indicates the presence of a cycle, making it impossible to finish all courses.

After the topological sort, I check if there are any remaining courses with in-degree greater than 0. If so, it implies there are disconnected components in the graph, and it's not possible to finish all courses.

## Complexity
- Time complexity:
The time complexity is O(V + E), where V is the number of courses (vertices) and E is the number of prerequisites (edges). Constructing the graph and performing topological sort contribute to this complexity.

- Space complexity:
The space complexity is O(V + E) as well. The graph and in-degree dictionaries grow with the number of courses and prerequisites. The queue can potentially store all courses in the worst case.

## Code
```python
class Solution:
    def canFinish(
        self, numCourses: int, prerequisites: List[List[int]]
    ) -> bool:
        graph = {i: [] for i in range(numCourses)}
        in_degree = {i: 0 for i in range(numCourses)}
        for dst, src in prerequisites:
            graph[src].append(dst)
            in_degree[dst] += 1

        queue = deque()
        for node, val in in_degree.items():
            if val == 0:
                queue.append(node)

        if not queue:
            return False

        while queue:
            node = queue.popleft()
            for nei in graph[node]:
                in_degree[nei] -= 1
                if in_degree[nei] == 0:
                    queue.append(nei)


        for i in range(numCourses):
            if in_degree[i] > 0:
                return False

        return True

```

# Editorial Solution
Topological Sort
```python
class Solution:
    def canFinish(self, numCourses, prerequisites):
        indegree = [0] * numCourses
        adj = [[] for _ in range(numCourses)]

        for prerequisite in prerequisites:
            adj[prerequisite[1]].append(prerequisite[0])
            indegree[prerequisite[0]] += 1

        queue = deque()
        for i in range(numCourses):
            if indegree[i] == 0:
                queue.append(i)

        nodesVisited = 0
        while queue:
            node = queue.popleft()
            nodesVisited += 1

            for neighbor in adj[node]:
                indegree[neighbor] -= 1
                if indegree[neighbor] == 0:
                    queue.append(neighbor)

        return nodesVisited == numCourses
```

DFS Approach
```python
class Solution:
    def dfs(self, node, adj, visit, inStack):
        # If the node is already in the stack, we have a cycle.
        if inStack[node]:
            return True
        if visit[node]:
            return False
        # Mark the current node as visited and part of current recursion stack.
        visit[node] = True
        inStack[node] = True
        for neighbor in adj[node]:
            if self.dfs(neighbor, adj, visit, inStack):
                return True
        # Remove the node from the stack.
        inStack[node] = False
        return False

    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        for prerequisite in prerequisites:
            adj[prerequisite[1]].append(prerequisite[0])

        visit = [False] * numCourses
        inStack = [False] * numCourses
        for i in range(numCourses):
            if self.dfs(i, adj, visit, inStack):
                return False
        return True
```