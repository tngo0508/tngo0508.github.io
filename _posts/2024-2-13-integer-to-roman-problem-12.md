---
layout: single
title: "Problem of The Day: Integer to Roman"
date: 2024-2-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Daily Coding
---

## Problem Statement

[![problem-12](/assets/images/2024-02-13_23-11-43-problem-12.png)](/assets/images/2024-02-13_23-11-43-problem-12.png)

## Intuition

My initial thoughts are to use a hash map to store the mapping between integers and their corresponding Roman numerals. Additionally, I need to consider special cases where subtraction is involved, such as IV for 4 or IX for 9.

## Approach

I will create a hash map containing the integer values as keys and their Roman numeral counterparts as values. To handle special cases like 4, 9, 40, 90, etc., I will include those entries in the hash map. I will also keep a list of sorted keys for easy iteration.

I will then iterate through the sorted keys and subtract the largest possible value from the given number in each iteration while updating the result string with the corresponding Roman numeral. I will repeat this process until the number becomes zero.

## Complexity

- Time complexity:
Since the input space (integers from 1 to 3999) is finite, the while loop will iterate a constant number of times, making the time complexity effectively O(1)

- Space complexity:
O(1) as the hash map and sorted values are fixed and do not scale with the input.

## Code

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        hash_map = {
            1: 'I',
            5: 'V',
            10: 'X',
            50: 'L',
            100: 'C',
            500: 'D',
            1000: 'M',
            4: 'IV',
            9: 'IX',
            40: 'XL',
            90: 'XC',
            400: 'CD',
            900: 'CM'
        }
        values = sorted(hash_map.keys())
        res = []
        while num > 0:
            i = 0
            k = values[0]
            while i < len(values) and num >= values[i]:
                k = values[i]
                i += 1

            num -= k            
            res.append(hash_map[k])

        return ''.join(res)            

            

```
