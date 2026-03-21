---
title: "Solving Top K Frequent Elements in C# with PriorityQueue"
excerpt: "Learn how to find the most frequent elements in an array efficiently using a Dictionary and a Min-Heap (PriorityQueue) in .NET."
date: 2026-03-21
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

### 1. The Problem: Top K Frequent Elements

The "Top K Frequent Elements" problem is a popular challenge that tests your knowledge of frequency counting and efficient sorting.

> Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in **any order**.

### 2. The Intuition: Trading Speed for Space

The most straightforward way to solve this would be to count the frequencies and then sort the entire list of unique numbers. However, sorting takes **O(N log N)** time. 

By using a **Min-Heap (PriorityQueue)**, we can maintain only the "Top K" elements as we iterate, reducing our time complexity to **O(N log K)**.

1. **Count Everything**: Use a `Dictionary` to store how many times each number appears.
2. **The "K-Sized Tray" (Min-Heap)**: We iterate through our counts. We add elements to a Min-Heap where the *frequency* is the priority.
3. **Automatic Filter**: If the heap's size exceeds `k`, we `Dequeue()` the element with the *lowest* frequency.
4. **The Survivors**: After checking all elements, the `k` elements remaining in the heap are our most frequent ones.

### 3. Implementation (Version 1: PriorityQueue)

Here is a clean implementation using `Dictionary<int, int>` for counting and `PriorityQueue<int, int>` for maintaining the top elements.

```csharp
public class Solution {
    public int[] TopKFrequent(int[] nums, int k) {
        // 1. Initialize our frequency map and the priority queue (Min-Heap)
        var minHeap = new PriorityQueue<int, int>();
        var freq = new Dictionary<int, int>();

        // 2. Count the frequency of each number
        foreach (var num in nums) {
            freq[num] = freq.GetValueOrDefault(num, 0) + 1;
        }

        // 3. Iterate through the dictionary and maintain a heap of size k
        foreach (var (num, count) in freq) {
            // Enqueue the number with its frequency as the priority
            minHeap.Enqueue(num, count);

            // If we have more than k elements, remove the one with the lowest frequency
            if (minHeap.Count > k) {
                minHeap.Dequeue();
            }
        }

        // 4. Extract the elements from the heap
        // UnorderedItems allows us to access elements without clearing the queue
        return minHeap.UnorderedItems.Select(x => x.Element).ToArray();
    }
}
```

### 4. Implementation (Neetcode Version)

This version follows the Neetcode approach, which also uses a Min-Heap (PriorityQueue) but handles frequency counting and result extraction more manually.

```csharp
public class Solution {
    public int[] TopKFrequent(int[] nums, int k) {
        // 1. Manually count frequencies using a Dictionary
        var count = new Dictionary<int, int>();
        foreach (var num in nums) {
            if (count.ContainsKey(num)) {
                count[num]++;
            } else {
                count[num] = 1;
            }
        }

        // 2. Maintain a Min-Heap of size K
        var heap = new PriorityQueue<int, int>();
        foreach (var entry in count) {
            heap.Enqueue(entry.Key, entry.Value);
            if (heap.Count > k) {
                heap.Dequeue();
            }
        }

        // 3. Extract the K survivors from the heap
        var res = new int[k];
        for (int i = 0; i < k; i++) {
            res[i] = heap.Dequeue();
        }
        return res;
    }
}
```

### 5. Step-by-Step Breakdown

#### Step 1: Frequency Count
We use a `Dictionary<int, int>` where the **Key** is the number and the **Value** is its frequency. `GetValueOrDefault` makes the increment logic concise.

#### Step 2: The Min-Heap Strategy
We use the `PriorityQueue<TElement, TPriority>` introduced in .NET 6. By using the frequency as the priority, the "smallest" (least frequent) item is always at the top of the heap.

#### Step 3: Maintaining Size K
Every time the heap grows beyond size `k`, we call `Dequeue()`. This removes the element with the lowest frequency currently in the heap. This ensures that only the `k` largest (most frequent) elements remain.

#### Step 4: Efficient Extraction
Instead of manually dequeuing elements into a list, we use `.UnorderedItems`. This property provides a non-destructive way to access the elements in the queue, which we then project and convert to an array.

### 6. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N log K)** | We iterate over N elements to build the dictionary (O(N)). Then we iterate over unique elements (max N) and perform heap operations (log K). |
| **Space Complexity** | **O(N)** | In the worst case (all unique elements), the dictionary stores N items. The heap stores K items. |

### 7. Why use a PriorityQueue?

If we used `Array.Sort()` on the dictionary entries, it would be **O(N log N)**. 
- For $N = 1,000,000$ and $k = 10$:
    - **Sorting**: ~20,000,000 operations.
    - **PriorityQueue**: ~3,300,000 operations.

The `PriorityQueue` approach is significantly faster when `k` is small compared to `N`.

### 8. Summary
The Top K Frequent Elements problem demonstrates how to combine two fundamental data structures: **Dictionaries** for fast counting and **Heaps** for maintaining a rolling "Top List" of items.

### 9. Further Reading
- [C# PriorityQueue Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2)
- [Neetcode - Top K Frequent Elements](https://neetcode.io/problems/top-k-elements-in-list)
- [LeetCode Problem 347](https://leetcode.com/problems/top-k-frequent-elements/)
