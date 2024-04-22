---
layout: single
title: "Problem of The Day: Open the Lock"
date: 2024-4-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-752](/assets/images/2024-04-21_21-39-17-problem-752.png)

## Intuition

My initial thought is to utilize a breadth-first search (BFS) approach to explore all possible combinations of turning the wheels of the lock until we reach the target combination.

## Approach

I'll start by checking if the initial state '0000' or the target state is in the list of deadends. If either of them is, then it's impossible to open the lock, so I'll return -1. Then, I'll initialize a queue to perform BFS. I'll enqueue the initial state along with the number of turns taken to reach that state.

I'll continue exploring states using BFS until I reach the target state or exhaust all possibilities. For each state, I'll check all possible combinations obtained by turning each wheel either clockwise or counterclockwise. I'll enqueue the valid states that are not in the deadends and have not been visited before.

## Complexity

- Time complexity:
  O(4(d + 10^4))

- Space complexity:
  O(4(d + 10^4))

## Code

```python
class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        if '0000' in deadends or target in deadends:
            return -1
        queue = deque()
        NUM_WHEELS = 4
        NUM_SLOTS = 10
        queue.append(['0000', 0])
        res = float('inf')
        visited = set()
        visited.add('0000')
        while queue:
            node, turns = queue.popleft()
            if node == target:
                res = min(res, turns)
                break
            for pos in range(NUM_WHEELS):
                curr = [int(x) for x in node]
                curr[pos] = (curr[pos] + 1) % NUM_SLOTS
                next_node = ''.join([str(x) for x in curr])
                if next_node not in deadends and next_node not in visited:
                    queue.append([next_node, turns + 1])
                    visited.add(next_node)

                curr = [int(x) for x in node]
                curr[pos] = (curr[pos] - 1) % NUM_SLOTS if curr[pos] - 1 >= 0 else NUM_SLOTS - 1
                next_node = ''.join([str(x) for x in curr])
                if next_node not in deadends and next_node not in visited:
                    queue.append([next_node, turns + 1])
                    visited.add(next_node)

        return res if res != float('inf') else -1


```

## Clean Solution From Discussion Forum

```python
from collections import deque, defaultdict

class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        if '0000' in deadends:
            return -1

        deadends = set(deadends)

        visited = defaultdict(bool)
        q = deque([('0000', 0)])
        visited['0000'] = True

        while q:
            cur_comb, cur_dist = q.popleft()

            if cur_comb == target:
                return cur_dist

            for i in range(len(cur_comb)):
                cur_symb = cur_comb[i]
                symb_up = str((int(cur_symb) + 1) % 10)
                symb_down = str((int(cur_symb) + 9) % 10)

                comb_up = cur_comb[:i] + symb_up + cur_comb[i+1:]
                comb_down = cur_comb[:i] + symb_down + cur_comb[i+1:]

                if (not visited[comb_up]) and (not (comb_up in deadends)):
                    visited[comb_up] = True
                    q.append((comb_up, cur_dist + 1))

                if (not visited[comb_down]) and (not (comb_down in deadends)):
                    visited[comb_down] = True
                    q.append((comb_down, cur_dist + 1))

        return -1
```

## Editorial Solution

```python
class Solution:
    def openLock(self, deadends: List[str], target: str) -> int:
        # Map the next slot digit for each current slot digit.
        next_slot = {
            "0": "1",
            "1": "2",
            "2": "3",
            "3": "4",
            "4": "5",
            "5": "6",
            "6": "7",
            "7": "8",
            "8": "9",
            "9": "0",
        }
        # Map the previous slot digit for each current slot digit.
        prev_slot = {
            "0": "9",
            "1": "0",
            "2": "1",
            "3": "2",
            "4": "3",
            "5": "4",
            "6": "5",
            "7": "6",
            "8": "7",
            "9": "8",
        }

        # Set to store visited and dead-end combinations.
        visited_combinations = set(deadends)
        # Queue to store combinations generated after each turn.
        pending_combinations = deque()

        # Count the number of wheel turns made.
        turns = 0

        # If the starting combination is also a dead-end,
        # then we can't move from the starting combination.
        if "0000" in visited_combinations:
            return -1

        # Start with the initial combination '0000'.
        pending_combinations.append("0000")
        visited_combinations.add("0000")

        while pending_combinations:
            # Explore all combinations of the current level.
            curr_level_nodes_count = len(pending_combinations)
            for _ in range(curr_level_nodes_count):
                # Get the current combination from the front of the queue.
                current_combination = pending_combinations.popleft()

                # If the current combination matches the target,
                # return the number of turns/level.
                if current_combination == target:
                    return turns

                # Explore all possible new combinations
                # by turning each wheel in both directions.
                for wheel in range(4):
                    # Generate the new combination
                    # by turning the wheel to the next digit.
                    new_combination = list(current_combination)
                    new_combination[wheel] = next_slot[new_combination[wheel]]
                    new_combination_str = "".join(new_combination)
                    # If the new combination is not a dead-end and
                    # was never visited,
                    # add it to the queue and mark it as visited.
                    if new_combination_str not in visited_combinations:
                        pending_combinations.append(new_combination_str)
                        visited_combinations.add(new_combination_str)

                    # Generate the new combination
                    # by turning the wheel to the previous digit.
                    new_combination = list(current_combination)
                    new_combination[wheel] = prev_slot[new_combination[wheel]]
                    new_combination_str = "".join(new_combination)
                    # If the new combination is not a dead-end and
                    # is never visited,
                    # add it to the queue and mark it as visited.
                    if new_combination_str not in visited_combinations:
                        pending_combinations.append(new_combination_str)
                        visited_combinations.add(new_combination_str)

            # We will visit next-level combinations.
            turns += 1

        # We never reached the target combination.
        return -1
```
