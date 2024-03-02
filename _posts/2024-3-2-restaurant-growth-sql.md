---
layout: single
title: "SQL problem - Restaurant Growth"
date: 2024-3-02
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-1321](/assets/images/2024-03-02_10-59-02-problem-1321.png)](/assets/images/2024-03-02_10-59-02-problem-1321.png)

## Query

```sql
WITH T AS (
SELECT
    *,
    (
        CASE
            WHEN
                ROW_NUMBER() OVER (ORDER BY visited_on) >= 7 THEN
                    SUM(c.sum_amount_per_day) OVER (ORDER BY visited_on
                        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
        END
    ) as cumulative_sum,
    (
        CASE
            WHEN
                ROW_NUMBER() OVER (ORDER BY visited_on) >= 7 THEN
                    ROUND(AVG(c.sum_amount_per_day) OVER (ORDER BY visited_on
                                    ROWS BETWEEN 6 PRECEDING AND
                                    CURRENT ROW), 2)
            ELSE NULL
        END
    ) AS average_amount
FROM
    (
        SELECT *, SUM(amount) as sum_amount_per_day
        FROM Customer
        GROUP BY visited_on
    ) as c
GROUP BY
    c.visited_on
)

SELECT
    visited_on, cumulative_sum as amount, average_amount
FROM T
WHERE average_amount IS NOT NULL
ORDER BY visited_on ASC
```
