---
layout: single
title: "SQL problem - Consecutive Numbers"
date: 2024-2-25
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-180](/assets/images/2024-02-25_14-21-32-problem-180.png)](/assets/images/2024-02-25_14-21-32-problem-180.png)

## Query

```sql
SELECT DISTINCT
    l1.num AS ConsecutiveNums
FROM
    Logs AS l1,
    Logs AS l2,
    Logs AS l3
WHERE 
    l1.num = l2.num AND l1.num = l3.num AND l1.id = l2.id - 1 AND l1.id = l3.id - 2
```
