---
layout: single
title: "SQL problem - Replace Employee ID With The Unique Identifier"
date: 2024-2-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

![problem-1378](/assets/images/2024-02-04_20-08-14-problem-1378.png)

## Query

```sql
SELECT unique_id, name
FROM EmployeeUNI
RIGHT JOIN Employees
ON EmployeeUNI.id = Employees.id
```

## Editorial Solution

```sql
SELECT 
    * 
FROM
    Employees 
LEFT JOIN 
    EmployeeUNI 
ON 
    Employees.id = EmployeeUNI.id;
```