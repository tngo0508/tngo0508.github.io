---
layout: single
title: "SQL problem - Employee Bonus"
date: 2024-2-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem-577](/assets/images/2024-02-06_22-27-26-problem-577.png)](/assets/images/2024-02-06_22-27-26-problem-577.png)

## Query

```sql
SELECT
    name,
    bonus
FROM
    Employee AS e
LEFT JOIN
    Bonus AS b
ON
    e.empId = b.empId
WHERE
    bonus < 1000 OR bonus IS NULL
```
