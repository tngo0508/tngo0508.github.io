---
layout: single
title: "Problem of The Day: Rearrange Array Elements by Sign"
date: 2024-2-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2149](/assets/images/2024-02-13_21-10-32-problem-2149.png)](/assets/images/2024-02-13_21-10-32-problem-2149.png)

## Intuition

My initial thoughts are to use two separate queues to store positive and negative numbers separately. By alternately popping elements from these queues and appending them to the result list, we can achieve the desired arrangement.

## Approach

I will use two deques (double-ended queues) to separate positive and negative numbers. I'll iterate through the input array and enqueue positive numbers into one deque and negative numbers into another deque. After that, I'll start forming the result array by alternately dequeuing elements from the positive and negative deques.

I will handle the case where either the positive or negative deque is empty separately to ensure that the final arrangement follows the given rules.

## Complexity

- Time complexity:
  O(n), where n is the length of the input array. We iterate through the array once to enqueue elements into the deques, and then we iterate again to dequeue elements while forming the result array.

- Space complexity:
  O(n), as we use two deques to store positive and negative numbers separately, and the result array has the same length as the input array.

## Code

```python
class Solution:
    def rearrangeArray(self, nums: List[int]) -> List[int]:
        positives = deque()
        negatives = deque()
        for num in nums:
            if num < 0:
                negatives.append(num)
            else:
                positives.append(num)

        if not positives:
            return []

        res = [positives.popleft()]
        while positives and negatives:
            if res[-1] > 0:
                res.append(negatives.popleft())
            else:
                res.append(positives.popleft())

        res.extend(positives)
        res.extend(negatives)

        return res
```

## Editorial Solution

### Approach: Two Pointers

```python
class Solution:
    def rearrangeArray(self, nums: List[int]) -> List[int]:
        n = len(nums)

        # Initializing an answer array of size n
        ans = [0] * n

        # Initializing two pointers to track even and
        # odd indices for positive and negative integers respectively
        pos_index, neg_index = 0, 1

        for i in range(n):
            if nums[i] > 0:
                # Placing the positive integer at the
                # desired index in ans and incrementing pos_index by 2
                ans[pos_index] = nums[i]
                pos_index += 2
            else:
                # Placing the negative integer at the
                # desired index in ans and incrementing neg_index by 2
                ans[neg_index] = nums[i]
                neg_index += 2

        return ans
```

- Time complexity: O(n)
- Space complexity: O(n)
