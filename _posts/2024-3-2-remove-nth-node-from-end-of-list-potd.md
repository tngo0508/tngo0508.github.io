---
layout: single
title: "Problem of The Day: Remove Nth Node From End of List"
date: 2024-3-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-19](/assets/images/problem-19.png)](/assets/images/problem-19.png)

## Intuition

The problem involves removing the Nth node from the end of a linked list. My initial thought is to use a two-pointer approach, where one pointer moves N steps ahead of the other. This way, when the faster pointer reaches the end, the slower pointer will be at the Nth node from the end.

## Approach

I will use two pointers, `slow` and `fast`, both initially pointing to the dummy node. First, I will move the `fast` pointer N steps ahead. Then, while advancing both pointers one step at a time until the `fast` pointer reaches the end, the `slow` pointer will be at the node just before the Nth node from the end. Finally, I can update the `next` pointer of the `slow` pointer to skip the Nth node.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the linked list. We iterate through the list once.

- Space complexity:
  O(1), as we only use a constant amount of extra space for the two pointers.

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(-1, head)
        slow = fast = dummy
        for _ in range(n):
            if fast:
                fast = fast.next

        while fast and fast.next:
            slow = slow.next
            fast = fast.next

        slow.next = slow.next.next

        return dummy.next
```
