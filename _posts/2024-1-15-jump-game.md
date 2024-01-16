# Intuition
The given problem involves finding the minimum number of jumps required to reach the end of an array. The approach involves using a depth-first search (DFS) with memoization to explore possible jumps at each index.

# Approach
I am using a recursive DFS approach to explore all possible jumps from the current index. Memoization is employed to avoid redundant computations and improve the overall efficiency. The base case is when the current index is greater than or equal to the last index, indicating that we have reached or exceeded the end of the array. The recursive calls explore different jump options, and the minimum number of jumps is calculated.

# Complexity
- Time complexity:
The time complexity is O(2^n), where 'n' is the length of the input array 'nums'. This is because, at each index, the algorithm can make up to 'nums[index]' jumps, leading to an exponential number of recursive calls.

- Space complexity:
The space complexity is determined by the memoization dictionary, which stores the results of subproblems. In the worst case, we might have an entry for each index, resulting in a space complexity of O(n)

# Code
```python
class Solution:
    def jump(self, nums: List[int]) -> int:
        memo = defaultdict()
        def dfs(index):
            if index >= len(nums) - 1:
                return 0

            if index in memo:
                return memo[index]

            steps = nums[index]
            num_of_jumps = float('inf')
            for i in range(steps, 0, -1):
                num_of_jumps = min(num_of_jumps, dfs(index + i) + 1)
            memo[index] = num_of_jumps
            return num_of_jumps

        return dfs(0)
```

# Editorial Solution
Greedy Approach
```python

class Solution:
    def jump(self, nums: List[int]) -> int:
        # The starting range of the first jump is [0, 0]
        answer, n = 0, len(nums)
        cur_end, cur_far = 0, 0
        
        for i in range(n - 1):
            # Update the farthest reachable index of this jump.
            cur_far = max(cur_far, i + nums[i])

            # If we finish the starting range of this jump,
            # Move on to the starting range of the next jump.
            if i == cur_end:
                answer += 1
                cur_end = cur_far
                
        return answer
```

Let `n` be the length of the input array `nums`.

- Time complexity: O(n)

We iterate over `nums` and stop at the second last element. In each step of the iteration, we make some calculations that take constant time. Therefore, the overall time complexity is O(n).

- Space complexity: O(1)

In the iteration, we only need to update three variables, `curEnd`, `curFar` and `answer`, they only take constant space.