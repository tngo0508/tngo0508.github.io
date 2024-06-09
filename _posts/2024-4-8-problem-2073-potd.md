---
layout: single
title: "Problem of The Day: Time Needed to Buy Tickets"
date: 2024-4-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-2073](/assets/images/2024-04-08_18-22-14-problem-2073.png)

## Intuition

I have to calculate the time required for me to buy all the tickets at a ticket counter. I'll be joining a queue, and each time I step forward, I'll buy one ticket. I need to handle a special case where I'm at position `k` in the queue and buy my tickets first.

## Approach

I'll create a queue using a `deque` and iterate through the tickets, adding each person's index and the number of tickets they want to buy to the queue. Then, I'll simulate the process of buying tickets by popping elements from the queue, decrementing the number of tickets they want to buy, and if the person is at position `k` and has bought all their tickets, I'll return the current time. Otherwise, I'll continue until all tickets are bought.

## Complexity

- Time complexity:
  O(n \* m) where n is the total number of tickets and m is the maximum number of tickets at each index.

- Space complexity:
  O(n) as we use deque to store the queue of people and their tickets

## Code

```python
class Solution:
    def timeRequiredToBuy(self, tickets: List[int], k: int) -> int:
        time = 0
        queue = deque()
        for i, ticket in enumerate(tickets):
            queue.append([i, ticket])
        while queue:
            person, tickets = queue.popleft()
            time += 1
            tickets -= 1
            if person == k and tickets == 0:
                return time
            if tickets > 0:
                queue.append([person, tickets])

```

## Editorial Solution

Approach 2: Simulation Without Queue

```python
class Solution:
    def timeRequiredToBuy(self, tickets: List[int], k: int) -> int:
        n = len(tickets)
        time = 0

        # If person k only needs one ticket, return the time to buy it
        if tickets[k] == 1:
            return k + 1

        # Continue buying tickets until person k buys all their tickets
        while tickets[k] > 0:
            for i in range(n):
                # Buy a ticket at index 'i' if available
                if tickets[i] != 0:
                    tickets[i] -= 1
                    time += 1

                # If person k bought all their tickets, return the time
                if tickets[k] == 0:
                    return time

        return time
```

- Time complexity: O(n \* m)
- Space complexity: O(1)
