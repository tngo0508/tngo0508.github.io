---
layout: single
title: "Problem of The Day: Sort List"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Sort List](https://leetcode.com/problems/sort-list/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thoughts are to convert the linked list into an array, sort the array based on node values, and then reconstruct the linked list.

# Approach
I'll traverse the linked list and create a list of pairs, where each pair consists of the node value and the corresponding node. Then, I'll sort the list of pairs based on the node values. Finally, I'll reconstruct the linked list using the sorted pairs.

# Complexity
- Time complexity:
O(n log n), where n is the number of nodes in the linked list. This is because sorting the array of nodes takes O(n log n) time.

- Space complexity:
O(n), as we create an array to store the pairs. The space complexity is linear with respect to the number of nodes in the linked list.

# Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def sortList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head:
            return head
        curr = head
        arr = []
        while curr:
            arr.append([curr.val, curr])
            curr = curr.next
        
        arr.sort(key=lambda x: x[0])
        for i in range(1, len(arr)):
            arr[i - 1][1].next = arr[i][1]
        
        arr[-1][1].next = None
        return arr[0][1]
```