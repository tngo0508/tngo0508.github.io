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
Strings in C# are **immutable**. Every time you use `+` to concatenate strings, a **new** string object is allocated on the heap, and the old characters are copied over. In a loop of `N` iterations, this leads to `O(N^2)` time complexity and massive memory allocations.

Always use `StringBuilder` (from `System.Text`) for multiple concatenations to keep it `O(N)` and avoid GC pressure.

```csharp
var sb = new StringBuilder();
for (int i = 0; i < 100; i++) {
    sb.Append(i); // Efficiently appends to an internal buffer
}
string result = sb.ToString(); // O(N) at the end
```

*   **Tip:** If you know the final size, initialize with capacity: `new StringBuilder(1000)`.
*   **Edge Case:** If you are only joining a fixed number of strings (e.g., `s1 + s2 + s3`), the compiler optimizes this to `string.Concat`, which is efficient. `StringBuilder` is for dynamic scenarios.

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
Useful for quick transformations, but be mindful of performance in tight loops (especially with Large datasets or deep recursion).

```csharp
using System.Linq;

// 1. Filtering & Existence
bool allPositive = nums.All(n => n > 0);
bool hasZero = nums.Any(n => n == 0);
int evensCount = nums.Count(n => n % 2 == 0);

// 2. Transformations
var squares = nums.Select(n => n * n);
var flattened = matrix.SelectMany(row => row); // Flattens 2D to 1D
var zipped = nums1.Zip(nums2, (a, b) => a + b); // Element-wise sum

// 3. Unique & Set Operations
var unique = nums.Distinct().ToArray();
var common = listA.Intersect(listB);
var diff = listA.Except(listB); // Elements in A not in B

// 4. Element Access (Safe)
int first = nums.FirstOrDefault(-1); // Returns -1 if empty
int last = nums.LastOrDefault();

// 5. MaxBy & MinBy (.NET 6+) - Find element with max property
var oldestPerson = people.MaxBy(p => p.Age);
var shortestPath = paths.MinBy(p => p.Length);

// 6. Generation (Great for testing)
var range = Enumerable.Range(1, 100); // 1 to 100
var repeated = Enumerable.Repeat(-1, 10); // ten -1s

// 7. Sum, Min, Max, Average
int total = nums.Sum();
int min = nums.Min();

// 8. Sorting
var sorted = nums.OrderBy(n => n).ThenByDescending(n => n).ToList();
```

### Arrays & Lists
Essential for storing and manipulating collections of data.

#### Initialization
```csharp
// 1D Array
int[] arr = new int[10];
int[] arr2 = { 1, 2, 3 };
int[] arr3 = new int[] { 1, 2, 3 };
Array.Fill(arr, -1); // Quick fill with a value

// 2D Jagged Array (Array of Arrays) - Preferred for LeetCode
// Each row can have a different length; fits naturally with dynamic graph inputs.
int[][] jagged = new int[rows][];
for (int i = 0; i < rows; i++) {
    jagged[i] = new int[cols];
}

// 2D Multi-dimensional Array (Rectangular)
// Fixed size; memory is contiguous; cleaner syntax for indexing [i, j].
int[,] matrix = new int[rows, cols];
matrix[0, 1] = 5;

// TRICK: Quickly fill a 2D Array
for (int i = 0; i < rows; i++) Array.Fill(jagged[i], -1); // Jagged
// Array.Fill does NOT work directly on multi-dimensional [,] arrays.
```

#### Common Static Array Methods
These are methods on the `Array` class itself (`Array.Method(arr)`).

```csharp
int[] arr = { 5, 2, 8, 1, 9 };

// 1. Sort O(N log N)
Array.Sort(arr); // { 1, 2, 5, 8, 9 }

// 2. Reverse O(N)
Array.Reverse(arr); // { 9, 8, 5, 2, 1 }

// 3. Binary Search (Requires sorted array!)
int index = Array.BinarySearch(arr, 5); // returns index or negative

// 4. Fill O(N)
Array.Fill(arr, 0); // Fills everything with 0

// 5. Clear O(N)
Array.Clear(arr, 0, arr.Length); // Resets elements to default (0 for int)

// 6. Copy O(N)
int[] target = new int[5];
Array.Copy(arr, target, arr.Length);

// 7. Find, FindAll, Exists (Predicate based)
bool hasEven = Array.Exists(arr, x => x % 2 == 0);
int firstEven = Array.Find(arr, x => x % 2 == 0);
int[] allEvens = Array.FindAll(arr, x => x % 2 == 0);

// 8. IndexOf
int idx = Array.IndexOf(arr, 8); // Returns index of first occurrence or -1
```

