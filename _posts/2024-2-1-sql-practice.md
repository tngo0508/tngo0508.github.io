---
layout: single
title: "SQL problem - Swap Salary"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---

# Problem
![prompt1](/assets/images/2024-02-01_11-28-00-prompt-1.png)

![prompt2](/assets/images/2024-02-01_11-28-19-prompt-2.png)

# Solution
To dynamically set a value to a column, we can use `UPDATE` statement together when `CASE`...`WHEN`... flow control statement.
```sql
UPDATE salary
SET
    sex = CASE sex
        WHEN 'm' THEN 'f'
        ELSE 'm'
    END;
```