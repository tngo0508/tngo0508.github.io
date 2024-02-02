---
layout: single
title: "SQL problem - Customer Who Visited but Did Not Make Any Transactions"
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

[![problem](/assets/images/2024-02-02_12-22-44-customer-who-visited-but-did-not-make-any-transactions.png)](/assets/images/2024-02-02_12-22-44-customer-who-visited-but-did-not-make-any-transactions.png)

## My Query

```sql
SELECT
    customer_id, COUNT(customer_id) as count_no_trans
FROM
    Visits as v
LEFT JOIN
    Transactions as t
        ON
            v.visit_id = t.visit_id
WHERE
    transaction_id IS NULL
GROUP BY 
    customer_id
```

## Editorial Solution

### Approach 1: Removing Records Using NOT IN/EXISTS

```sql
SELECT 
  customer_id, 
  COUNT(visit_id) AS count_no_trans 
FROM 
  Visits 
WHERE 
  visit_id NOT IN (
    SELECT 
      visit_id 
    FROM 
      Transactions
  ) 
GROUP BY 
  customer_id
```

### Approach 2: Removing Records Using LEFT JOIN and IS NULL

```sql
SELECT 
  customer_id, 
  COUNT(*) AS count_no_trans 
FROM 
  Visits AS v 
  LEFT JOIN Transactions AS t ON v.visit_id = t.visit_id 
WHERE 
  t.visit_id IS NULL 
GROUP BY 
  customer_id
```