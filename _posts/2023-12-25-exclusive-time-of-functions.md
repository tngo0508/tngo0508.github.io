---
title: "I failed the IBM assessment today, but I am not giving up yet"
date: 2023-12-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
# Failed IBM Assessment
Today, I attempted to take another coding assessment for the Frontend role at IBM. At first, I thought the questions were simple like the first three times that I took a few weeks ago. But I was totally wrong. For this time, the assessment includes two questions but different difficulty level. It is fairly harder than the three previous attempts that I have done. The first coding challenge is the algorithm questions about a medium question on Leet code. The second one is about the frontend knowledge. I completely screwed up this assessment since I could not even solve the first question. After the assessment, I felt pretty bad and thought about giving up on the software engineer career path. However, I decided to go back to the problem and tried to solve on my own.

The total time of this assessment is only 45 minutes. But, when I came back to attempt to figure out the first question. It took me more than 2 hours to understand and find the solution. I was still not able to solve it until looking at other people's solution on the forum. I studied their ideas and tried to write the implementation based on my understanding. So, this is the [problem](https://leetcode.com/problems/exclusive-time-of-functions/) and here is my explanation for solution.

# My Explanation
Basically, I go through the input list and use built-in function `split()` from python library to tokenize each string element. I utilized the stack axillary data structure to keep track of the **pre-empted** function calls from the input `logs` list. Every time, I counter the log that contains the word `start`, I know that I need to append it to the stack. The reason is because the stack follows the LIFO style or Last In First Out. This characteristic of the stack is helpful to this kind of problem due to the fact that we want to know which function or process is being executed and once it's done, we need to somehow subtract that time from the previous function called.

The algorithm lays out as the following:
- First, we allocate two things: the `stack` and return array `result`
- We use for-loop to go through the input list
- At each iteration, we split the string into three parts: `function_id`, `tag`, and `timestamp`
  - whenever, we encounter the keyword `start`, we will append it to the stack as a pair of `function_id`, and `timestamp`
  - otherwise, we need to calculate the period of time for the current `function_id`. After that, we need to check if the stack is empty or not. The reason is because we want to subtract the period of time of the current function call from the previous function call. This way it helps us to find the exclusive time.

With that being said, this is my code for the solution

```python
class Solution:
    def exclusiveTime(self, n: int, logs: List[str]) -> List[int]:
        stack = []
        result = [0] * n
        for log in logs:
            func_id, tag, timestamp = log.split(':')
            timestamp = int(timestamp)
            func_id = int(func_id)
            if tag == 'start':
                stack.append([func_id, timestamp])
            else:
                curr_id, curr_timestamp = stack.pop()
                time = timestamp - curr_timestamp + 1
                result[curr_id] += time
                if stack:
                    top_id, top_timestamp = stack[-1]
                    result[top_id] -= time
        return result
```

# For Future Me
Today's setback is tomorrow's strength. Adversity shapes character. Keep pushing, stay resilient. Your breakthrough is just around the corner. Don't give up!