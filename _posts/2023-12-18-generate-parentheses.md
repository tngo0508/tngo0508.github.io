---
title: "Problem of The Day: Generate Parentheses"
date: 2023-12-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
Today, I attempted to do a more challenge problem. The problem belongs to the topic backtrack. 

# Problem Description:
Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.
```
Example 1:

Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]

Example 2:

Input: n = 1
Output: ["()"]
```

# My Explanation:
In this algorithm, I'm generating valid combinations of parentheses for a given number, `n`. I use backtracking to explore all possible combinations. The recursive function `backtrack` takes parameters: `i` to track the position in the combination, `open` to count the open parentheses, `n` for the target number, `result` to store valid combinations, and `curr` for the current combination being formed. 

The base cases ensure that the number of open parentheses is within bounds. 

If `i` reaches twice `n`, it checks if the combination is valid, and if so, adds it to the result. 

In each step, I iterate through possible parentheses `(` and `)` and explore the combinations by adjusting the count of open parentheses accordingly. The final result contains all valid combinations of parentheses for the given `n`.

# Python Solution:
```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        def backtrack(i, open, n, result, curr):
            if open > n or open < 0:
                return
            
            if i == n * 2:
                if open == 0:
                    result.append(''.join(curr))
                return

            for c in '()':
                if c == '(':
                    backtrack(i + 1, open + 1,  n, result, curr + [c])
                else:
                    backtrack(i + 1, open - 1, n, result, curr + [c])

        result = []
        backtrack(0, 0, n, result, [])
        return result
```

# ChatGPT version for improving my algorithm
## Pruning Unnecessary Paths:

Instead of iterating through both '(' and ')' in every step, you can prioritize the '(' when open < n and ')' when open > 0. This helps in pruning unnecessary paths early in the recursion.
```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        def backtrack(i, open_count, n, result, current):
            if open_count > n or open_count < 0:
                return

            if i == n * 2:
                if open_count == 0:
                    result.append(''.join(current))
                return

            for c in '()':
                if c == '(' and open_count < n:
                    backtrack(i + 1, open_count + 1, n, result, current + [c])
                elif c == ')' and open_count > 0:
                    backtrack(i + 1, open_count - 1, n, result, current + [c])

        result = []
        backtrack(0, 0, n, result, [])
        return result

```