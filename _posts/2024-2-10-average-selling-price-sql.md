---
layout: single
title: "SQL problem - Average Selling Price"
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

[![problem-1251](/assets/images/2024-02-10_18-03-01-problem-1251.png)](/assets/images/2024-02-10_18-03-01-problem-1251.png)

## My Query

```sql
SELECT
    p.product_id,
    ROUND(IFNULL(SUM(units * price)/SUM(units), 0),2) as average_price
FROM
    Prices as p
LEFT JOIN
    UnitsSold as u
    ON
        p.product_id = u.product_id AND (u.purchase_date BETWEEN p.start_date AND p.end_date)
GROUP BY
    p.product_id
```
