---
layout: single
title: "SQL problem - Exchange Seats"
date: 2024-3-01
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-626](/assets/images/2024-03-01_16-28-26-problem-626.png)](/assets/images/2024-03-01_16-28-26-problem-626.png)

## Query

```sql
WITH T AS
    (SELECT
        *
    FROM
        (
            SELECT id as s1_id, student as s1_student
            FROM Seat
            WHERE MOD(id, 2) = 1
        ) s1,
        (
            SELECT id as s2_id, student as s2_student
            FROM Seat
            WHERE MOD(id, 2) = 0
        ) s2
    WHERE
        s1_id = s2_id - 1
    )

SELECT *
FROM
 (
    (
        SELECT DISTINCT
            s.id,
        (
            CASE
                WHEN s.id = T.s1_id THEN s2_student
                WHEN s.id = T.s2_id THEN s1_student
            END
        ) student
        FROM
            T,
            Seat as s
        WHERE
            s.id = T.s1_id OR s.id = T.s2_id
        ORDER BY
            s.id
    )
    UNION
    (
        SELECT *
        FROM
            (
                SELECT *
                FROM Seat
                ORDER BY id DESC
                LIMIT 1
            ) temp
        WHERE temp.id % 2 = 1
    )
 ) AS result
ORDER BY
    id
```

## Editorial Solution

### Approach I: Using flow control statement `CASE`

```sql
SELECT
    (CASE
        WHEN MOD(id, 2) != 0 AND counts != id THEN id + 1
        WHEN MOD(id, 2) != 0 AND counts = id THEN id
        ELSE id - 1
    END) AS id,
    student
FROM
    seat,
    (SELECT
        COUNT(*) AS counts
    FROM
        seat) AS seat_counts
ORDER BY id ASC;
```

### Approach II: Using bit manipulation and `COALESCE()`

```sql
SELECT
    s1.id, COALESCE(s2.student, s1.student) AS student
FROM
    seat s1
        LEFT JOIN
    seat s2 ON ((s1.id + 1) ^ 1) - 1 = s2.id
ORDER BY s1.id;
```
