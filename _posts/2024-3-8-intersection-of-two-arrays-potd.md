---
layout: single
title: "Problem of The Day: Intersection of Two Arrays"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-349](/assets/images/2024-03-09_16-22-22-problem-349.png)

## Intuition

Use hash map or hash set to solve the problem.

## Approach

I approach the problem by using a hash map to track the occurrences of elements in the first array (`nums1`). I then iterate through the second array (`nums2`), checking if each element exists in the hash map. If it does, I add it to the result and decrement its count in the hash map to avoid duplicates.

## Complexity

- Time complexity:
  O(n + m), where n and m are the lengths of nums1 and nums2, respectively. The algorithm iterates through both arrays once.

- Space complexity:
  O(min(n, m)), as the space required for the hash map is proportional to the size of the smaller array. In the worst case, where both arrays have distinct elements, the space complexity is O(min(n, m)).

## Code

```python
class Solution:
    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:
        hash_map = defaultdict(int)
        for num in nums1:
            hash_map[num] = 1
        res = []

        for num in nums2:
            if hash_map[num] == 1:
                res.append(num)
                hash_map[num] -= 1

        return res

```
