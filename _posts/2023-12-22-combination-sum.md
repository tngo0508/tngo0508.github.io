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
When tackling the Combination Sum problem, I approached it with an exhaustive search using backtracking. I began by recognizing the need to explore all possible combinations, making backtracking an appropriate algorithmic choice. The recursive nature of backtracking allows for a systematic exploration of the solution space.

## Recursive Case First:
In recursive functions like `backtrack`, I find it intuitive to start with the recursive case. This approach helps me understand how the solution traverses or searches within the problem space.

## Utilizing a For-Loop for Recursive Calls:
For the recursive case, I employed a `for-loop` statement to invoke the `backtrack` function recursively. Each invocation of this function considers two scenarios: whether to include the current number or to skip it and move on to the next candidate.

## Two Scenarios: Keep or Skip:
To handle the two scenarios of keeping the current number or skipping it, I passed the arguments `index` and `index + 1` to the backtrack function. The `index` parameter allows trying to add the same number multiple times to see if it can contribute to reaching the target. On the other hand, `index + 1` is used to explore the next candidates in the list.

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

While my initial algorithm successfully handled the base test cases, it encountered a Time Limit Exceeded error upon submission. This outcome signals a need for optimization to enhance the efficiency of the solution.

## Acknowledging the Limitation:
The failure to pass the time limit indicates that the algorithm may not scale well for larger input sizes or edge cases. It prompts me to reconsider the design and execution of the solution to make it more time-efficient.

## Reflecting on the Initial Solution:
Upon reflection, I identified certain aspects that could be refined to address the performance issue. Specifically, the loop logic and duplicate checking were potential areas for improvement.

## Improved Loop Logic:
Refining the loop logic to eliminate redundancy and unnecessary recursive calls can contribute to a more streamlined and faster execution. In the revised solution, the loop is adjusted to traverse the candidates more efficiently, reducing unnecessary computations.

## Handling Duplicates More Effectively:
To prevent duplicate solutions, I transformed the `candidates` list into a set. This approach ensures that only unique numbers are considered, eliminating the need for sorting and duplicate checks. This adjustment contributes to a more efficient and concise solution.

## Revised Solution
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

The optimization process highlights the importance of carefully considering loop structures, duplicate handling, and the overall algorithmic design. By addressing these aspects, the revised solution aims to deliver improved performance while maintaining the core backtracking approach.

## Exploration of Alternative Solution:
My journey didn't conclude with the initial solution; I invested time in exploring alternative approaches to solving the Combination Sum problem. The goal was to discover a method that not only aligns with the conceptual understanding but also translates seamlessly into code. The following solution represents an alternative implementation that captures the essence of making choices at each number encountered.

## Embracing Two Choices: Keep or Skip
In this alternative solution, I continued with the idea of having two choices when encountering a number: keeping it in the current combination or skipping it and moving on to the next candidate. This dual-choice strategy aligns with the backtracking paradigm, allowing for a systematic exploration of the solution space.

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
This alternative solution reinforces the flexibility of the backtracking approach, where the essence lies in making choices at each step. By explicitly incorporating the two choices within the code, the solution becomes more intuitive and closely mirrors the thought process.

The exploration of alternatives not only provides a different perspective on problem-solving but also enhances the understanding of the underlying concepts. This iterative and open-minded approach to refining solutions contributes to a deeper mastery of algorithmic techniques.

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

# For Future Me
It's time to step up. You've spent too much time idling in the past. Now, work tenfold harder than others. Leverage may not be on your side, but consistency is your ally. No excuses, no rest. Rise above the challenges and make every moment count.