---
layout: single
title: "SQL problem - Confirmation Rate"
date: 2024-2-10
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem-1934](/assets/images/2024-02-10_13-01-31-problem-1934.png)](/assets/images/2024-02-10_13-01-31-problem-1934.png)

## Query

```sql
SELECT 
    -- *,
    -- SUM(IF(c.action = 'confirmed', 1, 0)) as num_of_confirmed,
    -- COUNT(s.user_id) as total_request,
    s.user_id,
    (ROUND(SUM(IF(c.action = 'confirmed', 1, 0)) / COUNT(s.user_id), 2)) AS confirmation_rate
FROM
    Signups AS s
LEFT JOIN
    Confirmations AS c
    ON 
        s.user_id = c.user_id
GROUP BY
    s.user_id
```
