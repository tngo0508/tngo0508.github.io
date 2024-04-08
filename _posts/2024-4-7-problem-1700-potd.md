---
layout: single
title: "Problem of The Day: Number of Students Unable to Eat Lunch"
date: 2024-4-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-1700](/assets/images/2024-04-07_18-50-41-problem1700.png)

## Intuition

Intuition
Initially, I'm thinking of using a queue to represent the line of students and a stack to represent the sandwiches. We can simulate the process of students taking sandwiches one by one and check if they match the preference.

## Approach

I will use a `deque` as a queue to represent the line of students and reverse the sandwiches list to use it as a stack. Then, I'll iterate over the queue, checking if the student's sandwich preference matches the top sandwich in the stack. If it does, I'll remove the sandwich from the stack, indicating that the student got their preferred sandwich. If it doesn't match, I'll move the student to the end of the queue. I'll continue this process until all students either get their preferred sandwich or the queue remains unchanged after an iteration, indicating that some students couldn't get their preferred sandwich.

## Complexity

- Time complexity:
  O(n)

- Space complexity:
  O(n)

## Code

```python
class Solution:
    def countStudents(self, students: List[int], sandwiches: List[int]) -> int:
        queue = deque(students)
        stack = sandwiches[::-1]
        while True:
            N = len(queue)
            take = False
            for _ in range(N):
                student = queue.popleft()
                if student == stack[-1]:
                    stack.pop()
                    take = True
                    break
                queue.append(student)

            if not take:
                return len(queue)

        return 0

```

## Editorial Solution

Approach 2: Counting

```python
class Solution:
    def countStudents(self, students: List[int], sandwiches: List[int]) -> int:
        circle_student_count = 0
        square_student_count = 0

        # Count the number of students who want each type of sandwich
        for student in students:
            if student == 0:
                circle_student_count += 1
            else:
                square_student_count += 1

        # Serve sandwiches to students
        for sandwich in sandwiches:

            # No student wants the circle sandwich on top of the stack
            if sandwich == 0 and circle_student_count == 0:
                return square_student_count

            # No student wants the square sandwich on top of the stack
            if sandwich == 1 and square_student_count == 0:
                return circle_student_count

            # Decrement the count of the served sandwich type
            if sandwich == 0:
                circle_student_count -= 1
            else:
                square_student_count -= 1

        # Every student received a sandwich
        return 0
```

- Time complexity: O(n + m)
- Space complexity: O(1)
