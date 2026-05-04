---
title: "Linked List Cycle Detection in C#"
excerpt: "Learn how to detect a cycle in a linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare) in C#."
date: 2026-05-05
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Linked List
  - Floyd's Algorithm
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Linked List Cycle

The "Linked List Cycle" problem asks us to determine if a given linked list contains a cycle. A cycle occurs if there is some node in the list that can be reached again by continuously following the `next` pointer.

> Given `head`, the head of a linked list, determine if the linked list has a cycle in it.
>
> Return `true` if there is a cycle in the linked list. Otherwise, return `false`.

### 2. The Intuition: Floyd's Cycle-Finding Algorithm

The most efficient way to detect a cycle is by using **Floyd's Cycle-Finding Algorithm**, also known as the **"Tortoise and the Hare"** algorithm.

Imagine two runners on a circular track. If one runs faster than the other, they will eventually meet again. We can apply this to a linked list:
- We use two pointers: `slow` (the tortoise) and `fast` (the hare).
- `slow` moves one step at a time.
- `fast` moves two steps at a time.
- If there's no cycle, `fast` will eventually reach the end of the list (`null`).
- If there's a cycle, `fast` will eventually "lap" `slow` and they will point to the same node.

### 3. Implementation: Two-Pointer Approach

This implementation initializes `slow` at the head and `fast` at the next node, then iterates through the list.

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
    public bool HasCycle(ListNode head) {
        // 1. If the list is empty, there is no cycle
        if (head == null) {
            return false;
        }

        // 2. Initialize slow and fast pointers
        ListNode slow = head;
        ListNode fast = head.next;

        // 3. Iterate while the hare can move
        while (fast != null && fast.next != null) {
            // 4. Move slow one step, fast two steps
            slow = slow.next;
            fast = fast.next.next;

            // 5. If they meet, a cycle is detected
            if (slow == fast) {
                return true;
            }
        }

        // 6. If we reach the end, no cycle exists
        return false;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Base Case
If the `head` is `null`, the list is empty, so it can't have a cycle.

#### Step 2: Pointer Initialization
We start `slow` at the `head` and `fast` at `head.next`. This small offset ensures they don't start at the same position, which would trigger the "meeting" condition immediately.

#### Step 3: The Traversal
The `while` loop continues as long as `fast` and `fast.next` are not `null`. This prevents `NullReferenceException` when moving `fast` two steps ahead.

#### Step 4: Iteration
`slow` moves to `slow.next`.
`fast` moves to `fast.next.next`.

#### Step 5: Meeting Point
Inside the loop, we check if `slow == fast`. If they are equal, it means the hare has caught up to the tortoise from behind, confirming a loop exists.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | In the worst case (no cycle), we visit each node once. If there is a cycle, the fast pointer will catch the slow pointer in at most N steps. |
| **Space Complexity** | **O(1)** | We only use two pointers regardless of the size of the linked list. |

### 6. Summary

Floyd's Cycle-Finding Algorithm is the gold standard for cycle detection in linked lists. It provides a highly efficient solution with linear time complexity and constant space complexity, making it much better than approaches that use a `HashSet` to track visited nodes.

### 7. Further Reading
- [Floyd's Cycle-Finding Algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_tortoise_and_hare)
- [Neetcode - Linked List Cycle](https://neetcode.io/problems/linked-list-cycle)
- [LeetCode Problem 141](https://leetcode.com/problems/linked-list-cycle/)
