---
layout: single
title: "Problem of The Day: Reverse Linked List"
date: 2024-1-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement

See [Problem](https://leetcode.com/problems/reverse-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)

My note:
![note1](/assets/images/2024-01-18_09-55-50-reverse-sll-1.png)

![note2](/assets/images/2024-01-18_09-59-03-reverse-sll-2.png)


# Intuition
Use recursion or stack to do the reverse.

# Approach
The function `reverseList` takes the head of the linked list as an argument. It recursively reverses the remaining portion of the list and adjusts the pointers to reverse the current node. The base cases check if the head is None or if it is the last node, in which case it returns the head.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list. Each node is visited once during the reversal process.

- Space complexity:
O(n), where n is the maximum depth of the recursive call stack. The space required is proportional to the length of the linked list.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head:
            return
            
        if head and not head.next:
            return head
        curr = self.reverseList(head.next)
        head.next.next = head
        head.next = None
        return curr
```