#### List<int> vs int[]
The difference between `int[]` and `List<int>` is in the underlying data structure.

| Feature | `int[]` | `List<int>` |
| :--- | :--- | :--- |
| **Size** | Fixed (Immutable length) | Dynamic (Resizes automatically) |
| **Performance** | Slightly faster (No overhead) | Slight overhead due to resizing |
| **Common Use** | Known bounds, static grids | Unknown bounds, stacks, BFS/DFS |
| **Return Type** | Often expected by LeetCode | Flexible for intermediate steps |

**Tip**: If you know the size upfront, use `int[]` or initialize `List<int>` with capacity: `new List<int>(size)`.

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
| **Left Shift** | `a << 1` | Multiply by 2^n |
| **Right Shift** | `a >> 1` | Divide by 2^n |

```csharp
int a = 5, b = 3; // 101, 011
int and = a & b;  // 1 (001)
int or  = a | b;  // 7 (111)
int xor = a ^ b;  // 6 (110)
int not = ~a;     // -6 (Inverts all bits)
int left = a << 1; // 10 (1010)
int right = a >> 1; // 2 (10)

// Check if i-th bit is set
bool isSet = (a & (1 << i)) != 0;

// Set i-th bit
a |= (1 << i);

// Clear i-th bit
a &= ~(1 << i);
```

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

## 6. General Tips & Advice

1.  **Use `long` for overflow**: In problems involving large products or cumulative sums, use `long` to avoid overflow before returning the result as an `int`.
    ```csharp
    long sum = 0;
    foreach (int n in nums) sum += n;
    return (int)(sum % 1000000007);
    ```
2.  **Recursion Depth**: C# has a default stack size. For very deep DFS (> 10^4), prefer an iterative approach with `Stack<T>` to avoid `StackOverflowException`.
    ```csharp
    var stack = new Stack<Node>();
    stack.Push(root);
    while (stack.Count > 0) { ... }
    ```
3.  **`int.MaxValue` and `int.MinValue`**: Standard values for initializing minimums and maximums.
    ```csharp
    int min = int.MaxValue;
    int max = int.MinValue;
    ```
4.  **`char - 'a'`**: Quickly get the 0-25 index of a lowercase character.
    ```csharp
    int index = c - 'a'; // 'b' -> 1
    char original = (char)('a' + index);
    ```
5.  **`SortedSet<T>` / `SortedDictionary<K,V>`**: Use these when you need elements to remain sorted at all times (Red-Black tree under the hood).
    ```csharp
    var set = new SortedSet<int>();
    set.Add(5); set.Add(1);
    int min = set.Min; // 1
    int max = set.Max; // 5
    ```
6.  **`String.Compare`**: For lexicographical comparison of strings.
    ```csharp
    int result = string.Compare("apple", "banana"); // Negative (apple < banana)
    ```
7.  **`List<T>.Capacity`**: If you know the final size of a list, initialize it with `new List<int>(size)` to avoid multiple reallocations.
    ```csharp
    var list = new List<int>(1000); // Pre-allocates space for 1000 elements
    ```

---

## 7. Common Patterns Templates

### Decision Guide: How to Approach a Problem
```text
       [ START ]
           |
           v
    Is it a Graph/Tree? - YES -> Shortest Path? - YES -> (Unweighted) -> [BFS]
           |                      |               |
           NO                     |               +----> (Weighted)   -> [Dijkstra]
           |                      |
           v                      NO -> Connected? -- YES -> [Union Find]
    Is it Sorted? --- YES -> [Binary Search]           |
           |                 [Two Pointers]            NO -> [DFS] / [BFS]
           NO
           |
           v
    Subarray/String? - YES -> [Sliding Window] / [Prefix Sum]
           |
           NO
           |
           v
    Top K Elements? - YES -> [Heap / PriorityQueue]
           |
           NO
           |
           v
    All Comb/Perm? -- YES -> [Backtracking]
           |
           NO
           |
           v
    Freq/Existence? - YES -> [HashMap / HashSet]
           |
           NO
           |
           v
    [Greedy] or [Dynamic Programming]
```

