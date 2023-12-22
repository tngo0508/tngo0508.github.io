---
title: "Problem of the day: Combination Sum"
date: 2023-12-22
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
Today, I continue practicing solving Leet Code problems. I tackle the [Top 100 Liked](https://leetcode.com/studyplan/top-100-liked/) on the Backtracking topic again. Problem of the day is called Combination Sum. And here is the description of this problem.

# Problem Description:
>Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target. You may return the combinations in any order.
>
>The same number may be chosen from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.
>
>The test cases are generated such that the number of unique combinations that sum up to target is less than 150 combinations for the given input.
```
Example 1:

Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation:
2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
7 is a candidate, and 7 = 7.
These are the only two combinations.
Example 2:

Input: candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]
Example 3:

Input: candidates = [2], target = 1
Output: []
```

# My Solution and Explanation:
Since the prompt of the problem asks for the combination, I automatically think of the exhaustive search approach. This is because in order to generate all the combination, I need to try all possible combination. That means that I have to try all candidates repeatedly. And, the algorithm can help me to accomplish is backtracking. The idea is that I start at the beginning index of the input array `candidates`. Then, I recursively call the helper function `backtrack` which is passed in a few parameters to keep track of the potential solution and final solution.

For recursive function such as backtrack, I usually think of two cases: base case and recursive case. Normally, I always start with recursive case because it seems come to me naturally and it seems if I start with recursive case, it helps me to know how to traverse or search for the solution in the search space. 

With that said, I start with recursive case. For my recursive case, I attempt to use a `for-loop` statement to invoke my `backtrack` function recursively. Every time that I invoke this function, I think about two scenarios. Should I keep the current number or should I skip it or try the next candidate? In order to translate this thought into code. I just need to pass the argument `index` and `index + 1`. The purpose of `index` is to keep try to add the same number to see if it can reach the `target` or not. And the purpose of `index + 1` is to try the next candidates.

## Initial Solution
At first, my algorithm was able to pass the base test cases. But, when I submitted the solution, it failed due to the Time Limit. This tells me that my solution could be improved.

```python
# Time Limit Exceeded
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        def backtrack(index, cands, result, curr, target):
            if sum(curr) == target:
                soln = sorted(curr)
                if soln not in result:
                    result.append(soln)
                return
            
            if index == len(cands) or sum(curr) > target:
                return

            for i in range(index, len(cands)):
                backtrack(index, cands, result, curr + [cands[i]], target)
                backtrack(index + 1, cands, result, curr + [cands[i]], target)

        result = []
        backtrack(0, candidates, result, [], target)
        return result
```

So, I decided to take a step back and consider my solution for some time. I realized that there are a few holes in my solution that can be addressed immediately. First of all, I didn't think carefully when implementing it. The `for-loop` above did not perform the operation as I expected. So I refined it properly this time. Basically, the `for-loop` that I wrote already going from the current `index` to the end of input array `candidates` already. I don't need to call the helper function on `index + 1`. This is redundant. Every time, I invoke `backtrack` on the index `i`. It would continue try the same number again anyway. Secondly, to avoid the duplicate solutions, I transformed the `candidates` list into set so that it only contains the unique numbers. This helps me to avoid the sorting and checking if the solution already exists in my final solution.

## Optimized Solution
```python
# My improved solution
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        def backtrack(index, cands, result, curr, target):
            if sum(curr) == target:
                result.append(curr)
                return
            
            if index >= len(cands) or sum(curr) > target:
                return

            for i in range(index, len(cands)):
                # Recursive calls to explore combinations
                backtrack(i, cands, result, curr + [cands[i]], target)


        candidates = list(set(candidates))
        result = []
        backtrack(0, candidates, result, [], target)
        return result
```

## Alternative Solution
But why do I stop here? I spent some time to figure out if there is another way to solve this problem. And I came up with the following solution. As I explained above, the initial solution did not clearly translate my thought into code. But the following does exactly what I expected. The idea is the same as mentioned above. When I reach a number, I have two choice: keep it or ignore it and move on next candidate.

```python
# My other solution
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        def backtrack(index, cands, result, curr, target):
            if sum(curr) == target:
                result.append(curr)
                return
            
            if index >= len(cands) or sum(curr) > target:
                return

            backtrack(index, cands, result, curr + [cands[index]], target)
            backtrack(index + 1, cands, result, curr, target)

        candidates = list(set(candidates))
        result = []
        backtrack(0, candidates, result, [], target)
        return result
```

# Leet Code Solution
Finally, this is the solution that Leet Code posted on their website.


```python
# Leet Code - Editorial Solution
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:

        results = []

        def backtrack(remain, comb, start):
            if remain == 0:
                # make a deep copy of the current combination
                results.append(list(comb))
                return
            elif remain < 0:
                # exceed the scope, stop exploration.
                return

            for i in range(start, len(candidates)):
                # add the number into the combination
                comb.append(candidates[i])
                # give the current number another chance, rather than moving on
                backtrack(remain - candidates[i], comb, i)
                # backtrack, remove the number from the combination
                comb.pop()

        backtrack(target, [], 0)

        return results
```