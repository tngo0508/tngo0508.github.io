---
title: "Solving Koko Eating Bananas in C#"
excerpt: "Learn how to find the minimum eating speed for Koko using a Binary Search on Answer strategy in C#."
date: 2026-04-19
categories:
  - LeetCode
  - Algorithms
tags:
  - C#
  - .NET 10
  - Binary Search
  - Neetcode List
toc: true
toc_label: "In this post"
---

### 1. The Problem: Koko Eating Bananas

The "Koko Eating Bananas" problem (LeetCode 875) presents us with $n$ piles of bananas, where the $i^{th}$ pile has `piles[i]` bananas. Koko wants to eat all the bananas within $h$ hours.

Koko can decide her bananas-per-hour eating speed $k$. Each hour, she chooses some pile of bananas and eats $k$ bananas from that pile. If the pile has less than $k$ bananas, she eats all of them instead and will not eat any more bananas during this hour.

Koko likes to eat slowly but still wants to finish eating all the bananas before the guards return in $h$ hours.

**Key constraints:**
- `1 <= piles.length <= 10^4`
- `piles.length <= h <= 10^9`
- `1 <= piles[i] <= 10^9`

> **Problem Statement:** Return *the minimum integer $k$ such that she can eat all the bananas within $h$ hours*.

### 2. The Intuition: Binary Search on Answer

The core challenge is finding the smallest $k$. We know:
- The minimum possible speed is **1** (she must eat at least something).
- The maximum possible speed is **the maximum number of bananas in any single pile** (eating more than that won't save any more time because she only eats from one pile per hour).

Since the required speed $k$ has a monotonic property (if she can finish at speed $k$, she can also finish at any speed $> k$), we can use **Binary Search** to efficiently find the minimum $k$ in the range `[1, Max(piles)]`.

### 3. Implementation: Two Styles

#### 3.1 Modular Approach (with Helper Method)

This implementation uses a helper method `IsValid` to check if a given speed `amount` allows Koko to finish all bananas within the time limit `target`. This modularity makes the code easier to read and test.

```csharp
using System;
using System.Linq;

public class Solution {
    public bool IsValid(int amount, int[] piles, int target) {
        long totalTime = 0; // Use long to prevent overflow
        foreach (int pile in piles) {
            // Calculate hours needed for this pile
            int hour = (int)Math.Ceiling((double)pile / amount);
            totalTime += hour;
        }

        return totalTime <= target;
    }

    public int MinEatingSpeed(int[] piles, int h) {
        int left = 1, right = piles.Max();
        int ans = right;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (IsValid(mid, piles, h)) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }

        return ans;
    }
}
```

#### 3.2 Integrated Approach (NeetCode.io)

This approach calculates the total time directly inside the binary search loop. It's a concise way to implement the same logic without external helper methods.

```csharp
using System;
using System.Linq;

public class Solution {
    public int MinEatingSpeed(int[] piles, int h) {
        int l = 1;
        int r = piles.Max();
        int res = r;

        while (l <= r) {
            int k = (l + r) / 2;

            long totalTime = 0;
            foreach (int p in piles) {
                totalTime += (int)Math.Ceiling((double)p / k);
            }

            if (totalTime <= h) {
                res = k;
                r = k - 1;
            } else {
                l = k + 1;
            }
        }
        return res;
    }
}
```

*Note: In the implementation above, I've used `long` for `totalTime` to ensure we don't overflow when summing up hours, especially since `h` can be up to $10^9$.*

### 4. Step-by-Step Breakdown

1.  **Define the Search Range**: Start with `left = 1` and `right = max(piles)`.
2.  **Binary Search**:
    - Calculate the middle speed (`mid` or `k`).
    - Calculate the **Total Time** required for Koko to eat all bananas at that speed.
    - If **Total Time <= h**: This speed works! Store it as a potential answer and try a slower speed by moving the `right` boundary (`right = mid - 1`).
    - If **Total Time > h**: This speed is too slow. Increase the minimum speed by moving the `left` boundary (`left = mid + 1`).
3.  **Compute Hours**: For each pile, the time spent is `Ceil(pile / speed)`.
4.  **Final Result**: The loop terminates when `left > right`, returning the smallest valid speed found.

### 5. Complexity Analysis

| Complexity | Rating | Why? |
| :--- | :--- | :--- |
| **Time Complexity** | **O(N * log(M))** | $N$ is the number of piles, and $M$ is the maximum value in `piles`. We perform binary search over the range of speeds, and for each speed, we iterate through all piles. |
| **Space Complexity** | **O(1)** | We only use a few variables for the search boundaries and the time calculation. |

### 6. Summary

The "Koko Eating Bananas" problem is a classic example of **Binary Search on Answer**. Instead of searching for an element in an array, we search for the optimal value within a possible range. This technique is extremely powerful for optimization problems where the solution space is sorted.

### 7. Further Reading
- [LeetCode 875: Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)
- [NeetCode: Koko Eating Bananas Video](https://neetcode.io/problems/koko-eating-bananas)
- [Microsoft Docs: Math.Ceiling Method](https://learn.microsoft.com/en-us/dotnet/api/system.math.ceiling)
- [Binary Search Explained](https://en.wikipedia.org/wiki/Binary_search_algorithm)
