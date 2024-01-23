---
layout: single
title: "Problem of The Day: Reverse Nodes in k-Group"
date: 2024-1-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [problem](https://leetcode.com/problems/reverse-nodes-in-k-group/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
Use Stack to perform the reverese of the group.

# Approach
I used a stack to collect nodes in groups of k. For each group, I popped nodes from the stack and connected them in reverse order. I kept track of the previous node to correctly link the reversed groups.



# Complexity
- Time complexity:
O(N), where N is the number of nodes in the linked list.

- Space complexity:
O(k), as the stack can contain at most k nodes.


# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        stack = []
        dummy = ListNode(-1)
        curr = head
        prev = dummy
        while curr:
            stack.append(curr)
            curr = curr.next
            if len(stack) == k:
                group_prev = prev
                while stack:
                    node = stack.pop()
                    group_prev.next = node
                    group_prev = node
                group_prev.next = curr
                prev = group_prev
        
        return dummy.next
            
        
```