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
  - Algorithms
  - Interview Preparation
  - LeetCode
  - Python
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

# Sort by multiple criteria (length ASC, then value DESC)
# Trick: Use negative for numbers to reverse order within a tuple
nums.sort(key=lambda x: (len(str(x)), -x))

# Reverse sort
nums.sort(reverse=True)
```

### Common Built-ins
*   `enumerate(iterable)`: Get index and value.
*   `zip(list1, list2)`: Iterate over multiple lists simultaneously.
*   `map(func, iterable)`: Apply function to all items.
*   `filter(func, iterable)`: Keep items where func(item) is True.
*   `all(iterable)` / `any(iterable)`: Check if all or any elements are truthy.

```python
# 1. Enumerate
for idx, val in enumerate(nums): ...

# 2. Zip (Stop at shortest)
for n1, n2 in zip(list1, list2): ...

# 3. Zip (Fill missing)
from itertools import zip_longest
for n1, n2 in zip_longest(list1, list2, fillvalue=0): ...

# 4. Map & Filter
squares = list(map(lambda x: x*x, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
```

---

## 2. Essential Data Structures (`collections`)

### `deque` (Double-ended queue)
Fast O(1) appends and pops from both ends. Ideal for BFS.
```python
from collections import deque
q = deque([1, 2, 3])
q.append(4)
q.appendleft(0)
val = q.popleft()     # 0
last = q.pop()        # 4
q.rotate(1)           # Shift right by 1
```

### `Counter`
Hash map for counting hashable objects.
```python
from collections import Counter
counts = Counter("banana") # Counter({'a': 3, 'n': 2, 'b': 1})
top_two = counts.most_common(2) # [('a', 3), ('n', 2)]

# Counter Arithmetic
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
res = c1 + c2 # Counter({'a': 4, 'b': 3})
res = c1 - c2 # Counter({'a': 2}) - Keeps only positive counts
```

### `defaultdict`
Automatically initializes keys if they don't exist.
```python
from collections import defaultdict
adj = defaultdict(list)
adj[u].append(v)

# Frequency map with defaultdict(int)
counts = defaultdict(int)
for x in nums: counts[x] += 1
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

# Heapify a list in-place O(N)
heapq.heapify(arr)

# Get N largest/smallest O(N log K)
top_k = heapq.nlargest(k, nums)
bottom_k = heapq.nsmallest(k, nums)
```

### `bisect` (Binary Search)
```python
import bisect
# Find insertion point to maintain order
# bisect_left: leftmost insertion point (lower bound)
idx = bisect.bisect_left(arr, target) 

# bisect_right: rightmost insertion point (upper bound)
idx = bisect.bisect_right(arr, target)

# Insert while maintaining order
bisect.insort(arr, target)
```

---

## 4. Arrays & Lists

### Initialization & Comprehensions
```python
# 1D Array
arr = [0] * 10
arr2 = [i for i in range(10)]

# 2D Array (Jagged/Matrix)
# CORRECT way:
matrix = [[0] * cols for _ in range(rows)]

# INCORRECT way (All rows will point to the same object!):
bad_matrix = [[0] * cols] * rows 

# List Slicing
nums[start:end]      # [start, end)
nums[::-1]           # Reverse
nums[1:4]            # Index 1, 2, 3
```

### List vs. Set vs. Dict Lookups

| Data Structure | Lookup | Add/Remove | Use Case |
| :--- | :--- | :--- | :--- |
| **List** | O(N) | O(1) append, O(N) insert | Ordered collection |
| **Set** | O(1) | O(1) | Unique items, fast existence check |
| **Dict** | O(1) | O(1) | Key-value pairs, frequency maps |

---

## 5. Bit Manipulation Tricks
Commonly used for performance optimization and specific problems.

| Operation | Syntax | Use Case |
| :--- | :--- | :--- |
| **AND** | `a & b` | Check if bit is set, clear bits |
| **OR** | `a | b` | Set a specific bit |
| **XOR** | `a ^ b` | Toggle a bit, find single element in pairs |
| **NOT** | `~a` | Invert all bits (careful with Python's infinite bits) |
| **Left Shift** | `a << 1` | Multiply by 2^n |
| **Right Shift** | `a >> 1` | Floor divide by 2^n |

```python
# Check if i-th bit is set
is_set = (n & (1 << i)) != 0

# Set i-th bit
n |= (1 << i)

# Clear i-th bit
n &= ~(1 << i)

# Toggle i-th bit
n ^= (1 << i)

# Common Trick: Remove rightmost set bit
n &= (n - 1) # Useful for counting set bits (Hamming Weight)

# Check if Power of 2
is_pow_2 = n > 0 and (n & (n - 1)) == 0
```

---

## 6. Competitive Programming Input/Output
Essential for platforms like HackerRank or Codeforces.

```python
import sys

# 1. Reading single line of integers
nums = list(map(int, sys.stdin.readline().split()))

# 2. Reading multiple lines until EOF
for line in sys.stdin:
    process(line.strip())

# 3. Fast Output
sys.stdout.write(" ".join(map(str, result)) + "\n")
```

---

## 7. Math & Utilities

```python
import math

# 1. Initialization
min_val = float('-inf')
max_val = float('inf')

# 2. Common Functions
math.gcd(a, b)       # Greatest Common Divisor
math.lcm(a, b)       # Least Common Multiple (Python 3.9+)
math.isqrt(n)        # Integer square root
math.perm(n, k)      # Permutations
math.comb(n, k)      # Combinations

# 3. Quotient & Remainder
q, r = divmod(10, 3) # q=3, r=1

# 4. Character Conversion
ord('a')             # 97
chr(97)              # 'a'
# Character-to-index (0-25)
idx = ord(char) - ord('a')
```

---

## 8. Useful Tips & Advice

1.  **Integer Size:** Python integers have arbitrary precision (no overflow!), but be mindful of complexity when working with massive numbers.
2.  **String Joins:** `" ".join(list_of_strings)` is O(n), while repeatedly using `+` is O(n²).
3.  **Recursion Limit:** For deep DFS, you may need to increase the limit.
    ```python
    import sys
    sys.setrecursionlimit(2000)
    ```
4.  **For-Else:** The `else` block runs if the loop completes without a `break`.
    ```python
    for x in nums:
        if x == target: break
    else:
        # Runs ONLY if target was not found
        print("Not found")
    ```
5.  **Walrus Operator (Python 3.8+):** Assign and use in one expression.
    ```python
    if (n := len(nums)) > 10:
        print(f"List is long: {n}")
    ```

---

## 9. Algorithmic Templates

### Sliding Window (Fixed Size)
```python
def sliding_window_fixed(nums, k):
    curr_sum = sum(nums[:k])
    max_sum = curr_sum
    for i in range(k, len(nums)):
        curr_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, curr_sum)
    return max_sum
```

### Sliding Window (Variable Size)
```python
def sliding_window_variable(nums, target):
    l = 0
    curr_sum = 0
    ans = float('inf')
    for r in range(len(nums)):
        curr_sum += nums[r]
        while curr_sum >= target:
            ans = min(ans, r - l + 1)
            curr_sum -= nums[l]
            l += 1
    return ans if ans != float('inf') else 0
```

### Binary Search (Search Space)
```python
def binary_search_space(low, high):
    while low <= high:
        mid = (low + high) // 2
        if check(mid):
            ans = mid
            high = mid - 1 # Try smaller
        else:
            low = mid + 1 # Try larger
    return ans
```

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

### DFS (Iterative)
```python
def dfs_iterative(root):
    if not root: return
    stack = [root]
    visited = set()
    while stack:
        node = stack.pop()
        if node in visited: continue
        visited.add(node)
        # Process node
        for neighbor in reversed(node.neighbors):
            stack.append(neighbor)
```

### Backtracking (Template)
```python
def backtrack(start, path, options):
    if is_solution(path):
        res.append(path[:])
        return
    
    for i in range(start, len(options)):
        # 1. Choose
        path.append(options[i])
        # 2. Explore
        backtrack(i + 1, path, options)
        # 3. Un-choose (Backtrack)
        path.pop()
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

### Trie (Prefix Tree)
```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def search(self, word: str) -> bool:
        node = self.find_node(word)
        return node is not None and node.is_end_of_word

    def startsWith(self, prefix: str) -> bool:
        return self.find_node(prefix) is not None

    def find_node(self, s: str):
        node = self.root
        for char in s:
            if char not in node.children:
                return None
            node = node.children[char]
        return node
```

### Union Find (Disjoint Set Union)
```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [1] * n
    
    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i]) # Path compression
        return self.parent[i]
    
    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            if self.rank[root_i] > self.rank[root_j]:
                self.parent[root_j] = root_i
            elif self.rank[root_i] < self.rank[root_j]:
                self.parent[root_i] = root_j
            else:
                self.parent[root_j] = root_i
                self.rank[root_i] += 1
            return True
        return False
```

---

## 10. Big O Complexity Analysis
Crucial for the "How can we optimize this?" part of the interview.

### How to Estimate
- **Iterative**: Count nested loops. O(N^k) where k is the depth.
- **Sequential**: Add them up. O(N + M).
- **Logarithmic**: Divide/Multiply by 2 each step (Binary Search). O(log N).
- **Recursive**: O(branches^depth).
    -   **Subsets**: O(2^N).
    -   **Permutations**: O(N!).
    -   **DFS on Tree**: O(N) where N is the number of nodes.

### Python Data Structure Complexity Table

| Data Structure | Access | Search | Insert (Push/Enqueue) | Delete (Pop/Dequeue) | Notes                              |
|:---------------|:-------|:-------|:----------------------|:---------------------|:-----------------------------------|
| **List**       | O(1)   | O(N)   | O(1)^*                | O(N)                 | ^*Amortized O(1) for `append`. |
| **Dict**       | N/A    | O(1)   | O(1)                  | O(1)                 | Hash-based.                        |
| **Set**        | N/A    | O(1)   | O(1)                  | O(1)                 | Unique elements.                   |
| **deque**      | O(N)   | O(N)   | O(1)                  | O(1)                 | Fast appends/pops from both ends.  |
| **heapq**      | O(1)   | O(N)   | O(log N)              | O(log N)             | Min-heap (Access is `heap[0]`).    |
| **Trie**       | N/A    | O(L)   | O(L)                  | O(L)                 | Prefix Tree, L = word length.      |
| **Union Find** | N/A    | α(N)   | α(N)                  | α(N)                 | Disjoint Set, Inverse Ackermann.   |

### Common Python Built-in Complexities
- `list.sort()` or `sorted()`: O(N log N) (Timsort).
- `list[a:b]` (Slicing): O(K) where K = b - a.
- `x in list`: O(N).
- `x in set/dict`: O(1).
- `"".join(list_of_strings)`: O(N) where N is the total length of all strings.
- `collections.Counter(iterable)`: O(N).
- `deque.rotate(k)`: O(k).

---

## Python Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-python-review %})
* [Part 2: LeetCode Prep and Templates]({{ site.baseurl }}{% post_url 2026-3-5-python-leetcode-prep %})
