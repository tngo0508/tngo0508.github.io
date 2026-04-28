---
title: "Solving Car Fleet in C#"
excerpt: "Learn how to determine the number of car fleets that will reach the target using a stack-based approach in C#."
date: 2026-03-31
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Stack
  - Sorting
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Car Fleet

The "Car Fleet" problem (LeetCode 853) presents a scenario where cars travel along a one-lane road towards a target destination. Each car has a starting position and a constant speed.

Key constraints:
- A faster car that catches up to a slower car cannot overtake it.
- Instead, it joins the slower car to form a **car fleet**, and they continue moving at the slower car's speed.
- The goal is to find the total number of fleets that reach the target.

> **Problem Statement:** There are `n` cars at given miles away from a `target` destination. You are given two integer arrays `position` and `speed`. Return the number of car fleets that will arrive at the destination.

### 2. The Intuition: Sorting and Time to Target

The most crucial observation is that a car's arrival at the target depends on the car directly in front of it.

1.  **Sort by Position:** If we process cars from the one closest to the target to the one farthest away, we can easily determine if a trailing car will catch up.
2.  **Calculate Time to Reach Target:** The time it takes for a car at `pos` with speed `s` to reach `target` is:
    **Time = \frac{Target - Position}{Speed}**
3.  **Fleet Formation:** If a car behind takes **less or equal time** than the fleet in front of it, it will eventually catch up and join that fleet. If it takes **more time**, it will never catch up and thus forms a new fleet.

### 3. Implementation: Stack-Based Approach

We use a `Stack<double>` to keep track of the arrival times of the leading cars of each fleet.

```csharp
public class Solution {
    public int CarFleet(int target, int[] position, int[] speed) {
        List<(int, int)> arr = new List<(int, int)>();
        for (int i = 0; i < speed.Length; i++) {
            arr.Add((position[i], speed[i]));
        }
        var sortedArr = arr.OrderByDescending(x => x.Item1).ToList();
        var stack = new Stack<double>();
        for (int i = 0; i < sortedArr.Count; i++) {
            var (pos, curr) = sortedArr[i];
            double time = (double)(target - pos) / curr;
            if (stack.Count == 0 || stack.Peek() < time)
                stack.Push(time);

        }

        return stack.Count;
    }
}
```

### 4. Step-by-Step Breakdown

#### Step 1: Pair and Sort
We pair each car's `position` and `speed` together and sort them in descending order based on their position. This allows us to process cars starting from the one closest to the target.

#### Step 2: Calculate Arrival Time
For each car, we calculate how long it would take to reach the `target` if it were traveling alone.

#### Step 3: Manage Fleets with a Stack
- If the `stack` is empty, the current car is the first (closest to target) and forms the first fleet.
- If the current car's `time` is **greater** than the time of the fleet in front (`stack.Peek()`), it means this car will never catch up. It becomes the leader of a new fleet, so we push its time onto the stack.
- If the current car's `time` is **less than or equal** to the fleet in front, it will join that fleet. We don't push anything to the stack because it doesn't form a new fleet.

#### Step 4: Return Count
The size of the stack at the end is the total number of car fleets.

### 5. Complexity Analysis

| Metric | Complexity | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N log N)** | Due to sorting the cars based on their positions. The single pass through the sorted array is O(N). |
| **Space Complexity** | **O(N)** | We store the car data in a list and potentially all car arrival times in a stack. |

### 6. Summary

The "Car Fleet" problem is efficiently solved by sorting cars by their starting positions and using a stack to track fleet arrival times. By comparing the time-to-target of a car with the fleet ahead of it, we can easily count how many distinct groups will reach the destination.

### 7. Further Reading
- [LeetCode 853: Car Fleet](https://leetcode.com/problems/car-fleet/)
- [NeetCode: Car Fleet Explanation](https://neetcode.io/problems/car-fleet)
- [C# List.OrderByDescending Method](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable.orderbydescending)
