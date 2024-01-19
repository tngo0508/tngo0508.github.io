---
layout: single
title: "Problem of The Day: Linked List Cycle II"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thoughts are to use the Floyd's Tortoise and Hare algorithm to detect a cycle in the linked list.

# Approach
I'll use two pointers, slow and fast, initially pointing to the head. The slow pointer moves one step at a time, and the fast pointer moves two steps at a time. If there is a cycle, they will eventually meet at some point within the cycle.

Once the cycle is detected, I'll reset one pointer to the head and move both pointers one step at a time. The point where they meet again is the start of the cycle.



# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list. In the worst case, we might need to traverse the entire list.

- Space complexity:
O(1), as we only use two pointers regardless of the size of the linked list.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        no_cycle = True
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                no_cycle = False
                break
        
        if no_cycle:
            return

        p1 = slow
        p2 = head
        while p1 and p2:
            if p1 is p2:
                return p1
            p1 = p1.next
            p2 = p2.next
        
        return
        
        
```

# Editorial Solution
```python
class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Initialize tortoise and hare pointers
        tortoise = head
        hare = head

        # Move tortoise one step and hare two steps
        while hare and hare.next:
            tortoise = tortoise.next
            hare = hare.next.next

            # Check if the hare meets the tortoise
            if tortoise == hare:
                break

        # Check if there is no cycle
        if not hare or not hare.next:
            return None

        # Reset either tortoise or hare pointer to the head
        hare = head

        # Move both pointers one step until they meet again
        while tortoise != hare:
            tortoise = tortoise.next
            hare = hare.next

        # Return the node where the cycle begins
        return tortoise
```