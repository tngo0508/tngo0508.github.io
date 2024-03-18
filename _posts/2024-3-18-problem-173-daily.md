---
layout: single
title: "Problem of The Day: Binary Search Tree Iterator"
date: 2024-3-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-173](/assets/images/2024-03-18_12-33-19-problem-173.png)](/assets/images/2024-03-18_12-33-19-problem-173.png)

## Intuition

My approach involves converting the binary search tree into a singly linked list using an in-order traversal. This conversion allows for efficient retrieval of the next element and checking for its existence.

## Approach

- Initialize a dummy node to facilitate the conversion process.
- Perform an in-order traversal of the binary search tree.
- During traversal, modify the tree nodes to form a linked list such that each node's right child points to the next node in the traversal sequence.
- Adjust the current pointer accordingly to maintain track of the current node during traversal.
- Implement `next()` method to move to the next node in the traversal sequence and return its value.
- Implement `hasNext()` method to check if there exists a next node to traverse.

## Complexity

- Time complexity:

  - Initializing the iterator involves an in-order traversal of the entire tree, which takes O(n) time, where n is the number of nodes in the BST.
  - Both `next()` and `hasNext()` methods have O(1) time complexity as they involve simple pointer manipulation.

- Space complexity:

  - The space complexity of the `BSTIterator` class is O(n), where n is the number of nodes in the BST, as we store all nodes in the dummy node during initialization.
  - The space complexity of the `next()` and `hasNext()` methods is O(1) since we are not using any additional space proportional to the input size.

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class BSTIterator:

    def __init__(self, root: Optional[TreeNode]):
        self.dummy = TreeNode(-1)
        self.curr = self.dummy
        self.in_order_traverse(root)
        self.curr = self.dummy


    def in_order_traverse(self, root):
        if not root:
            return
        self.in_order_traverse(root.left)
        self.curr.right = root
        self.curr = self.curr.right
        self.in_order_traverse(root.right)

    def next(self) -> int:
        self.curr = self.curr.right
        return self.curr.val

    def hasNext(self) -> bool:
        return True if self.curr and self.curr.right else False


# Your BSTIterator object will be instantiated and called as such:
# obj = BSTIterator(root)
# param_1 = obj.next()
# param_2 = obj.hasNext()
```

## Editorial Solution

### Approach 1: Flattening the BST

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class BSTIterator:

    def __init__(self, root: TreeNode):

        # Array containing all the nodes in the sorted order
        self.nodes_sorted = []

        # Pointer to the next smallest element in the BST
        self.index = -1

        # Call to flatten the input binary search tree
        self._inorder(root)

    def _inorder(self, root):
        if not root:
            return
        self._inorder(root.left)
        self.nodes_sorted.append(root.val)
        self._inorder(root.right)

    def next(self) -> int:
        """
        @return the next smallest number
        """
        self.index += 1
        return self.nodes_sorted[self.index]

    def hasNext(self) -> bool:
        """
        @return whether we have a next smallest number
        """
        return self.index + 1 < len(self.nodes_sorted)
```

### Approach 2: Controlled Recursion

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class BSTIterator:

    def __init__(self, root: TreeNode):

        # Stack for the recursion simulation
        self.stack = []

        # Remember that the algorithm starts with a call to the helper function
        # with the root node as the input
        self._leftmost_inorder(root)

    def _leftmost_inorder(self, root):

        # For a given node, add all the elements in the leftmost branch of the tree
        # under it to the stack.
        while root:
            self.stack.append(root)
            root = root.left

    def next(self) -> int:
        """
        @return the next smallest number
        """

        # Node at the top of the stack is the next smallest element
        topmost_node = self.stack.pop()

        # Need to maintain the invariant. If the node has a right child, call the
        # helper function for the right child
        if topmost_node.right:
            self._leftmost_inorder(topmost_node.right)
        return topmost_node.val

    def hasNext(self) -> bool:
        """
        @return whether we have a next smallest number
        """
        return len(self.stack) > 0
```
