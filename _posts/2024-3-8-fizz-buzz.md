---
layout: single
title: "Problem of The Day: Fizz Buzz"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

![problem-412](/assets/images/2024-03-08_08-58-01-problem-412.png)

## Intuition

My initial thought is to iterate through the numbers from 1 to n and check their divisibility by 3 and 5 to determine whether they are multiples of both, only 3, only 5, or neither.

## Approach

I approach the problem by using a loop to iterate through the numbers from 1 to n. For each number, I check if it is divisible by both 3 and 5, in which case I append "FizzBuzz" to the result list. If it is divisible by only 3, I append "Fizz," and if it is divisible by only 5, I append "Buzz." Otherwise, I append the string representation of the number.

## Complexity

- Time complexity:
  O(n), where n is the input parameter representing the upper limit of the range.

- Space complexity:
  O(1) since the space required for the result list is not dependent on the input size.

## Code

```python
class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        res = []
        for i in range(1, n + 1):
            if i % 3 == 0 and i % 5 == 0:
                res.append("FizzBuzz")
            elif i % 3 == 0:
                res.append("Fizz")
            elif i % 5 == 0:
                res.append("Buzz")
            else:
                res.append(str(i))

        return res
```

## Editorial Solution

### Approach 1: Naive Approach

```python
class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        # ans list
        ans = []

        for num in range(1,n+1):

            divisible_by_3 = (num % 3 == 0)
            divisible_by_5 = (num % 5 == 0)

            if divisible_by_3 and divisible_by_5:
                # Divides by both 3 and 5, add FizzBuzz
                ans.append("FizzBuzz")
            elif divisible_by_3:
                # Divides by 3, add Fizz
                ans.append("Fizz")
            elif divisible_by_5:
                # Divides by 5, add Buzz
                ans.append("Buzz")
            else:
                # Not divisible by 3 or 5, add the number
                ans.append(str(num))

        return ans
```

### Approach 2: String Concatenation

```python
class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        # ans list
        ans = []

        for num in range(1,n+1):

            divisible_by_3 = (num % 3 == 0)
            divisible_by_5 = (num % 5 == 0)

            num_ans_str = ""

            if divisible_by_3:
                # Divides by 3
                num_ans_str += "Fizz"
            if divisible_by_5:
                # Divides by 5
                num_ans_str += "Buzz"
            if not num_ans_str:
                # Not divisible by 3 or 5
                num_ans_str = str(num)

            # Append the current answer str to the ans list
            ans.append(num_ans_str)

        return ans
```

### Approach 3: Hash it!

```python
class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        # ans list
        ans = []

        # Dictionary to store all fizzbuzz mappings
        fizz_buzz_dict = {3 : "Fizz", 5 : "Buzz"}

        # List of divisors which we will iterate over.
        divisors = [3, 5]

        for num in range(1, n + 1):

            num_ans_str = []

            for key in divisors:
                # If the num is divisible by key,
                # then add the corresponding string mapping to current num_ans_str
                if num % key == 0:
                    num_ans_str.append(fizz_buzz_dict[key])

            if not num_ans_str:
                num_ans_str.append(str(num))

            # Append the current answer str to the ans list
            ans.append(''.join(num_ans_str))

        return ans
```
