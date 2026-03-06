---
layout: single
title: "C# Interview Preparation: LeetCode Tips and Tricks"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - .NET
  - Algorithms
  - C#
  - Interview Preparation
  - LeetCode
---

Preparing for LeetCode in C# requires knowing the right data structures and language-specific "hacks" to write clean and efficient code. This post summarizes essential tools for your coding interviews.

## 1. Essential Data Structures

### PriorityQueue (Min-Heap / Max-Heap)
Available since .NET 6. Crucial for Dijkstra, K-th largest element, and median problems.

```csharp
// Min-Heap (Default)
var minHeap = new PriorityQueue<string, int>();
minHeap.Enqueue("Task A", 3);
minHeap.Enqueue("Task B", 1);
var element = minHeap.Dequeue(); // "Task B" (lowest priority value first)

// Max-Heap (Use negative priority or custom comparer)
var maxHeap = new PriorityQueue<string, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
```

### Dictionary & HashSet
Fast O(1) lookups for frequency counting and existence checks.

```csharp
var map = new Dictionary<int, string>();
if (!map.ContainsKey(1)) map[1] = "Value";

// TryGetValue is cleaner and faster (one lookup instead of two)
if (map.TryGetValue(1, out var val)) { ... }

// GetValueOrDefault (C# 7+)
var value = map.GetValueOrDefault(key, "default");
```

### Queue & Stack
Standard FIFO and LIFO structures for BFS and DFS.

```csharp
// Queue (BFS)
var queue = new Queue<int>();
queue.Enqueue(1);
int qTop = queue.Peek();
int qItem = queue.Dequeue();

// Stack (DFS / Monotonic Stack)
var stack = new Stack<int>();
stack.Push(1);
int sTop = stack.Peek();
int sItem = stack.Pop();
```

### StringBuilder
Always use `StringBuilder` for string concatenation in loops to avoid $O(N^2)$ complexity due to string immutability.

```csharp
var sb = new StringBuilder();
for (int i = 0; i < 100; i++) sb.Append(i);
string result = sb.ToString();
```

---

## 2. Array & String Maneuvers

### Conversions & Joining
```csharp
char[] chars = s.ToCharArray();
string reversed = new string(chars); // Constructor takes char array
string joined = string.Join(",", array); // Joins elements with separator
```

### Initializing Arrays
```csharp
int[] arr = new int[10];
Array.Fill(arr, -1); // Fills all elements with -1

// 2D Array (Jagged) - Preferred for LeetCode
int[][] matrix = new int[rows][];
for(int i = 0; i < rows; i++) matrix[i] = new int[cols];
```

### Indices and Ranges (C# 8.0+)
```csharp
int[] nums = { 0, 1, 2, 3, 4, 5 };
int last = nums[^1];      // 5 (Index from end)
int secondLast = nums[^2]; // 4
int[] slice = nums[1..4];  // { 1, 2, 3 } (Range: [start, end))
```

---

## 3. Bit Manipulation Tricks
Commonly used in "Optimal" space solutions.

| Operation | Syntax | Use Case |
| :--- | :--- | :--- |
| **AND** | `a & b` | Check if bit is set, clear specific bits |
| **OR** | `a | b` | Set a specific bit |
| **XOR** | `a ^ b` | Toggle a bit, find unique element in pair array |
| **NOT** | `~a` | Invert all bits |
| **Left Shift** | `a << 1` | Multiply by $2^n$ |
| **Right Shift** | `a >> 1` | Divide by $2^n$ |

**Common Trick**: `n & (n - 1)` removes the rightmost set bit. Useful for counting set bits or checking if a number is a power of 2 (`(n & (n-1)) == 0`).

---

## 4. Useful Math & Utilities

### Binary Search
```csharp
int[] sortedArr = { 1, 3, 5, 7 };
int index = Array.BinarySearch(sortedArr, 5); // returns index (2)

// If not found, returns a negative number (~index of next larger element)
if (index < 0) {
    int insertIndex = ~index; 
}
```

### Tuples for Multiple Returns
```csharp
public (int min, int max) GetStats(int[] nums) {
    return (nums.Min(), nums.Max());
}

// Usage with deconstruction
var (min, max) = GetStats(nums);
```

### Math Methods
```csharp
int max = Math.Max(a, b);
int min = Math.Min(a, b);
int abs = Math.Abs(-5);
double power = Math.Pow(base, exp);
```

---

