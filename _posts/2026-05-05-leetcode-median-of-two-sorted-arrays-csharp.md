---
title: "Median of Two Sorted Arrays in C#"
excerpt: "Learn how to find the median of two sorted arrays using both an intuitive merging approach and the optimal O(log(N+M)) binary search approach in C#."
date: 2026-05-05
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Arrays
  - Binary Search
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Median of Two Sorted Arrays

The "Median of Two Sorted Arrays" problem asks us to find the median value of two already sorted arrays. The median is the middle element in a sorted list. If the total number of elements is even, the median is the average of the two middle elements.

> Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.
>
> The overall run time complexity should be `O(log (m+n))`.

*Note: While the intuitive merge-sort approach is `O(N+M)`, the optimal solution uses Binary Search to achieve `O(log(m+n))`. Both are covered below.*

### 2. The Intuition: Merging Sorted Arrays

The most straightforward way to solve this problem is to merge the two sorted arrays into one large sorted array and then pick the middle element(s).

1. Create a new array `arr` with a length equal to the sum of the lengths of `nums1` and `nums2`.
2. Use three pointers (`i`, `j`, `k`) to iterate through `nums1`, `nums2`, and `arr` respectively.
3. Compare elements from `nums1` and `nums2` and place the smaller one into `arr`.
4. Once one array is exhausted, append the remaining elements from the other array.
5. Calculate the median based on whether the total length is odd or even.

### 3. Implementation: Merging Approach

This implementation merges both arrays into a temporary array and then calculates the median.

```csharp
public class Solution {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        int len1 = nums1.Length;
        int len2 = nums2.Length;
        int length = len1 + len2;
        int[] arr = new int[length];
        int i = 0, j = 0, k = 0;

        // 1. Merge elements from both arrays until one is exhausted
        while (i < len1 && j < len2) {
            if (nums1[i] <= nums2[j]) {
                arr[k] = nums1[i];
                i++;
            } else {
                arr[k] = nums2[j];
                j++;
            }
            k++;
        }

        // 2. Add remaining elements from nums1
        while (i < len1) {
            arr[k] = nums1[i];
            i++;
            k++;
        }

        // 3. Add remaining elements from nums2
        while (j < len2) {
            arr[k] = nums2[j];
            j++;
            k++;
        }

        // 4. Calculate the median
        int mid = k / 2;
        int isOdd = (len1 + len2) % 2;
        if (isOdd > 0) {
            return arr[mid];
        }
        return (double)(arr[mid] + arr[mid - 1]) / 2;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialization
We determine the lengths of both arrays and create a combined array `arr` to hold all elements. We also initialize pointers `i`, `j`, and `k` for tracking positions.

#### Step 2: The Merging Process
We use a `while` loop to compare the current elements of both arrays. The smaller element is added to `arr`, and the corresponding pointer is incremented.

#### Step 3: Handling Remainders
After the first loop, one of the arrays might still have elements. We use two additional `while` loops to ensure all elements from `nums1` and `nums2` are moved into `arr`.

#### Step 4: Finding the Median
- If the total length is **odd**, the median is simply the element at the `mid` index.
- If the total length is **even**, the median is the average of the elements at `mid` and `mid - 1`.

### 5. The Optimal Approach: Binary Search on Partitions

To achieve `O(log(min(N, M)))`, we don't need to merge the arrays. Instead, we can use binary search to find the correct "cut" or partition point in the smaller array such that all elements to the left of the partition are smaller than or equal to all elements to the right.

1.  **Ensure `nums1` is the smaller array**: This minimizes the binary search range.
2.  **Partitioning**: We want to partition `nums1` at index `i` and `nums2` at index `j` such that `i + j` is exactly half of the total elements.
3.  **Conditions for Median**:
    - `left1 <= right2` and `left2 <= right1`.
    - If `left1 > right2`, we moved too far right in `nums1`, so we decrease `i`.
    - If `left2 > right1`, we moved too far left in `nums1`, so we increase `i`.
4.  **Handling Edges**: Use `int.MinValue` and `int.MaxValue` for partitions that fall outside array boundaries.

### 6. Implementation: Binary Search Approach

```csharp
public class Solution {
    public double FindMedianSortedArrays(int[] nums1, int[] nums2) {
        int n1 = nums1.Length;
        int n2 = nums2.Length;
        
        // Ensure nums1 is the smaller array
        if (n1 > n2) return FindMedianSortedArrays(nums2, nums1);
        
        int low = 0, high = n1;
        int totalLeft = (n1 + n2 + 1) / 2;
        
        while (low <= high) {
            int i = (low + high) / 2; // Partition index for nums1
            int j = totalLeft - i;    // Partition index for nums2
            
            int left1 = (i > 0) ? nums1[i - 1] : int.MinValue;
            int right1 = (i < n1) ? nums1[i] : int.MaxValue;
            
            int left2 = (j > 0) ? nums2[j - 1] : int.MinValue;
            int right2 = (j < n2) ? nums2[j] : int.MaxValue;
            
            if (left1 <= right2 && left2 <= right1) {
                // Correct partition found
                if ((n1 + n2) % 2 == 1) {
                    return Math.Max(left1, left2);
                }
                return (Math.Max(left1, left2) + Math.Min(right1, right2)) / 2.0;
            }
            else if (left1 > right2) {
                high = i - 1;
            }
            else {
                low = i + 1;
            }
        }
        
        return 0.0;
    }
}
```

### 7. Step-by-Step Breakdown (Binary Search)

#### Step 1: Array Normalization
We always perform binary search on the shorter array (`nums1`). This ensures that the partition index `j` in the larger array is always valid and positive.

#### Step 2: Defining the Search Range
The binary search range is `[0, n1]`, representing the possible number of elements from `nums1` that could be in the left half of the combined sorted array.

#### Step 3: Checking the Partition
For every mid-point `i`, we calculate `j` such that `i + j` covers half the elements. We then check if the largest elements on the left sides (`left1`, `left2`) are smaller than the smallest elements on the right sides (`right1`, `right2`).

#### Step 4: Adjusting the Search
- If `left1 > right2`, our partition in `nums1` is too far to the right. We move `high = i - 1`.
- If `left2 > right1`, our partition in `nums1` is too far to the left. We move `low = i + 1`.

### 8. Complexity Analysis

| Approach | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- |
| **Merging** | **O(N + M)** | **O(N + M)** | Requires iterating and storing all elements in a new array. |
| **Binary Search** | **O(log(min(N, M)))** | **O(1)** | We binary search on the smaller array and only use a few variables. |

### 9. Summary

While the merging approach is easier to visualize, the binary search approach is the expected solution in interviews due to its superior efficiency. It demonstrates a deep understanding of how to apply binary search to non-trivial problems by searching for a partition point rather than a specific value.

### 10. Further Reading
- [Binary Search Algorithm](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Neetcode - Median of Two Sorted Arrays](https://neetcode.io/problems/median-of-two-sorted-arrays)
- [LeetCode Problem 4](https://leetcode.com/problems/median-of-two-sorted-arrays/)
