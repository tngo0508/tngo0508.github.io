---
title: "Solving Product of Array Except Self in C#"
excerpt: "Learn how to calculate the product of all elements except the current one in O(N) time and O(1) extra space without using the division operator."
date: 2026-03-23
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Array Manipulation
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Product of Array Except Self

The "Product of Array Except Self" problem requires us to return an array such that each element at index `i` is the product of all the numbers in the original array except `nums[i]`.

> Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.
>
> You must write an algorithm that runs in **O(n)** time and without using the division operation.

### 2. The Intuition: Prefix and Suffix Products

Since we cannot use division, we need another way to "exclude" the current number. 

The key insight is that the product of all elements except `nums[i]` is:
**(Product of all elements to the left of i) * (Product of all elements to the right of i)**

1.  **Prefix Products**: Calculate the running product of all elements from the beginning up to each index.
2.  **Suffix Products**: Calculate the running product of all elements from the end back to each index.
3.  **Combine**: Multiply the prefix and suffix products for each index.

### 3. Implementation (Version 1: Prefix and Suffix Arrays)

This version uses two auxiliary arrays (`left` and `right`) to store the running products. It's the most intuitive implementation and easy to understand.

```csharp
public class Solution {
    public int[] ProductExceptSelf(int[] nums) {
        var length = nums.Length;
        var left = new int[length + 1];
        var right = new int[length + 1];
        var result = new int[length];
        Array.Fill(left, 1);
        Array.Fill(right, 1);
        
        // Fill prefix products (left array)
        for (var i = 1; i < length + 1; i++) {
            left[i] = left[i - 1] *  nums[i - 1];
        }
        
        // Fill suffix products (right array)
        for (var i = length - 1; i >= 0; i--) {
            right[i] = right[i + 1] * nums[i];
        }

        // Multiply prefix and suffix for each index
        for (var i = 0; i < length; i++) {
            result[i] = left[i] * right[i + 1];
        }
        return result;
    }
}
```

### 4. Implementation (Version 2: Neetcode Approach)

This version also uses prefix and suffix arrays but handles the indices differently, following the standard Neetcode implementation.

```csharp
public class Solution {
    public int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        int[] res = new int[n];
        int[] pref = new int[n];
        int[] suff = new int[n];

        pref[0] = 1;
        suff[n - 1] = 1;
        for (int i = 1; i < n; i++) {
            pref[i] = nums[i - 1] * pref[i - 1];
        }
        for (int i = n - 2; i >= 0; i--) {
            suff[i] = nums[i + 1] * suff[i + 1];
        }
        for (int i = 0; i < n; i++) {
            res[i] = pref[i] * suff[i];
        }
        return res;
    }
}
```

### 5. Implementation (Version 3: Optimized O(1) Extra Space)

We can improve the space complexity by using the `result` array itself to store the prefix products and then calculating the suffix products on the fly while updating the `result`.

```csharp
public class Solution {
    public int[] ProductExceptSelf(int[] nums) {
        int n = nums.Length;
        int[] result = new int[n];
        
        // 1. Calculate prefix products directly in the result array
        result[0] = 1;
        for (int i = 1; i < n; i++) {
            result[i] = result[i - 1] * nums[i - 1];
        }
        
        // 2. Calculate suffix products on the fly and update result
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= suffix;
            suffix *= nums[i];
        }
        
        return result;
    }
}
```

### 6. Step-by-Step Breakdown (Optimized Version)

#### Step 1: Prefix Calculation
We iterate through the array once from left to right. Each `result[i]` stores the product of all numbers before `i`. We initialize `result[0] = 1` because there are no elements to the left of the first item.

#### Step 2: Suffix Multiplier
We iterate backward from the last element. We use a single variable `suffix` to keep track of the running product of everything to the right of our current position.

#### Step 3: The Final Result
For each index, we multiply the existing prefix product (already in `result[i]`) by our current `suffix` value. This gives us the final "product except self."

### 7. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | We make two linear passes through the array. |
| **Space Complexity** | **O(1)** | We use the output array for our calculations. Auxiliary space is constant (excluding the result array). |

### 8. Why avoid division?
The problem explicitly forbids division. If we could use division, we would simply calculate the total product of the entire array and then divide by `nums[i]` at each step. However:
1.  **Division by Zero**: This fails if the array contains any zeros.
2.  **Precision/Overflow**: Multi-step division can sometimes lead to precision issues in certain languages (though less so with integers).
3.  **Algorithm Design**: This constraint forces you to understand the structure of the data rather than relying on a math trick.

### 9. Summary

The "Product of Array Except Self" problem is a classic example of using prefix and suffix information to solve a problem that would otherwise require division. By calculating products from both ends, we can efficiently find the result for every position in a single O(N) pass.

### 10. Further Reading
- [C# Array.Fill Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.array.fill)
- [Neetcode - Product of Array Except Self](https://neetcode.io/problems/products-of-array-discluding-self)
- [LeetCode Problem 238](https://leetcode.com/problems/product-of-array-except-self/)
