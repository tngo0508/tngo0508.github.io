---
layout: single
title: "Problem of The Day: Add Two Numbers"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thought is to use two pointers, one moving at a slower pace (slow) and the other at a faster pace (fast). This is a classic approach to detect cycles in a linked list.

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
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(-1)
        curr = dummy
        carry = 0
        while l1 and l2:
            sum_val = l1.val + l2.val + carry
            carry = sum_val // 10
            val = sum_val % 10 
            curr.next = ListNode(val)
            curr = curr.next
            l1 = l1.next
            l2 = l2.next
        
        node = l1 if l1 else l2
        while node:
            sum_val = node.val + carry
            carry = sum_val // 10
            val = sum_val % 10
            curr.next = ListNode(val)
            curr = curr.next
            node = node.next

        if carry:
            curr.next = ListNode(carry)
        
        return dummy.next
```

# Editorial Solution
```python
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummyHead = ListNode(0)
        curr = dummyHead
        carry = 0
        while l1 != None or l2 != None or carry != 0:
            l1Val = l1.val if l1 else 0
            l2Val = l2.val if l2 else 0
            columnSum = l1Val + l2Val + carry
            carry = columnSum // 10
            newNode = ListNode(columnSum % 10)
            curr.next = newNode
            curr = newNode
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummyHead.next
```

- Time complexity: O(max(m,n))
- Space complexity: O(1)