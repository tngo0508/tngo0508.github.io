---
layout: single
title: "Problem of The Day: Bag of Tokens"
date: 2024-3-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-938](/assets/images/2024-03-03_21-42-00-problem-948.png)](/assets/images/2024-03-03_21-42-00-problem-948.png)

## Brute Force - TLE

```python
class Solution:
    def bagOfTokensScore(self, tokens: List[int], power: int) -> int:
        N = len(tokens)

        def dfs(curr_power, curr_score, tokens_arr):
            tokens_arr = list(tokens_arr)
            if set(tokens_arr) == 1 and '#' in tokens_arr:
                return curr_score

            res = 0

            for i in range(N):
                if tokens_arr[i] != '#':
                    token = tokens_arr[i]
                    tokens_arr[i] = '#'
                    if curr_power >= token:
                        res = max(res, dfs(curr_power - token, curr_score + 1, tuple(tokens_arr)))
                    if curr_score >= 1:
                        res = max(res, dfs(curr_power + token, curr_score - 1, tuple(tokens_arr)))
                    tokens_arr[i] = token
            return max(res, curr_score)

        return dfs(power, 0, tuple(tokens))
```

- Time complexity: O(2^N) since we have two choices at each element
- Space complexity: O(2^N) since in the worst case scenario we need to generate all possible combinations.

## Memoization - TLE

```python
class Solution:
    def bagOfTokensScore(self, tokens: List[int], power: int) -> int:
        N = len(tokens)

        def dfs(curr_power, curr_score, tokens_arr):
            if (curr_power, curr_score, tokens_arr) in memo:
                return memo[(curr_power, curr_score, tokens_arr)]

            tokens_arr = list(tokens_arr)
            if set(tokens_arr) == 1 and '#' in tokens_arr:
                return curr_score

            res = 0

            for i in range(N):
                if tokens_arr[i] != '#':
                    token = tokens_arr[i]
                    tokens_arr[i] = '#'
                    if curr_power >= token:
                        res = max(res, dfs(curr_power - token, curr_score + 1, tuple(tokens_arr)))
                    if curr_score >= 1:
                        res = max(res, dfs(curr_power + token, curr_score - 1, tuple(tokens_arr)))
                    tokens_arr[i] = token

            memo[(curr_power, curr_score, tuple(tokens_arr))] = max(res, curr_score)
            return max(res, curr_score)

        memo = defaultdict(tuple)
        return dfs(power, 0, tuple(tokens))
```

- Time complexity: O(2^N) since we have two choices at each element
- Space complexity: O(2^N) since in the worst case scenario we need to generate all possible combinations.

## Two pointers Approach - Accepted

### Intuition

I approach this problem using a greedy strategy. The idea is to sort the tokens initially and then iterate through them, trying to maximize the score. We maintain two pointers, one starting from the left end of the sorted array and the other from the right end. We try to spend power to gain more points and, if needed, gain power by spending points. The goal is to find the maximum score achievable.

### Approach

- Sort the tokens array.
- Initialize two pointers, `l` at the beginning (left end) and `r` at the end (right end) of the array.
- While `l` is less than `r` and the current power is less than the smallest token in the remaining tokens:
  - Increment `l` to try to gain more power.
- While `l` is less than or equal to `r`:
  - While `l` is less than or equal to `r` and the current power is sufficient to pick the token at `l`:
    - Increment the score, spend power, and move `l` to the right.
  - While `r` is greater than `l` and there is at least one point gained and the current power is insufficient to pick the token at `l`:
    - Gain power by spending the largest token at `r`, decrement `r`, and decrement the current score.
  - Break if `l` is greater than or equal to `r`.
- Return the maximum score obtained.

### Complexity

- Time complexity:
  O(n log n)

- Space complexity:
  O(1)

### Code

```python
class Solution:
    def bagOfTokensScore(self, tokens: List[int], power: int) -> int:
        N = len(tokens)
        tokens.sort()
        l, r = 0, N - 1
        score = 0
        curr_score = 0
        while l < r and power < tokens[l]:
            l += 1
        while l <= r:
            while l <= r and power >= tokens[l]:
                curr_score += 1
                power -= tokens[l]
                l +=1
                score = max(score, curr_score)
            while r > l and curr_score >= 1 and power < tokens[l]:
                power += tokens[r]
                r -= 1
                curr_score -= 1

            if l >= r:
                break
        return score
```

## Editorial Solution

### Implementation 1: Two Pointer

```python
class Solution:
    def bagOfTokensScore(self, tokens: List[int], power: int) -> int:
        low = 0
        high = len(tokens) - 1
        score = 0
        tokens.sort()

        while low <= high:
            # When we have enough power, play lowest token face-up
            if power >= tokens[low]:
                score += 1
                power -= tokens[low]
                low += 1

            # We don't have enough power to play a token face-up
            # If there is at least one token remaining,
            # and we have enough score, play highest token face-down
            elif low < high and score > 0:
                score -= 1
                power += tokens[high]
                high -= 1

            # We don't have enough score, power, or tokens
            # to play face-up or down and increase our score
            else:
                return score

        return score
```

### Implementation 2: Deque

```python
class Solution(object):
     def bagOfTokensScore(self, tokens: List[int], power: int) -> int:
        score = 0
        tokens.sort()
        deque = collections.deque(tokens)

        while deque:
            # When we have enough power, play token face-up
            if power >= deque[0]:
                power -= deque.popleft()
                score += 1

            # We don't have enough power to play a token face-up
            # When there is at least one token remaining,
            # and we have enough score, play token face-down
            elif len(deque) > 2 and score > 0:
                power += deque.pop()
                score -= 1

            # We don't have enough score, power, or tokens
            # to play face-up or down and increase our score
            else:
                return score

        return score
```
