---
title: "Remove N-th Node From End of List in C#"
excerpt: "Learn how to remove the n-th node from the end of a singly-linked list using the two-pointer approach in C#."
date: 2026-05-12
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Linked List
  - Two Pointers
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Remove N-th Node From End of List

Given the `head` of a linked list, remove the `n`-th node from the end of the list and return its head.

**Example 1:**
- **Input:** `head = [1,2,3,4,5]`, `n = 2`
- **Output:** `[1,2,3,5]`

**Example 2:**
- **Input:** `head = [1]`, `n = 1`
- **Output:** `[]`

**Example 3:**
- **Input:** `head = [1,2]`, `n = 1`
- **Output:** `[1]`

### 2. The Intuition: Two-Pointer Technique

The most efficient way to solve this problem is by using two pointers, often called `fast` and `slow`, in a single pass. 

The goal is to position the `slow` pointer at the node **just before** the one we want to remove. To do this:
1.  Move the `fast` pointer `n` steps ahead.
2.  Move both `fast` and `slow` pointers together until `fast` reaches the last node.
3.  The `slow` pointer will now be exactly `n` nodes behind `fast`, which means it's pointing to the node preceding the target.

To handle the edge case where we need to remove the first node (the head), we use a **dummy node** that points to the head.

#### Logic Steps:
1.  **Initialize Dummy:** Create a `dummy` node with `next` pointing to `head`.
2.  **Initialize Pointers:** Set both `slow` and `fast` pointers to the `dummy` node.
3.  **Advance Fast Pointer:** Move `fast` forward `n` times.
4.  **Traverse Together:** While `fast.next` is not null, move both `slow` and `fast` forward one step at a time.
5.  **Remove Node:** Update `slow.next` to skip the target node: `slow.next = slow.next.next`.
6.  **Return Result:** Return `dummy.next` (the new head).

### 3. Solution: Two-Pointer Approach

Here is the implementation in C#:

```csharp
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     public int val;
 *     public ListNode next;
 *     public ListNode(int val=0, ListNode next=null) {
 *         this.val = val;
 *         this.next = next;
 *     }
 * }
 */

public class Solution {
    public ListNode RemoveNthFromEnd(ListNode head, int n) {
        // Use a dummy node to simplify edge cases (e.g., removing the head)
        ListNode dummy = new ListNode(-1, head);
        ListNode slow = dummy;
        ListNode fast = dummy;

        // Move fast pointer n steps ahead
        while (n > 0 && fast.next != null) {
            fast = fast.next;
            n -= 1;
        }

        // Move both pointers until fast reaches the end
        while (fast.next != null) {
            slow = slow.next;
            fast = fast.next;
        }

        // slow is now just before the node to be removed
        slow.next = slow.next.next;

        return dummy.next;
    }
}
```

### 4. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Two-Pointer** | `O(N)` | `O(1)` | Single pass through the list, constant extra space for pointers. |

- **Time Complexity:** `O(N)`, where N is the number of nodes in the linked list. We traverse the list once.
- **Space Complexity:** `O(1)`, as we only use a few extra pointer variables regardless of the list size.

### 5. Summary

Using the two-pointer technique allows us to solve this problem in a single pass with constant space. The dummy node is a crucial pattern in linked list problems as it gracefully handles cases where the head of the list might be modified or removed.

### 6. Further Reading
- [Remove Nth Node From End of List (LeetCode 19)](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)
- [Linked List Data Structure (Wikipedia)](https://en.wikipedia.org/wiki/Linked_list)
- [NeetCode Roadmap - Linked List](https://neetcode.io/roadmap)
- [NeetCode Solution Video](https://www.youtube.com/watch?v=XVuQxVej6y8)
