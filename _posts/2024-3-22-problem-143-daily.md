---
layout: single
title: "Problem of The Day: Reorder List"
date: 2024-3-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-143](/assets/images/2024-03-22_20-08-55-problem-143.png)

## Intuition

Initially, I thought about splitting the linked list into two halves, then reversing the second half, and finally interleaving the nodes from both halves.

## Approach

To implement this approach, I divided the problem into three steps:

- Find the head of the second half of the linked list.
- Reverse the second half of the linked list.
- Interleave the nodes from both halves.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(1)

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def get_second_half_head(self, node: Optional[ListNode]) -> ListNode:
        prev = None
        slow = fast = node
        while fast and fast.next:
            prev = slow
            slow = slow.next
            fast = fast.next.next

        if prev:
            prev.next = None
        return slow


    def reverse_second_half(self, head: Optional[ListNode]) -> ListNode:
        curr = self.get_second_half_head(head)
        prev = None
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node

        return prev


    def reorderList(self, head: Optional[ListNode]) -> None:
        """
        Do not return anything, modify head in-place instead.
        """
        l1 = head
        l2 = self.reverse_second_half(head)


        dummy = ListNode(-1, head)
        curr = dummy
        while l1 and l2 and l1 is not l2:
            curr.next = l1
            l1 = l1.next
            curr = curr.next
            curr.next = l2
            l2 = l2.next
            curr = curr.next

        return dummy.next
```