### Linked List Basics (Dummy Node & Two Pointers)
**When to use:**
- **Dummy Node:** When the head of the list might change or be removed (e.g., *Merge Two Sorted Lists*, *Remove Nth Node from End*).
- **Two Pointers (Slow/Fast):** To find the middle of a list (e.g., *Middle of the Linked List*) or detect a cycle (e.g., *Linked List Cycle*).

```csharp
public class ListNode {
    public int val;
    public ListNode next;
    public ListNode(int val=0, ListNode next=null) {
        this.val = val;
        this.next = next;
    }
}

// 1. Dummy Node Technique (Useful for removals and head-modifying cases)
public ListNode RemoveElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0, head);
    ListNode curr = dummy;
    while (curr.next != null) {
        if (curr.next.val == val) curr.next = curr.next.next;
        else curr = curr.next;
    }
    return dummy.next;
}

// 2. Two Pointers (Slow & Fast) - Find Middle or Cycle
public ListNode FindMiddle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
```

### BFS (Level Order)
**When to use:** Shortest path in unweighted graphs, level-by-level traversal, and finding the minimum number of steps to reach a goal.

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
**When to use:** Exhaustive search, pathfinding where depth matters, and tree traversals where you need to explore a branch fully before moving to the next.

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
**When to use:** Finding the shortest path in a weighted graph with **non-negative weights**.

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
**When to use:** Finding the top `k` elements in an array or the `k-th` largest/smallest element (e.g., *K-th Largest Element in an Array*).

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
**When to use:** Maintaining a running median or finding the middle element in a continuously updating stream of data.

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
**When to use:** Finding a contiguous subarray or substring that meets a specific condition (e.g., *Longest Substring Without Repeating Characters*, *Minimum Size Subarray Sum*).

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
**When to use:** "Minimizing the maximum" or "Maximizing the minimum" problems, or when the answer range is known and monotonic (e.g., *Koko Eating Bananas*, *Capacity To Ship Packages Within D Days*).

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
**When to use:** Generating all possible combinations, permutations, or subsets. Also useful for "Sudoku" or "N-Queens" style constraint-satisfaction problems.

```csharp
// 0. Generic Template
void Backtrack(State state) {
    if (IsSolution(state)) {
        ProcessSolution(state);
        return;
    }
    
    foreach (var choice in GetChoices(state)) {
        if (IsValid(choice, state)) {
            MakeChoice(choice, state);
            Backtrack(state);
            UndoChoice(choice, state); // Backtrack
        }
    }
}

// 1. Subsets (Power Set) - O(2^N)
public IList<IList<int>> Subsets(int[] nums) {
    var result = new List<IList<int>>();
    void Backtrack(int start, List<int> current) {
        result.Add(new List<int>(current)); // Add every intermediate state
        for (int i = start; i < nums.Length; i++) {
            current.Add(nums[i]);
            Backtrack(i + 1, current); // Move to next element
            current.RemoveAt(current.Count - 1);
        }
    }
    Backtrack(0, new List<int>());
    return result;
}

// 2. Permutations - O(N!)
public IList<IList<int>> Permute(int[] nums) {
    var result = new List<IList<int>>();
    bool[] used = new bool[nums.Length];
    void Backtrack(List<int> current) {
        if (current.Count == nums.Length) {
            result.Add(new List<int>(current)); // Add when full permutation is formed
            return;
        }
        for (int i = 0; i < nums.Length; i++) {
            if (used[i]) continue;
            used[i] = true;
            current.Add(nums[i]);
            Backtrack(current);
            current.RemoveAt(current.Count - 1);
            used[i] = false;
        }
    }
    Backtrack(new List<int>());
    return result;
}
```

### Trie (Prefix Tree)
**When to use:** Prefix matching, autocomplete, and dictionary-related problems where you need to search for words with a common prefix efficiently (e.g., *Implement Trie*, *Word Search II*).

