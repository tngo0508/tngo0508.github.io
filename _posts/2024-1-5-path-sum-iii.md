---
layout: single
title: "Problem of The Day: Path Sum III"
date: 2024-1-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---

# Problem Statement
# Intuition
The problem requires finding the number of paths in a binary tree where the sum of node values along the path equals a given target sum. My initial thought is to perform a Depth-First Search (DFS) traversal of the tree and, at each node, explore the paths going down to the left and right subtrees, checking for valid paths along the way.

# Approach
I use a recursive DFS approach. At each node, I calculate the current sum by adding the node value to the sum accumulated so far. If the current sum equals the target sum, I increment the result count. I then proceed to explore the left and right subtrees with updated sums.

To implement this, I define a recursive helper function `dfs` that takes a node, the target sum, and the current sum as parameters. The function returns the count of valid paths starting from the given node. The base case is when the node is `None`, in which case the count is 0. The recursive calls accumulate the counts from the left and right subtrees.

The main function `pathSum` initializes the result variable and calls the `dfs` function on the root node. Additionally, it makes recursive calls on the left and right subtrees to cover all paths in the tree. The final result is the total count of valid paths.

# Complexity
- Time complexity:
O(n^2), where n is the number of nodes in the tree. This is because, in the worst case, for each node, we perform a recursive DFS, resulting in a time complexity of O(n) for each node, leading to a quaradratic time complexity.

- Space complexity:
O(h), where h is the height of the tree. The recursive call stack can go as deep as the height of the tree during the DFS traversal.

# Code
```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        def dfs(node, target, curr_sum):
            if not node:
                return 0
            
            result = 0
            curr_sum += node.val
            if curr_sum == target:
                result += 1
            result += dfs(node.left, target, curr_sum)
            result += dfs(node.right, target, curr_sum)

            return result

        if not root:
            return 0
        
        ways = dfs(root, targetSum, 0)
        ways += self.pathSum(root.left, targetSum)
        ways += self.pathSum(root.right, targetSum)
        return ways
```

# Alternative
The algorithm explores the binary tree in a depth-first manner, maintaining a running sum of node values from the root to the current node. At each node, it checks if there are any valid paths with the desired sum ending at that node. The algorithm keeps track of cumulative sums using a hash table to efficiently determine the count of valid paths. By employing a recursive approach, the algorithm explores all possible paths in the tree, counting those that satisfy the target sum condition.

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        sums = defaultdict(int)
        sums[0] = 1

        def count_paths(node, total):
            if node is None:
                return 0

            total += node.val
            count = sums[total-targetSum]
            sums[total] += 1

            count += count_paths(node.left, total)
            count += count_paths(node.right, total)

            sums[total] -= 1

            return count

        return count_paths(root, 0)
```

# Editorial Solution
The algorithm explores the binary tree in a preorder traversal manner, maintaining a running sum of node values from the root to the current node. At each node, it checks if there are any valid paths with the desired sum ending at that node. The algorithm keeps track of cumulative sums using a hash table to efficiently determine the count of valid paths. By employing a recursive approach, the algorithm explores all possible paths in the tree, counting those that satisfy the target sum condition.

```python
class Solution:
    def pathSum(self, root: TreeNode, sum: int) -> int:
        def preorder(node: TreeNode, curr_sum) -> None:
            nonlocal count
            if not node:
                return 
            
            # The current prefix sum
            curr_sum += node.val
            
            # Here is the sum we're looking for
            if curr_sum == k:
                count += 1
            
            # The number of times the curr_sum − k has occurred already, 
            # determines the number of times a path with sum k 
            # has occurred up to the current node
            count += h[curr_sum - k]
            
            # Add the current sum into a hashmap
            # to use it during the child nodes' processing
            h[curr_sum] += 1
            
            # Process the left subtree
            preorder(node.left, curr_sum)
            # Process the right subtree
            preorder(node.right, curr_sum)
            
            # Remove the current sum from the hashmap
            # in order not to use it during 
            # the parallel subtree processing
            h[curr_sum] -= 1
            
        count, k = 0, sum
        h = defaultdict(int)
        preorder(root, 0)
        return count
```

