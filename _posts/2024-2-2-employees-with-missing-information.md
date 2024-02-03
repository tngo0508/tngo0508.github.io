---
layout: single
title: "SQL problem - Employees With Missing Information"
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

![problem-1965](/assets/images/2024-02-02_16-28-33-employees-with-missing-information.png)

## My Solution

Note:

- Need to implement the `FULL JOIN` in MySQL for this problem since MySQL doesn't have that type of join.

```sql
SELECT
    COALESCE(e_id, t_id) AS employee_id
FROM(
(   SELECT
        Employees.employee_id as e_id,
        Salaries.employee_id as t_id,
        name,
        salary
    FROM
        Employees
    LEFT JOIN Salaries
        ON Employees.employee_id = Salaries.employee_id
)
UNION ALL
(   SELECT
        Employees.employee_id as e_id,
        Salaries.employee_id as t_id,
        name,
        salary
    FROM
        Employees
    RIGHT JOIN Salaries
        ON Employees.employee_id = Salaries.employee_id
    WHERE Employees.employee_id IS NULL
)
) AS t3
WHERE salary IS NULL OR name IS NULL
ORDER BY employee_id;
```

## Discussion/Forum Solution

- There is no natively implemented Outer Join in MySQL.
- But we can implement `OUTER JOIN` in MySQL by taking a `LEFT JOIN` and `RIGHT JOIN` union.
- If column names of two tables are identical, we can use the USING clause instead of the ON clause.

```sql
SELECT T.employee_id
FROM  
  (SELECT * FROM Employees LEFT JOIN Salaries USING(employee_id)
   UNION 
   SELECT * FROM Employees RIGHT JOIN Salaries USING(employee_id))
AS T
WHERE T.salary IS NULL OR T.name IS NULL
ORDER BY employee_id;
```