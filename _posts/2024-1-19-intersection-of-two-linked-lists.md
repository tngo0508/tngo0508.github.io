---
layout: single
title: "Problem of The Day: Intersection of Two Linked Lists"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Intersection of Two Linked Lists](https://leetcode.com/problems/intersection-of-two-linked-lists/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
I am using a simple approach where I traverse the first linked list (`headA`) and store its nodes in a list. Then, I traverse the second linked list (`headB`) and check if any node is present in the list. If found, I return that node as it is the intersection point.

# Approach
- Traverse `headA` and store its nodes in the list `l1`.
- Traverse `headB`, and for each node, check if it is present in `l1`. If found, return that node.
- If no intersection is found, return None.

# Complexity
- Time complexity:
O(m + n), where m and n are the lengths of the linked lists `headA` and `headB` respectively. This is because we traverse both lists once.

- Space complexity:
O(m), where m is the length of the linked list `headA` as we store its nodes in the list `l1`.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        l1 = []
        ptrA = headA
        ptrB = headB
        while ptrA:
            l1.append(ptrA)
            ptrA = ptrA.next
        
        while ptrB:
            if ptrB in l1:
                return ptrB
            ptrB = ptrB.next
        
        return None

```