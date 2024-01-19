---
layout: single
title: "Problem of The Day: Palindrome Linked List"
date: 2024-1-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [234. Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
The idea is to find the middle of the linked list using two pointers (slow and fast). Then, reverse the second half of the linked list and compare it with the first half.

# Approach
I'll use two pointers, slow and fast, to find the middle of the linked list. While traversing, I'll reverse the second half of the linked list. Finally, I'll compare the reversed second half with the first half to determine if the linked list is a palindrome.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list.

- Space complexity:
O(1), as I'm using a constant amount of extra space regardless of the input size.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        def reverse_linked_list(node):
            prev = None
            curr = node
            while curr:
                next_node = curr.next
                curr.next = prev
                prev = curr
                curr = next_node

            return prev


        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        
        p1 = head
        p2 = reverse_linked_list(slow)

        while p1 and p2:
            if p1.val != p2.val:
                return False
            p1 = p1.next
            p2 = p2.next

        return True
```