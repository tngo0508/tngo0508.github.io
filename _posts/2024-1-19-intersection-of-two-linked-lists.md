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

# Improve Approach
## Intuition
I observed that after the initial traversal to find the lengths of both linked lists, we can align the starting points of the two lists. This way, when we traverse them together, we will reach the intersection point simultaneously.


## Approach
- Traverse both linked lists (headA and headB) initially to - find their lengths (lenA and lenB).
- Determine the longer and shorter linked lists.
- Traverse the longer linked list by the difference in - lengths between the two lists.
- Now, traverse both linked lists simultaneously until an - intersection point is found.
- If an intersection is found, return the intersecting node; otherwise, return None.

## Complexity
- Time complexity:
O(m + n), where m and n are the lengths of the linked lists headA and headB respectively. We traverse both lists once.

- Space complexity:
O(1), as we only use a constant amount of extra space.

## Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        ptrA = headA
        ptrB = headB
        while ptrA and ptrB:
            ptrA = ptrA.next
            ptrB = ptrB.next

        if ptrA:
            longer = headA
            shorter = headB
        else:
            longer = headB
            shorter = headA

        count = 0
        while ptrA:
            count += 1
            ptrA = ptrA.next
        
        while ptrB:
            count += 1
            ptrB = ptrB.next

        for _ in range(count):
            longer = longer.next
        
        while longer and shorter:
            
            if longer is shorter:
                return longer
            longer = longer.next
            shorter = shorter.next
        
        return     
```

# Editorial Solution
```python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode:
        pA = headA
        pB = headB

        while pA != pB:
            pA = headB if pA is None else pA.next
            pB = headA if pB is None else pB.next

        return pA
        # Note: In the case lists do not intersect, the pointers for A and B
        # will still line up in the 2nd iteration, just that here won't be
        # a common node down the list and both will reach their respective ends
        # at the same time. So pA will be NULL in that case.
```

- Time complexity: O(N)
- Space complexity: O(1)