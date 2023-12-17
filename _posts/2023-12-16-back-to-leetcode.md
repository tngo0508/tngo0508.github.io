---
# layout: single
title: "Back To Leetcode Grinding"
date: 2023-12-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
classes: wide
---
# Restarting the LeetCode Journey
Today marks the beginning of my renewed commitment to daily LeetCode practice. I've set a goal to solve at least one problem consistently each day, starting with the Top 100 Liked Problems. To maximize the learning experience, I've decided to document my solutions, including explanations and notes. This dual approach not only helps me articulate my thought process but also aims to enhance my communication skills for future technical interviews. The ultimate objective is to sharpen my problem-solving abilities and prepare effectively for technical challenges.

# Problem of the Day: Letter Combinations of a Phone Number
## Description
Given a string containing digits from 2-9 inclusive, the task is to return all possible letter combinations that the number could represent. The output should be in any order, considering the mapping of digits to letters on a telephone keypad.

## Example
Input: "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

Input: digits = ""
Output: []
Example 3:

Input: digits = "2"
Output: ["a","b","c"]

# My solution

To solve this problem, I utilized a hash map data structure to map numbers to characters. Employing backtracking as a method to traverse the map, I treated the hash map as a graph represented in an adjacency list. The recursive `backtrack` function efficiently explores the possible combinations.

The strategy to tackle this problem involves leveraging a hash map data structure to establish a mapping between numbers and characters. The key technique is to utilize the backtracking method, treating the hash map as a graph represented in the form of an adjacency list.

Here's a breakdown of the approach:

1. **Traversal Initialization:**
Begin by starting at the first index in the given input digits.
2. **Character Mapping:**
For each index, retrieve the current number and use the hash map to obtain the corresponding characters.
3. **Invocation of Helper Function (Backtrack):**
Invoke the helper function, passing crucial parameters:
The first parameter is `index + 1` to access the next element in the given inputs.
Alongside the index parameter, pass the current solution or candidate for the final solution.
4. **Base Condition:**
The base condition checks for `index == len(digits)`.
If this condition is met, the recursion stops.
Additionally, ensure that the current solution is not empty (`curr`) before appending it to the result.
This systematic approach effectively navigates the map and generates the desired combinations. It forms the core of the backtracking solution, providing a structured and efficient way to solve the problem.


```python
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        number_map = {
            '1': '',
            '2': 'abc',
            '3': 'def',
            '4': 'ghi',
            '5': 'jkl',
            '6': 'mno',
            '7': 'pqrs',
            '8': 'tuv',
            '9': 'wxyz',
            '0': '',
        }
        def backtrack(number_map, digits, result, index, curr):
            if index == len(digits):
                if curr:
                    result.append(curr[:])
                return

            digit = digits[index]
            for c in number_map[digit]:
                backtrack(number_map, digits, result, index + 1, curr + c)

        result = []
        backtrack(number_map, digits, result, 0, "")
        return result
```

# Reflection on Today's Practice
Taking a step toward consistent problem-solving is crucial during challenging times. Documenting my solutions not only reinforces my understanding but also contributes to a systematic review of previously solved problems.

# For Future Me
In the midst of this recession, remember: Every setback is a setup for a comeback. Keep pushing forward, stay resilient, and don't lose faith in your journey. The right opportunity is on the horizon—persevere, and the door will open for us. Your determination will pave the way to success.