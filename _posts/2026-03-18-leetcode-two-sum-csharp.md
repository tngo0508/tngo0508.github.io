---
title: "Solving the Two Sum Problem in C# with Dictionaries"
excerpt: "Learn how to solve the classic Two Sum LeetCode problem efficiently using a Dictionary for O(n) performance in .NET 10."
date: 2026-03-18
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Data Structures
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Two Sum

The "Two Sum" problem is a classic entry point for anyone starting with data structures and algorithms. The challenge is simple:

> Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

### 2. The Intuition: The "Missing Piece" Analogy

Imagine you are at a party, and everyone is wearing a number on their back. You want to find two people whose numbers add up to exactly **10**.

1. You walk through the room one by one.
2. For every person you meet (let's say they have number **3**), you calculate their "complement": `10 - 3 = 7`.
3. You look at a list of people you've already seen. If you've already seen a **7**, you've found your pair!
4. If not, you write down the number **3** and where you saw them (their index) and move to the next person.

By using a **Dictionary**, we create this "Seen List" that allows us to find the "Missing Piece" almost instantly.

### 3. The Implementation (C#)

Here is a clean implementation using a `Dictionary<int, int>` to store the values and their respective indices.

```csharp
public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // 1. Initialize our result and the 'Seen' list
        int[] result = new int[2];
        Dictionary<int, int> seen = new Dictionary<int, int>();

        for(int i = 0; i < nums.Length; i++) {
            // 2. Calculate what we need to find (the complement)
            int complement = target - nums[i];

            // 3. Have we seen this complement before?
            if (seen.ContainsKey(complement)) {
                return new int[] { seen[complement], i };
            }

            // 4. If not, add current number to the 'Seen' list
            // We use TryGetValue or a check to handle potential duplicates safely
            if (!seen.TryGetValue(nums[i], out var existing)) {
                seen[nums[i]] = i;
            }
        }

        return result;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize the Dictionary
We use a `Dictionary<int, int>` where:
- **Key**: The value of the number from the array.
- **Value**: The index of that number.

#### Step 2: The Loop & Complement
As we iterate, we don't just look at the current number `nums[i]`. We calculate `target - nums[i]`. This is the "magic number" that, if added to our current number, solves the puzzle.

#### Step 3: Instant Lookup
The power of the Dictionary is that `ContainsKey` (or `TryGetValue`) runs in **O(1)** time on average. This is much faster than searching the entire array again.

#### Step 4: Storing for Later
If we haven't found the complement, we store the current number's value and index so that a *future* number in the array can find us.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(n)** | We traverse the list only once. Each lookup in the dictionary is O(1). |
| **Space Complexity** | **O(n)** | In the worst case, we might store all elements in the dictionary. |

### 6. Why use a Dictionary?

If we used a nested `for` loop (Brute Force), the time complexity would be **O(n²)**. For an array of 10,000 numbers:
- **Brute Force**: ~100,000,000 operations.
- **Dictionary**: ~10,000 operations.

This is a massive performance gain for just a little extra memory!

### 7. Summary
The Two Sum problem teaches us the importance of **trading space for time**. By using a small amount of extra memory (the Dictionary), we dramatically reduce the time it takes to find our answer.

### 8. Further Reading
- [C# Dictionary Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)
- [Big O Notation Simplified](https://www.freecodecamp.org/news/big-o-notation-simply-explained-with-illustrations-and-video/)
- [LeetCode Two Sum](https://leetcode.com/problems/two-sum/)
