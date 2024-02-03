---
layout: single
title: "SQL problem - Top Travellers"
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

![problem-1407](/assets/images/2024-02-02_15-30-04-top-travellers.png)

## Query

```sql
SELECT
    u.name,
    IF(r.distance IS NOT NULL, SUM(r.distance), 0) AS travelled_distance
FROM
    Users as u
LEFT JOIN
    Rides as r
    ON u.id = r.user_id
GROUP BY u.id
ORDER BY 
    travelled_distance DESC,
    u.name ASC
```

## Editorial Solution

- Since the question is asking for the distance travelled by each user and there may be users who have not travelled any distance, `LEFT JOIN` is needed so each user from the Users table will be included.
- For those users who have not travelled, functions such as `IFNULL()` or `COALESCE()` are needed to return 0 instead of null for their total distance. The two functions are a little bit different, but for this question, they can be used interchangeably.
  - [IFNULL()](https://dev.mysql.com/doc/refman/5.7/en/flow-control-functions.html#function_ifnull): takes two arguments and returns the first one if it's not NULL or the second if the first one is NULL.
  - [COALESCE()](https://dev.mysql.com/doc/refman/5.7/en/comparison-operators.html#function_coalesce): takes two or more parameters and returns the first non-NULL parameter, or NULL if all parameters are NULL.
- Since users might have the same name and id is the primary key for this table (which means the values in this column will be unique). We need to use id for `GROUP BY` to get the aggregated distance for each user.

```sql
SELECT 
    u.name, 
    IFNULL(SUM(distance),0) AS travelled_distance
FROM 
    Users u
LEFT JOIN 
    Rides r
ON 
    u.id = r.user_id
GROUP BY 
    u.id
ORDER BY 2 DESC, 1 ASC
```
