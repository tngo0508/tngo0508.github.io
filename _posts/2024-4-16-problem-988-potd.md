---
layout: single
title: "Problem of The Day: Smallest String Starting From Leaf"
date: 2024-4-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-988](/assets/images/2024-04-16_23-34-06-problem-988.png)

## Intuition

My initial thoughts are to traverse the binary tree and keep track of the paths from the root to each leaf node. Then, I can compare these paths to find the smallest lexicographically sorted path.

## Approach

I'll use depth-first search (DFS) to traverse the tree and maintain the current path from the root to the current node. When I reach a leaf node, I'll compare its path with the current smallest path found so far. If it's smaller, I'll update the smallest path. Finally, I'll convert the smallest path to its corresponding characters and return it.

## Complexity

- Time complexity:
  O(n) where n is number nodes in the binary tree

- Space complexity:
  O(h) where h is the heigh of the tree

## Code

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def smallestFromLeaf(self, root: Optional[TreeNode]) -> str:
        res = []
        def dfs(root, curr):
            nonlocal res
            if not root:
                return
            if not root.left and not root.right:
                curr.append(root.val)
                if not res:
                    res = curr[:]
                else:
                    a = list(reversed(res))
                    b = list(reversed(curr))
                    for i in range(max(len(a), len(b))):
                        x = a[i] if i < len(a) else float('-inf')
                        y = b[i] if i < len(b) else float('-inf')
                        if x > y:
                            res = curr[:]
                            break
                        elif x < y:
                            break

                return
            dfs(root.left, curr + [root.val])
            dfs(root.right, curr + [root.val])

        dfs(root, [])
        res.reverse()
        return ''.join([chr(x + ord('a')) for x in res])
```

## Editorial Solution

### DFS

```python
class Solution:
    def smallestFromLeaf(self, root: Optional[TreeNode]) -> str:
        self.smallest_string = ""
        self.dfs(root, "")
        return self.smallest_string

    # Helper function to find the lexicographically smallest string
    def dfs(self, root, current_string):
        # If the current node is NULL, return
        if not root:
            return

        # Construct the current string by appending
        # the character corresponding to the node's value
        current_string = chr(root.val + ord('a')) + current_string

        # If the current node is a leaf node
        if not root.left and not root.right:
            # If the current string is smaller than the result
            # or if the result is empty
            if not self.smallest_string or self.smallest_string > current_string:
                self.smallest_string = current_string

        # Recursively traverse the left subtree
        if root.left:
            self.dfs(root.left, current_string)

        # Recursively traverse the right subtree
        if root.right:
            self.dfs(root.right, current_string)
```

- Time: O(n \* n) where n is the length of the resulting string
- Space: O(n \* n)

### BFS

```python
class Solution:
    def smallestFromLeaf(self, root: Optional[TreeNode]) -> str:
        smallest_string = ""
        node_queue = deque()

        # Add root node to deque along with its value converted to a character
        node_queue.append([root, chr(root.val + ord('a'))])

        # Perform BFS traversal until deque is empty
        while node_queue:
            # Pop the leftmost node and its corresponding string from deque
            node, current_string = node_queue.popleft()

            # If current node is a leaf node
            if not node.left and not node.right:
                # Update smallest_string if it's empty or current string is smaller
                smallest_string = min(smallest_string, current_string) if smallest_string else current_string

            # If current node has a left child, append it to deque
            if node.left:
                node_queue.append([node.left, chr(node.left.val + ord('a')) + current_string])

            # If current node has a right child, append it to deque
            if node.right:
                node_queue.append([node.right, chr(node.right.val + ord('a')) + current_string])

        return smallest_string
```
