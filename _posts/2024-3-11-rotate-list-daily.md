---
layout: single
title: "Problem of The Day: Rotate List"
date: 2024-3-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-61](/assets/images/2024-03-07_15-52-47-problem-61.png)](/assets/images/2024-03-07_15-52-47-problem-61.png)

## Intuition

The problem involves rotating a linked list to the right by k positions. Use `deque` or `double-linked list` data structure to solve the problem

## Approach

I approach the problem by using a deque (`q`) to store the nodes of the linked list. I iterate through the linked list, adding each node to the deque. Then, I perform the rotation by popping and appending nodes from the deque based on the value of k. Finally, I construct the rotated linked list using the modified deque.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the linked list. The algorithm iterates through the list twice: once to build the deque and once to create the rotated linked list.

- Space complexity:
  O(n), as the space required for the deque is proportional to the number of nodes in the linked list.

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def rotateRight(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        q = deque()
        curr = head
        while curr:
            q.append(curr)
            curr = curr.next

        if not q:
            return

        n = len(q)
        for _ in range(k % n):
            node = q.pop()
            q.appendleft(node)

        dummy = ListNode(-1)
        curr = dummy
        while q:
            node = q.popleft()
            curr.next = node
            curr = curr.next

        curr.next = None

        return dummy.next
```
