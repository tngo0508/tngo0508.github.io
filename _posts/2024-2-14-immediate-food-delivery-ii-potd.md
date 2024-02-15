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

## Explanation

Breakdown the logic to understand:

- To find the earliest date for each customer

```sql
SELECT MIN(order_date) AS first_date, customer_id
FROM Delivery
GROUP BY customer_id
```

result:

| first_date | customer_id |
| ---------- | ----------- |
| 2019-08-01 | 1           |
| 2019-08-02 | 2           |
| 2019-08-21 | 3           |
| 2019-08-09 | 4           |

- Here, we perform self join in order to eliminate unnecessary rows and query only the rows that have `the order with the earliest order date that customer made`.

```sql
SELECT
    *
FROM
    Delivery AS d,
    (
        SELECT MIN(order_date) AS first_date, customer_id
        FROM Delivery
        GROUP BY customer_id
    ) AS t
WHERE d.order_date = t.first_date and d.customer_id = t.customer_id
```

result:

| delivery_id | customer_id | order_date | customer_pref_delivery_date | first_date | customer_id |
| ----------- | ----------- | ---------- | --------------------------- | ---------- | ----------- |
| 1           | 1           | 2019-08-01 | 2019-08-02                  | 2019-08-01 | 1           |
| 2           | 2           | 2019-08-02 | 2019-08-02                  | 2019-08-02 | 2           |
| 5           | 3           | 2019-08-21 | 2019-08-22                  | 2019-08-21 | 3           |
| 7           | 4           | 2019-08-09 | 2019-08-09                  | 2019-08-09 | 4           |

- Create `status` column which labels `immedidate` and `schedule` for `the first orders of all customer`

```sql
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
```

Result:

| status    |
| --------- |
| scheduled |
| immediate |
| scheduled |
| immediate |

- Finally, we use `Common Table Expression (CTE)` to simplify the logic and perform the main query below on that table.

```sql
SELECT
    ROUND(SUM(status = 'immediate') / COUNT(*) * 100, 2) AS immediate_percentage
FROM
    T
```
