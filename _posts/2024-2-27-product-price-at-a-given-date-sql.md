---
layout: single
title: "SQL problem - Product Price at a Given Date"
date: 2024-2-27
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-1164](/assets/images/2024-02-27_13-11-39-problem-1164.png)](/assets/images/2024-02-27_13-11-39-problem-1164.png)

>Need to review this problem again.

## Editorial Solution

### Approach 1: Divide cases by using UNION ALL

The main idea of the approach is to divide the cases into two sets using the UNION ALL keyword. The first set includes products where the first changed date (change\_date) is after '2019-08-16', and in this case, the new price is set to 10. The second set includes products where the last changed date is on or before '2019-08-16', and the new price is obtained by finding the last changed price for each product.

Here is a step-by-step summary:

1. Group the table by product\_id and use the MIN aggregation function with the HAVING clause to find products with the first changed date after '2019-08-16'. Set the price to 10 for these products.

2. Group the table by product\_id again and find the product\_id and the last changed date until '2019-08-16'.

3. Find the last changed new\_price field with the last changed date for each product.

4. Combine the two sets using UNION ALL.

The approach ensures that there are no duplicate tuples when combining the sets, and it takes into account the cases where the price wasn't changed in time, setting the new price to 10 in such scenarios. Additionally, UNION ALL is preferred over UNION for better performance since it retains duplicate rows.

```sql
SELECT
  product_id,
  10 AS price
FROM
  Products
GROUP BY
  product_id
HAVING
  MIN(change_date) > '2019-08-16'
UNION ALL
SELECT
  product_id,
  new_price AS price
FROM
  Products
WHERE
  (product_id, change_date) IN (
    SELECT
      product_id,
      MAX(change_date)
    FROM
      Products
    WHERE
      change_date <= '2019-08-16'
    GROUP BY
      product_id
  )
```
