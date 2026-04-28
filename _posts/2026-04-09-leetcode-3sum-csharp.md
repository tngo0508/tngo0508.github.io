---
title: "Solving 3Sum in C#"
excerpt: "Learn how to find all unique triplets in an array that add up to zero using sorting and a two-pointer approach in C#."
date: 2026-04-09
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Two Pointers
  - Array
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: 3Sum

The "3Sum" problem (LeetCode 15) asks us to find all unique triplets $[nums[i], nums[j], nums[k]]$ such that their sum is exactly zero ($nums[i] + nums[j] + nums[k] = 0$).

> **Problem Statement:** Given an integer array `nums`, return all the triplets $[nums[i], nums[j], nums[k]]$ such that $i \neq j, i \neq k,$ and $j \neq k$, and $nums[i] + nums[j] + nums[k] == 0$. The solution set must not contain duplicate triplets.

### 2. The Intuition: Sorting and Two Pointers

Finding three numbers that sum to zero can be simplified by fixing one number and finding the other two that sum to its negative value ($a + b = -c$).

1.  **Sorting:** By sorting the array first, we can easily skip duplicate elements and use the two-pointer technique to find the matching pairs.
2.  **Iterative Selection:** We use a loop to pick the first element of our potential triplet. To avoid duplicates, we skip any element that is the same as the previous one.
3.  **Two-Pointer Strategy:** For each fixed element `nums[i]`, we set two pointers: `left` at `i + 1` and `right` at the end of the array.
    - If the sum of `nums[left] + nums[right]` matches `-nums[i]`, we've found a triplet.
    - If the sum is **too large**, we decrement `right`.
    - If the sum is **too small**, we increment `left`.
4.  **Skipping Duplicates:** After finding a valid triplet, we move both pointers and skip any adjacent identical values to ensure all returned triplets are unique.

### 3. Implementation: C# Two-Pointer Approach

This implementation leverages sorting and a classic `while` loop with two pointers to achieve an $O(n^2)$ time complexity.

```csharp
public class Solution {
    public List<List<int>> ThreeSum(int[] nums) {
        Array.Sort(nums);
        var result = new List<List<int>>();
        var n = nums.Length;
        for (int i = 0; i < nums.Length; i++) {
            // Skip duplicates for the first element
            if (i > 0 && nums[i] == nums[i-1]) continue;
            
            int index = i;
            int left = i + 1;
            int right = n - 1;
            
            while (left < right) {
                var currVal = nums[left] + nums[right];
                
                if (currVal == -nums[index]) {
                    result.Add(new List<int> {nums[index], nums[left], nums[right]});
                    left++;
                    right--;
                    
                    // Skip duplicates for the second element
                    while (left < right && nums[left] == nums[left - 1]) {
                        left++;
                    }

                    // Skip duplicates for the third element
                    while (left < right && nums[right] == nums[right + 1]) {
                        right--;
                    }
                } else if (currVal > -nums[index]) {
                    right--;
                } else {
                    left++;
                }
            }
        }

        return result;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Sort the Array
The array is sorted in non-decreasing order. This is crucial for both the two-pointer logic and duplicate skipping.

#### Step 2: Fix the First Element
The outer `for` loop picks `nums[i]`. If `nums[i]` is the same as `nums[i-1]`, we skip it to prevent duplicate triplets starting with the same value.

#### Step 3: Initialize Two Pointers
`left` starts just after `i`, and `right` starts at the very end. We calculate `currVal = nums[left] + nums[right]`.

#### Step 4: Compare and Move
- If `currVal == -nums[i]`: We store the triplet and move both pointers. We then use `while` loops to skip any identical numbers to avoid repeating the same triplet.
- If `currVal > -nums[i]`: The sum is too high, so we move `right` inward to find a smaller number.
- If `currVal < -nums[i]`: The sum is too low, so we move `left` inward to find a larger number.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **$O(n^2)$** | Sorting takes $O(n \log n)$. The nested loops (one `for` and one `while`) take $O(n^2)$ in the worst case. |
| **Space Complexity** | **$O(\log n)$** | C#'s `Array.Sort` uses Introspective sort, which has $O(\log n)$ space complexity. |

### 6. Summary

The 3Sum problem is a classic application of the two-pointer technique. By sorting the array, we transform the search for three numbers into a series of Two Sum problems, while efficiently handling duplicate entries to meet the uniqueness requirement.

### 7. Further Reading
- [LeetCode 15: 3Sum](https://leetcode.com/problems/3sum/)
- [NeetCode: 3Sum Explanation](https://neetcode.io/problems/three-sum)
- [C# Array.Sort Method](https://learn.microsoft.com/en-us/dotnet/api/system.array.sort)