## 5. General Tips & Advice

1.  **Use `long` for overflow**: In problems involving large products or cumulative sums, use `long` to avoid overflow before returning the result as an `int`.
2.  **Recursion Depth**: C# has a default stack size. For very deep DFS ($> 10^4$), prefer an iterative approach with `Stack<T>` to avoid `StackOverflowException`.
3.  **`int.MaxValue` and `int.MinValue`**: Standard values for initializing minimums and maximums.
4.  **`char - 'a'`**: Quickly get the 0-25 index of a lowercase character.
5.  **`SortedSet<T>` / `SortedDictionary<K,V>`**: Use these when you need elements to remain sorted at all times (Red-Black tree under the hood).
6.  **`String.Compare`**: For lexicographical comparison of strings.
7.  **`List<T>.Capacity`**: If you know the final size of a list, initialize it with `new List<int>(size)` to avoid multiple reallocations.

---

## 6. Common Patterns Templates

### BFS (Level Order)
```csharp
public void BFS(Node root) {
    if (root == null) return;
    Queue<Node> queue = new Queue<Node>();
    queue.Enqueue(root);
    
    while (queue.Count > 0) {
        int levelSize = queue.Count;
        for (int i = 0; i < levelSize; i++) {
            var current = queue.Dequeue();
            // Process current node
            foreach (var neighbor in current.Neighbors) {
                queue.Enqueue(neighbor);
            }
        }
    }
}
```

### DFS (Recursive)
```csharp
HashSet<Node> visited = new HashSet<Node>();

public void DFS(Node node) {
    if (node == null || visited.Contains(node)) return;
    
    visited.Add(node);
    // Process current node
    
    foreach (var neighbor in node.Neighbors) {
        DFS(neighbor);
    }
}
```

### Dijkstra's Algorithm (Shortest Path)
```csharp
public int Dijkstra(int n, List<(int to, int weight)>[] adj, int start, int end) {
    int[] dist = new int[n + 1];
    Array.Fill(dist, int.MaxValue);
    dist[start] = 0;
    
    // PriorityQueue<Node, Distance>
    var pq = new PriorityQueue<int, int>();
    pq.Enqueue(start, 0);
    
    while (pq.Count > 0) {
        if (!pq.TryDequeue(out int u, out int d)) break;
        
        // Skip if we found a better path already
        if (d > dist[u]) continue;
        if (u == end) return d;
        
        foreach (var (v, weight) in adj[u]) {
            if (dist[u] != int.MaxValue && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                pq.Enqueue(v, dist[v]);
            }
        }
    }
    return dist[end] == int.MaxValue ? -1 : dist[end];
}
```

### K-th Largest Element
```csharp
public int FindKthLargest(int[] nums, int k) {
    // Use a min-heap of size K
    var pq = new PriorityQueue<int, int>();
    foreach (int num in nums) {
        pq.Enqueue(num, num);
        if (pq.Count > k) {
            pq.Dequeue();
        }
    }
    // The top of the min-heap is the K-th largest element
    return pq.Peek();
}
```

### Median from Data Stream (Two Heaps)
```csharp
public class MedianFinder {
    // Max-heap for the smaller half
    private PriorityQueue<int, int> leftMaxHeap = 
        new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    // Min-heap for the larger half
    private PriorityQueue<int, int> rightMinHeap = new PriorityQueue<int, int>();

    public void AddNum(int num) {
        leftMaxHeap.Enqueue(num, num);
        int maxLeft = leftMaxHeap.Dequeue();
        rightMinHeap.Enqueue(maxLeft, maxLeft);

        // Balance: left heap can have at most one more element than right heap
        if (rightMinHeap.Count > leftMaxHeap.Count) {
            int minRight = rightMinHeap.Dequeue();
            leftMaxHeap.Enqueue(minRight, minRight);
        }
    }

    public double FindMedian() {
        if (leftMaxHeap.Count > rightMinHeap.Count) return leftMaxHeap.Peek();
        return (leftMaxHeap.Peek() + rightMinHeap.Peek()) / 2.0;
    }
}
```

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
* [Part 7: Clean Architecture: Principles, Layers, and Best Practices]({{ site.baseurl }}{% post_url 2026-3-5-clean-architecture %})
* [Part 8: N-Tier Architecture: Structure, Layers, and Beginner Guide]({{ site.baseurl }}{% post_url 2026-3-5-n-tier-architecture %})
