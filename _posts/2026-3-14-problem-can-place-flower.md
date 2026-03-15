---
layout: single
title: "Problem of The Day: Can Place Flowers"
date: 2026-03-11
show_date: true
classes: wide
tags:
  - Problem of The Day
  - Neetcode List
---

## Problem Statement

[leetcode problem link](https://leetcode.com/problems/can-place-flowers/description/)

## Solution [Accepted]

```csharp
public class Solution {
    public bool CanPlaceFlowers(int[] flowerbed, int n) {
        var cannotPlant = new HashSet<int>();
        for(int i = 0; i < flowerbed.Length; i++) {
            if (flowerbed[i] == 1) {
                cannotPlant.Add(i);
                cannotPlant.Add(i - 1);
                cannotPlant.Add(i + 1);
            }
        }
        for (int i = 0; i < flowerbed.Length; i++) {
            if (flowerbed[i] == 0 && !cannotPlant.Contains(i)) {
                n -= 1;
                cannotPlant.Add(i);
                cannotPlant.Add(i + 1);
                cannotPlant.Add(i - 1);
            }
        }

        return n <= 0;
    }
}
```

## Neetcode Solution

```csharp
public class Solution {
    public bool CanPlaceFlowers(int[] flowerbed, int n) {
        int[] f = new int[flowerbed.Length + 2];
        for (int i = 0; i < flowerbed.Length; i++) {
            f[i + 1] = flowerbed[i];
        }

        for (int i = 1; i < f.Length - 1; i++) {
            if (f[i - 1] == 0 && f[i] == 0 && f[i + 1] == 0) {
                f[i] = 1;
                n--;
            }
        }

        return n <= 0;
    }
}
```
