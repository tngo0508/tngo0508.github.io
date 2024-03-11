---
layout: single
title: "Problem of The Day: Linked List Frequency"
date: 2024-3-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-3063](/assets/images/2024-03-11_05-10-25-problem-3063.png)](/assets/images/2024-03-11_05-10-25-problem-3063.png)

## Intuition

The problem involves counting the frequencies of elements in a linked list and creating a new linked list with these frequencies.

## Approach

I approach the problem by using a dictionary (`freq_map`) to store the frequencies of each element in the linked list. I iterate through the linked list, updating the frequencies in the dictionary. Then, I create a new linked list by iterating through the values in the dictionary and appending nodes with the corresponding frequencies to the result.

## Complexity

- Time complexity:
  O(n), where n is the number of nodes in the linked list. The algorithm iterates through the list once to count the frequencies and once to create the new linked list.

- Space complexity:
  O(m), where m is the number of unique elements in the linked list. The space required for the dictionary is proportional to the number of unique elements in the linked list.

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def frequenciesOfElements(self, head: Optional[ListNode]) -> Optional[ListNode]:
        freq_map = defaultdict(int)
        curr = head
        while curr:
            freq_map[curr.val] += 1
            curr = curr.next

        dummy = ListNode(-1)
        curr = dummy
        for v in freq_map.values():
            curr.next = ListNode(v)
            curr = curr.next

        return dummy.next

```

## Editorial Solution

Approach 2: Hash Table

```python
class Solution:
    def frequenciesOfElements(self, head: Optional[ListNode]) -> Optional[ListNode]:
        frequencies = {}
        current = head
        freq_head = None

        # Process the linked list, storing
        # frequency ListNodes in the hashtable
        while current is not None:
            # Existing element, increment frequency
            if current.val in frequencies:
                frequency_node = frequencies[current.val]
                frequency_node.val += 1

            # New element, create hashtable entry with frequency node
            else:
                new_frequency_node = ListNode(1, freq_head)
                frequencies[current.val] = new_frequency_node
                freq_head = new_frequency_node
            current = current.next

        return freq_head
```
