---
layout: single
title: "SQL problem - Customers Who Never Order"
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

![problem-183](/assets/images/2024-02-02_14-37-04-customers-who-never-order.png)

## Query

```sql
SELECT c.name as Customers
FROM Customers AS c
WHERE c.id NOT IN (
    SELECT customerId
    FROM Orders
)
```

## Editorial Solution

### Approach 1: Filtering Data with Exclusion Criteria

```sql
select *
from customers
where customers.id not in
(
    select customerid from orders
);
```

### Approach 2: Left Join on customers

```sql
SELECT name AS 'Customers'
FROM Customers
LEFT JOIN Orders ON Customers.Id = Orders.CustomerId
WHERE Orders.CustomerId IS NULL
```