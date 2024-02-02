---
layout: single
title: "SQL problem - Sales Person"
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

![problem-607](/assets/images/2024-02-02_14-30-47-sale-person.png)

## Query

```sql
SELECT s.name
FROM 
    SalesPerson AS s
WHERE
    s.sales_id NOT IN (
        SELECT 
            o.sales_id
        FROM
            Orders AS o
        JOIN
            Company AS c
            ON o.com_id = c.com_id AND c.name = 'RED'
    )
```

# Editorial Solution

```sql
SELECT
    s.name
FROM
    salesperson s
WHERE
    s.sales_id NOT IN (SELECT
            o.sales_id
        FROM
            orders o
                LEFT JOIN
            company c ON o.com_id = c.com_id
        WHERE
            c.name = 'RED')
;
```