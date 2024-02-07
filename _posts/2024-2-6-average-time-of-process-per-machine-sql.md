---
layout: single
title: "SQL problem - Average Time of Process per Machine"
date: 2024-2-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem-1661](/assets/images/2024-02-06_22-05-58-problem-1661.png)](/assets/images/2024-02-06_22-05-58-problem-1661.png)

## My Query

```sql
WITH output AS (
    SELECT
        a1.machine_id,
        (a2.timestamp - a1.timestamp) as processing_time
    FROM
        Activity AS a1
    JOIN
        Activity AS a2
    WHERE
        a1.machine_id = a2.machine_id
        AND a1.process_id = a2.process_id
        AND a1.activity_type = 'start' AND a2.activity_type = 'end'
)
SELECT
    machine_id,
    ROUND(AVG(processing_time), 3) AS processing_time
FROM
    output
GROUP BY
    machine_id
```

## Editorial Solution

### Approach 1: Transform Values with CASE WHEN and then Calculate

The basic syntax of the `CASE` statement in MySQL is as follows:

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE default_result
END
```

> we use CASE WHEN to multiply all the start timestamp by -1, so the aggregated total of timestamp becomes the time to complete a process for each machine.

Note: the idea is that `(-start) + end` is equal to `end - start`

Solution:

```sql
SELECT
    machine_id,
    ROUND(SUM(CASE WHEN activity_type='start' THEN timestamp*-1 ELSE timestamp END)*1.0
    / (SELECT COUNT(DISTINCT process_id)),3) AS processing_time
FROM
    Activity
GROUP BY machine_id
```

### Approach 2: Calling the original Table twice and Calculate as two columns

```sql
SELECT a.machine_id,
       ROUND(AVG(b.timestamp - a.timestamp), 3) AS processing_time
FROM Activity a,
     Activity b
WHERE
    a.machine_id = b.machine_id
AND
    a.process_id = b.process_id
AND
    a.activity_type = 'start'
AND
    b.activity_type = 'end'
GROUP BY machine_id
```
