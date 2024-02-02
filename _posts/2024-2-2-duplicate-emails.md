---
layout: single
title: "SQL problem - Duplicate Emails"
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

[![problem](/assets/images/2024-02-02_09-25-20-duplicate-emails.png)](/assets/images/2024-02-02_09-25-20-duplicate-emails.png)

## Query

Note:

- because `WHERE` cannot be used with the `GROUP BY`, that's why we have `HAVING` clause.

```sql
SELECT
    email
FROM
    Person
GROUP BY email
HAVING COUNT(email) > 1
```

## Editorial Solution

### Approach 1: Using GROUP BY and Subquery

```sql
select Email from
(
  select Email, count(Email) as num
  from Person
  group by Email
) as statistic
where num > 1
;
```
