---
layout: single
title: "SQL problem - Students and Examinations"
date: 2024-2-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem-1280](/assets/images/2024-02-08_13-04-15-problem-1280.png)](/assets/images/2024-02-08_13-04-15-problem-1280.png)

## My Query

The idea is that I created the inner query to cross join the table `Students` and `Subjects`. Then, use the `LEFT JOIN` to merge with the `Examinations` table. After that, I used the aggretation function `COUNT` to find out the attended times the students have. In addition, I utilized the `IF` clause to set the `NULL` value to `0` if students do not attend the exams of a subject.

```sql
SELECT
    t.student_id,
    t.student_name,
    t.subject_name,
    IF(e.student_id IS NULL, 0, COUNT(*)) AS attended_exams
FROM
    (SELECT
        *
    FROM
        Students AS s,
        Subjects AS sub) AS t
LEFT JOIN
    Examinations AS e
    ON 
        t.student_id = e.student_id AND e.subject_name = t.subject_name
GROUP BY
    t.student_id, t.subject_name
ORDER BY
    t.student_id, t.subject_name ASC
```

## Editorial Solution

```sql
SELECT 
    s.student_id, s.student_name, sub.subject_name, IFNULL(grouped.attended_exams, 0) AS attended_exams
FROM 
    Students s
CROSS JOIN 
    Subjects sub
LEFT JOIN (
    SELECT student_id, subject_name, COUNT(*) AS attended_exams
    FROM Examinations
    GROUP BY student_id, subject_name
) grouped 
ON s.student_id = grouped.student_id AND sub.subject_name = grouped.subject_name
ORDER BY s.student_id, sub.subject_name;
```
