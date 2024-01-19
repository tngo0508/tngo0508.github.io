---
layout: single
title: "Problem of The Day: Swap Nodes in Pairs"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/description/?envType=study-plan-v2&envId=top-100-liked)

My note:
[![note](</assets/images/Screenshot 2024-01-19 at 2.44.55 PM-note.png>)](</assets/images/Screenshot 2024-01-19 at 2.44.55 PM-note.png>)

# Intuition
My initial thoughts are to use an iterative approach to swap pairs of nodes in the linked list.

# Approach
I'll create a dummy node before the head to simplify the handling of edge cases where the head needs to be swapped. I'll use three pointers: prev, curr, and next_node. I'll iterate through the list, swapping pairs of nodes by updating the next pointers accordingly.

The process involves rearranging the pointers to achieve the swap of adjacent nodes. I'll continue this process until we reach the end of the list or a single node is left.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list. We traverse the list once.

- Space complexity:
O(1), as we use a constant amount of extra space for pointers.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(-1, head)
        curr = head
        prev = dummy
        while curr and curr.next:
            next_node = curr.next.next
            curr.next.next = curr
            prev.next = curr.next
            curr.next = next_node
            prev = curr
            curr = next_node
        
        return dummy.next

```

# Editorial Solution
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def swapPairs(self, head: ListNode) -> ListNode:
        """
        :type head: ListNode
        :rtype: ListNode
        """
        # Dummy node acts as the prevNode for the head node
        # of the list and hence stores pointer to the head node.
        dummy = ListNode(-1)
        dummy.next = head

        prev_node = dummy

        while head and head.next:

            # Nodes to be swapped
            first_node = head
            second_node = head.next

            # Swapping
            prev_node.next = second_node
            first_node.next = second_node.next
            second_node.next = first_node

            # Reinitializing the head and prev_node for next swap
            prev_node = first_node
            head = first_node.next

        # Return the new head node.
        return dummy.next
```