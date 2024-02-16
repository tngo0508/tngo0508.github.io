---
layout: single
title: "SQL problem - Game Play Analysis IV"
date: 2024-2-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-550](/assets/images/2024-02-15_17-33-13-problem-550.png)](/assets/images/2024-02-15_17-33-13-problem-550.png)

## Query

```sql
WITH first_date_table AS (
    SELECT
        MIN(event_date) AS first_date, player_id
    FROM
        Activity
    GROUP BY
        player_id
)

SELECT 
    ROUND(
        (
            SELECT
                COUNT(*)
            FROM
                Activity AS a
            JOIN
                first_date_table AS f
                ON 
                    a.player_id = f.player_id AND a.event_date = DATE_ADD(f.first_date, INTERVAL 1 DAY)
        ) / count(DISTINCT player_id), 2
    ) AS fraction
FROM
    Activity
```
