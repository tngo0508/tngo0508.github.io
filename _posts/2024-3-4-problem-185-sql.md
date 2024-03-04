---
layout: single
title: "SQL problem - Find Users With Valid E-Mails"
date: 2024-3-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-185](/assets/images/2024-03-04_13-54-18-problem-185.png)](/assets/images/2024-03-04_13-54-18-problem-185.png)

## Query

```sql
SELECT
    t.Department, t.Employee, t.Salary
FROM
(
    SELECT DISTINCT
        (e.id) employee_id,
        (d.id) department_id,
        (d.name) Department,
        (e.name) Employee,
        (salary) Salary,
        DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) as rnk
    FROM
        Employee e,
        Department d
    WHERE
        e.departmentId = d.id
) t
WHERE
    t.rnk < 4
```

## Editorial Solution

### Approach 1: Return the First n Rows Using Correlated Subquery

```sql
SELECT d.name AS 'Department',
       e1.name AS 'Employee',
       e1.salary AS 'Salary'
FROM Employee e1
JOIN Department d
ON e1.departmentId = d.id
WHERE
    3 > (SELECT COUNT(DISTINCT e2.salary)
        FROM Employee e2
        WHERE e2.salary > e1.salary AND e1.departmentId = e2.departmentId);
```

### Approach 2: Return the First n Rows Using DENSE_RANK()

```sql
WITH employee_department AS
    (
    SELECT d.id,
        d.name AS Department,
        salary AS Salary,
        e.name AS Employee,
        DENSE_RANK()OVER(PARTITION BY d.id ORDER BY salary DESC) AS rnk
    FROM Department d
    JOIN Employee e
    ON d.id = e.departmentId
    )
SELECT Department, Employee, Salary
FROM employee_department
WHERE rnk <= 3
```
