---
layout: single
title: "SQL problem - Rising Temperature"
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

![problem-197](/assets/images/2024-02-06_12-29-23-problem-197.png)

## Approach 1: Using JOIN and DATEDIFF()

By performing a self-join on the Weather table, we essentially combine each day with every other day. To narrow it down, we use the `DATEDIFF` function to only include pairs of consecutive days. Then, we filter these pairs further to only include cases where the temperature is higher on the second day. The resulting ids identify days where the temperature was higher than the day before.

Note: using the `DATEDIFF` function to find pairs of records where the `recordDate` differs by exactly one day.

```sql
SELECT
    w1.id
FROM
    Weather w1
JOIN
    Weather w2
ON
    DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE
    w1.temperature > w2.temperature;
```

## Approach 2: Using LAG() Function

### What is Common Table Expression (CTE)?

A Common Table Expression (CTE) is a temporary named result set in a SQL query that can be referenced within the context of a SELECT, INSERT, UPDATE, or DELETE statement. It allows you to create a named, reusable, and self-contained query that can be referenced multiple times in a larger SQL statement.

CTEs are defined using the WITH clause, and they are particularly useful for simplifying complex queries, improving readability, and breaking down a large query into more manageable and modular parts. They are often employed for recursive queries, aggregations, or when you need to perform multiple operations on the same subset of data within a query.

Here's a basic syntax for creating a CTE:

```sql
WITH cte_name (column1, column2, ...) AS (
    -- CTE query definition
    SELECT column1, column2, ...
    FROM your_table
    WHERE conditions
)
-- Main query using the CTE
SELECT *
FROM cte_name;
```

#### What is LAG()?

In SQL, the `LAG()` function is used to access the value of a column from the previous row within the result set. It helps compare the current row's value with the value of the preceding row. This function is particularly useful for tasks like identifying changes or trends in sequential data.

```sql
SELECT column_name, LAG(column_name) OVER (ORDER BY some_order_column) AS previous_value
FROM your_table;
```

Note: uses the `DATE_ADD()` function to add an interval of 1 day to the PreviousRecordDate and checks if it equals the current recordDate.

simple example of `DATE_ADD`: adds 7 days to the date '2022-01-01', resulting in a new date. You can replace '2022-01-01' with any date expression and adjust the interval according to your requirements.

```sql
SELECT DATE_ADD('2022-01-01', INTERVAL 7 DAYS) AS new_date;
```

**Solution**

```sql
WITH PreviousWeatherData AS
(
    SELECT
        id,
        recordDate,
        temperature,
        LAG(temperature, 1) OVER (ORDER BY recordDate) AS PreviousTemperature,
        LAG(recordDate, 1) OVER (ORDER BY recordDate) AS PreviousRecordDate
    FROM
        Weather
)
SELECT
    id
FROM
    PreviousWeatherData
WHERE
    temperature > PreviousTemperature
AND
    recordDate = DATE_ADD(PreviousRecordDate, INTERVAL 1 DAY);
```

## Approach 3: Using Subquery

The inner query is responsible for retrieving the temperature of the day before the date currently under consideration in the outer query.

```sql
SELECT
    w2.temperature
FROM
    Weather w2
WHERE
    w2.recordDate = DATE_SUB(w1.recordDate, INTERVAL 1 DAY)
```

**Solution**

```sql
SELECT
    w1.id
FROM
    Weather w1
WHERE
    w1.temperature > (
        SELECT
            w2.temperature
        FROM
            Weather w2
        WHERE
            w2.recordDate = DATE_SUB(w1.recordDate, INTERVAL 1 DAY)
    );
```

## Approach 4: Using Cartesian Product and WHERE Clause

```sql
SELECT
    w2.id
FROM
    Weather w1, Weather w2
WHERE
    DATEDIFF(w2.recordDate, w1.recordDate) = 1
AND
    w2.temperature > w1.temperature;
```
