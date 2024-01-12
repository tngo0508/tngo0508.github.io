---
layout: single
title: "Problem of The Day: Determine if String Halves Are Alike"
date: 2024-1-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement

```
You are given a string s of even length. Split this string into two halves of equal lengths, and let a be the first half and b be the second half.

Two strings are alike if they have the same number of vowels ('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'). Notice that s contains uppercase and lowercase letters.

Return true if a and b are alike. Otherwise, return false.

 

Example 1:

Input: s = "book"
Output: true
Explanation: a = "bo" and b = "ok". a has 1 vowel and b has 1 vowel. Therefore, they are alike.
Example 2:

Input: s = "textbook"
Output: false
Explanation: a = "text" and b = "book". a has 1 vowel whereas b has 2. Therefore, they are not alike.
Notice that the vowel o is counted twice.
 

Constraints:

2 <= s.length <= 1000
s.length is even.
s consists of uppercase and lowercase letters.
```

# Intuition
The goal is to determine if the two halves of the given string have an equal number of vowels. To achieve this, the approach involves iterating through the string from both ends simultaneously, counting the number of vowels on each side.

# Approach
I maintain two pointers, `l` and `r`, starting from the beginning and end of the string, respectively. I also have a set of vowels for easy checking. While iterating towards the center (`l < r`), I increment the count of vowels for the left and right halves. The final step involves comparing the counts to check if they are equal.

# Complexity
- Time complexity:
O(n), where n is the length of the input string. The algorithm iterates through the string once, and each step involves constant time operations.

- Space complexity:
O(1), as the space used is independent of the input size. The set of vowels is of constant size, and a few variables are used for counting.

# Code
```python
class Solution:
    def halvesAreAlike(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        vowels = ('a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U')
        left = right = 0
        while l < r:
            left += s[l] in vowels
            right += s[r] in vowels
            l += 1
            r -= 1
        return left == right
```

# Editorial Code
```python
class Solution:
    def halvesAreAlike(self, s: str) -> bool:

        def countVowel(start, end, s):
            answer = 0
            for i in range(start, end):
                if s[i] in "aieouAIEOU":
                    answer += 1
            return answer

        n = len(s)

        return countVowel(0, n//2, s) == countVowel(n//2, n, s)
```