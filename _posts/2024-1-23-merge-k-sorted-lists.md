---
layout: single
title: "Problem of The Day: Merge k Sorted Lists"
date: 2024-1-23
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

 

Example 1:

Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
Example 2:

Input: lists = []
Output: []
Example 3:

Input: lists = [[]]
Output: []
 

Constraints:

k == lists.length
0 <= k <= 104
0 <= lists[i].length <= 500
-10^4 <= lists[i][j] <= 10^4
lists[i] is sorted in ascending order.
The sum of lists[i].length will not exceed 10^4.
```

# Brute Force - Compare the heads Approach
## Intuition
My first thought was to use the hash map to store the head node of each linked list so that I can get the reference. Also, I used the sentinel node technique to prevent some edge cases. Then, I looped through the list and compare the first node or head node of each linked list to find out the smallest value. I added the node with smallest value to my returned linked list and the head pointer of that node to the next node. After that, I updated the reference in my hash map.

## Approach
I'll use a hash map to keep track of the current head of each list. In each iteration, I'll find the smallest node among the heads using the hash map. I'll add this node to the merged list and move the corresponding list's head to the next node. I'll repeat this process until all lists are exhausted.

## Complexity
- Time complexity:
O(Nk), where N is the total number of nodes and k is the number of linked lists.

- Space complexity:
O(k), as the hash map contains the heads of all k lists.

## Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        dummy = ListNode()
        curr = dummy
        N = len(lists)
        hash_map = {}
        for i in range(N):
            hash_map[i] = lists[i]

        while curr:
            node = ListNode(float('inf'))
            idx = 0
            for i in range(N):
                curr_head = hash_map[i]
                if curr_head and curr_head.val < node.val:
                    node = curr_head
                    idx = i
            
            if node.val != float('inf'):
                hash_map[idx] = node.next
                next_node = node
                curr.next = next_node
                next_node.next = None
            curr = curr.next
        
        return dummy.next
```

# Divide and Conquer Approach
## Intuition
I considered using the merge sort technique or a divide and conquer approach to achieve this.

## Approach
I implemented a recursive function that divides the list of linked lists into halves until there's only one or zero lists left. Then, I merged the divided lists pairwise, ensuring that each merge results in a sorted list. This process continued until all lists were merged into a single sorted list.

## Complexity
- Time complexity:
O(N log k), where N is the total number of nodes and k is the number of linked lists.

- Space complexity:
O(log k), as the recursion stack can go up to log k levels.

## Code
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        def merge(p1, p2):
            dummy = ListNode(-1)
            curr = dummy
            while p1 and p2:
                if p1.val < p2.val:
                    curr.next = p1
                    p1 = p1.next
                else:
                    curr.next = p2
                    p2 = p2.next
                curr = curr.next
            
            curr.next = p1 if p1 else p2
            return dummy.next


        if not lists:
            return None
        if len(lists) == 1:
            return lists[0]
        mid = len(lists) // 2
        p1 = self.mergeKLists(lists[:mid])
        p2 = self.mergeKLists(lists[mid:])
        return merge(p1, p2)
```