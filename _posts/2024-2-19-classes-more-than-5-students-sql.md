---
layout: single
title: "SQL problem - Classes More Than 5 Students"
date: 2024-2-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-596](/assets/images/2024-02-19_18-47-35-problem-596.png)](/assets/images/2024-02-19_18-47-35-problem-596.png)

## Query

```sql
SELECT
    class
FROM Courses
GROUP BY class
HAVING COUNT(student) >= 5
```

## Editorial Solution

### Approach: Group By

```sql
SELECT
    class
FROM
    (SELECT
        class, COUNT(student) AS num
    FROM
        courses
    GROUP BY class) AS temp_table
WHERE
    num >= 5
;
```
