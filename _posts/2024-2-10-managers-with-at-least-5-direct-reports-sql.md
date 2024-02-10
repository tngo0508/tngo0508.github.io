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

![problem-570](/assets/images/2024-02-10_11-50-15-problem-570.png)

## Query

```sql
SELECT 
    e1.name
FROM
    Employee AS e1
JOIN
    Employee AS e2
WHERE
    e1.id = e2.managerId
GROUP BY
    e1.id
HAVING COUNT(*) >= 5
```

## Editorial Solution

### Approach 1: Group By and Join

```sql
SELECT
    Name
FROM
    Employee AS t1 
JOIN
    (SELECT 
        ManagerId
    FROM 
        Employee
    GROUP BY ManagerId
    HAVING COUNT(ManagerId) >= 5) AS t2
ON 
    t1.Id = t2.ManagerId
;
```

### Approach 2: IN Clause with Subquery

```sql
SELECT
    name
FROM
    employee
WHERE
    id IN (
        SELECT
            managerId
        FROM
            employee
        GROUP BY
            managerId
        HAVING COUNT(*) >= 5
    );
```
