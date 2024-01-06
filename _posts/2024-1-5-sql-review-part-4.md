---
layout: single
title: "SQL Review - Part 4"
date: 2024-1-5
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---
In this post, I continue the review of my knowledge about SQL. The materials are from the [Leet Code SQL card](https://leetcode.com/explore/learn/card/sql-language/)

# What I learn:
- How to query data with single and comparing conditions.
- How to query data with a range condition.
- How to query data with a fuzzy condition.

# Basic Condition
## Equal To
```sql
SELECT * FROM `new_schema`.`users` WHERE id = 1;
```
## Greater Than
```sql
SELECT * FROM `new_schema`.`users` WHERE id > 2;
```
## Not Equal
```sql
SELECT * FROM `new_schema`.`users` WHERE id != 1;
```
## NULL
In SQL, checking if a column value is equal to `NULL` cannot be expressed as `columnA = NULL.` Due to the special nature of `NULL` as a database placeholder, it cannot be used in a standard value comparison. Instead, the correct approach is to use the following syntax:
```sql
SELECT * FROM `new_schema`.`users` WHERE height IS NULL;
```

For the opposite condition, you only need to add one more keyword, NOT.
```sql
SELECT * FROM `new_schema`.`users` WHERE height IS NOT NULL;
```

# Multiple Conditions
we need to use logical operators, which is to combine `AND` and `OR` keywords in SQL statements to meet our requirements.
## AND
```sql
SELECT * FROM `new_schema`.`users` WHERE age < 40 AND height > 160;
```
## OR
```sql
SELECT * FROM `new_schema`.`users` WHERE age < 40 OR height > 160;
```

# Range Conditions
Range queries are a prevalent type of data searching problem in SQL. There are three primary types of range queries: `IN`, `BETWEEN`, and `LIKE`.
## IN
This SQL query retrieves all columns (`*`) from the users table in the `new_schema` database where the `id` column matches any value in the provided list (1, 3). The `IN` keyword is used to specify a range condition, and in this case, it filters rows where the `id` is either 1 or 3.
```sql
SELECT * FROM `new_schema`.`users` WHERE `id` IN (1, 3);
```
And just like the earlier example statement for IS NULL, you can add a NOT keyword before IN to obtain the opposite result.
```sql
SELECT * FROM `new_schema`.`users` WHERE id NOT IN (1, 4);
```

## BETWEEN
This SQL query retrieves all columns (*) from the users table in the `new_schema` database where the `height` column falls within the range of 160 to 190 (inclusive). The `BETWEEN` keyword is used for range comparison, and it selects rows where the `height` value is greater than or equal to 160 and less than or equal to 190.
```sql
SELECT * FROM `new_schema`.`users` WHERE height BETWEEN 160 AND 190;
```

>**BETWEEN** needs to be used with the **AND** keyword to fetch the data within a specific range. And like **IN**, there is also a reverse query mode with **NOT**.

## LIKE
This SQL query retrieves all columns (`*`) from the `users` table in the `new_schema` database where the `name` column contains the character `a` anywhere in the string. The `LIKE` operator, along with the `%` wildcard, is used for pattern matching. In this case, `%a%` indicates that the name should include the character `a` at any position within the string.
```sql
SELECT * FROM `new_schema`.`users` WHERE name LIKE '%a%';
```
>Note: The percent sign (**%**) will match zero, one, or multiple characters. To match exactly one character we could use an underscore (**_**).

## Find the data whose name starts with J
This SQL query retrieves all columns (`*`) from the users table in the `new_schema` database where the name column starts with the letter `J`. The `LIKE` operator is used for pattern matching, and in this case, `J%` specifies that the name should begin with the letter `J`, followed by any sequence of characters.
```sql
SELECT * FROM `new_schema`.`users` WHERE name LIKE 'J%';
```

## Find the data whose name ends with y
```sql
SELECT * FROM `new_schema`.`users` WHERE name LIKE '%y';
```