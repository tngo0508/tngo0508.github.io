---
layout: single
title: "Problem of The Day: Find Players With Zero or One Losses"
date: 2024-1-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
You are given an integer array matches where matches[i] = [winneri, loseri] indicates that the player winneri defeated player loseri in a match.

Return a list answer of size 2 where:

answer[0] is a list of all players that have not lost any matches.
answer[1] is a list of all players that have lost exactly one match.
The values in the two lists should be returned in increasing order.

Note:

You should only consider the players that have played at least one match.
The testcases will be generated such that no two matches will have the same outcome.
 

Example 1:

Input: matches = [[1,3],[2,3],[3,6],[5,6],[5,7],[4,5],[4,8],[4,9],[10,4],[10,9]]
Output: [[1,2,10],[4,5,7,8]]
Explanation:
Players 1, 2, and 10 have not lost any matches.
Players 4, 5, 7, and 8 each have lost one match.
Players 3, 6, and 9 each have lost two matches.
Thus, answer[0] = [1,2,10] and answer[1] = [4,5,7,8].
Example 2:

Input: matches = [[2,3],[1,3],[5,4],[6,4]]
Output: [[1,2,5,6],[]]
Explanation:
Players 1, 2, 5, and 6 have not lost any matches.
Players 3 and 4 each have lost two matches.
Thus, answer[0] = [1,2,5,6] and answer[1] = [].
 

Constraints:

1 <= matches.length <= 105
matches[i].length == 2
1 <= winneri, loseri <= 105
winneri != loseri
All matches[i] are unique.
```

# Intuition
The problem involves finding the winners in a set of matches based on their win and loss records. My approach is to use a defaultdict to keep track of each player's wins and losses. I iterate through the matches to update the records and then categorize the players into two lists: those with no losses and those with only one loss.

# Approach
1. Initialize a `defaultdict` to store the win and loss records for each player.
2. Iterate through the matches to update the records.
3. Create two lists - one for players with no losses and another for players with only one loss.
4. Return the lists as the final result.

# Complexity
- Time complexity:
O(nlogn), where n is the number of matches. The sorting of player IDs contributes to this complexity.

- Space complexity:
O(n), as we store information about each player in the defaultdict.

# Code
```python
class Solution:
    def findWinners(self, matches: List[List[int]]) -> List[List[int]]:
        players = defaultdict(list)
        for match in matches:
            w, l = match
            if w not in players:
                players[w].append(0)
                players[w].append(0)

            if l not in players:
                players[l].append(0)
                players[l].append(0)

        for match in matches:
            w, l = match
            players[w][0] += 1
            players[l][1] += 1

        player_id = players.keys()
        no_lost = []
        lost_one = []
        for p in sorted(player_id):
            if players[p][1] == 0:
                no_lost.append(p)
            if players[p][1] == 1:
                lost_one.append(p)
            
        return [no_lost, lost_one]

```

# Cleanup Code
After a closer examination of the code, I realized that tracking the winning data was unnecessary. I've streamlined the code by removing redundant lines, making it cleaner and more readable.

```python
class Solution:
    def findWinners(self, matches: List[List[int]]) -> List[List[int]]:
        players = defaultdict(int)
        for winner, loser in matches:
            players[winner] += 0
            players[loser] += 1
        
        player_ids = sorted(players.keys())
        
        no_lose = []
        one_lose = []
        for player_id in player_ids:
            if players[player_id] == 0:
                no_lose.append(player_id)
            elif players[player_id] == 1:
                one_lose.append(player_id)
        
        return [no_lose, one_lose]
```

# Editorial Solution
## Approach 1: Hash Set
```python
class Solution:
    def findWinners(self, matches: List[List[int]]) -> List[List[int]]:
        zero_loss = set()
        one_loss = set()
        more_losses = set()
        
        for winner, loser in matches:
            # Add winner
            if (winner not in one_loss) and (winner not in more_losses):
                zero_loss.add(winner)
            # Add or move loser.
            if loser in zero_loss:
                zero_loss.remove(loser)
                one_loss.add(loser)
            elif loser in one_loss:
                one_loss.remove(loser)
                more_losses.add(loser)
            elif loser in more_losses:
                continue
            else:
                one_loss.add(loser)          
            
        return [sorted(list(zero_loss)), sorted(list(one_loss))]
```

## Approach 2: Hash Set + Hash Map

```python
class Solution: 
    def findWinners(self, matches : List[List[int]]) ->List[List[int]]: 
        seen = set() losses_count = {}
        
        for winner, loser in matches:
            seen.add(winner)
            seen.add(loser)
            losses_count[loser] = losses_count.get(loser, 0) + 1
        
        # Add players with 0 or 1 loss to the corresponding list.
        zero_lose, one_lose = [], []
        for player in seen:
            count = losses_count.get(player, 0)
            if count == 0:
                zero_lose.append(player)
            elif count == 1:
                one_lose.append(player)
        
        return [sorted(zero_lose), sorted(one_lose)]
```

## Approach 3: Hash Map
```python
class Solution: 
    def findWinners(self, matches: List[List[int]]) ->List[List[int]]: 
        losses_count = {}
        
        for winner, loser in matches:
            losses_count[winner] = losses_count.get(winner, 0)
            losses_count[loser] = losses_count.get(loser, 0) + 1
        
        zero_lose, one_lose = [], []
        for player, count in losses_count.items():
            if count == 0:
                zero_lose.append(player)
            if count == 1:
                one_lose.append(player)
        
        return [sorted(zero_lose), sorted(one_lose)]
```

## Approach 4: Counting with Array
```python
def findWinners(self, matches: List[List[int]]) -> List[List[int]]:
        losses_count = [-1] * 100001

        for winner, loser in matches:
            if losses_count[winner] == -1:
                losses_count[winner] = 0
            if losses_count[loser] == -1:
                losses_count[loser] = 1
            else:
                losses_count[loser] += 1
            
        answer = [[], []]
        for i in range(100001):
            if losses_count[i] == 0:
                answer[0].append(i)
            elif losses_count[i] == 1:
                answer[1].append(i)
                
        return answer
```
Let `n` be the size of the input array `matches`, and `k` be the range of values in `winner` or `loser`.
Time Complexity: O(n + k)
Space Complexity: O(k)

# For Future Me
Endure the hardships of today, for they are the foundation upon which the strength of your future self is built. Embrace challenges as opportunities, and remember that the journey may be tough, but it is shaping you into the resilient person you aspire to become.