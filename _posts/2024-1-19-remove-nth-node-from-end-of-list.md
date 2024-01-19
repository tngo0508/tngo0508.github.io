---
layout: single
title: "Problem of The Day: Remove Nth Node From End of List"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition - One Pass
My initial thoughts are to use a recursive approach to traverse the linked list and keep track of the position from the end.

# Approach
I'll define a recursive helper function (`helper`) that takes a node as an argument and returns the updated node after removing the Nth node from the end. The helper function will be called recursively until the end of the list is reached. I'll use a nonlocal variable (`N`) to keep track of the position from the end and remove the Nth node when N becomes zero.

I'll create a dummy node before the head to handle cases where the head itself needs to be removed.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list. We traverse the entire list once.

- Space complexity:
O(n), where n is the recursion depth. In the worst case, the recursion depth is equal to the number of nodes in the linked list.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        N = n
        def helper(node):
            nonlocal N
            if not node or not node.next:
                return node
        
            curr = helper(node.next)
            N -= 1
            if N == 0:
                node.next = node.next.next
            return head

        dummy = ListNode(-1, head)
        helper(dummy)
        return dummy.next
        
```

# Editorial Solution
One pass with O(1) space complexity
```java
public ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode first = dummy;
    ListNode second = dummy;
    // Advances first pointer so that the gap between first and second is n nodes apart
    for (int i = 1; i <= n + 1; i++) {
        first = first.next;
    }
    // Move first to the end, maintaining the gap
    while (first != null) {
        first = first.next;
        second = second.next;
    }
    second.next = second.next.next;
    return dummy.next;
}
```