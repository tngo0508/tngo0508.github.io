---
layout: single
title: "SQL problem - Market Analysis I"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem](/assets/images/2024-02-02_13-41-08-market-analysis-i.png)](/assets/images/2024-02-02_13-41-08-market-analysis-i.png)

## Query

Note:

- Cannot use `WHERE` clause since it won't show the records when users do not have orders in year 2019
- Use `YEAR(order_date)` to get the 2019 when merging tables with `LEFT JOIN`

```sql
SELECT
    u.user_id AS buyer_id,
    join_date,
    COUNT(order_id) AS orders_in_2019
FROM
    Users AS u
    LEFT JOIN
        Orders As o
        ON
            u.user_id = o.buyer_id AND YEAR(order_date) = 2019
GROUP BY
    u.user_id
```

## Editorial Solution

The followings are step-by-step intuition to write query for this problem:

- start with base table (`FROM` clause)
- joning with Orders (`LEFT JOIN`)
- aggregtion (`GROUP BY`)
- select clause to get relevant columns and apply `COUNT` function
- Ordering the output (optional)

```sql
SELECT 
  u.user_id AS buyer_id, 
  join_date, 
  COUNT(o.order_id) AS orders_in_2019 
FROM 
  Users u 
  LEFT JOIN Orders o ON u.user_id = o.buyer_id 
  AND YEAR(order_date)= '2019' 
GROUP BY 
  u.user_id 
ORDER BY 
  u.user_id
```