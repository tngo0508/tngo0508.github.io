---
title: "Merging Two Sorted Lists in C#"
excerpt: "Discover how to merge two sorted linked lists into a single sorted list using an iterative approach with a sentinel node in C#."
date: 2026-05-02
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Linked List
  - Iteration
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Merge Two Sorted Lists

The "Merge Two Sorted Lists" problem asks us to combine two already sorted linked lists into one continuous sorted list.

> You are given the heads of two sorted linked lists `list1` and `list2`.
>
> Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.
>
> Return the head of the merged linked list.

### 2. The Intuition: Sentinel Node and Two Pointers

The most efficient way to merge two sorted lists is by using an iterative approach. We compare the current nodes of both lists and always pick the smaller one to append to our new list.

To simplify the logic, especially for the head of the merged list, we use a **Sentinel (or Dummy) Node**. This acts as a placeholder, allowing us to easily append nodes without worrying if the result list is empty or which list provides the first node.

### 3. Implementation: Iterative Approach

This implementation uses a sentinel node to build the new list and iterates through both input lists until they are exhausted.

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
    public ListNode MergeTwoLists(ListNode list1, ListNode list2) {
        // 1. Initialize a sentinel node to start the merged list
        ListNode sentinel = new ListNode(-1);
        var head = sentinel;
        
        var l1 = list1;
        var l2 = list2;

        // 2. Iterate while both lists have nodes
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                head.next = l1;
                l1 = l1.next;
            } else {
                head.next = l2;
                l2 = l2.next;
            }

            head = head.next;
        }

        // 3. Attach remaining nodes from l1 if any
        while (l1 != null) {
            head.next = l1;
            l1 = l1.next;
            head = head.next;
        }

        // 4. Attach remaining nodes from l2 if any
        while (l2 != null) {
            head.next = l2;
            l2 = l2.next;
            head = head.next;
        }

        // 5. The merged list starts after the sentinel node
        return sentinel.next;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Sentinel Node Initialization
We create a `sentinel` node with a dummy value (like -1). We also maintain a `head` pointer that moves as we add nodes to the merged list. This prevents having to write special logic for the very first node.

#### Step 2: Main Merging Loop
We compare the values at the current pointers of both lists (`l1` and `l2`).
- If `l1.val` is smaller or equal, we point `head.next` to `l1` and advance `l1`.
- Otherwise, we point `head.next` to `l2` and advance `l2`.
- We then move the `head` pointer forward.

#### Step 3 & 4: Handling Remainders
If one list is longer than the other, the `while` loop terminates when the shorter list reaches `null`. We then append the remaining nodes of the other list.

#### Step 5: Returning the Result
Since the `sentinel` node was just a placeholder, the actual merged list begins at `sentinel.next`.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N + M)** | We visit each node in both lists exactly once, where N and M are the lengths of the lists. |
| **Space Complexity** | **O(1)** | We are merging the lists in-place by changing the `next` pointers. No extra nodes are created (except the sentinel). |

### 6. Summary

Merging two sorted lists is a classic linked list problem that demonstrates how useful a sentinel node can be for simplifying head management. By comparing nodes one-by-one, we maintain the sorted property while achieving optimal time and space complexity.

### 7. Further Reading
- [Linked List Data Structure](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1)
- [Neetcode - Merge Two Sorted Lists](https://neetcode.io/problems/merge-two-sorted-lists)
- [LeetCode Problem 21](https://leetcode.com/problems/merge-two-sorted-lists/)
