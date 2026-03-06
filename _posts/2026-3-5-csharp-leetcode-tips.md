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

#### Looping / Accessing Elements
Note: `PriorityQueue` is **not** enumerable in order.

```csharp
// 1. Destructive (Maintains Priority Order)
while (minHeap.Count > 0) {
    var item = minHeap.Dequeue();
    Console.WriteLine(item);
}

// 2. Non-Destructive (Unordered)
// Use .UnorderedItems to see contents without clearing the queue
foreach (var (element, priority) in minHeap.UnorderedItems) {
    Console.WriteLine($"{element} at {priority}");
}

// Quick Print (for debugging, Unordered)
Console.WriteLine(string.Join(", ", minHeap.UnorderedItems.Select(x => $"({x.Element}, {x.Priority})")));
```

### Dictionary & HashSet
Fast O(1) lookups for frequency counting and existence checks.

**Note**: `TryGetValue` and `ContainsKey` do **not** add the key to the dictionary.

#### Adding / Updating Items
```csharp
var map = new Dictionary<int, string>();

// 1. Check-then-Add (ContainsKey)
if (!map.ContainsKey(1)) {
    map[1] = "Value";
}

// 2. Try-Get-then-Add (TryGetValue) - Faster (one lookup)
if (!map.TryGetValue(2, out var existing)) {
    map[2] = "New Value";
}

// 3. Collection Initializer
var counts = new Dictionary<char, int> { ['a'] = 1, ['b'] = 2 };
```

#### Looping through Dictionary
```csharp
// Loop through KeyValuePairs
foreach (KeyValuePair<int, string> entry in map) {
    Console.WriteLine($"{entry.Key}: {entry.Value}");
}

// Deconstruction (C# 7+) - Most common for LeetCode
foreach (var (key, val) in map) {
    Console.WriteLine($"{key}: {val}");
}

// Loop through Keys or Values only
foreach (int key in map.Keys) { ... }
foreach (string val in map.Values) { ... }

// Quick Print (for debugging)
Console.WriteLine(string.Join(", ", map.Select(kvp => $"[{kvp.Key}, {kvp.Value}]")));

// GetValueOrDefault (C# 7+)
var value = map.GetValueOrDefault(1, "default");
```

#### Frequency Map (Counter)
C# doesn't have a built-in `Counter` class like Python, but you can easily achieve the same behavior.

```csharp
// 1. Manual Approach (Efficient)
var counter = new Dictionary<char, int>();
foreach (char c in s) {
    counter[c] = counter.GetValueOrDefault(c) + 1;
}

// 2. LINQ Approach (Concise)
var counter = s.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());

// 3. Most Common (Counter.most_common(k))
var topK = counter.OrderByDescending(kvp => kvp.Value)
                  .Take(k)
                  .Select(kvp => kvp.Key)
                  .ToList();
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

### Conversions, Joining & Substrings
```csharp
char[] chars = s.ToCharArray();
string reversed = new string(chars);      // Constructor takes char array
string joined = string.Join(",", array);  // Joins elements with separator

// Substrings and Slicing
string sub = s.Substring(startIndex, length); 
string sub2 = s[startIndex..endIndex];   // C# 8.0+ Range [start, end)
```

### Common List & Array Operations
```csharp
var list = new List<int> { 3, 1, 2 };
list.Add(4);
list.RemoveAt(0);        // Remove by index
list.Sort();             // In-place sort O(N log N)
list.Reverse();          // In-place reverse

int[] arr = list.ToArray();
List<int> newList = new List<int>(arr);
```

### LINQ for Competitive Programming
Useful for quick transformations, but be mindful of performance in tight loops.
```csharp
using System.Linq;

// Filtering and Mapping
var evenSquares = nums.Where(n => n % 2 == 0).Select(n => n * n).ToList();

// Sum, Min, Max, Average
int total = nums.Sum();
int min = nums.Min();

// Sorting
var sorted = nums.OrderBy(n => n).ThenByDescending(n => n).ToList();
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

## 4. Competitive Programming Input/Output
Essential for platforms like HackerRank or Codeforces.

```csharp
// Reading a single line of integers
int[] nums = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();

// Reading multiple lines
string line;
while ((line = Console.ReadLine()) != null) {
    // Process line
}

// Fast Output
Console.WriteLine(string.Join(" ", result));
```

---

## 5. Useful Math & Utilities

### Binary Search
```csharp
int[] sortedArr = { 1, 3, 5, 7 };
int index = Array.BinarySearch(sortedArr, 5); // returns index (2)

// If not found, returns a negative number (~index of next larger element)
if (index < 0) {
    int insertIndex = ~index; 
}
```

### Tuples & Object Deconstruction
```csharp
// 1. Tuples for Multiple Returns
public (int min, int max) GetStats(int[] nums) {
    return (nums.Min(), nums.Max());
}

// Usage with deconstruction
var (min, max) = GetStats(nums);

// 2. Custom Object Deconstruction (C# 7.0+)
// Add a Deconstruct method to any class/struct
public class Point {
    public int X { get; }
    public int Y { get; }
    public Point(int x, int y) => (X, Y) = (x, y);

    public void Deconstruct(out int x, out int y) {
        x = X;
        y = Y;
    }
}

var point = new Point(10, 20);
var (x, y) = point; // Deconstruction in action
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

### Sliding Window Template
```csharp
public int SlidingWindow(int[] nums, int k) {
    int left = 0, right = 0, currentSum = 0, result = 0;
    
    while (right < nums.Length) {
        currentSum += nums[right];
        
        // Shrink window if condition met
        while (/* condition */) {
            currentSum -= nums[left];
            left++;
        }
        
        result = Math.Max(result, right - left + 1);
        right++;
    }
    return result;
}
```

### Binary Search (Search Space)
Use this for "Minimizing the Maximum" or "Maximizing the Minimum" problems.
```csharp
public int BinarySearchRange(int low, int high) {
    int ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (IsValid(mid)) {
            ans = mid;
            high = mid - 1; // Try smaller if minimizing
        } else {
            low = mid + 1;
        }
    }
    return ans;
}
```

### Backtracking (Subsets/Permutations)
```csharp
public void Backtrack(int start, List<int> current, int[] nums) {
    // 1. Base case / Goal
    result.Add(new List<int>(current));
    
    for (int i = start; i < nums.Length; i++) {
        // 2. Choose
        current.Add(nums[i]);
        
        // 3. Explore
        Backtrack(i + 1, current, nums);
        
        // 4. Un-choose (Backtrack)
        current.RemoveAt(current.Count - 1);
    }
}
```

---

## 4. References & Further Reading
*   **Microsoft Learn:** [Collections and Data Structures](https://learn.microsoft.com/en-us/dotnet/standard/collections/)
*   **Microsoft Learn:** [PriorityQueue<TElement,TPriority> Class](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2)
*   **Blog:** [Big O Notation in C# for Beginners](https://rehansaeed.com/big-o-notation-in-csharp/)
*   **Practice:** [LeetCode - Top Interview Questions (C#)](https://leetcode.com/problemset/all/?topicSlugs=csharp&listId=wpwgkgt)

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
* [Part 9: Repository and Unit of Work Patterns: Implementation and Benefits]({{ site.baseurl }}{% post_url 2026-3-5-repository-unit-of-work %})
* [Part 10: TDD and Unit Testing in .NET: Production-Ready Strategies]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
