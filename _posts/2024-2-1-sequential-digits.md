---
layout: single
title: "Problem of The Day: Sequential Digits"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

# Problem Statement
```
An integer has sequential digits if and only if each digit in the number is one more than the previous digit.

Return a sorted list of all the integers in the range [low, high] inclusive that have sequential digits.

 

Example 1:

Input: low = 100, high = 300
Output: [123,234]
Example 2:

Input: low = 1000, high = 13000
Output: [1234,2345,3456,4567,5678,6789,12345]
 

Constraints:

10 <= low <= high <= 10^9
```

My note:
[![note](/assets/images/2024-02-01_16-39-31-problem-1291-note.png)](/assets/images/2024-02-01_16-39-31-problem-1291-note.png)

# Intuition
I want to generate all possible sequential digits between the given low and high range. Starting with single-digit numbers, I'll iteratively generate the next sequential digits using Breadth-First Search (BFS) to explore the possibilities.

# Approach
I'm using a deque (double-ended queue) to efficiently perform BFS. I start with the digits 1 to 9, enqueue them, and then iteratively dequeue and generate the next sequential digit by appending the next digit to the current number. I continue this process until I reach a number greater than the high limit.

# Complexity
- Time complexity:
O(n), where n is the number of sequential digits generated within the specified range.

- Space complexity:
O(n), where n is the number of sequential digits generated within the specified range. In practice, the space used by the deque will be less than this maximum, but it still grows linearly with the size of the output.

# Code
```python
class Solution:
    def sequentialDigits(self, low: int, high: int) -> List[int]:
        queue = deque()
        for i in range(1, 10):
            queue.append(i)
        
        res = []
        while queue:
            num = queue.popleft()
            if num > high:
                break
            if num >= low:
                res.append(num)
            if (num % 10) + 1 <= 9:
                next_num = (num * 10) + ((num % 10) + 1)
                queue.append(next_num)
            
        return res

```

# Editorial Solution
Approach 1: Sliding Window
```python
class Solution:
    def sequentialDigits(self, low: int, high: int) -> List[int]:
        sample = "123456789"
        n = 10
        nums = []

        for length in range(len(str(low)), len(str(high)) + 1):
            for start in range(n - length):
                num = int(sample[start: start + length])
                if num >= low and num <= high:
                    nums.append(num)
        
        return nums
```

- Time complexity: O(1) The length of the sample string is 9, and the lengths of low and high are between 2 and 9. Hence the nested loops are executed no more than 8×8=64 times.
- Space complexity: O(1) to keep not more than 36 integers with sequential digits.