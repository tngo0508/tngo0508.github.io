---
layout: single
title: "SQL Review - Part 7"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---
In this post, I continue the review of my knowledge about SQL. The materials are from the [Leet Code SQL card](https://leetcode.com/explore/learn/card/sql-language/)

# What I learn

- How to find the data without duplicates.
- How to paginate the result.
- How to sort the result.
- How to group the data into specified columns.

# Table

```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'This is the primary index',
  `name` VARCHAR(45) NOT NULL DEFAULT 'N/A',
  `age` INT NULL,
  `height` INT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `new_schema`.`users` (`id`, `name`, `age`, `height`) VALUES 
  (1, 'John', 40, 150),
  (2, 'May', 30, 140),
  (3, 'Tim', 25, 170),
  (4, 'Jay', 60, 185),
  (5, 'Maria', 30, 190),
  (6, 'Tom', 53, 200),
  (7, 'Carter', 40, 145);
```

result:

| id | name   | age | height |
|----|--------|-----|--------|
| 1  | John   | 40  | 150    |
| 2  | May    | 30  | 140    |
| 3  | Tim    | 25  | 170    |
| 4  | Jay    | 60  | 185    |
| 5  | Maria  | 30  | 190    |
| 6  | Tom    | 53  | 200    |
| 7  | Carter | 40  | 145    |

# Uniqueness: DISTINCT

```sql
SELECT DISTINCT age FROM `new_schema`.`users`;
```

Result:

| age |
|-----|
| 40  |
| 30  |
| 25  |
| 60  |
| 53  |

# Pagination: LIMIT & OFFSET

`LIMIT`: limiting number of items displayed

`OFFSET`: skipping the first specified number of items

```sql
SELECT * FROM `new_schema`.`users` LIMIT 3 OFFSET 1;
```

Result:

| id | name | age | height |
|----|------|-----|--------|
| 2  | May  | 30  | 140    |
| 3  | Tim  | 25  | 170    |
| 4  | Jay  | 60  | 185    |

```sql
SELECT * FROM `new_schema`.`users` LIMIT 3 OFFSET 3;
```

Result:

| id | name  | age | height |
|----|-------|-----|--------|
| 4  | Jay   | 60  | 185    |
| 5  | Maria | 30  | 190    |
| 6  | Tom   | 53  | 200    |

# Sorting: ORDER

The `ORDER BY` clause in SQL is typically ***employed at the end of a query*** to enhance the search results by arranging the data based on a specified column. This enables a more organized and visually accessible analysis of the data. For instance, when dealing with columns like '`updated_time`' or '`order_price`,' `ORDER BY` facilitates sorting the results in ascending (small to big) or descending (big to small) order. This functionality is valuable for efficiently examining and interpreting data, especially when focusing on specific criteria.

```sql
SELECT * FROM `new_schema`.`users` ORDER BY age;
```

Result:

| id | name   | age | height |
|----|--------|-----|--------|
| 3  | Tim    | 25  | 170    |
| 2  | May    | 30  | 140    |
| 5  | Maria  | 30  | 190    |
| 1  | John   | 40  | 150    |
| 7  | Carter | 40  | 145    |
| 6  | Tom    | 53  | 200    |
| 4  | Jay    | 60  | 185    |

As shown in the above results, it will be sorted in ascending by age, from small to large, and this statement is actually an abbreviation of the following sentence:

```sql
SELECT * FROM `new_schema`.`users` ORDER BY age ASC;
```

Therefore, by replacing the `ASC` the keyword at the back of the age, with `DESC`, the data can be sorted in descending order, that is, from large to small.

# Multi-column Sorting

```sql
SELECT * FROM `new_schema`.`users` ORDER BY age DESC, height DESC;
```

Result:

| id | name   | age | height |
|----|--------|-----|--------|
| 4  | Jay    | 60  | 185    |
| 6  | Tom    | 53  | 200    |
| 1  | John   | 40  | 150    |
| 7  | Carter | 40  | 145    |
| 5  | Maria  | 30  | 190    |
| 2  | May    | 30  | 140    |
| 3  | Tim    | 25  | 170    |

# Grouping: GROUP BY

Use `GROUP BY` on grouping logic. It is similiar to the `DISTINCT`, but `GROUP BY` also supports **Agregation Function** statements.

```sql
SELECT `age` FROM `new_schema`.`users` GROUP BY age;
```

Result:

| age |
|-----|
| 40  |
| 30  |
| 25  |
| 60  |
| 53  |

To find out how many records there are in each age group

```sql
SELECT COUNT(*), `age` FROM `new_schema`.`users` GROUP BY age;
```

Result:

| count(*) | age |
|----------|-----|
|    2     |  40 |
|    2     |  30 |
|    1     |  25 |
|    1     |  60 |
|    1     |  53 |

And here, we can use the various optimizing `SELECT` statements we have learned to optimize the results. For example, we can use `AS` to change the name of the `count(*)` column to make it easier to read, and we can sort the results from small to large:

```sql
SELECT COUNT(*) AS `age_count`, `age`
FROM `new_schema`.`users`
GROUP BY age
ORDER BY `age_count`;
```

Result:

| age_count | age |
|-----------|-----|
|     1     |  25 |
|     1     |  60 |
|     1     |  53 |
|     2     |  40 |
|     2     |  30 |

Notes: 
Can divide our thinking into 2 parts
1. The first part is **how to write a query that meets the given conditions**.
2. The second part is **how to display the generated result**.