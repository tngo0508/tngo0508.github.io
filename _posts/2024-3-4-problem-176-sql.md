---
layout: single
title: "SQL problem - Second Highest Salary"
date: 2024-3-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-176](/assets/images/2024-03-04_00-58-46-PROBLEM-176.png)]

## Query

```sql
SELECT
    (
        SELECT
            DISTINCT T.salary as SecondHighestSalary
        FROM
        (
            SELECT
                *,
                RANK() OVER (ORDER BY salary DESC) AS rnk
            FROM
                Employee e
        ) T
        WHERE
            T.rnk >= 2
        LIMIT 1
    ) SecondHighestSalary
```

## Editorial Solution

### Approach 1: Using `sub-query` and `LIMIT` clause

```sql
SELECT
    (SELECT DISTINCT
            Salary
        FROM
            Employee
        ORDER BY Salary DESC
        LIMIT 1 OFFSET 1) AS SecondHighestSalary
;
```

### Approach 2: Using IFNULL and LIMIT clause

```sql
SELECT
    IFNULL(
      (SELECT DISTINCT Salary
       FROM Employee
       ORDER BY Salary DESC
        LIMIT 1 OFFSET 1),
    NULL) AS SecondHighestSalary
```
