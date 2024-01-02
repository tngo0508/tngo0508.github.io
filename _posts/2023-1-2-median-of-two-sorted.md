---
layout: single
title: "Problem of The Day: Median of Two Sorted Arrays"
date: 2024-1-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Top 100 Liked
---
Today, I tackled a challenging problem from the Top 100 Liked Problem List. It proved to be quite difficult, and despite my best efforts, I couldn't arrive at a solution independently. I ended up resorting to the Editorial solution to grasp the algorithm.

In reflecting on this experience, I decided to write my own explanation of the solution. This exercise serves two purposes: to reinforce my understanding of the approach and to create a resource for future reference, aiding me in revisiting and solving similar problems on my own.

# Problem Statement

```
Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example 1:

Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
Example 2:

Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
```


# My Explanation
The trick to solve this question is to figure out how to discard the half of the portion in either array `A` or array `B`. 

To achieve this, we shall visualize the array in three different parts.
```
A = [     A-left        , A-mid,          A-right     ]
B = [     B-left        , B-mid,          B-right     ]
```

And what we already knew is that
```
A-left <= A-mid <= A-right
B-left <= B-mid <= B-right
```

Based on this, we could derive further information. Assume that `A-mid <= B-mid`.
```
A-left < A-right, B-right

And

A-left,B-left < B-right
``` 

In addition, if we merge the two arrays into one, we will get the a mixed of A-left, A-right, B-left, and B-right. However, there will be an invisible boundary that separate the A-left from A-right and B-right
```
In the following, 
a = data in A-left
b = data in B-left
aa = data in A-right
bb = data in B-right 
                                           |
Merged Array = [a, a, a, b, b, a, b, a ...,|aa, bb, aa, bb, ...] (sorted)
                                           |
```
We could use leverage this knowledge to help us discard or cut the search space in half to reduce the runtime efficiency to meet the requirement O(log(m + n)).

Basically, we calculate the middle indices in both array `A` and array `B`. If the middle index that we are looking for, say `k`, is larger than half of the number of elements in our merge sorted array, we can safely discard the smaller left half and vice versa. That means that we are going to use the condition to make the comparison and decide which parts to throw away.

```python
# Get the middle indexes and middle values of A and B.
a_index, b_index = (a_start + a_end) // 2, (b_start + b_end) // 2
a_value, b_value = A[a_index], B[b_index]

# If k is in the right half of A + B, remove the smaller left half.
if a_index + b_index < k:
    if a_value > b_value:
        return solve(k, a_start, a_end, b_index + 1, b_end)
    else:
        return solve(k, a_index + 1, a_end, b_start, b_end)
# Otherwise, remove the larger right half. 
else:
    if a_value > b_value:
        return solve(k, a_start, a_index - 1, b_start, b_end)
    else:
        return solve(k, a_start, a_end, b_start, b_index - 1)
```

Also, since this is a recursive function, we need the base case to terminate the execution and return the result for edge cases. We need the add the following check statements.

```python
# If the segment of on array is empty, it means we have passed all
# its element, just return the corresponding element in the other array.
if a_start > a_end: 
    return B[k - a_start]
if b_start > b_end: 
    return A[k - b_start]
```

Last and not least, because the total number of the array could be even or odd. Depends on the situation, we need to calculate the median accordingly. To implement this elegantly, we shall apply the following snippet code to make the code looks clean and elegant.

```python
if n % 2:
    return solve(n // 2, 0, na - 1, 0, nb - 1)
else:
    return (solve(n // 2 - 1, 0, na - 1, 0, nb - 1) + solve(n // 2, 0, na - 1, 0, nb - 1)) / 2
```

# Leet Code Solution

```python
class Solution:
    def findMedianSortedArrays(self, A: List[int], B: List[int]) -> float:
        na, nb = len(A), len(B)
        n = na + nb
        
        def solve(k, a_start, a_end, b_start, b_end):
            # If the segment of on array is empty, it means we have passed all
            # its element, just return the corresponding element in the other array.
            if a_start > a_end: 
                return B[k - a_start]
            if b_start > b_end: 
                return A[k - b_start]

            # Get the middle indexes and middle values of A and B.
            a_index, b_index = (a_start + a_end) // 2, (b_start + b_end) // 2
            a_value, b_value = A[a_index], B[b_index]

            # If k is in the right half of A + B, remove the smaller left half.
            if a_index + b_index < k:
                if a_value > b_value:
                    return solve(k, a_start, a_end, b_index + 1, b_end)
                else:
                    return solve(k, a_index + 1, a_end, b_start, b_end)
            # Otherwise, remove the larger right half. 
            else:
                if a_value > b_value:
                    return solve(k, a_start, a_index - 1, b_start, b_end)
                else:
                    return solve(k, a_start, a_end, b_start, b_index - 1)
        
        if n % 2:
            return solve(n // 2, 0, na - 1, 0, nb - 1)
        else:
            return (solve(n // 2 - 1, 0, na - 1, 0, nb - 1) + solve(n // 2, 0, na - 1, 0, nb - 1)) / 2
```

# Other Smart Solution
This algorithm aims to determine the median of two sorted arrays, nums1 and nums2. To simplify the process, it first ensures that the array nums1 is not longer than nums2. If it is, the algorithm swaps them to streamline subsequent calculations.

The core of the algorithm employs a binary search strategy. It iteratively refines the partition points in nums1 and calculates the corresponding points in nums2. This step aims to efficiently locate the right split point between the two arrays.

Following this, the algorithm examines the surrounding numbers near the determined partition points. It considers the maximum on the left and the minimum on the right for both arrays. The objective is to ascertain that the arrangement of the two halves complies with the order required for calculating the median.

Once the algorithm confirms the correct order, it calculates the median based on whether the total number of elements is even or odd. It handles both scenarios to ensure accurate determination of the median.

In cases where adjustments are needed, the algorithm adapts the partition points by moving them towards the left or right. This process repeats until the correct configuration is found, ensuring that the elements on the left side of the partition points are either smaller or equal to the elements on the right side.

In summary, this algorithm strategically divides the arrays into two parts, continually refining the partition points to achieve the correct order. It then calculates the median based on the identified configuration, providing an efficient and accurate solution for finding the median of two sorted arrays.


```python
class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        if len(nums1) > len(nums2):
            return self.findMedianSortedArrays(nums2, nums1)


        m, n = len(nums1), len(nums2)
        left, right = 0, m

        while left <= right:
            partitionA = (left + right) // 2
            partitionB = (m + n + 1) // 2 - partitionA

            maxLeftA = float('-inf') if partitionA == 0 else nums1[partitionA - 1]
            minRightA = float('inf') if partitionA == m else nums1[partitionA]
            maxLeftB = float('-inf') if partitionB == 0 else nums2[partitionB - 1]
            minRightB = float('inf') if partitionB == n else nums2[partitionB]

            if maxLeftA <= minRightB and maxLeftB <= minRightA:
                if (m + n) % 2 == 0:
                    return (max(maxLeftA, maxLeftB) + min(minRightA, minRightB)) / 2
                else:
                    return max(maxLeftA, maxLeftB)
            elif maxLeftA > minRightB:
                right = partitionA - 1
            else:
                left = partitionA + 1
```