---
title: "Solving Valid Palindrome in C#"
excerpt: "Learn how to determine if a string is a palindrome by considering only alphanumeric characters and ignoring cases using a two-pointer approach in C#."
date: 2026-04-01
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Two Pointers
  - String
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Valid Palindrome

The "Valid Palindrome" problem (LeetCode 125) asks to determine if a given string is a palindrome. A string is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Key constraints:
- Only letters and digits are considered.
- The comparison is case-insensitive.
- An empty string or one with only non-alphanumeric characters is considered a valid palindrome.

> **Problem Statement:** Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

### 2. The Intuition: Two Pointers

The most efficient way to check for a palindrome while ignoring specific characters is to use the **Two Pointers** technique. 

1.  **Start and End Pointers:** We initialize one pointer at the beginning (`left`) and another at the end (`right`) of the string.
2.  **Skip Non-Alphanumeric:** We move the pointers towards the center, skipping any characters that are not letters or digits using `char.IsLetterOrDigit`.
3.  **Compare Characters:** Once both pointers land on valid characters, we compare them case-insensitively using `char.ToLower`.
4.  **Early Exit:** If the characters don't match, we immediately return `false`. If they do match, we continue moving both pointers closer until they meet or cross.

### 3. Implementation: Two-Pointer Approach

#### 3.1 Standard C# Approach

This implementation utilizes the built-in `char.IsLetterOrDigit` method to skip non-alphanumeric characters.

```csharp
public class Solution {
    public bool IsPalindrome(string s) {
        int left = 0;
        int right = s.Length - 1;
        while (left < right) {
            // Move left pointer forward while character is not alphanumeric
            while (left < right && !char.IsLetterOrDigit(s[left])) {
                left++;
            }
            // Move right pointer backward while character is not alphanumeric
            while (left < right && !char.IsLetterOrDigit(s[right])) {
                right--;
            }

            // Perform case-insensitive comparison
            if (char.ToLower(s[left]) != char.ToLower(s[right])) {
                return false;
            }
            
            // Move both pointers inward
            left++;
            right--;
        }
        return true;
    }
}
```

#### 3.2 NeetCode.io Approach

This version uses a custom `AlphaNum` helper method to manually check for alphanumeric characters, avoiding the overhead of some built-in methods if necessary.

```csharp
public class Solution {
    public bool IsPalindrome(string s) {
        int l = 0, r = s.Length - 1;

        while (l < r) {
            while (l < r && !AlphaNum(s[l])) {
                l++;
            }
            while (r > l && !AlphaNum(s[r])) {
                r--;
            }
            if (char.ToLower(s[l]) != char.ToLower(s[r])) {
                return false;
            }
            l++; r--;
        }
        return true;
    }

    public bool AlphaNum(char c) {
        return (c >= 'A' && c <= 'Z' ||
                c >= 'a' && c <= 'z' ||
                c >= '0' && c <= '9');
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize Pointers
We start with two pointers at the ends of the string (e.g., `left` and `right`). These pointers will traverse the string toward the middle.

#### Step 2: Skip Non-Alphanumeric Characters
The inner `while` loops ensure that we only compare relevant characters. We can use built-in methods like `char.IsLetterOrDigit` or a custom helper. For example, in the string `"A man, a plan, a canal: Panama"`, the pointers will skip spaces, commas, and colons.

#### Step 3: Compare and Move
We use `char.ToLower` to normalize the characters for comparison. If they are the same, we simply increment `left` and decrement `right` to check the next pair.

#### Step 4: Final Result
If the pointers cross without any mismatches being found, the entire string (after filtering) is a palindrome, so we return `true`.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N)** | Each character in the string is visited at most once by the pointers. |
| **Space Complexity** | **O(1)** | The algorithm works in-place and only uses a few integer variables for the pointers. |

### 6. Summary

The "Valid Palindrome" problem is a classic example of the two-pointer technique. By skipping non-essential characters and performing case-insensitive comparisons in a single pass, we achieve an optimal O(N) time complexity with constant space. This approach is highly efficient and avoids the overhead of creating a new, filtered string.

### 7. Further Reading
- [LeetCode 125: Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [NeetCode: Valid Palindrome Explanation](https://neetcode.io/problems/valid-palindrome)
- [C# char.IsLetterOrDigit Method](https://learn.microsoft.com/en-us/dotnet/api/system.char.isletterordigit)
- [C# char.ToLower Method](https://learn.microsoft.com/en-us/dotnet/api/system.char.tolower)
