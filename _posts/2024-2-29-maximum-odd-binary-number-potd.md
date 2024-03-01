---
layout: single
title: "Problem of The Day: Maximum Odd Binary Number"
date: 2024-2-29
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-2864](/assets/images/2024-02-29_18-15-21-problem-2864.png)](/assets/images/2024-02-29_18-15-21-problem-2864.png)

## Intuition

The problem requires finding the maximum odd binary number by flipping at most one '0' bit. To maximize the value, it's intuitive to set the rightmost '1' bit and then try to set as many '1' bits to the left of it as possible.

## Approach

 begin by counting the occurrences of '1' in the given binary string `s` using a Counter. If there is at least one '1' in the string, I proceed to construct the maximum odd binary number.

I initialize a result list `res` of the same length as the input string, filled with '0'. I set the rightmost bit of `res` to '1' since it's the least significant bit in an odd binary number. I then iterate through the string to set as many '1' bits to the left as possible, reducing the count of available '1' bits in the Counter.

If there are no '1' bits in the string, I return the original string as it is already an even binary number

## Complexity

- Time complexity:
O(n), where n is the length of the input string `s`. The algorithm iterates through the string once.

- Space complexity:
O(n), where n is the length of the input string `s`. The space is used for the result list.

## Code

```python
class Solution:
    def maximumOddBinaryNumber(self, s: str) -> str:
        counter = Counter(s)
        if counter['1'] > 0:
            N = len(s)
            res = ['0'] * N
            res[-1] = '1'
            counter['1'] -= 1
            i = 0
            while counter['1'] > 0:
                res[i] = '1'
                counter['1'] -= 1
                i += 1
            return ''.join(res)
        return s
```

## Editorial Solution

### Approach 1: Greedy Bit Manipulation (Sorting and Swapping)

```python
class Solution:
    def maximumOddBinaryNumber(self, s: str) -> str:

        arr = sorted(s)

        # Reverse order for the first N - 1 elements of the array
        # Because we want to keep a 1 at the last index
        # The last element of the array is index N - 1, the second the last is at N - 2
        secondLast = len(arr) - 2
        for i in range(len(arr) // 2):
            arr[i], arr[secondLast - i] = arr[secondLast - i], arr[i]

        # Return result
        return "".join(arr)
```

- Time complexity: O(nlogn)
- Space complexity: O(n)

### Approach 2: Greedy Bit Manipulation (Counting Ones)

```python
class Solution:
    def maximumOddBinaryNumber(self, s: str) -> str:
        # Get n and ones_cnt
        n = len(s)
        ones_cnt = s.count('1')

        # Construct the resulting string
        return '1' * (ones_cnt - 1) + '0' * (n - ones_cnt) + '1'
```

- Time complexity: O(n)
- Space complexity: O(n)

### Approach 3: Greedy Bit Manipulation (One Pass with Two Pointers)

```python
class Solution:
    def maximumOddBinaryNumber(self, s: str) -> str:
        # Get n and char array
        N = len(s)
        arr = [char for char in s]

        left = 0
        right = N - 1
        while left <= right:
            
            # Increment left if equals 1
            if arr[left] == '1':
                left += 1
            # Decrement right if equals 0
            if arr[right] == '0':
                right -= 1
            # Swap if neither pointer can be iterated
            if left <= right and arr[left] == '0' and arr[right] == '1':
                arr[left] = '1'
                arr[right] = '0'
        
        # Swap rightmost 1 bit to the end
        arr[left - 1] = '0'
        arr[N - 1] = '1'

        return "".join(arr)
```
