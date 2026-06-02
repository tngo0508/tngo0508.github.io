---
title: "Copy List with Random Pointer in C#"
excerpt: "Learn how to create a deep copy of a linked list where each node contains an additional random pointer using hash map and space-optimized interweaving approaches in C#."
date: 2026-06-01
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Linked List
  - Hash Map
  - Space Optimization
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Copy List with Random Pointer

A linked list of length `n` is given such that each node contains an additional random pointer, which could point to any node in the list, or `null`.

Construct a **deep copy** of the list. The deep copy should consist of exactly `n` brand new nodes, where each new node has its value set to the value of its corresponding original node. Both the `next` and `random` pointer of the new nodes should point to new nodes in the copied list such that the pointers in the original list and copied list represent the same list state. **None of the pointers in the new list should point to nodes in the original list.**

### 2. The Intuition: Hash Map for Cloning

To create a deep copy, we need to map each original node to its corresponding newly created node. This allows us to correctly assign the `random` pointers even if they point to nodes that appear later in the list.

The approach involves two passes:
1.  **First Pass:** Traverse the original list. For each node, create a new node with the same value and store the mapping (`Original Node` -> `New Node`) in a dictionary (hash map). Simultaneously, link the new nodes using the `next` pointer.
2.  **Second Pass:** Traverse the original list again. For each node, if it has a `random` pointer, look up the corresponding cloned node in the dictionary and set its `random` pointer to the cloned version of the original's random target.

### 3. Solution 1: Iterative Hash Map Approach

This approach uses a dictionary to store the mapping between original nodes and their clones, performing two linear passes.

Here is the implementation in C#:

```csharp
/*
// Definition for a Node.
public class Node {
    public int val;
    public Node next;
    public Node random;
    
    public Node(int _val) {
        val = _val;
        next = null;
        random = null;
    }
}
*/

public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;

        // Dictionary to map original nodes to their copies
        Dictionary<Node, Node> cloneDict = new Dictionary<Node, Node>();
        Node curr = head;
        Node dummy = new Node(-1);
        Node ptr = dummy;

        // First pass: create all nodes and link them via 'next'
        while (curr != null) {
            Node newNode = new Node(curr.val);
            cloneDict[curr] = newNode;
            ptr.next = newNode;
            ptr = newNode;
            curr = curr.next;
        }

        // Second pass: assign 'random' pointers
        curr = head;
        while (curr != null) {
            if (curr.random != null) {
                cloneDict[curr].random = cloneDict[curr.random];
            }
            curr = curr.next;
        }

        return dummy.next;
    }
}
```

### 4. Solution 2: Recursive Hash Map Approach (NeetCode)

This version uses recursion (DFS) and a dictionary to handle the deep copy in a more functional style.

```csharp
/*
// Definition for a Node.
public class Node {
    public int val;
    public Node next;
    public Node random;

    public Node(int _val) {
        val = _val;
        next = null;
        random = null;
    }
}
*/

public class Solution {
    private Dictionary<Node, Node> map = new Dictionary<Node, Node>();

    public Node copyRandomList(Node head) {
        if (head == null) return null;
        if (map.ContainsKey(head)) return map[head];

        // Create the copy and map it immediately to handle cycles/random pointers
        Node copy = new Node(head.val);
        map[head] = copy;

        // Recursively copy next and random pointers
        copy.next = copyRandomList(head.next);

        if (head.random != null) {
            copy.random = copyRandomList(head.random);
        } else {
            copy.random = null;
        }

        return copy;
    }
}
```

### 5. Solution 3: Optimized Interweaving Approach

This approach eliminates the need for extra space (like a dictionary) by temporarily modifying the original list to weave the new nodes into it.

**The process involves three steps:**
1.  **Interweave:** Create a copy of each node and insert it immediately after the original node.
2.  **Link Random Pointers:** Set the `random` pointers of the new nodes based on the original nodes' `random` pointers.
3.  **Separate Lists:** Restore the original list and extract the new list.

```csharp
/*
// Definition for a Node.
public class Node {
    public int val;
    public Node next;
    public Node random;

    public Node(int _val) {
        val = _val;
        next = null;
        random = null;
    }
}
*/

public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) {
            return null;
        }

        // Step 1: Interweave original and copied nodes
        Node l1 = head;
        while (l1 != null) {
            Node l2 = new Node(l1.val);
            l2.next = l1.next;
            l1.next = l2;
            l1 = l2.next;
        }

        Node newHead = head.next;

        // Step 2: Assign random pointers to the copied nodes
        l1 = head;
        while (l1 != null) {
            if (l1.random != null) {
                l1.next.random = l1.random.next;
            }
            l1 = l1.next.next;
        }

        // Step 3: Separate the interweaved list into original and copied lists
        l1 = head;
        while (l1 != null) {
            Node l2 = l1.next;
            l1.next = l2.next;
            if (l2.next != null) {
                l2.next = l2.next.next;
            }
            l1 = l1.next;
        }

        return newHead;
    }
}
```

### 6. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Iterative** | `O(N)` | `O(N)` | Two passes and a dictionary to store N nodes. |
| **Recursive** | `O(N)` | `O(N)` | One pass, uses a dictionary and recursion stack. |
| **Interweaving** | `O(N)` | `O(1)` | Three passes, no extra space used beyond the new nodes. |

#### Iterative Approach:
- **Time Complexity:** `O(N)`, where `N` is the number of nodes. Two linear passes.
- **Space Complexity:** `O(N)`, for the dictionary storing mappings.

#### Recursive Approach:
- **Time Complexity:** `O(N)`, where `N` is the number of nodes.
- **Space Complexity:** `O(N)`, for the dictionary and recursion stack.

#### Interweaving Approach:
- **Time Complexity:** `O(N)`, where `N` is the number of nodes. We perform three linear passes.
- **Space Complexity:** `O(1)`, as we don't use any additional data structures for mapping (the new nodes themselves don't count towards extra space complexity in many definitions).

### 7. Summary

Using a hash map (either iteratively or recursively) is a robust and intuitive way to handle deep copies. However, the **interweaving approach** is the most optimal in terms of space complexity, as it avoids the need for an external dictionary by temporarily modifying the original list.

### 8. Further Reading

- [Copy List with Random Pointer (LeetCode 138)](https://leetcode.com/problems/copy-list-with-random-pointer/)
- [Deep Copy vs Shallow Copy](https://en.wikipedia.org/wiki/Object_copying#Deep_copy)
- [NeetCode Roadmap - Linked List](https://neetcode.io/roadmap)
- [NeetCode Solution Video](https://www.youtube.com/watch?v=5Y2EiZST97Y)
