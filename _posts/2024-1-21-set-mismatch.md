---
layout: single
title: "Problem of The Day: Set Mismatch"
date: 2024-1-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
You have a set of integers s, which originally contains all the numbers from 1 to n. Unfortunately, due to some error, one of the numbers in s got duplicated to another number in the set, which results in repetition of one number and loss of another number.

You are given an integer array nums representing the data status of this set after the error.

Find the number that occurs twice and the number that is missing and return them in the form of an array.

 

Example 1:

Input: nums = [1,2,2,4]
Output: [2,3]
Example 2:

Input: nums = [1,1]
Output: [1,2]
 

Constraints:

2 <= nums.length <= 10^4
1 <= nums[i] <= 10^4
```
# Intuition
My initial thoughts on solving this problem involve using a set to keep track of seen numbers and identifying the repeated element. 

# Approach
 would iterate through the given list, checking for duplicates using a set. Once a duplicate is found, I would add it to the result. Additionally, I would iterate through the range of expected numbers and identify the missing element, appending it to the result.

# Complexity
- Time complexity:
O(n), where n is the length of the input list. 

- Space complexity:
O(n), as I use a set to store seen numbers

# Code
```python
class Solution:
    def findErrorNums(self, nums: List[int]) -> List[int]:
        res = []
        seen = set()
        for i, num in enumerate(nums):
            if num in seen:
                res.append(num)
            seen.add(num)
        for i in range(1, len(nums) + 1):
            if i not in seen:
                res.append(i)
                break
        return res

            
```

# Editorial Solution
This approach utilizes the positivity of all elements in the given `nums` array, ranging from 1 to n. By inverting the sign of the element at the index corresponding to the picked number, we can detect duplicates when encountering a negative value. After this inversion process, if all elements are negative, there are no missing numbers. However, if a positive element is found at index `j`, it indicates the absence of the number `j`. This approach eliminates the need for additional space, providing an efficient solution.
```java
public class Solution {
    public int[] findErrorNums(int[] nums) {
        int dup = -1, missing = 1;
        for (int n: nums) {
            if (nums[Math.abs(n) - 1] < 0)
                dup = Math.abs(n);
            else
                nums[Math.abs(n) - 1] *= -1;
        }
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] > 0)
                missing = i + 1;
        }
        return new int[]{dup, missing};
    }
}
```

- Time complexity: O(n)
- Space complexity: O(1)