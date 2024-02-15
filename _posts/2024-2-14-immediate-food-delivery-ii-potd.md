---
layout: single
title: "SQL problem - Immediate Food Delivery II"
date: 2024-2-14
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-1174](/assets/images/2024-02-14_20-57-37-problem-1174.png)](/assets/images/2024-02-14_20-57-37-problem-1174.png)

## Query

```sql
WITH T AS (
    SELECT
        IF(order_date = customer_pref_delivery_date, 'immediate', 'scheduled') AS status
    FROM
        Delivery AS d,
        (
            SELECT MIN(order_date) AS first_date, customer_id
            FROM Delivery
            GROUP BY customer_id
        ) AS t
    WHERE d.order_date = t.first_date and d.customer_id = t.customer_id
)
SELECT
    ROUND(SUM(status = 'immediate') / COUNT(*) * 100, 2) AS immediate_percentage
FROM
    T
```
