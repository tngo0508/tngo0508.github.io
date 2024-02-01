---
layout: single
title: "SQL problem - Article Views I"
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

![problem](/assets/images/2024-02-01_12-02-39-article-views-1.png)

# My Solution

```sql
SELECT author_id as id
FROM Views
WHERE author_id = viewer_id
GROUP BY id
ORDER BY id ASC
```

# Editorial Solution

In SQL, we can use the keyword `DISTINCT` in the `SELECT` statement to retrieve unique elements from the table Views. We also apply a condition using the WHERE clause. This condition filters out only those rows where the `author_id` is equal to the `viewer_id`.

```sql
SELECT 
    DISTINCT author_id AS id 
FROM 
    Views 
WHERE 
    author_id = viewer_id 
ORDER BY 
    id 
```