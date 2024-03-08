---
layout: single
title: "Problem of The Day: Partition List"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-86](/assets/images/2024-03-08_09-47-44-problem-86.png)](/assets/images/2024-03-08_09-47-44-problem-86.png)

## Intuition

The goal is to partition a linked list into two parts: nodes with values less than `x` and nodes with values greater than or equal to `x`.

## Approach

I iterate through the linked list, categorizing nodes into two groups: those with values less than `x` and those with values greater than or equal to `x`. Then, I use two deques (`less` and `greater`) to store the nodes in each group. Finally, I merge the two deques to create the partitioned linked list.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the linked list. We iterate through the list once.

- Space complexity:
  O(n), as we use deques to store the nodes in the two groups. The space required is proportional to the number of nodes in the linked list.

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def partition(self, head: Optional[ListNode], x: int) -> Optional[ListNode]:
        dummy = ListNode(-1)
        hash_map = defaultdict(list)
        curr = head
        while curr:
            if curr.val < x:
                hash_map['less'].append(curr)
            else:
                hash_map['greater'].append(curr)

            curr = curr.next

        curr = dummy
        less = deque(hash_map['less'])
        greater = deque(hash_map['greater'])

        while less and greater:
            while less and less[0].val <= greater[0].val:
                smaller_node = less.popleft()
                curr.next = smaller_node
                curr = curr.next
            curr.next = greater.popleft()
            curr = curr.next

        while less:
            node = less.popleft()
            curr.next = node
            curr = curr.next

        while greater:
            node = greater.popleft()
            curr.next = node
            curr = curr.next

        curr.next = None

        return dummy.next
```

## Editorial Solution

Approach 1: Two Pointer Approach

```python
class Solution(object):
    def partition(self, head, x):
        """
        :type head: ListNode
        :type x: int
        :rtype: ListNode
        """

        # before and after are the two pointers used to create two list
        # before_head and after_head are used to save the heads of the two lists.
        # All of these are initialized with the dummy nodes created.
        before = before_head = ListNode(0)
        after = after_head = ListNode(0)

        while head:
            # If the original list node is lesser than the given x,
            # assign it to the before list.
            if head.val < x:
                before.next = head
                before = before.next
            else:
                # If the original list node is greater or equal to the given x,
                # assign it to the after list.
                after.next = head
                after = after.next

            # move ahead in the original list
            head = head.next

        # Last node of "after" list would also be ending node of the reformed list
        after.next = None
        # Once all the nodes are correctly assigned to the two lists,
        # combine them to form a single list which would be returned.
        before.next = after_head.next

        return before_head.next
```

- Time complexity: O(n)
- Space complexity: O(1)
