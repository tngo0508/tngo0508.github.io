---
layout: single
title: "Problem of The Day: Insert Delete GetRandom O(1)"
date: 2024-1-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Problem of The Day
---
# Problem Statement
```
Implement the RandomizedSet class:

RandomizedSet() Initializes the RandomizedSet object.
bool insert(int val) Inserts an item val into the set if not present. Returns true if the item was not present, false otherwise.
bool remove(int val) Removes an item val from the set if present. Returns true if the item was present, false otherwise.
int getRandom() Returns a random element from the current set of elements (it's guaranteed that at least one element exists when this method is called). Each element must have the same probability of being returned.
You must implement the functions of the class such that each function works in average O(1) time complexity.

 

Example 1:

Input
["RandomizedSet", "insert", "remove", "insert", "getRandom", "remove", "insert", "getRandom"]
[[], [1], [2], [2], [], [1], [2], []]
Output
[null, true, false, true, 2, true, false, 2]

Explanation
RandomizedSet randomizedSet = new RandomizedSet();
randomizedSet.insert(1); // Inserts 1 to the set. Returns true as 1 was inserted successfully.
randomizedSet.remove(2); // Returns false as 2 does not exist in the set.
randomizedSet.insert(2); // Inserts 2 to the set, returns true. Set now contains [1,2].
randomizedSet.getRandom(); // getRandom() should return either 1 or 2 randomly.
randomizedSet.remove(1); // Removes 1 from the set, returns true. Set now contains [2].
randomizedSet.insert(2); // 2 was already in the set, so return false.
randomizedSet.getRandom(); // Since 2 is the only number in the set, getRandom() will always return 2.
 

Constraints:

-231 <= val <= 231 - 1
At most 2 * 105 calls will be made to insert, remove, and getRandom.
There will be at least one element in the data structure when getRandom is called.
```

# Intuition
The idea is to use a combination of a hash map and a list to achieve constant-time insertions and removals, as well as random access for the `getRandom` operation. The hash map stores the mapping of values to their indices in the list.

# Approach
- For `insert`, we check if the value is already in the hash map. If not, we append it to the list, update its index in the hash map, and return True. If it's already present, we return False.
- For `remove`, we check if the value is in the hash map. If not, we return False. If it's present, we get its index, swap it with the last element in the list, update the index of the swapped element in the hash map, pop the last element from the list, and remove the value from the hash map.
- For `getRandom`, we generate a random index and return the element at that index in the list.

# Complexity
- Time complexity:
O(1) for all operations

- Space complexity:
O(n), where n is the number of elements in the set. This is due to the storage of elements in both the list and the hash map.

# Code
```python
class RandomizedSet:

    def __init__(self):
        self.hash_map = {}
        self.nums = []

    def insert(self, val: int) -> bool:
        if val in self.hash_map:
            return False
        self.nums.append(val)
        self.hash_map[val] = len(self.nums) - 1
        return True

    def remove(self, val: int) -> bool:
        if val not in self.hash_map:
            return False
        idx = self.hash_map[val]
        self.hash_map[self.nums[-1]] = idx
        self.nums[-1], self.nums[idx] = self.nums[idx], self.nums[-1]
        self.nums.pop()
        del self.hash_map[val]
        return True

    def getRandom(self) -> int:
        random_idx = random.randrange(len(self.nums))
        return self.nums[random_idx]
        


# Your RandomizedSet object will be instantiated and called as such:
# obj = RandomizedSet()
# param_1 = obj.insert(val)
# param_2 = obj.remove(val)
# param_3 = obj.getRandom()
```

# Editorial solution
```python
from random import choice
class RandomizedSet():
    def __init__(self):
        """
        Initialize your data structure here.
        """
        self.dict = {}
        self.list = []

        
    def insert(self, val: int) -> bool:
        """
        Inserts a value to the set. Returns true if the set did not already contain the specified element.
        """
        if val in self.dict:
            return False
        self.dict[val] = len(self.list)
        self.list.append(val)
        return True
        

    def remove(self, val: int) -> bool:
        """
        Removes a value from the set. Returns true if the set contained the specified element.
        """
        if val in self.dict:
            # move the last element to the place idx of the element to delete
            last_element, idx = self.list[-1], self.dict[val]
            self.list[idx], self.dict[last_element] = last_element, idx
            # delete the last element
            self.list.pop()
            del self.dict[val]
            return True
        return False

    def getRandom(self) -> int:
        """
        Get a random element from the set.
        """
        return choice(self.list)
```