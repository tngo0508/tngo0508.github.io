---
layout: single
title: "Problem of The Day: Assign Cookies"
date: 2024-1-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
```
Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie.

Each child i has a greed factor g[i], which is the minimum size of a cookie that the child will be content with; and each cookie j has a size s[j]. If s[j] >= g[i], we can assign the cookie j to the child i, and the child i will be content. Your goal is to maximize the number of your content children and output the maximum number.

 

Example 1:

Input: g = [1,2,3], s = [1,1]
Output: 1
Explanation: You have 3 children and 2 cookies. The greed factors of 3 children are 1, 2, 3. 
And even though you have 2 cookies, since their size is both 1, you could only make the child whose greed factor is 1 content.
You need to output 1.
Example 2:

Input: g = [1,2], s = [1,2,3]
Output: 2
Explanation: You have 2 children and 3 cookies. The greed factors of 2 children are 1, 2. 
You have 3 cookies and their sizes are big enough to gratify all of the children, 
You need to output 2.
```

# My Explanation and Approach
## Brute Force
I approached this problem with a brute force solution, employing two nested for-loops and a set to address the challenge. The fundamental idea was to sort both the greed factor array (g) and the size array (s). I iterated through the greed factor input, comparing each element with those in the size array. Sorting was crucial as the goal was to maximize the number of content children who could receive a cookie. Following a greedy algorithm, I prioritized providing cookies to children with smaller greed factors. The condition specified in the problem statement determined when to update my result variable. To prevent reusing the same element from the size array, I introduced a set called `used` to track the utilized cookies. Although this algorithm successfully handled small test cases, it encountered difficulties with very large datasets, ultimately leading to failure.

## Issue
The brute force approach, while correct, encounters a problem with larger datasets, leading to a "Time Limit Exceeded" error.

```python
# Time Limit Exceeded
class Solution:
    def findContentChildren(self, g: List[int], s: List[int]) -> int:
        result = 0
        used = set()
        for greed_factor in sorted(g):
            for i, size in enumerate(sorted(s)):
                if size >= greed_factor and i not in used:
                    result += 1
                    used.add(i)
                    break
        return result
```

## Improved Approach
To enhance the efficiency of the brute force approach, I introduced a variable called `start` to keep track of the index within the size array (s). The intention was to skip checking unqualified size elements that couldn't satisfy the children's content requirement. By doing this, I avoided unnecessary iterations through smaller-sized cookies if they were insufficient to satisfy the children. This adjustment significantly reduced the runtime of my algorithm.

```python
class Solution:
    def findContentChildren(self, g: List[int], s: List[int]) -> int:
        sorted_g = sorted(g)
        sorted_s = sorted(s)
        start = 0
        result = 0
        for i, val in enumerate(sorted_s):
            if val >= sorted_g[0]:
                start = i
                break
        
        for greed_factor in sorted_g:
            for i in range(start, len(sorted_s)):
                if sorted_s[i] >= greed_factor:
                    result += 1
                    start = i + 1
                    break
        
        return result
```
# Leet Code Solution
```python
class Solution:
    def findContentChildren(self, g: List[int], s: List[int]) -> int:
        g.sort()
        s.sort()
        content_children = 0
        cookie_index = 0
        while cookie_index < len(s) and content_children < len(g):
            if s[cookie_index] >= g[content_children]:
                content_children += 1
            cookie_index += 1
        return content_children
```
# For Future Me
For the future version of myself, envision life as an exciting adventure where you play the role of the main character. Embrace the narrative of your journey and seize each moment. Life is too brief to dwell on overthinking and squandering precious time. Embrace the spontaneity and vibrancy of your story.