---
layout: single
title: "Problem of The Day: Path Sum III"
date: 2024-1-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
  - Top 100 Liked
---

# Problem Statement
![problem](/assets/images/2024-01-05_14-47-53-path-sum-3.png)
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
To improve the brute force solution above, I took the liberty of reading the editorial and discussion forum. I realized that there was a concept called prefix sum that I could use to apply for this problem.

Basically, my approach revolves around using recursion to traverse the binary tree. For each node, I calculate the cumulative sum along the path from the root to that node. This information is crucial for identifying valid paths with the desired target sum. I utilize a `defaultdict` or hash map to keep track of prefix sums encountered during the traversal. In addition, this approach also involves in the backtracking so that I could explore entire search space for the final count.

Time complexity: The time complexity is influenced by the number of nodes in the binary tree, resulting in a time complexity of O(n).

Space complexity: The space complexity is determined by the storage required for prefix sums, resulting in a space complexity of O(n).

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        prefix_sum = defaultdict(int)
        def count_path(node, target, curr_sum):
            if not node:
                return 0
            
            curr_sum += node.val
            count = prefix_sum[curr_sum - target]
            if curr_sum == target:
                count += 1
            prefix_sum[curr_sum] += 1

            count += count_path(node.left, target, curr_sum)
            count += count_path(node.right, target, curr_sum)

            prefix_sum[curr_sum] -= 1

            return count

        return count_path(root, targetSum, 0)
```

## Algorithm Walkthrough
Consider this binary tree:
```
        10
       /  \
      5   -3
     / \    \
    3   2   11
   / \   \
  3  -2   1

```
**Initialize**: Set up a `defaultdict` or hash map called `prefix_sum` to keep track of cumulative sums encountered during traversal.

**Recursive Traversal**: Begin the recursive traversal of the binary tree starting from the root (10). The parameters include the current node, target sum (8), and the cumulative sum up to the current node (0 initially).

**Node 10 (Root):**
- Cumulative sum: 10 (0 + 10)
- Check prefix_sum: No entry for 10 - 8 = 2.
- Update prefix_sum[10] to 1.

**Node 5 (Left Child of 10):**
- Cumulative sum: 15 (10 + 5)
- Check prefix_sum: No entry for 15 - 8 = 7.
- Update prefix_sum[15] to 1.

**Node 3 (Left Child of 5):**
- Cumulative sum: 18 (15 + 3)
- Check prefix_sum: Entry for 18 - 8 = 10 exists (count = 1).
- Increment count by prefix_sum[10] (1).
- Update prefix_sum[18] to 1.
  
**Node -2 (Right Child of 3):**
- Cumulative sum: 16 (18 + (-2))
- Check prefix_sum: Entry for 16 - 8 = 8 exists (count = 1).
- Increment count by prefix_sum[8] (1).
- Update prefix_sum[16] to 1.
  
**Backtrack to Node 3:**
- Update prefix_sum[18] to 0 (backtrack).

**Backtrack to Node 5:**
- Update prefix_sum[15] to 0 (backtrack).

**Node 2 (Right Child of 5):**
- Cumulative sum: 17 (15 + 2)
- Check prefix_sum: Entry for 17 - 8 = 9 doesn't exist.
- Update prefix_sum[17] to 1.

**Backtrack to Node 5:**
- Update prefix_sum[15] to 0 (backtrack).
- Backtrack to Node 10:
- Update prefix_sum[10] to 0 (backtrack).

**Node -3 (Right Child of 10):**
- Cumulative sum: 7 (10 + (-3))
- Check prefix_sum: No entry for 7 - 8 = -1.
- Update prefix_sum[7] to 1.
  
**Node 11 (Right Child of -3):**
- Cumulative sum: 8 (7 + 11)
- Check prefix_sum: Entry for 8 - 8 = 0 doesn't exist.
- Update prefix_sum[8] to 1.

**Backtrack to Node -3:**
- Update prefix_sum[7] to 0 (backtrack).

**Backtrack to Node 10:**
- Update prefix_sum[10] to 0 (backtrack).

**Result:**
The algorithm explores all possible paths in the binary tree, maintaining a count of paths where the cumulative sum equals the target sum. In this example, the count is 3, representing the following paths: `[5, 3]`, `[3, -2, 2]`, `[-3, 11]`.


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

