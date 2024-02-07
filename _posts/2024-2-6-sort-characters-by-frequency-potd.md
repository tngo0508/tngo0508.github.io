---
layout: single
title: "Problem of The Day: Sort Characters By Frequency"
date: 2024-2-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-451](/assets/images/2024-02-06_19-21-10-problem-451.png)

## Intuition

My initial thought is to utilize a frequency-based sorting approach. By counting the frequency of each character in the string, I can then sort them based on their frequencies in descending order.

## Approach

To solve the problem, I'll start by counting the frequency of each character in the given string using a `Counter`. Then, I'll transform the counter items into a list of list, where each list contains the character and its frequency. After that, I'll sort this list in descending order based on the frequencies. Finally, I'll reconstruct the string by concatenating characters according to their frequencies in the sorted list.

## Complexity

- Time complexity:

  - Counting the frequency of characters takes O(n) time.
  - Sorting the list of tuples takes O(n log n) time.
  - Constructing the result string takes O(n) time.
  - Hence, the overall time complexity is O(n log n).

- Space complexity:
  O(n), where n is the length of the input string. This is because we're storing the frequency of each character and constructing the result string.

## Code

```python
class Solution:
    def frequencySort(self, s: str) -> str:
        counter_s = Counter(s)
        arr = []
        for c, freq in counter_s.items():
            arr.append([freq, c])

        arr.sort(reverse=True)
        res = []
        for freq, c in arr:
            res.append(c * freq)

        return ''.join(res)
```

## Editorial Solution

### Approach 1: Arrays and Sorting

```python
def frequencySort(self, s: str) -> str:
    if not s: return s

    # Convert s to a list.
    s = list(s)

    # Sort the characters in s.
    s.sort()

    # Make a list of strings, one for each unique char.
    all_strings = []
    cur_sb = [s[0]]
    for c in s[1:]:
        # If the last character on string builder is different...
        if cur_sb[-1] != c:
            all_strings.append("".join(cur_sb))
            cur_sb = []
        cur_sb.append(c)
    all_strings.append("".join(cur_sb))

    # Sort the strings by length from *longest* to shortest.
    all_strings.sort(key=lambda string : len(string), reverse=True)

    # Convert to a single string to return.
    # Converting a list of strings to a string is often done
    # using this rather strange looking python idiom.
    return "".join(all_strings)
```

- Time complexity: O(n log n)
- Space complexity: O(n)

### Approach 2: HashMap and Sort

In Python, the `Counter` class from the `collections` module has a `most_common` method, which returns a list of the n most common elements and their counts, sorted in descending order. This method can be particularly useful when you want to get the characters sorted by frequency without manually sorting the list.

```python
def frequencySort(self, s: str) -> str:

    # Count up the occurances.
    counts = collections.Counter(s)

    # Build up the string builder.
    string_builder = []
    for letter, freq in counts.most_common():
        # letter * freq makes freq copies of letter.
        # e.g. "a" * 4 -> "aaaa"
        string_builder.append(letter * freq)
    return "".join(string_builder)
```

- Time complexity: O(n log n)
- Space complexity: O(n)

### Approach 3: Multiset and Bucket Sort (Most optimized solution)

```python
def frequencySort(self, s: str) -> str:
    if not s: return s

    # Determine the frequency of each character.
    counts = collections.Counter(s)
    max_freq = max(counts.values())

    # Bucket sort the characters by frequency.
    buckets = [[] for _ in range(max_freq + 1)]
    for c, i in counts.items():
        buckets[i].append(c)

    # Build up the string.
    string_builder = []
    for i in range(len(buckets) - 1, 0, -1):
        for c in buckets[i]:
            string_builder.append(c * i)

    return "".join(string_builder)
```

- Time complexity: O(n)
- Space complexity: O(n)
