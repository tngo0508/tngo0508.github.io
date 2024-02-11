---
layout: single
title: "SQL problem - Managers with at Least 5 Direct Reports"
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

[![problem-1075](/assets/images/2024-02-10_19-07-36-problem-1075.png)](/assets/images/2024-02-10_19-07-36-problem-1075.png)

## Query

```sql
SELECT
    p.project_id,
    ROUND(AVG(e.experience_years), 2) AS average_years
FROM
    Project AS p
JOIN
    Employee AS e
    ON
        p.employee_id = e.employee_id
GROUP BY
    p.project_id
```
