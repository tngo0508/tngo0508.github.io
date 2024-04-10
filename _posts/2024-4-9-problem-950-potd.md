---
layout: single
title: "Problem of The Day: Reveal Cards In Increasing Order"
date: 2024-4-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem](/assets/images/2024-04-09_19-45-10-problem-950.png)

## Intuition

When considering how to reveal the cards in increasing order, I thought about simulating the process of revealing the cards step by step. Initially, sorting the deck allows us to start with the smallest card. Then, I simulated the process of revealing the cards one by one by manipulating a queue to keep track of the indices of the cards to be revealed.

## Approach

I approached the problem by first sorting the deck in ascending order. Then, I initialized a result list with the same length as the deck to store the revealed cards. Additionally, I used a `deque` to simulate the process of revealing the cards. I iterated through the sorted deck and dequeued indices from the `deque` one by one. For each index, I assigned the corresponding card from the sorted deck to the result list. After revealing each card, I moved the next index to the end of the `deque` to simulate the next step in the process. Finally, I returned the result list containing the cards revealed in increasing order.

## Complexity

- Time complexity:
  O(n log n) due to the sorting operation, where n is the number of cards in the deck.

- Space complexity:
  O(n), where n is the number of cards in the deck.

## Code

```python
class Solution:
    def deckRevealedIncreasing(self, deck: List[int]) -> List[int]:
        i = j = 0
        N = len(deck)
        deck.sort()
        res = [0] * N
        queue = deque(list(range(N)))
        while j < N:
            take = queue.popleft()
            if queue:
                queue.append(queue.popleft())
            res[take] = deck[j]
            j += 1
        return res

```
