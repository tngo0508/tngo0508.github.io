---
title: "Solving the Group Anagrams Problem in C#"
excerpt: "Learn how to efficiently group anagrams from a list of strings using sorting and dictionaries in .NET 10."
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

### 1. The Problem: Group Anagrams

The "Group Anagrams" challenge is a fundamental exercise in string manipulation and data structuring. The requirement is:

> Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### 2. The Intuition: The "Sorted Key" Approach

The core idea is to find a **canonical form** for each string. Since anagrams consist of the same letters, they will all look identical if we sort their characters alphabetically.

1. Take the words `"eat"`, `"tea"`, and `"ate"`.
2. Sort each one:
   - `"eat"` &rarr; `"aet"`
   - `"tea"` &rarr; `"aet"`
   - `"ate"` &rarr; `"aet"`
3. Now that they all share the same key (`"aet"`), we can easily group them in a **Dictionary**.

### 3. The Implementation (C#)

Here is a clean implementation using `System.Linq` for character sorting and a `Dictionary` for grouping.

```csharp
public class Solution {
    public List<List<string>> GroupAnagrams(string[] strs) {
        // 1. Initialize our dictionary to store grouped anagrams
        // Key: The sorted version of the string (canonical key)
        // Value: A list of original strings that match that key
        var dict = new Dictionary<string, List<string>>();

        foreach(var currString in strs) {
            // 2. Create the canonical key by sorting characters
            var key = new string(currString.OrderBy(c => c).ToArray());

            // 3. Check if we've seen this anagram group before
            if (!dict.TryGetValue(key, out var existing)) {
                existing = new List<string>();
                dict[key] = existing;
            }

            // 4. Add the original string to its respective group
            existing.Add(currString);
        }

        // 5. Return all the groups as a List of Lists
        return new List<List<string>>(dict.Values);
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Initialize the Dictionary
We use a `Dictionary<string, List<string>>` where:
- **Key**: The sorted string (e.g., `"aet"`).
- **Value**: A list containing all original words that sort into that key (e.g., `["eat", "tea", "ate"]`).

#### Step 2: Sorting as a Canonical Key
By using `currString.OrderBy(c => c).ToArray()`, we ensure that any string containing the same letters will produce the same character array. Converting it back to a `new string(...)` gives us our lookup key.

#### Step 3: Handle New Groups
`TryGetValue` is a performance-friendly way to check if a key exists and retrieve it in one go. If it's a new key, we initialize a new `List<string>`.

#### Step 4: Storing Results
The original word (unmodified) is added to the list associated with its sorted key.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(n * k log k)** | `n` is the number of strings, and `k` is the max length of a string. We sort each string (k log k) for every string (n). |
| **Space Complexity** | **O(n * k)** | We store every string and its characters in the dictionary. |

### 6. Why use Sorting?

While you can also group anagrams by counting the frequency of each letter (which takes **O(n * k)** time), sorting is often:
- **Simpler to implement**: Standard LINQ methods make it concise.
- **Fast enough**: For most competitive programming constraints (where string length `k` is relatively small), `k log k` is negligible compared to the overhead of building frequency maps.

### 7. Summary
The Group Anagrams problem is a perfect example of using a **Hash Map** (Dictionary) to categorize items based on a derived property. By transforming each input into a "canonical" form (sorting), we turn a complex comparison problem into a simple key lookup.

### 8. Further Reading
- [C# LINQ OrderBy Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.orderby)
- [Dictionary<TKey,TValue> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)
- [LeetCode Group Anagrams](https://leetcode.com/problems/group-anagrams/)
