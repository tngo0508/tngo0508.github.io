---
layout: single
title: "Problem of The Day: Count Elements With Maximum Frequency"
date: 2024-3-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---

## Problem Statement

![problem-3005](/assets/images/2024-03-07_21-10-59-problem-3005.png)

## Intuition

My initial thoughts are to iterate through the list, keep track of the frequency of each element, and find the maximum frequency.

## Approach

I'll use a `defaultdict` to store the frequency of each element. While iterating through the list, I'll update the frequency count. After that, I'll find the maximum frequency and iterate through the frequency dictionary again to count the number of elements with that frequency.

## Complexity

- Time complexity:
  O(n) where n is the length of the input list. We iterate through the list once to calculate frequencies and then again to find elements with the maximum frequency.

- Space complexity:
  O(n) as we use a defaultdict to store the frequency of each element.

## Code

```python
class Solution:
    def maxFrequencyElements(self, nums: List[int]) -> int:
        freq = defaultdict(int)
        curr_max = 0
        for num in nums:
            freq[num] += 1
            curr_max = max(freq[num], curr_max)


        res = 0
        for value in freq.values():
            if value == curr_max:
                res += value
        return res
```

## Editorial Solution

### Approach 1: Count Frequency and Max Frequency

```python
class Solution:
    def maxFrequencyElements(self, nums: List[int]) -> int:
        # Find the frequency of each element
        frequencies = {}
        for num in nums:
            if num in frequencies:
                frequencies[num] += 1
            else:
                frequencies[num] = 1

        # Determine the maximum frequency
        max_frequency = 0
        for frequency in frequencies.values():
            max_frequency = max(max_frequency, frequency)

        # Calculate the total frequencies of elements with the maximum frequency
        frequency_of_max_frequency = 0
        for frequency in frequencies.values():
            if frequency == max_frequency:
                frequency_of_max_frequency += 1

        return frequency_of_max_frequency * max_frequency
```

### Approach 2: Sort Frequencies and Sum Max Frequencies

```python
class Solution:
    def maxFrequencyElements(self, nums):
        # Find the frequency of each element
        frequencies = [0] * 100
        for num in nums:
            frequencies[num - 1] += 1

        # Determine the maximum frequency, stored in the last index of the sorted array
        frequencies.sort()
        max_freq_index = len(frequencies) - 1
        total_frequencies = frequencies[max_freq_index]

        # Calculate the total frequencies of elements with the maximum frequency
        # Start from the last index and iterate right to left
        while max_freq_index > 0 and frequencies[max_freq_index] == frequencies[max_freq_index - 1]:
            total_frequencies += frequencies[max_freq_index]
            max_freq_index -= 1
        return total_frequencies
```

### Approach 3: One-Pass Sum Max Frequencies

```python
class Solution:
    def maxFrequencyElements(self, nums):
        frequencies = {}
        max_frequency = 0
        total_frequencies = 0

        # Find the frequency of each element
        # Determine the maximum frequency
        # Calculate the total frequencies of elements with the maximum frequency
        for num in nums:
            frequencies[num] = frequencies.get(num, 0) + 1
            frequency = frequencies[num]

            # If we discover a higher frequency element
            # Update max_frequency
            # Re-set totalFrequencies to the new max frequency
            if frequency > max_frequency:
                max_frequency = frequency
                total_frequencies = frequency
            # If we find an element with the max frequency, add it to the total
            elif frequency == max_frequency:
                total_frequencies += frequency

        return total_frequencies
```
