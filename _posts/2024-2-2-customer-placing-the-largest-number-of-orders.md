---
layout: single
title: "SQL problem - Customer Placing the Largest Number of Orders"
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

![problem-586](/assets/images/2024-02-02_15-13-33-customer-placing-the-largest-number-of-orders.png)

## My Query

```sql
SELECT t.customer_number
FROM (
    SELECT customer_number, COUNT(*) as total
    FROM Orders
    GROUP BY customer_number
    ORDER BY total DESC
    LIMIT 1
) AS t
```

## Editorial Solution

```sql
SELECT
    customer_number
FROM
    orders
GROUP BY customer_number
ORDER BY COUNT(*) DESC
LIMIT 1
;
```