---
layout: single
title: "SQL problem - Delete Duplicate Emails"
date: 2024-3-3
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-196](/assets/images/2024-03-03_11-23-54-problem-196.png)](/assets/images/2024-03-03_11-23-54-problem-196.png)

## Query

```sql
DELETE FROM
    Person p1
WHERE
    p1.id IN (
        SELECT id
        FROM (
            SELECT
                id,
                ROW_NUMBER() OVER (PARTITION BY Email ORDER BY id) as row_num
            FROM Person
        ) as p
        WHERE row_num > 1
    )

```

Explanation:

```sql
SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY Email ORDER BY id) as row_num
FROM Person
```

In this part, the query uses the `ROW_NUMBER()` window function to assign a unique row number to each record within partitions defined by the "Email" column. The `PARTITION BY Email` clause means that the numbering restarts for each unique email address, and the `ORDER BY id` ensures a consistent order within each partition.

```sql
SELECT id
FROM (
    -- Inner query here
) as p
WHERE row_num > 1

```

The outer query selects the "id" column from the result of the inner query (aliased as "p"). It filters the results to include only those rows where the row number (`row_num`) is greater than 1. This means it will retrieve the IDs of records that have duplicates based on the "Email" column.

In summary, the query is finding and returning the IDs of records in the "Person" table that have duplicate email addresses. The use of `ROW_NUMBER()` and filtering for `row_num > 1` helps identify and exclude unique records, leaving only the IDs of duplicate records in the final result.

## Editorial Solution

### Approach: Using `DELETE` and `WHERE` clause

```sql
DELETE p1 FROM person p1,
    person p2
WHERE
    p1.Email = p2.Email AND p1.Id > p2.Id
```
