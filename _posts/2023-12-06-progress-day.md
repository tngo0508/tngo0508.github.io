---
title: "Progress Day"
date: 2023-12-06
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
# A Positive Start and Professional Development

Today began with another rejection from Amazon. However, I've grown accustomed to setbacks and now view them as opportunities for growth. If one door closes, another is sure to open elsewhere. Luck, I believe, is the result of preparedness meeting opportunity. To lift my spirits, I shared a quality lunch with a friend from the gym, setting a positive tone for the day.

Despite facing slow internet at the coffee shop, I returned home with renewed motivation. I delved into the development of my personal project, focusing on refining frontend UIs and experimenting with different chart options. An exciting idea emerged—allowing users to import/export reports based on data tables and charts on the website. This will be my engaging task for the coming days.

Below image is the demonstration for today's progress.

![codetrack](/assets/images/screencapture-localhost-7134-2023-12-07-00_16_10.png)


# Balanced Lifestyle and Writing Reflections

Later, I followed my daily workout routine at a friend's gym. The familiar soreness in my muscles signified progress in my journey to rebuild both body and mind. Simultaneously, my commitment to daily writing and coding practice showed notable improvements. Despite an initial struggle, I find myself writing more naturally, with thoughts flowing effortlessly onto the keyboard. This newfound ease has mitigated my earlier frustration, transforming writing from a daunting task to a gratifying pursuit.

Reflecting on my past aversion to writing during college, particularly English courses, I recognize substantial progress in my skills. Although my writing isn't perfect, it's undeniably less flawed than before. The mantra "Practice makes perfect" resonates strongly with me now.

# Daily LeetCode Challenge and Code Sharing

In the evening, I revisited my daily LeetCode problem. While my focus has shifted more to the personal project, LeetCode remains an integral part of my routine, enhancing not only my technical interview skills but also my understanding of less frequently used data structures. Consistency has boosted my coding confidence, making seemingly arduous problems more approachable.

For those interested, here's the LeetCode problem I tackled today:
```python
# My solution
from collections import deque
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
      q = deque()
      n = len(grid)
      m = len(grid[0])
      fresh_oranges = 0
      for r in range(n):
        for c in range(m):
          if grid[r][c] == 2:
            q.append([r, c, 0])
          if grid[r][c] == 1:
            fresh_oranges += 1
      
      minute = 0
      while q:
        x, y, minute = q.popleft()
        
        for row, col in [(x, y + 1), (x + 1, y), (x, y - 1), (x - 1, y)]:
          if 0 <= row < n and 0 <= col < m and grid[row][col] == 1:
            q.append([row, col, minute + 1])
            fresh_oranges -= 1
            grid[row][col] = 2
      

      return minute if fresh_oranges == 0 else -1
```

```python
# Leetcode editorial solution
from collections import deque
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        queue = deque()

        # Step 1). build the initial set of rotten oranges
        fresh_oranges = 0
        ROWS, COLS = len(grid), len(grid[0])
        for r in range(ROWS):
            for c in range(COLS):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh_oranges += 1

        # Mark the round / level, _i.e_ the ticker of timestamp
        queue.append((-1, -1))

        # Step 2). start the rotting process via BFS
        minutes_elapsed = -1
        directions = [(-1, 0), (0, 1), (1, 0), (0, -1)]
        while queue:
            row, col = queue.popleft()
            if row == -1:
                # We finish one round of processing
                minutes_elapsed += 1
                if queue:  # to avoid the endless loop
                    queue.append((-1, -1))
            else:
                # this is a rotten orange
                # then it would contaminate its neighbors
                for d in directions:
                    neighbor_row, neighbor_col = row + d[0], col + d[1]
                    if ROWS > neighbor_row >= 0 and COLS > neighbor_col >= 0:
                        if grid[neighbor_row][neighbor_col] == 1:
                            # this orange would be contaminated
                            grid[neighbor_row][neighbor_col] = 2
                            fresh_oranges -= 1
                            # this orange would then contaminate other oranges
                            queue.append((neighbor_row, neighbor_col))

        # return elapsed minutes if no fresh orange left
        return minutes_elapsed if fresh_oranges == 0 else -1
```

# Closing Thoughts for Future Me
Embrace change, seek growth, and savor each moment. Life is a journey, not a destination—make it extraordinary.