---
layout: single
title: "SQL problem - Not Boring Movies"
date: 2024-2-9
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

![problem-620](/assets/images/2024-02-09_11-51-03-PROBLEM-620.png)

## My Query

```sql
SELECT *
FROM Cinema AS c
WHERE c.id % 2 != 0 AND c.description != 'boring'
ORDER BY rating DESC
```

## Editorial Solution

```sql
select *
from cinema
where mod(id, 2) = 1 and description != 'boring'
order by rating DESC
;
```
