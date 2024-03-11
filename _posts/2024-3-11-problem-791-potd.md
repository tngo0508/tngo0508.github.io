---
layout: single
title: "Problem of The Day: Custom Sort String"
date: 2024-3-11
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-791](/assets/images/2024-03-11_04-16-06-problem-791.png)](/assets/images/2024-03-11_04-16-06-problem-791.png)

## Intuition

Use one hash map to track the frequency of characters of string `s` occurs in `order` and a list for the rest. Then, iterate through the input `order` again to construct the final result using hash map and appends the `out_order` list into the result string.

## Approach

I approach the problem by first counting the occurrences of each character in the input string `s` that is also present in the given order. I use a dictionary (`in_order`) for this purpose. Additionally, I keep track of characters in `s` that are not in the order (`out_order`). Then, I iterate through the given order and append the characters, repeated based on their count in `in_order`, to the result list (`res`). Finally, I append the characters in `out_order` to the result. The final sorted string is obtained by joining the elements of the result list.

## Complexity

- Time complexity:
  O(n + m), where n is the length of the input string `s` and m is the length of the given order. The algorithm iterates through the input string and the order separately.

- Space complexity:
  O(n), as the space required for the dictionary `in_order` and the list `out_order` is proportional to the length of the input string `s`.

## Code

```python
class Solution:
    def customSortString(self, order: str, s: str) -> str:
        res = []
        in_order = defaultdict(int)
        out_order = []
        for c in s:
            if c in order:
                in_order[c] += 1
            else:
                out_order.append(c)

        for c in order:
            if c in in_order:
                res.append(c * in_order[c])

        res.extend(out_order)
        return ''.join(res)
```
