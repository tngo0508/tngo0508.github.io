---
layout: single
title: "Python Interview Preparation: LeetCode Prep and Templates"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - Python
  - LeetCode
  - Algorithms
  - Interview Preparation
---

This post covers essential Python syntax, data structures, and algorithmic templates commonly used in technical interviews and LeetCode challenges.

## 1. Sorting and Built-ins

### Sorting
*   `list.sort()`: In-place sort (O(1) extra space).
*   `sorted(iterable)`: Returns a new sorted list (O(n) extra space).
*   **Custom Sort:** Use the `key` parameter (lambda).

```python
# Sort by string length
words.sort(key=lambda x: len(x))

# Sort by multiple criteria (length, then lexicographical)
words.sort(key=lambda x: (len(x), x))

# Reverse sort
nums.sort(reverse=True)
```

### Common Built-ins
*   `enumerate(iterable)`: Get index and value.
*   `zip(list1, list2)`: Iterate over multiple lists simultaneously.
*   `map(func, iterable)`: Apply function to all items.
*   `filter(func, iterable)`: Keep items where func(item) is True.

---

## 2. Essential Data Structures (`collections`)

### `deque` (Double-ended queue)
Fast O(1) appends and pops from both ends. Ideal for BFS.
```python
from collections import deque
q = deque([1, 2, 3])
q.append(4)
q.appendleft(0)
val = q.popleft()
```

### `Counter`
Hash map for counting hashable objects.
```python
from collections import Counter
counts = Counter("banana") # Counter({'a': 3, 'n': 2, 'b': 1})
top_two = counts.most_common(2)
```

### `defaultdict`
Automatically initializes keys if they don't exist.
```python
from collections import defaultdict
adj = defaultdict(list)
adj[u].append(v)
```

---

## 3. Heaps and Binary Search

### `heapq` (Min-Heap by default)
```python
import heapq
heap = []
heapq.heappush(heap, 4)
min_val = heapq.heappop(heap)

# Max-Heap trick: multiply by -1
heapq.heappush(max_heap, -num)
max_val = -heapq.heappop(max_heap)

# Heapify a list in-place
heapq.heapify(arr)
```

### `bisect` (Binary Search)
```python
import bisect
# Find insertion point to maintain order
idx = bisect.bisect_left(arr, target)
# Insert while maintaining order
bisect.insort(arr, target)
```

---

## 4. Bit Manipulation Tricks
Commonly used for performance optimization and specific problems.

| Operation | Syntax | Use Case |
| :--- | :--- | :--- |
| **AND** | `a & b` | Check if bit is set, clear bits |
| **OR** | `a | b` | Set a specific bit |
| **XOR** | `a ^ b` | Toggle a bit, find single element in pairs |
| **NOT** | `~a` | Invert all bits (careful with Python's infinite bits) |
| **Left Shift** | `a << 1` | Multiply by $2^n$ |
| **Right Shift** | `a >> 1` | Floor divide by $2^n$ |

**Common Trick:** `n & (n - 1)` removes the rightmost set bit. Useful for counting set bits.

---

## 5. Useful Tips & Advice

1.  **Integer Size:** Python integers have arbitrary precision (no overflow!), but use `float('inf')` and `float('-inf')` for min/max initialization.
2.  **Slicing:** `nums[start:end:step]`. `nums[::-1]` reverses a list/string.
3.  **String Joins:** `"".join(list_of_chars)` is O(n), while repeatedly using `+` is O(n²).
4.  **Divmod:** `q, r = divmod(a, b)` gets both quotient and remainder.
5.  **Character Conversion:** `ord('a')` → 97, `chr(97)` → 'a'.

---

## 5. Algorithmic Templates

### BFS (Level Order)
```python
def bfs(root):
    if not root: return
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for _ in range(level_size):
            node = queue.popleft()
            # Process node
            for neighbor in node.neighbors:
                queue.append(neighbor)
```

### DFS (Recursive)
```python
visited = set()
def dfs(node):
    if not node or node in visited: return
    visited.add(node)
    # Process node
    for neighbor in node.neighbors:
        dfs(neighbor)
```

### Dijkstra's Algorithm
```python
import heapq

def dijkstra(n, adj, start):
    # adj is {u: [(v, weight), ...]}
    dist = [float('inf')] * (n + 1)
    dist[start] = 0
    pq = [(0, start)] # (distance, node)

    while pq:
        d, u = heapq.heappop(pq)
        
        if d > dist[u]: continue
        
        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist
```

### K-th Largest Element
```python
import heapq

def findKthLargest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0] # Top of min-heap is K-th largest
```

### Median from Data Stream (Two Heaps)
```python
import heapq

class MedianFinder:
    def __init__(self):
        self.small = [] # Max-heap (smaller half)
        self.large = [] # Min-heap (larger half)

    def addNum(self, num):
        # Push to max-heap, then move max to min-heap
        heapq.heappush(self.small, -num)
        heapq.heappush(self.large, -heapq.heappop(self.small))
        
        # Balance: large can have at most one more than small
        if len(self.large) > len(self.small) + 1:
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.large) > len(self.small):
            return float(self.large[0])
        return (self.large[0] - self.small[0]) / 2.0
```

---

## Python Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-python-review %})
* [Part 2: LeetCode Prep and Templates]({{ site.baseurl }}{% post_url 2026-3-5-python-leetcode-prep %})
