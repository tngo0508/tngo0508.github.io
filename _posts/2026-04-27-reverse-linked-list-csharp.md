---
title: "Reverse Linked List in C#"
excerpt: "Learn how to reverse a singly-linked list using both iterative and recursive (NeetCode) approaches in C#."
date: 2026-04-27
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Linked List
  - Iterative
  - Recursive
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Reverse Linked List

Given the `head` of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
- **Input:** `head = [1,2,3,4,5]`
- **Output:** `[5,4,3,2,1]`

**Example 2:**
- **Input:** `head = [1,2]`
- **Output:** `[2,1]`

**Example 3:**
- **Input:** `head = []`
- **Output:** `[]`

### 2. The Intuition: Iterative vs Recursive

Reversing a linked list can be done in two primary ways:

1.  **Iterative Approach:** We use three pointers (`prev`, `curr`, `next`) to flip the `next` pointer of each node as we traverse the list. This is memory-efficient as it only uses constant extra space.
2.  **Recursive Approach:** We break the problem down by reversing the "rest of the list" first, then making the original second node point back to the first node. While elegant, it uses more memory due to the recursion stack.

#### Iterative Logic:
1.  **Initialize Pointers:** We need three pointers: `prev` (initially `null`), `curr` (initially `head`), and `next` (to temporary store the next node).
2.  **Traverse and Flip:** While `curr` is not `null`:
    - Store the `next` node: `next = curr.next`.
    - Reverse the link: `curr.next = prev`.
    - Move `prev` forward: `prev = curr`.
    - Move `curr` forward: `curr = next`.
3.  **Return New Head:** Once `curr` becomes `null`, `prev` will be pointing to the new head.

#### Recursive Logic (NeetCode):
1.  **Base Case:** If the list is empty or has only one node, return the `head`.
2.  **Recurse:** Recursively call `ReverseList` on the next node (`head.next`). This returns the new head of the reversed portion.
3.  **Link Back:** Set the `next` of the original next node to the current `head` (`head.next.next = head`).
4.  **Clean Up:** Set `head.next` to `null` to avoid cycles.

### 3. Solution 1: Iterative Approach

This approach is efficient and easy to implement. It reverses the list in-place without needing extra space for a new list.

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
    public ListNode ReverseList(ListNode head) {
        ListNode prev = null;
        var curr = head;
        while (curr != null) {
            var next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}
```

### 4. Solution 2: Recursive Approach (NeetCode)

This [NeetCode.io](https://neetcode.io) approach uses recursion to reach the end of the list first, then reverses the pointers as the call stack unwinds.

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
    public ListNode ReverseList(ListNode head) {
        if (head == null) {
            return null;
        }

        ListNode newHead = head;
        if (head.next != null) {
            newHead = ReverseList(head.next);
            head.next.next = head;
        }
        head.next = null;

        return newHead;
    }
}
```

### 5. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Iterative** | **O(N)** | **O(1)** | Single pass, constant extra pointer variables. |
| **Recursive** | **O(N)** | **O(N)** | Single pass, but uses the call stack for each node. |

- **Time Complexity:** **O(N)** for both, where N is the number of nodes in the linked list.
- **Space Complexity:** Iterative is **O(1)**, while recursive is **O(N)** due to the stack depth.

### 6. Summary

Reversing a linked list is a fundamental problem that tests your understanding of pointer manipulation. The iterative approach is generally preferred in production because it avoids potential stack overflow issues for very large lists. The recursive approach, however, is often considered more elegant and is a great way to practice recursive thinking.

### 7. Further Reading
- [Reverse Linked List (LeetCode 206)](https://leetcode.com/problems/reverse-linked-list/)
- [Linked List Data Structure (Wikipedia)](https://en.wikipedia.org/wiki/Linked_list)
- [NeetCode Roadmap - Linked List](https://neetcode.io/roadmap)
- [NeetCode Solution Video](https://www.youtube.com/watch?v=G0_I-ZF0S38)
