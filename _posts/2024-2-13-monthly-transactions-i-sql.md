---
layout: single
title: "SQL problem - Monthly Transactions I"
date: 2024-2-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-1193](/assets/images/2024-02-13_22-02-40-problem-1193.png)](/assets/images/2024-02-13_22-02-40-problem-1193.png)

## Query

```sql
SELECT
    DATE_FORMAT(trans_date, '%Y-%m') as month,
    country,
    COUNT(*) as trans_count,
    SUM(IF(state = "approved", 1, 0)) as approved_count,
    SUM(amount) as trans_total_amount,
    SUM(IF(state = "approved", amount, 0)) as approved_total_amount
FROM
    Transactions
GROUP BY
    DATE_FORMAT(trans_date, '%Y-%m'), country
```
