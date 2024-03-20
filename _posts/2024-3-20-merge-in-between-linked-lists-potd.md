---
layout: single
title: "Problem of The Day: Merge In Between Linked Lists"
date: 2024-3-20
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1669](/assets/images/2024-03-20_01-14-53-problem-1669.png)](/assets/images/2024-03-20_01-14-53-problem-1669.png)

## Intuition

I will iterate through the first list to find the nodes that need to be replaced with the second list. Then, I'll reconnect the nodes accordingly.

## Approach

I'll traverse the first list, keeping track of the nodes before and after the range [a, b] that needs to be replaced. Once I find these nodes, I'll connect the end of the first sublist to the head of the second list, and then connect the end of the second list to the node after the range [a, b].

## Complexity

- Time complexity:
  O(n + m) where n is the number of nodes in the first list and m is the number of nodes in the second list.

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
    def mergeInBetween(self, list1: ListNode, a: int, b: int, list2: ListNode) -> ListNode:
        node_a = node_b = None
        curr = list1
        i = 0
        while curr is not None:
            if i == a - 1:
                node_a = curr
            if i == b + 1:
                node_b = curr
            curr = curr.next
            i += 1

        node_a.next = list2
        curr = list2
        while curr is not None and curr.next is not None:
            curr = curr.next

        curr.next = node_b

        return list1
```

## Editorial Solution

Two pointers approach

```python
class Solution:
    def mergeInBetween(self, list1: ListNode, a: int, b: int, list2: ListNode) -> ListNode:
        start = ListNode()
        end = list1

        # Set start to node a - 1 and end to node b
        for index in range (b):
            if index == a - 1:
                start = end
            end = end.next

        # Connect the start node to list2
        start.next = list2

        # Find the tail of list2
        while (list2.next is not None):
            list2 = list2.next
        # Set the tail of list2 to end.next
        list2.next = end.next
        end.next = None

        return list1
```

- Time complexity: O(m + n)
- Space complexity: O(1)
