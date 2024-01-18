---
layout: single
title: "Problem of The Day: Find Median from Data Stream"
date: 2024-1-18
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Top 100 Liked
---
# Problem Statement
```
The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.

For example, for arr = [2,3,4], the median is 3.
For example, for arr = [2,3], the median is (2 + 3) / 2 = 2.5.
Implement the MedianFinder class:

MedianFinder() initializes the MedianFinder object.
void addNum(int num) adds the integer num from the data stream to the data structure.
double findMedian() returns the median of all elements so far. Answers within 10-5 of the actual answer will be accepted.
 

Example 1:

Input
["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]
[[], [1], [2], [], [3], []]
Output
[null, null, null, 1.5, null, 2.0]

Explanation
MedianFinder medianFinder = new MedianFinder();
medianFinder.addNum(1);    // arr = [1]
medianFinder.addNum(2);    // arr = [1, 2]
medianFinder.findMedian(); // return 1.5 (i.e., (1 + 2) / 2)
medianFinder.addNum(3);    // arr[1, 2, 3]
medianFinder.findMedian(); // return 2.0
```

# Intuition
The idea here is to maintain two heaps: a max heap to store the smaller half of the numbers and a min heap to store the larger half. This approach allows for quick retrieval of the median.

# Approach
- Initialize two heaps: `max_heap` and `min_heap`.
- For each added number, determine whether it should go to the max heap or min heap based on comparisons with the current median.
- Balance the heaps to ensure that the size difference between them is at most 1.
- Retrieve the median based on the size of the heaps.

# Complexity
- Time complexity:
    - Adding a number takes logarithmic time in the size of the heaps (O(log n)).
    - Finding the median is constant time.

- Space complexity:
O(n) where n is the number of elements in the stream, as we are storing all elements in the heaps.

# Code
```python
from heapq import *
class MedianFinder:

    def __init__(self):
        self.min_heap = [] # larger numbers
        self.max_heap = [] # smaller numbers
        

    def addNum(self, num: int) -> None:
        if not self.max_heap and not self.min_heap:
            heappush(self.max_heap, -num)
            return

        if self.max_heap and num > -self.max_heap[0]:
            heappush(self.min_heap, num)
        else:
            heappush(self.max_heap, -num)
        
        if len(self.max_heap) - len(self.min_heap) >= 1:
            heappush(self.min_heap, -heappop(self.max_heap))
        
        if len(self.min_heap) - len(self.max_heap) >= 2:
            heappush(self.max_heap, -heappop(self.min_heap))

    def findMedian(self) -> float:
        # print(f'smaller: {self.max_heap}')
        # print(f'larger: {self.min_heap}')
        if len(self.max_heap) == len(self.min_heap):
            return (-self.max_heap[0] + self.min_heap[0]) / 2.0
        return self.min_heap[0] if self.min_heap else -self.max_heap[0]


# Your MedianFinder object will be instantiated and called as such:
# obj = MedianFinder()
# obj.addNum(num)
# param_2 = obj.findMedian()
```

# Editorial Solution
```cpp
class MedianFinder {
    priority_queue<int> lo;                              // max heap
    priority_queue<int, vector<int>, greater<int>> hi;   // min heap

public:
    // Adds a number into the data structure.
    void addNum(int num)
    {
        lo.push(num);                                    // Add to max heap

        hi.push(lo.top());                               // balancing step
        lo.pop();

        if (lo.size() < hi.size()) {                     // maintain size property
            lo.push(hi.top());
            hi.pop();
        }
    }

    // Returns the median of current data stream
    double findMedian()
    {
        return lo.size() > hi.size() ? lo.top() : ((double) lo.top() + hi.top()) * 0.5;
    }
};
```

# Clean Solution in Python
```python
class MedianFinder:

    def __init__(self):
        self.min_stack = []
        self.max_stack = []

    def addNum(self, num: int) -> None:
        if len(self.min_stack) == len(self.max_stack):
            heapq.heappush(self.min_stack, -heapq.heappushpop(self.max_stack, -num))
        else:
            heapq.heappush(self.max_stack, -heapq.heappushpop(self.min_stack, num))

        

    def findMedian(self) -> float:
        if len(self.min_stack) == len(self.max_stack):
            return (self.min_stack[0] - self.max_stack[0]) / 2
        else:
            return self.min_stack[0]
        


# Your MedianFinder object will be instantiated and called as such:
# obj = MedianFinder()
# obj.addNum(num)
# param_2 = obj.findMedian()
```