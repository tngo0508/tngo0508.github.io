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
For this question, I started with the brute force approach which use two nested `for-loop` and a `set` to solve the problem. The basic idea is to sort both array and go through the `g` or greed factor input and compare with each element in the `s` or size input array. I need to sort the arrays because the question asked to maximize the number of content children that we can provide cookie. For this, I thought about the greedy algorithm and thought about sorting the arrays first in order to provide the cookie to content the children with small greed factor. This way, it would help to maximize the return or output value. I used the condition proposed in the description to check if I should update my return `result`. To avoid re-using the same element of the `s` array, I attempted to use `used` set to track for the cookie that I have used. With that said, my algorithm could run and pass all the small test cases except it failed for the very large data set.

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
To improve the brute force, I used the variable called `start` to track the index of the element in `s` or size array. The purpose is to ignore the checking for unqualified size element that do not satisfy the content of the children. There is no need to go through the smaller size cookies if they are not big enough to gratify the children. This way it helps to reduce my algorithm's runtime significantly.

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
