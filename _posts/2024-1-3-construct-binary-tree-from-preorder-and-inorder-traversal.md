---
layout: single
title: "Problem of The Day: Construct Binary Tree from Preorder and Inorder Traversal"
date: 2024-1-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Top 100 Liked
---
# Problem Statement
```
Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.

 

Example 1:
        3
       / \
      9   20
         / \
        15  3

Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
Output: [3,9,20,null,null,15,7]
Example 2:

Input: preorder = [-1], inorder = [-1]
Output: [-1]
```

# My Explanation and Approach
For this problem, I employ the `divide and conquer` concept to come up with the solution. The idea is simple. Basically, I attempted to divide the problem into sub-problem and use the recursion to build up the solution from sub-problems' solution. Let's take the example above as our core problem.

We start with this information.
```
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
```

We know that preorder and inorder follows these pattern respectively.
```
Preorder:
node -> left -> right

Inorder:
left -> node -> right
```

We leverage this information by using `inorder` input to tell us which nodes should be placed on the left side or right side of our tree at a certain node. Additionally, we use `preorder` input to build the tree or subtrees one node at time. To get the clear idea, Let's start with root node which is `3` since `3` is the first node that we see in the `preorder` input array. Then, we find the index of `3` inside the `inorder` array, all the nodes are on the left side of this index will be the left subtree and all the nodes are on the right side of this index will be right subtree. 

Next, we just use recursion to solve for the sub-problems. The sub-problems are how to build the left subtree and right subtree using `preorder` array and `inorder` array excludes the root node `3` that we just created. Note that, the `inorder` array for sub-problems are also changed since we partitioned the left and right of the original `inorder` input array.

For example
```
Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
                   ^
                 start here - this is our root node

              left tree |  right tree
                      v |     v 
inorder =            [9,3,15,20,7]
                        |
```

Then, our sub-problems become the following.
```
build tree for left subtree 
Input: preorder = [9,20,15,7], inorder = [9]

build tree for right subtree
Input: preorder = [9,20,15,7], inorder = [3,15,20,7]
```

Repeat the steps above to build left subtree.
```
Input: preorder = [9,20,15,7], inorder = [9]
                   ^
                 root node left tree

              left tree |  right tree
inorder =              [9]

In this case, if we call helper function for left or right tree, the inorder input of recursion call will be empty
```

Repeat the steps above to build right subtree.
```
Input: preorder = [9,20,15,7], inorder = [3,15,20,7]
                   ^
                 root node left tree

In this case, since 9 is not present in the inorder -> this tells us that the parent node shall have the left node which is 9 and right node is Null
```

My notes
![note](/assets/images/2024-01-03_17-22-54-build-tree-node.png)

```python
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        def helper(preorder, inorder):
            if helper.index >= len(preorder) or not inorder:
                return
            val = preorder[helper.index]
            root = TreeNode(val)
            val_idx = inorder.index(val)
            helper.index += 1
            root.left = helper(preorder, inorder[:val_idx])
            root.right = helper(preorder, inorder[val_idx + 1:])

            return root

        helper.index = 0
        return helper(preorder, inorder)
```
# Leet Code Solution
```python
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:

        def array_to_tree(left, right):
            nonlocal preorder_index
            # if there are no elements to construct the tree
            if left > right: return None

            # select the preorder_index element as the root and increment it
            root_value = preorder[preorder_index]
            root = TreeNode(root_value)


            preorder_index += 1

            # build left and right subtree
            # excluding inorder_index_map[root_value] element because it's the root
            root.left = array_to_tree(left, inorder_index_map[root_value] - 1)
            root.right = array_to_tree(inorder_index_map[root_value] + 1, right)

            return root

        preorder_index = 0

        # build a hashmap to store value -> its index relations
        inorder_index_map = {}
        for index, value in enumerate(inorder):
            inorder_index_map[value] = index

        return array_to_tree(0, len(preorder) - 1)
```