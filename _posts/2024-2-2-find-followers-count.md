---
layout: single
title: "SQL problem - Find Followers Count"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---

## Problem

[![problem](/assets/images/2024-02-02_08-49-11-problem-1729.png)](/assets/images/2024-02-02_08-49-11-problem-1729.png)

## Query

Note:

- (user_id, follower_id) is unique
- user `COUNT` function to count the occurences of a single `user_id`
  - `COUNT` aggregation function often requires the field to aggregate by => done by using `GROUP BY` clause
- `ORDER BY` TO order the result by ascending order

```sql
SELECT user_id, COUNT(follower_id) AS followers_count
FROM Followers
GROUP BY  user_id
ORDER BY user_id ASC
```
