---
title: "Solving Add Two Numbers in Python"
excerpt: "Learn how to add two numbers represented as linked lists efficiently using Python."
date: 2026-06-09
categories:
  - LeetCode
  - Algorithms
tags:
  - Python
  - Linked List
  - Math
toc: true
toc_label: "In this post"
---

### 1. The Problem: Add Two Numbers

The "Add Two Numbers" problem asks us to add two non-negative integers represented by two non-empty linked lists. The digits are stored in **reverse order**, and each of their nodes contains a single digit.

> You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.
> 
> You may assume the two numbers do not contain any leading zero, except the number 0 itself.

### 2. The Intuition: Elementary Math

The problem is essentially asking us to perform addition just like we would on paper, but with linked lists. Since the lists are already in reverse order (least significant digit first), we can iterate through both lists simultaneously, adding corresponding digits along with any carry from the previous position.

### 3. Implementation: Iterative Approach

Here is the Python implementation for the solution:

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
        
        while l1 or l2:
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            
            # Calculate sum and carry
            sum_val = val1 + val2 + carry
            carry = sum_val // 10
            val = sum_val % 10
            
            # Create new node and move pointer
            curr.next = ListNode(val)
            
            # Move to next nodes in l1 and l2
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
            curr = curr.next
        
        # Handle remaining carry
        if carry > 0:
            curr.next = ListNode(carry)

        return dummy.next
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize Dummy Node
We start by creating a `dummy` node. This acts as a placeholder for the head of our resulting linked list, making it easier to return the final list using `dummy.next`.

#### Step 2: Traverse the Lists
We use a `while` loop that continues as long as there is a node remaining in either `l1` or `l2`.

#### Step 3: Extract Values and Calculate Sum
For each iteration:
1. We get the values from the current nodes of `l1` and `l2`. If a list has reached its end, we use `0`.
2. We calculate the sum: `sum_val = val1 + val2 + carry`.
3. We update the `carry` for the next position: `carry = sum_val // 10`.
4. The digit for the current position is `sum_val % 10`.

#### Step 4: Build the Result List
We create a new `ListNode` with the calculated digit and attach it to our `curr.next`. Then, we move the `curr` pointer forward.

#### Step 5: Final Carry Check
After the loop, if there is still a `carry` (e.g., adding 5 + 5), we must add one final node with the carry value.

#### Step 6: Return the Result
Finally, we return `dummy.next`, which is the head of the new linked list.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(max(M, N))** | We iterate through the lists once, where M and N are the lengths of `l1` and `l2` respectively. |
| **Space Complexity** | **O(max(M, N))** | The length of the new list is at most `max(M, N) + 1`. |

### 6. Summary

The "Add Two Numbers" problem is a great exercise in linked list traversal and basic arithmetic logic. By using a dummy node and a carry variable, we can cleanly handle varying list lengths and the final carry-over digit.

### 7. Further Reading
- [LeetCode Problem 2 - Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)
- [Python Linked List Implementation](https://realpython.com/linked-lists-python/)
- [NeetCode - Add Two Numbers](https://neetcode.io/problems/add-two-numbers)
