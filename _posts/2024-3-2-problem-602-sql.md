---
layout: single
title: "SQL problem - Friend Requests II: Who Has the Most Friends"
date: 2024-3-02
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-602](/assets/images/2024-03-02_11-16-28-problem-602.png)](/assets/images/2024-03-02_11-16-28-problem-602.png)

## Query

```sql
SELECT
    id, COUNT(id) as num
FROM
(
    SELECT
        requester_id as id
    FROM
        RequestAccepted r

    UNION ALL

    SELECT
        accepter_id as id
    FROM
        RequestAccepted r
) AS t
GROUP BY
    id
ORDER BY
    num DESC
LIMIT 1
```

## Editorial Solution

### Approach 1: Combining Tables Using UNION ALL and Finding the Top Values Using ORDER BY + LIMIT

```sql
WITH all_ids AS (
   SELECT requester_id AS id
   FROM RequestAccepted
   UNION ALL
   SELECT accepter_id AS id
   FROM RequestAccepted)
SELECT id,
   COUNT(id) AS num
FROM all_ids
GROUP BY id
ORDER BY COUNT(id) DESC
LIMIT 1
```

### Approach 2: Combining Tables Using UNION ALL and Finding Top Values Using RANK()

```sql
WITH all_ids AS (
   SELECT requester_id AS id
   FROM RequestAccepted
   UNION ALL
   SELECT accepter_id AS id
   FROM RequestAccepted)
SELECT id, num
FROM
   (
   SELECT id,
      COUNT(id) AS num,
      RANK () OVER(ORDER BY COUNT(id) DESC) AS rnk
   FROM all_ids
   GROUP BY id
   )t0
WHERE rnk=1
```
