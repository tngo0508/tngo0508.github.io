---
layout: single
title: "Problem of The Day: Find Polygon With the Largest Perimeter"
date: 2024-2-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

[![problem-1481](/assets/images/2024-02-15_17-00-08-problem-1481.png)](/assets/images/2024-02-15_17-00-08-problem-1481.png)

## Intuition

My initial thought is to use a counter to keep track of the frequency of each number in the array.

## Approach

I'll start by creating a counter for the input array to get the frequency of each number. Then, I'll transform this counter into a list of tuples, where each tuple contains the frequency and the corresponding number. Sorting this list based on frequency allows me to prioritize removal of numbers with lower frequencies.

I'll iterate through the sorted list, deducting the frequency from k until I can't do so anymore. After that, I'll count the remaining unique integers with positive frequencies.

## Complexity

- Time complexity:
O(n * log(n)) due to the sorting step.

- Space complexity:
O(n) for storing the counter and the temporary list of tuples.

## Code

```python
class Solution:
    def findLeastNumOfUniqueInts(self, arr: List[int], k: int) -> int:
        counter = Counter(arr)
        temp = [(v, k) for k, v in counter.items()]
        temp.sort(key=lambda x:x[0])

        for freq, num in temp:
            if k < freq:
                break
            k -= freq
            counter[num] -= freq
        
        count = 0
        for k, v in counter.items():
            if v > 0:
                count += 1

        return count
```

## Editorial Solution

>Need to review this again

### Approach 3: Counting Sort

```python
class Solution:
    def findLeastNumOfUniqueInts(self, arr: List[int], k: int) -> int:
        # Dictionary to track the frequencies of elements
        map = {}
        for i in arr:
            map[i] = map.get(i, 0) + 1

        n = len(arr)

        # List to track the frequencies of frequencies
        # The maximum possible frequency of any element
        # will be n, so we'll initialize this list with size n + 1
        count_of_frequencies = [0] * (n + 1)

        # Populating count_of_frequencies list
        for count in map.values():
            count_of_frequencies[count] += 1

        # Variable to track the remaining number of unique elements
        remaining_unique_elements = len(map)

        # Traversing over all possible frequencies
        for i in range(1, n + 1):
            # For each possible frequency i, we'd like to remove as
            # many elements with that frequency as possible.
            # k // i represents the number of maximum possible elements
            # we could remove with k elements left to remove.
            # count_of_frequencies[i] represents the actual number of elements
            # with frequency i.
            num_elements_to_remove = min(k // i, count_of_frequencies[i])

            # Removing the maximum possible elements
            k -= (i * num_elements_to_remove)

            # num_elements_to_remove is the count of unique elements removed
            remaining_unique_elements -= num_elements_to_remove

            # If the number of elements that can be removed is less
            # than the current frequency, we won't be able to remove
            # any more elements with a higher frequency so we can return
            # the remaining number of unique elements
            if k < i:
                return remaining_unique_elements

        # We have traversed all possible frequencies i.e.,
        # removed all elements. Returning 0 in this case.
        return 0
```
