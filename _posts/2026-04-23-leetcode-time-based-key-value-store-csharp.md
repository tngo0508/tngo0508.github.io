---
title: "Time Based Key-Value Store in C#"
excerpt: "Learn how to build a time-based key-value store using a dictionary and binary search in C#."
date: 2026-04-23
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Binary Search
  - Hash Table
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Time Based Key-Value Store

Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the `TimeMap` class:

*   `TimeMap()` Initializes the object of the data structure.
*   `void Set(String key, String value, int timestamp)` Stores the key `key` with the value `value` at the given time `timestamp`.
*   `String Get(String key, int timestamp)` Returns a value such that `set` was called previously, with `timestamp_prev <= timestamp`. If there are multiple such values, it returns the value associated with the largest `timestamp_prev`. If there are no values, it returns `""`.

### 2. The Intuition: Dictionary + Binary Search

To solve this efficiently, we need a way to quickly look up a key and then quickly find the correct value based on the timestamp.

1.  **Storage:** A `Dictionary` is perfect for mapping a `string` key to its history of values. Since each key can have multiple values over time, we store them in a `List` of tuples: `List<(int timestamp, string value)>`.
2.  **Sorted Timestamps:** The problem specifies that timestamps in `Set` calls are strictly increasing. This is a huge advantage! It means the `List` for each key will automatically be sorted by timestamp.
3.  **Search:** When `Get` is called, we need to find the largest timestamp $\le$ the requested timestamp. Since the list is sorted, we can use **Binary Search** to find this value in $O(\log n)$ time instead of scanning the whole list in $O(n)$.

### 3. Solution 1: Dictionary + List (User Approach)

This approach uses a `Dictionary` to map each key to a `List` of timestamp-value pairs. Since the timestamps are added in strictly increasing order, the list is naturally sorted, allowing us to use binary search for retrieval.

```csharp
public class TimeMap {
    Dictionary<string, List<(int, string)>> TimeDict { get; set;}
    
    public TimeMap() {
        TimeDict = new();
    }
    
    public void Set(string key, string value, int timestamp) {
        if (!TimeDict.ContainsKey(key)) {
            TimeDict[key] = new List<(int, string)>();
        }
        TimeDict[key].Add((timestamp, value));
    }
    
    public string Get(string key, int timestamp) {
        if (!TimeDict.ContainsKey(key)) {
            return "";
        }
        
        var arr = TimeDict[key];
        int n = arr.Count;
        int left = 0, right = n - 1;
        string res = "";
        
        // Binary search for the largest timestamp <= requested timestamp
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid].Item1 <= timestamp) {
                res = arr[mid].Item2;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return res;
    }
}
```

### 4. Solution 2: Dictionary + SortedList (NeetCode Approach)

The [NeetCode.io](https://neetcode.io) approach uses a `SortedList<int, string>` within the `Dictionary`. This is conceptually similar but leverages a built-in collection that maintains keys in sorted order. Note that while `SortedList` provides indexed access to its keys and values, the binary search is still implemented manually to find the largest timestamp less than or equal to the target.

```csharp
public class TimeMap {
    private Dictionary<string, SortedList<int, string>> m;

    public TimeMap() {
        m = new Dictionary<string, SortedList<int, string>>();
    }

    public void Set(string key, string value, int timestamp) {
        if (!m.ContainsKey(key)) {
            m[key] = new SortedList<int, string>();
        }
        m[key][timestamp] = value;
    }

    public string Get(string key, int timestamp) {
        if (!m.ContainsKey(key)) return "";
        var timestamps = m[key];
        int left = 0;
        int right = timestamps.Count - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (timestamps.Keys[mid] == timestamp) {
                return timestamps.Values[mid];
            } else if (timestamps.Keys[mid] < timestamp) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (right >= 0) {
            return timestamps.Values[right];
        }
        return "";
    }
}
```

### 5. Complexity Analysis

| Approach | Operation | Time Complexity | Space Complexity | Why? |
| :--- | :--- | :--- | :--- | :--- |
| **Solution 1** | **Set** | **O(1)** | **O(1)** | Amortized constant time for dictionary lookup and list append. |
| **Solution 1** | **Get** | **O(log N)** | **O(1)** | Manual binary search on the sorted list. |
| **Solution 2** | **Set** | **O(N)** | **O(1)** | `SortedList` insertion is $O(N)$ as it may require shifting elements. |
| **Solution 2** | **Get** | **O(log N)** | **O(1)** | Manual binary search on `SortedList.Keys`. |

*   **Total Space Complexity:** **O(M * N)** where $M$ is the number of unique keys and $N$ is the average number of values per key.

### 6. Summary

The `TimeMap` problem demonstrates how to structure data for versioned retrieval. While Solution 1 is more efficient for the `Set` operation (given the strictly increasing timestamps), Solution 2 uses `SortedList` which explicitly enforces the sorted property of the keys. Both leverage **Binary Search** to achieve efficient $O(\log N)$ retrieval.

### 7. Further Reading
- [Time Based Key-Value Store (LeetCode 981)](https://leetcode.com/problems/time-based-key-value-store/)
- [Binary Search Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [NeetCode Roadmap - Binary Search](https://neetcode.io/roadmap)
