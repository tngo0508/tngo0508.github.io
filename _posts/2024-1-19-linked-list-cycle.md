---
layout: single
title: "Problem of The Day: Linked List Cycle"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to use two pointers, one moving at a slower pace (`slow`) and the other at a faster pace (`fast`). This is a classic approach to detect cycles in a linked list.

# Approach
I will use two pointers, initially pointing to the head of the linked list. The slow pointer moves one step at a time, while the fast pointer moves two steps at a time. If there is a cycle, these pointers will eventually meet at some point within the cycle. If there is no cycle, the fast pointer will reach the end of the linked list.

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
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False
```