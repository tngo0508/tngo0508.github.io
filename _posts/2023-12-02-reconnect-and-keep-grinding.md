---
title: "Reconnect with Friends and Keep Grinding: A Comedy of Code and Coffee"
date: 2023-12-02
toc: true
toc_label: "Page Navigation"
toc_sticky: true
tags:
  - Journal Entry
  - Daily Coding
---

# Meeting up with college friend
Today's tale is a rollercoaster of coding, coffee, and an unexpected reunion with the outside world. Buckle up, because we're diving into the thrilling saga of my day.

So, I took a break from my intense project-grind to step into the wild, wild world beyond my coding cave. I decided to hang out with a friend from college – you know, those mythical creatures you used to study with before algorithms took over your life. It was like encountering a unicorn in the middle of a concrete jungle.

I have to admit, it was refreshing to converse with someone other than my family, who've started thinking in loops and conditionals just to keep up with my conversations.

As I sipped my coffee, I realized this was my first step towards evolving from the ancient version of myself. It turns out there's a world out there, and it's not just made of GitHub stars and compiler errors.

During our rendezvous, we covered everything from career dilemmas to stress management, and even ventured into the mystical realm of dating and family drama. It was like a crash course in adulting, with a side of nostalgia.

The epiphany hit me like a ton of syntax errors – I am not the protagonist in a coding melodrama. Turns out, everyone has their version of a debugging nightmare. Who knew?

# I hope to receive a 10-star rating on my GitHub repository
Armed with newfound wisdom, I spent the morning reminiscing about the good old college days. We plotted world domination plans for my "CodeTrack" project – because, let's be honest, nothing says success like GitHub stars. I've set the bar low; just ten stars and I'll be strutting around like I've won the coding Oscars.

In my quest to create something useful (and hopefully not break the internet), I'm aiming for that one person who finds my website and thinks, "Hey, this is cool!" Forget life-changing – if it brings a smile, I'm calling it a win.

# Daily Leetcode
Fast forward to the night – the hour of code. I revisited the infamous 4sum problem, armed with coffee and determination. I decided to conquer it like a conquering coder conquers, starting with the 3Sum problem – because why go for 4 when you can conquer 3 first?

Even though the editorial solution initially looked like hieroglyphics, I bravely plunged into the explanation. The author did a stellar job, and suddenly, I felt like I'd unlocked a new level in a coding video game. One more problem in my pocket for the next technical interview – take that, algorithms!

So there you have it, folks – a day in the life of a coder breaking free, reconnecting with the real world, and trying to make GitHub stars rain. Stay tuned for more adventures in coding and comedy – where bugs are the punchlines, and syntax errors are just a plot twist in this epic saga of 1s and 0s!

Below is how I initially solved my 3sum problem. But it's so slow due to these lines of code. "The Slowpoke Algorithm"! Guaranteed to keep your computer entertained as it takes its sweet time.
```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        for i, num in enumerate(nums):
            l, r = i + 1, len(nums) - 1
            while l < r:
                if nums[l] + nums[r] + num < 0:
                    l += 1
                elif nums[l] + nums[r] + num > 0:
                    r -= 1
                else:
                    arr = [num, nums[l], nums[r]]
                    # Drumroll, please! Introducing the world's slowest check for duplicates!
                    if arr not in result:
                        result.append(arr[:])
                    l += 1
                    r -= 1
        return result
```

How do I fix it?
The trick is to change the logic to check for the duplicate subset into something similar to this.
Introducing the "Speedy Gonzales Algorithm"! Now with 100% less waiting around. It's so fast, you might think your computer just had an espresso!
```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        result = []
        for i, num in enumerate(nums):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                if nums[l] + nums[r] + num < 0:
                    l += 1
                elif nums[l] + nums[r] + num > 0:
                    r -= 1
                else:
                    arr = [num, nums[l], nums[r]]
                    result.append(arr)
                    l += 1
                    r -= 1
                    # this is where we skip the duplicates
                    while l < r and nums[l] == nums[l - 1]: 
                        l += 1
                    
        return result
```

Struggling with the 4Sum problem? No worries! Here's the solution for future "brain-freeze" moments. Bookmark this post so you can decipher the code and hopefully avoid another "what the hell" situation. Happy coding!
Behold, "The Great Quadruple Quest Solver"! Unraveling the mysteries of four numbers aligning in perfect harmony. And for the grand finale, witness the Duplicate Avoidance Extravaganza – because duplicates are so last season!
```python
class Solution:
    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:
        def twoSum(nums, target):
            res = []
            l, r = 0, len(nums) - 1
            while l < r:
                curr_sum = nums[l] + nums[r]
                if curr_sum < target:
                    l += 1
                elif curr_sum > target:
                    r -= 1
                else:
                    res.append([nums[l], nums[r]])
                    l += 1
                    r -= 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
                
            
            return res

        def kSum(nums, target, k):
            output = []
            if not nums:
                return output
            
            avg_val = target // k

            if nums[0] > avg_val or nums[-1] < avg_val:
                return output
            
            if k == 2:
                return twoSum(nums, target)

            for i, num in enumerate(nums):
                if i == 0 or nums[i] != nums[i - 1]:
                    subsets = kSum(nums[i + 1:], target - num, k - 1)
                    for subset in subsets:
                        output.append(subset + [num])
            
            return output


        nums.sort()
        return kSum(nums, target, 4)
        
```

# To My Future Me
Life's a journey, and tough times shape who we are. Embrace challenges, enjoy growing, and never give up on your dreams. The road might be tough, but every hurdle is a chance to build an amazing life. Keep going, and let's make our future awesome!