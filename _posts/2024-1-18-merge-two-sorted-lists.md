---
layout: single
title: "Problem of The Day: Merge Two Sorted Lists"
date: 2024-1-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

 

Example 1:


Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
Example 2:

Input: list1 = [], list2 = []
Output: []
Example 3:

Input: list1 = [], list2 = [0]
Output: [0]
 

Constraints:

The number of nodes in both lists is in the range [0, 50].
-100 <= Node.val <= 100
Both list1 and list2 are sorted in non-decreasing order.
```

# Intuition
The problem involves merging two sorted linked lists into a single sorted linked list. The intuition here is to use a dummy node to keep track of the merged list while iterating through both input lists.

# Approach
I use a dummy node as the starting point of the merged list. I also have a pointer 'curr' to keep track of the current position in the merged list. I use two pointers, 'p1' and 'p2', to traverse the input lists. While both 'p1' and 'p2' are not None, I compare their values. The smaller value is added to the merged list, and the respective pointer is moved to the next node. This process continues until one of the lists is exhausted. Finally, if any elements are remaining in either list, I append them to the merged list.

# Complexity
- Time complexity:
O(m + n) where 'm' and 'n' are the lengths of the input lists 'list1' and 'list2', respectively. The algorithm traverses both lists once.

- Space complexity:
O(1) as the additional space used is constant (dummy node and pointers).

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(-1)
        curr = dummy
        p1 = list1
        p2 = list2
        while p1 and p2:
            if p1.val < p2.val:
                curr.next = p1
                p1 = p1.next
            else:
                curr.next = p2
                p2 = p2.next
            curr = curr.next
        
        if p1:
            curr.next = p1
        else:
            curr.next = p2
        
        return dummy.next
```