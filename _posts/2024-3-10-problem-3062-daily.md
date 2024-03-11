---
layout: single
title: "Problem of The Day: Winner of the Linked List Game"
date: 2024-3-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-3062](/assets/images/2024-03-10_23-34-01-problem-3062.png)](/assets/images/2024-03-10_23-34-01-problem-3062.png)

## Intuition

Use hash map to track the count for even and odd.

## Approach

I approach the problem by using a dictionary (`points`) to store the points for odd and even indices. I iterate through the linked list, comparing values at consecutive odd and even indices. If the value at the odd index is greater, I increment the points for "Odd"; if it's smaller, I increment the points for "Even." I update the current pointer to skip to the next pair of nodes. Finally, I compare the points and determine the game result.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the linked list. The algorithm iterates through the list once.

- Space complexity:
  O(1), as the space required is constant. The dictionary only stores two integer values, regardless of the length of the linked list.

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def gameResult(self, head: Optional[ListNode]) -> str:
        points = defaultdict()
        points["odd"] = 0
        points["even"] = 0
        curr = head
        while curr and curr.next:
            even_idx_val = curr.val
            odd_idx_val = curr.next.val
            if odd_idx_val > even_idx_val:
                points["odd"] += 1
            elif odd_idx_val < even_idx_val:
                points["even"] += 1
            curr = curr.next.next

        if points["odd"] > points["even"]:
            return "Odd"
        elif points["odd"] < points["even"]:
            return "Even"

        return "Tie"

```
