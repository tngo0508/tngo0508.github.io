---
layout: single
title: "Problem of The Day: K Inverse Pairs Array"
date: 2024-1-26
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
![problem](/assets/images/2024-01-26_22-54-50-problem-629.png)

>Need to review this problem again.

# Brute Force - TLE
```python
class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        def generate_permutation(idx, nums, perms):
            if idx == n:
                perms.append(nums[:])
                return
            for i in range(idx, n):
                nums[i], nums[idx] = nums[idx], nums[i]
                generate_permutation(idx + 1, nums, perms)
                nums[i], nums[idx] = nums[idx], nums[i]

        nums = [i for i in range(1, n + 1)]
        perms = []
        generate_permutation(0, nums, perms)
        res = 0
        for perm in perms:
            count = 0
            for i in range(n):
                for j in range(i + 1, n):
                    if perm[i] > perm[j]:
                        count += 1
        
            if count == k:
                res += 1
        
        return res
```

# Cleaner Brute Force - TLE
```python
class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        def dfs(max_num, pairs):
            if pairs < 0:
                return 0
            if max_num == 0:
                return pairs == 0
            res = 0
            for i in range(max_num):
                res = (res + dfs(max_num - 1, pairs - i)) % MOD

            return res
            
        return dfs(n, k)
```

# Dynamic Programming - 2D - TLE
```python
class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        dp = [[0] * (k + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(k + 1):
                if j == 0:
                    dp[i][j] = 1
                else:
                    for p in range(min(j, i - 1) + 1):
                        dp[i][j] = (dp[i][j] + dp[i - 1][j - p]) % MOD
        
        return dp[n][k]
```

# Dymamic Programming 1D Approach - Accepted
```python
class Solution:
    def kInversePairs(self, n: int, k: int) -> int:
        MOD = 10**9 + 7
        dp = [0] * (k + 1)
        dp[0] = 1
        for i in range(1, n + 1):
            temp = [0] * (k + 1)
            total = 0
            for j in range(k + 1):
                if j - i >= 0:
                    total -= dp[j - i]
                total = (total + dp[j]) % MOD
                temp[j] = total
            dp = temp

        return dp[k]
```

# Editorial Solution
Dynamic Programming - 2D
```java
public class Solution {
    public int kInversePairs(int n, int k) {
        int[][] dp = new int[n + 1][k + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j <= k; j++) {
                if (j == 0)
                    dp[i][j] = 1;
                else {
                    for (int p = 0; p <= Math.min(j, i - 1); p++)
                        dp[i][j] = (dp[i][j] + dp[i - 1][j - p]) % 1000000007;
                }
            }
        }
        return dp[n][k];
    }
}
```

Dynamic Programming - optimized - 1D
```java
public class Solution {
    public int kInversePairs(int n, int k) {
        int[] dp = new int[k + 1];
        int M = 1000000007;
        for (int i = 1; i <= n; i++) {
            int[] temp = new int[k + 1];
            temp[0] = 1;
            for (int j = 1; j <= k ; j++) {
                int val = (dp[j] + M - ((j - i) >= 0 ? dp[j - i] : 0)) % M;
                temp[j] = (temp[j - 1] + val) % M;
            }
            dp = temp;
        }
        return ((dp[k] + M - (k > 0 ? dp[k - 1] : 0)) % M);
    }
}
```