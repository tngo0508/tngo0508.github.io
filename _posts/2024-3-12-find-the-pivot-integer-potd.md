---
layout: single
title: "Problem of The Day: Find the Pivot Integer"
date: 2024-3-12
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2485](/assets/images/2024-03-12_20-55-38-problem-2485.png)](/assets/images/2024-03-12_20-55-38-problem-2485.png)

## Intuition

My initial thought is to iterate through the integers, keeping track of the current sum and comparing it with the sum of the remaining integers on the right.

## Approach

I'll use a simple loop to iterate through the integers from 1 to n. At each step, I'll update the current sum and check if the remaining integers on the right have the same sum. If I find such a pivot integer, I'll return it. If no pivot integer is found, I'll return -1.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(1)

## Code

```python
class Solution:
    def pivotInteger(self, n: int) -> int:
        curr_sum = 0
        total_sum = sum(range(n + 1))
        for i in range(1, n + 1):
            curr_sum += i
            if total_sum - curr_sum + i == curr_sum:
                return i
        return -1
```

## Editorial Solution

### Approach 2: Two Pointer

```python
class Solution:
    def pivotInteger(self, n: int) -> int:
        left_value = 1
        right_value = n
        sum_left = left_value
        sum_right = right_value

        if n == 1:
            return n

        # Iterate until the pointers meet
        while left_value < right_value:
            # Adjust sums and pointers based on comparison
            if sum_left < sum_right:
                sum_left += left_value + 1
                left_value += 1
            else:
                sum_right += right_value - 1
                right_value -= 1

            # Check for pivot condition
            if sum_left == sum_right and left_value + 1 == right_value - 1:
                return left_value + 1

        return -1  # Return -1 if no pivot is found
```

- Time complexity: O(n)
- Space complexity: O(1)

### Approach 3: Binary Search

```python
class Solution:
    def pivotInteger(self, n: int) -> int:
        # Initialize left and right pointers for binary search
        left, right = 1, n

        # Calculate the total sum of the sequence
        total_sum = n * (n + 1) // 2

        # Binary search for the pivot point
        while left < right:
            # Calculate the mid-point
            mid = (left + right) // 2

            # Check if the difference between the square of mid and the total sum is negative
            if mid * mid - total_sum < 0:
                left = mid + 1  # Adjust the left bound if the sum is smaller
            else:
                right = mid  # Adjust the right bound if the sum is equal or greater

        # Check if the square of the left pointer minus the total sum is zero
        if left * left - total_sum == 0:
            return left
        else:
            return -1
```

- Time complexity: O(log n)
- Space complexity: O(1)
