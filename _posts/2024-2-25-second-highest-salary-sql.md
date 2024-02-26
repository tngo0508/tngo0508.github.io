---
layout: single
title: "SQL problem - Second Highest Salary"
date: 2024-2-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-176](/assets/images/2024-02-25_20-39-19-problem-176.png)](/assets/images/2024-02-25_20-39-19-problem-176.png)

## Query

### First implementation

```sql
SELECT
    IF(COUNT(*) = 0, NULL, e1.salary) as SecondHighestSalary
FROM
    Employee as e1,
    (
        SELECT *
        FROM Employee
        GROUP BY salary
        ORDER BY salary DESC
        LIMIT 1 OFFSET 1
    ) as e2
WHERE
    e1.id = e2.id
```

### Second implementation

```sql
SELECT
    IF(COUNT(*) = 0, NULL, e1.salary) as SecondHighestSalary
FROM
    Employee as e1,
    (
        SELECT DISTINCT salary
        FROM Employee
        ORDER BY salary DESC
        LIMIT 1 OFFSET 1
    ) as e2
WHERE
    e1.salary = e2.salary
```

## Editorial Solution

### Approach 1: Using sub-query and `LIMIT` clause

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

### Approach 2: Using `IFNULL` and `LIMIT` clause

```sql
SELECT
    IFNULL(
      (SELECT DISTINCT Salary
       FROM Employee
       ORDER BY Salary DESC
        LIMIT 1 OFFSET 1),
    NULL) AS SecondHighestSalary
```
