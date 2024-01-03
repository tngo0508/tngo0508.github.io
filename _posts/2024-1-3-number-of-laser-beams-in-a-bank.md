---
layout: single
title: "Problem of The Day: Number of Laser Beams in a Bank"
date: 2024-1-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Problem of The Day
  - Daily Coding
---
# Problem Statement
```
Anti-theft security devices are activated inside a bank. You are given a 0-indexed binary string array bank representing the floor plan of the bank, which is an m x n 2D matrix. bank[i] represents the ith row, consisting of '0's and '1's. '0' means the cell is empty, while'1' means the cell has a security device.

There is one laser beam between any two security devices if both conditions are met:

The two devices are located on two different rows: r1 and r2, where r1 < r2.
For each row i where r1 < i < r2, there are no security devices in the ith row.
Laser beams are independent, i.e., one beam does not interfere nor join with another.

Return the total number of laser beams in the bank.

Input: bank = ["011001","000000","010100","001000"]
Output: 8
Explanation: Between each of the following device pairs, there is one beam. In total, there are 8 beams:
 * bank[0][1] -- bank[2][1]
 * bank[0][1] -- bank[2][3]
 * bank[0][2] -- bank[2][1]
 * bank[0][2] -- bank[2][3]
 * bank[0][5] -- bank[2][1]
 * bank[0][5] -- bank[2][3]
 * bank[2][1] -- bank[3][2]
 * bank[2][3] -- bank[3][2]
Note that there is no beam between any device on the 0th row with any on the 3rd row.
This is because the 2nd row contains security devices, which breaks the second condition.

Input: bank = ["000","111","000"]
Output: 0
Explanation: There does not exist two devices located on two different rows.
```

# My Explanation and Approach
In my approach, I tackled the problem by using a queue to keep track of the levels or rows I was processing. At each level, I looked ahead to the next levels to identify any security devices. The key insight was that I could use the devices on the current level and those on the next level to create laser beams. Laser beams were formed by combining two adjacent levels. Therefore, the total number of laser beams created was determined by multiplying the number of devices on the current level by the number of devices on the next level. After processing a level, I added the next levels that had devices to my queue so that I could proceed to them next. This way, I systematically traversed through the levels, calculating and accumulating the total number of laser beams formed by the devices.

```python
from collections import Counter

class Solution:
    def numberOfBeams(self, bank: List[str]) -> int:
        result = 0
        queue = deque([0])
        while queue:
            level = queue.popleft()
            level_count = Counter(bank[level])
            next_level = level + 1
            for i in range(level + 1, len(bank)):
                if '1' in bank[i]:
                    next_level = i
                    break
            
            if next_level < len(bank):
                next_level_count = Counter(bank[next_level])
                result += (level_count['1'] * next_level_count['1'])
                queue.append(next_level)
        
        return result
```

# Leet Code Solution
```cpp
class Solution {
public:
    int numberOfBeams(vector<string>& bank) {
        int prev = 0, ans = 0;
        
        for (string s : bank) {
            int count = 0;
            for (char c : s) {
                if (c == '1') {
                    count++;
                }
            }
            if (count != 0) {
                ans += (prev * count);
                prev = count;
            }
        }
        
        return ans;
    }
};
```