```csharp
public class TrieNode {
    public TrieNode[] Children = new TrieNode[26];
    public bool IsEndOfWord = false;
}

public class Trie {
    private readonly TrieNode root = new TrieNode();

    public void Insert(string word) {
        var node = root;
        foreach (var c in word) {
            int idx = c - 'a';
            if (node.Children[idx] == null) node.Children[idx] = new TrieNode();
            node = node.Children[idx];
        }
        node.IsEndOfWord = true;
    }

    public bool Search(string word) {
        var node = GetNode(word);
        return node != null && node.IsEndOfWord;
    }

    public bool StartsWith(string prefix) {
        return GetNode(prefix) != null;
    }

    private TrieNode GetNode(string s) {
        var node = root;
        foreach (var c in s) {
            int idx = c - 'a';
            if (idx < 0 || idx >= 26 || node.Children[idx] == null) return null;
            node = node.Children[idx];
        }
        return node;
    }
}
```

### Union Find (Disjoint Set Union)
**When to use:** Connected components in a graph, cycle detection in undirected graphs, and merging sets efficiently (e.g., *Number of Provinces*, *Redundant Connection*).

```csharp
public class UnionFind {
    private int[] parent;
    private int[] rank;

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            rank[i] = 1;
        }
    }

    public int Find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = Find(parent[i]); // Path compression
    }

    public bool Union(int i, int j) {
        int rootI = Find(i);
        int rootJ = Find(j);
        if (rootI != rootJ) {
            if (rank[rootI] > rank[rootJ]) {
                parent[rootJ] = rootI;
            } else if (rank[rootI] < rank[rootJ]) {
                parent[rootI] = rootJ;
            } else {
                parent[rootJ] = rootI;
                rank[rootI]++;
            }
            return true;
        }
        return false;
    }
}
```

---

## 8. Big O Complexity Analysis
Crucial for the "How can we optimize this?" part of the interview.

### How to Estimate
- **Iterative**: Count nested loops. O(N^k) where k is the depth.
- **Sequential**: Add them up. O(N + M).
- **Logarithmic**: Divide/Multiply by 2 each step (Binary Search). O(log N).
- **Recursive**: O(branches^depth).
    -   **Subsets**: O(2^N).
    -   **Permutations**: O(N!).
    -   **DFS on Tree**: O(N) where N is the number of nodes.

### C# Data Structure Complexity Table

| Data Structure | Access | Search | Insert (Push/Enqueue) | Delete (Pop/Dequeue) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Array** | O(1) | O(N) | O(N) | O(N) | Fixed size, contiguous memory. |
| **List<T>** | O(1) | O(N) | O(1)^* | O(N) | ^*Amortized O(1) for `Add`. |
| **Linked List** | O(N) | O(N) | O(1) | O(1) | Manual Singly Linked List. |
| **Dictionary<K,V>** | N/A | O(1) | O(1) | O(1) | Hash-based. |
| **HashSet<T>** | N/A | O(1) | O(1) | O(1) | Unique elements. |
| **Stack<T>** | N/A | O(N) | O(1) | O(1) | LIFO. |
| **Queue<T>** | N/A | O(N) | O(1) | O(1) | FIFO. |
| **PriorityQueue<T,P>**| N/A | O(N) | O(log N) | O(log N) | Heap-based. |
| **SortedSet<T>** | N/A | O(log N) | O(log N) | O(log N) | Red-Black Tree. |
| **Trie** | N/A | O(L) | O(L) | O(L) | Prefix Tree, L = word length. |
| **Union Find** | N/A | α(N) | α(N) | α(N) | Disjoint Set, Inverse Ackermann. |

### Common C# Built-in Complexities
- `Array.Sort`: O(N log N).
- `string.Substring` or `s[a..b]`: O(K) where K is the length of the slice.
- `LINQ .OrderBy()`: O(N log N).
- `LINQ .GroupBy()`: O(N) (one pass over the collection).
- `StringBuilder.ToString()`: O(N).

---

## 9. References & Further Reading
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
* [Part 11: xUnit Testing: Facts, Theories, and Data-Driven Tests]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})
* [Part 12: FluentAssertions: Write More Readable Unit Tests]({{ site.baseurl }}{% post_url 2026-3-7-fluent-assertions %})
