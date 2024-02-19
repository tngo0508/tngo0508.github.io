---
layout: single
title: "SQL problem - Product Sales Analysis III"
date: 2024-2-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-1070](/assets/images/2024-02-19_11-40-54-problem-1070-sql.png)](/assets/images/2024-02-19_11-40-54-problem-1070-sql.png)

## Query

```sql
SELECT
    s2.product_id ,
    s1.first_year,
    s2.quantity,
    s2.price
FROM
    (
        SELECT MIN(year) AS first_year, product_id
        FROM Sales
        GROUP BY product_id
    ) AS s1,
    Sales AS s2
WHERE
    s1.product_id = s2.product_id AND s1.first_year = s2.year
```

## Editorial Solution

```sql
SELECT
  product_id,
  year AS first_year,
  quantity,
  price
FROM
  Sales
WHERE
  (product_id, year) IN (
    SELECT
      product_id,
      MIN(year) AS year
    FROM
      Sales
    GROUP BY
      product_id
  );
```
