---
layout: single
title: "Problem of The Day: Palindrome Linked List"
date: 2024-3-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-234](/assets/images/2024-03-21_18-02-23-problem-234.png)

## Intuition

My initial thought is to use the two-pointer approach to find the middle of the linked list. Then, reverse the second half of the list and compare it with the first half to check if it forms a palindrome.

## Approach

I start by initializing two pointers, `p` and `q`, both pointing to the head of the linked list. Then, I move `p` one step at a time and `q` two steps at a time until `q` reaches the end of the list. This way, when `q` reaches the end, `p` will be at the middle (or slightly left of the middle) of the list.

After finding the middle, I reverse the second half of the list. I use another pointer, `prev`, to keep track of the reversed part. Once the reversal is done, I compare the values of nodes from the first half (from the original head) with the reversed second half.

If the values match for all corresponding nodes, the linked list is a palindrome. If any pair of corresponding nodes has different values, I return False.

## Complexity

- Time complexity:
  Finding the middle and reversing the second half both take O(n/2) time, where n is the number of nodes in the linked list. The final comparison also takes O(n/2) time. Therefore, the overall time complexity is O(n).

- Space complexity:
  I use a constant amount of extra space for pointers and variables, so the space complexity is O(1).

## Code

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        prev = None
        p, q = head, head
        while q and q.next:
            prev = p
            p = p.next
            q = q.next.next

        if prev:
            prev.next = None
        q = head
        prev = None
        while p:
            next_node = p.next
            p.next = prev
            prev = p
            p = next_node

        p = prev
        while p and q:
            if p.val != q.val:
                return False
            p = p.next
            q = q.next

        return True

```

## Editorial Solution

### Brute Force

```python
def isPalindrome(self, head: ListNode) -> bool:
    vals = []
    current_node = head
    while current_node is not None:
        vals.append(current_node.val)
        current_node = current_node.next
    return vals == vals[::-1]
```

- Time complexity: O(n)
- Space complexity: O(n)

### Approach 2: Recursive (Advanced)

```python
def isPalindrome(self, head: ListNode) -> bool:

    self.front_pointer = head

    def recursively_check(current_node=head):
        if current_node is not None:
            if not recursively_check(current_node.next):
                return False
            if self.front_pointer.val != current_node.val:
                return False
            self.front_pointer = self.front_pointer.next
        return True

    return recursively_check()
```

- Time complexity: O(n)
- Space complexity: O(n)

### Approach 3: Reverse Second Half In-place

```python
class Solution:

    def isPalindrome(self, head: ListNode) -> bool:
        if head is None:
            return True

        # Find the end of first half and reverse second half.
        first_half_end = self.end_of_first_half(head)
        second_half_start = self.reverse_list(first_half_end.next)

        # Check whether or not there's a palindrome.
        result = True
        first_position = head
        second_position = second_half_start
        while result and second_position is not None:
            if first_position.val != second_position.val:
                result = False
            first_position = first_position.next
            second_position = second_position.next

        # Restore the list and return the result.
        first_half_end.next = self.reverse_list(second_half_start)
        return result

    def end_of_first_half(self, head):
        fast = head
        slow = head
        while fast.next is not None and fast.next.next is not None:
            fast = fast.next.next
            slow = slow.next
        return slow

    def reverse_list(self, head):
        previous = None
        current = head
        while current is not None:
            next_node = current.next
            current.next = previous
            previous = current
            current = next_node
        return previous
```

- Time complexity: O(n)
- Space complexity: O(1)