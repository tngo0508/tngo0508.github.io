---
layout: single
title: "Problem of The Day: Copy List with Random Pointer"
date: 2024-1-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
see [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/description/?envType=study-plan-v2&envId=top-100-liked)

# Intuition
My initial thoughts are to use a hash map to keep track of the mapping between original nodes and their corresponding copied nodes.

# Approach
I'll traverse the original linked list once and create a copy of each node while storing the mapping in a hash map. Then, I'll traverse the original list again to set the next and random pointers of the copied nodes based on the hash map.

I'll use a dummy node to simplify the creation of the new linked list.

# Complexity
- Time complexity:
O(n), where n is the number of nodes in the linked list. We traverse the list twice.

- Space complexity:
O(n), as we use a hash map to store the mapping between original and copied nodes. The space complexity is linear with respect to the number of nodes in the linked list.

# Code
```python
"""
# Definition for a Node.
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
"""

class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        hash_map = defaultdict()
        curr = head
        while curr:
            hash_map[curr] = Node(curr.val)
            curr = curr.next
        
        dummy = Node(-1)
        p = dummy
        curr = head
        while curr:
            p.next = hash_map[curr]
            p = p.next
            if curr.next in hash_map:
                p.next = hash_map[curr.next]
            if curr.random in hash_map:
                p.random = hash_map[curr.random]
            curr = curr.next

        return dummy.next
```

# Editorial Solution
Recursion Approach
```python
class Solution(object):
    """
    :type head: Node
    :rtype: Node
    """
    def __init__(self):
        # Dictionary which holds old nodes as keys and new nodes as its values.
        self.visitedHash = {}

    def copyRandomList(self, head):

        if head == None:
            return None

        # If we have already processed the current node, then we simply return the cloned version of it.
        if head in self.visitedHash:
            return self.visitedHash[head]

        # create a new node
        # with the value same as old node.
        node = Node(head.val, None, None)

        # Save this value in the hash map. This is needed since there might be
        # loops during traversal due to randomness of random pointers and this would help us avoid them.
        self.visitedHash[head] = node

        # Recursively copy the remaining linked list starting once from the next pointer and then from the random pointer.
        # Thus we have two independent recursive calls.
        # Finally we update the next and random pointers for the new node created.
        node.next = self.copyRandomList(head.next)
        node.random = self.copyRandomList(head.random)

        return node
```

Iterative Approach
```python
class Solution(object):
    def __init__(self):
        # Creating a visited dictionary to hold old node reference as "key" and new node reference as the "value"
        self.visited = {}

    def getClonedNode(self, node):
        # If node exists then
        if node:
            # Check if its in the visited dictionary          
            if node in self.visited:
                # If its in the visited dictionary then return the new node reference from the dictionary
                return self.visited[node]
            else:
                # Otherwise create a new node, save the reference in the visited dictionary and return it.
                self.visited[node] = Node(node.val, None, None)
                return self.visited[node]
        return None

    def copyRandomList(self, head):
        """
        :type head: Node
        :rtype: Node
        """

        if not head:
            return head

        old_node = head
        # Creating the new head node.       
        new_node = Node(old_node.val, None, None)
        self.visited[old_node] = new_node

        # Iterate on the linked list until all nodes are cloned.
        while old_node != None:

            # Get the clones of the nodes referenced by random and next pointers.
            new_node.random = self.getClonedNode(old_node.random)
            new_node.next = self.getClonedNode(old_node.next)

            # Move one step ahead in the linked list.
            old_node = old_node.next
            new_node = new_node.next

        return self.visited[head]
```