---
layout: single
title: "Problem of The Day: Flip Game"
date: 2024-2-28
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-293](/assets/images/2024-02-28_10-38-03-problem-293.png)](/assets/images/2024-02-28_10-38-03-problem-293.png)

## Intuition

The problem seems to involve iterating through the input string and identifying possible moves. The moves involve flipping two consecutive '+' symbols to '-'. My initial thoughts are to iterate through the string, identify valid positions for moves, and create new strings by making those moves.

## Approach

I will iterate through the input string, and whenever I find a position with two consecutive '+', I will create a new string by flipping those symbols to '-'. I will then append the new string to the result list. Finally, I will return the list of possible next moves.

## Complexity

- Time complexity:
O(n) where n is the length of string. We iterate through the string once

- Space complexity:
O(n) as we store result in a list

## Code

```python
class Solution:
    def generatePossibleNextMoves(self, currentState: str) -> List[str]:
        N = len(currentState)
        res = []
        
        for i in range(N):
            curr = list(currentState)
            if curr[i] == '+':
                if i + 1 < N and curr[i] == '+' and curr[i+1] == '+':
                    curr[i] = '-'
                    curr[i+1] = '-'
                    res.append(''.join(curr))
                
        return res
```

## Editorial Solution

```python
class Solution:
    def generatePossibleNextMoves(self, currentState: str) -> List[str]:
        # List to store all possible next states after making one move.
        next_possible_states = []

        # Iterate through the 'currentState' string characters from left to right.
        for index in range(len(currentState) - 1):
            # If two adjacent characters of the 'currentState' string are '+', 
            # replace them with '-' and store the new state string.
            if currentState[index] == '+' and currentState[index + 1] == '+':
                next_state = currentState[:index] + "--" + currentState[index + 2:]
                next_possible_states.append(next_state)

        # Return 'next_possible_states' list.
        return next_possible_states
```
