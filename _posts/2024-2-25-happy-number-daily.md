---
layout: single
title: "Problem of The Day: Happy Number"
date: 2024-2-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-202](/assets/images/2024-02-25_14-37-05-problem-202.png)](/assets/images/2024-02-25_14-37-05-problem-202.png)

## Intuition

My initial thoughts are to use a two-pointer approach, where one pointer (slow) moves one step at a time, and the other pointer (fast) moves two steps at a time. If there is a cycle, the fast pointer will eventually catch up with the slow pointer, indicating that the number is not a happy number.

## Approach

I will define a helper function to calculate the sum of squares of digits for a given number. Then, I'll initialize the slow and fast pointers with the result of applying the helper function to the input number and its double application, respectively.

I will iterate through the sequence until either of the pointers becomes 1 or they meet. If any of these conditions is met, I'll return True, indicating that the number is a happy number. Otherwise, I'll return False.

## Complexity

- Time complexity:
O(log n) - The time complexity is determined by the number of digits in the input number.

- Space complexity:
O(1) - The space complexity is constant as we are using a fixed number of variables regardless of the input size.

## Code

```python
class Solution:
    def isHappy(self, n: int) -> bool:
        def helper(x):
            res = 0
            while x > 0:
                res += (x % 10)**2
                x = x // 10
            return res
        slow = helper(n)
        fast = helper(helper(n))

        # print(slow, fast)
        while slow > 1 and fast > 1:
            slow = helper(slow)
            fast = helper(helper(fast))
            if slow == fast:
                return False
        
        return True

```
