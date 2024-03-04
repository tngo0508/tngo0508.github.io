---
layout: single
title: "SQL problem - Investments in 2016"
date: 2024-3-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-585](/assets/images/2024-03-04_13-33-45-problem-585.png)]

## Query

```sql
WITH t1 AS
(
    SELECT
        *
    FROM
        Insurance i
    GROUP BY
        tiv_2015
    HAVING
        COUNT(tiv_2015) > 1
),
t2 AS
(
    SELECT
        *,
        CONCAT(lat, lon) as latlon
    FROM
        Insurance i
    GROUP BY
        latlon
    HAVING
        COUNT(latlon) = 1
)

SELECT
    ROUND(SUM(i.tiv_2016),2) AS tiv_2016
FROM
    Insurance i,
    t1,
    t2
WHERE
    i.tiv_2015 = t1.tiv_2015 AND i.pid = t2.pid
```

## Editorial Solution

### Approach 1: Creating Filters in Subqueries

```sql
SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM Insurance i
JOIN
   (
   SELECT tiv_2015
   FROM Insurance
   GROUP BY tiv_2015
   HAVING COUNT(DISTINCT pid) > 1
   )t0
ON i.tiv_2015 = t0.tiv_2015
JOIN
   (
   SELECT CONCAT(lat, lon) lat_lon
   FROM Insurance
   GROUP BY CONCAT(lat, lon)
   HAVING COUNT(DISTINCT pid) = 1
   )t1
ON CONCAT(i.lat, i.lon) = t1.lat_lon
```

### Approach 2: Creating Filters Using Window Function

```sql
SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM (
   SELECT *,
       COUNT(*)OVER(PARTITION BY tiv_2015) AS tiv_2015_cnt,
       COUNT(*)OVER(PARTITION BY lat, lon) AS loc_cnt
   FROM Insurance
   )t0
WHERE tiv_2015_cnt > 1
AND loc_cnt = 1
```
