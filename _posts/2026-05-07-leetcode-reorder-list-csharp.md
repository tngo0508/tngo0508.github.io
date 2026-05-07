---
title: "LeetCode: Reorder List in C#"
excerpt: "Learn how to reorder a singly-linked list in-place using the slow/fast pointer technique, list reversal, and alternate merging in C#."
date: 2026-05-07
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

### 1. The Problem: Reorder List

The "Reorder List" problem (LeetCode 143) asks us to reorder a singly linked list in a specific way. Given a list `L0 → L1 → … → Ln-1 → Ln`, we need to transform it to `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`.

> **Example:**
> Input: `1 -> 2 -> 3 -> 4`
> Output: `1 -> 4 -> 2 -> 3`

The challenge is to perform this reordering **in-place** without modifying the values in the nodes.

### 2. The Intuition: Split, Reverse, and Merge

To solve this efficiently, we can break the process into three distinct phases:

1.  **Find the Middle**: Use the slow and fast pointer approach to find the midpoint of the list.
2.  **Reverse the Second Half**: Reverse the second half of the list starting from the middle node.
3.  **Merge the Two Halves**: Interleave nodes from the first half and the reversed second half.

### 3. Implementation: Reorder List Algorithm

The following implementation follows the three-step approach to reorder the list in-place.

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
    public void ReorderList(ListNode head) {
        if (head.next == null) {
            return;
        }
        
        // 1. Find the middle of the list
        ListNode slow = head;
        ListNode fast = head;
        ListNode prev = null;
        while (fast != null && fast.next != null) {
            prev = slow;
            slow = slow.next;
            fast = fast.next.next;
        }

        // Split the list into two halves
        prev.next = null;
        
        // 2. Reverse the second half (starting from slow)
        prev = null;
        while (slow != null) {
            ListNode next = slow.next;
            slow.next = prev;
            prev = slow;
            slow = next;
        }

        // 3. Merge the two halves alternately
        ListNode left = head;
        ListNode right = prev; // Head of the reversed second half
        ListNode dummy = new ListNode(-1);
        ListNode curr = dummy;
        
        while (left != null && right != null) {
            ListNode leftNode = left.next;
            ListNode rightNode = right.next;
            
            curr.next = left;
            left.next = right;
            right.next = null;
            
            curr = right;
            left = leftNode;
            right = rightNode;
        }

        // Handle the remaining node for odd-length lists
        if (right != null) {
            curr.next = right;
        }
        
        head = dummy.next;
    }
}
```

### 3.1 Alternative: NeetCode.io Solution (Concise Variant)

NeetCode’s approach uses a slightly different way to locate the middle (`fast = head.next`) and a concise merge. Functionally it achieves the same O(N) time and O(1) space.

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
    public void ReorderList(ListNode head) {
        // 1) Find middle (slow stops at end of first half)
        ListNode slow = head;
        ListNode fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // 2) Reverse second half
        ListNode second = slow.next;
        ListNode prev = slow.next = null; // split and init prev
        while (second != null) {
            ListNode tmp = second.next;
            second.next = prev;
            prev = second;
            second = tmp;
        }

        // 3) Merge two halves
        ListNode first = head;
        second = prev; // head of reversed second half
        while (second != null) {
            ListNode tmp1 = first.next;
            ListNode tmp2 = second.next;
            first.next = second;
            second.next = tmp1;
            first = tmp1;
            second = tmp2;
        }
    }
}
```

Key notes about this variant:
- Using `fast = head.next` makes `slow` end at the first half tail for even-length lists, simplifying the split with `slow.next = null`.
- The merge loop only checks `second != null` because the first half is guaranteed to be the same size or one node larger.
- Same complexity: O(N) time, O(1) extra space.

### 4. Step-by-Step Breakdown

#### Step 1: Finding the Middle
We use two pointers, `slow` and `fast`. For every step `slow` takes, `fast` takes two. When `fast` reaches the end of the list, `slow` is at the middle. We use `prev` to disconnect the first half from the second half.

#### Step 2: Reversing the Second Half
We reverse the second half of the list (the part starting from `slow`) in-place. This allows us to easily access the nodes from the end of the original list by iterating through this reversed part.

#### Step 3: Weaving the Lists
We use a `dummy` node to simplify the merging logic. We alternate between taking a node from the `left` (first half) and the `right` (reversed second half), connecting them together until one of the lists is exhausted.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We traverse the list to find the middle, reverse half of it, and then merge. All are linear operations. |
| **Space Complexity** | **O(1)** | We only use a constant amount of extra space for pointers, modifying the list in-place. |

### 6. Summary

By combining three fundamental linked list operations—finding the middle, reversing a list, and merging—we can solve the "Reorder List" problem efficiently. This approach is optimal for both time and space, making it a favorite in technical interviews.

---
*Looking for more? Check out my other [LeetCode solutions](/categories/#leetcode)!*
