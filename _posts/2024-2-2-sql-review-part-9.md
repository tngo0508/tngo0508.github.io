---
layout: single
title: "SQL Review - Part 9"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---

In this post, I continue the review of my knowledge about SQL. The materials are from the [Leet Code SQL card](https://leetcode.com/explore/learn/card/sql-language/)

## What I learn

- How to combine tables with LEFT, RIGHT, and INNER JOIN.
- How to select the columns swe need through JOIN.

use `JOIN` to combine different tables together.

## LEFT JOIN

- treating the table on the left side of the statement as the main table, and the other table as the attached table
- if any the specific record of main table does not include any attached table records, the values of the columns in the attached table will be set to NULL.

Assume that we are using the following tables

```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'This is the primary index',
  `name` VARCHAR(45) NOT NULL DEFAULT 'N/A',
  `age` INT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `new_schema`.`users` (`id`, `name`, `age`) VALUES 
  (1, 'John', 40),
  (2, 'May', 30),
  (3, 'Tim', 25);
  
  
CREATE TABLE `new_schema`.`orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT,
  `note` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);
 
INSERT INTO `new_schema`.`orders` (`id`, `user_id`, `note`) VALUES 
  (1, 1, 'some info'), 
  (2, 2, 'some comments'),
  (3, 2, 'no comments'),
  (4, NULL, 'weird');
```

order

| id  | user_id | note               |
|-----|---------|--------------------|
| 1   | 1       | some information   |
| 2   | 2       | some comments      |
| 3   | 2       | no comments        |
| 4   | NULL    | weird              |

users

| id  | name  | age |
|-----|-------|-----|
| 1   | John  | 40  |
| 2   | May   | 30  |
| 3   | Tim   | 25  |

Apply `LEFT JOIN`, treat `users` as main table and combine `orders` table as attached table

```sql
SELECT * FROM `new_schema`.`users`
LEFT JOIN `new_schema`.`orders` ON `users`.`id` = `orders`.`user_id`;
```

Result:

| id  | name  | age | id  | user_id | note               |
|-----|-------|-----|-----|---------|--------------------|
| 1   | John  | 40  | 1   | 1       | some information   |
| 2   | May   | 30  | 2   | 2       | some comments      |
| 2   | May   | 30  | 3   | 2       | no comments        |
| 3   | Tim   | 25  | NULL| NULL    | NULL               |

- **LEFT JOIN**: Combines rows from the main table (users) with matching rows from the attached table (orders). If there's no match in the attached table, NULL values are filled in.

- **ON**: Specifies the connection between the two tables. In this case, it links the 'id' column from the main table (users) to the 'user\_id' column in the attached table (orders). This establishes the relationship between the two tables based on these columns.

## RIGHT JOIN

- makes the table on the right the main table, and the table on the left the attached table.

```sql
SELECT * FROM `new_schema`.`users`
RIGHT JOIN `new_schema`.`orders` ON `users`.`id` = `orders`.`user_id`;
```

Result:

| id  | name  | age | id  | user_id | note               |
|-----|-------|-----|-----|---------|--------------------|
| 1   | John  | 40  | 1   | 1       | some information   |
| 2   | May   | 30  | 2   | 2       | some comments      |
| 2   | May   | 30  | 3   | 2       | no comments        |
| NULL| NULL  | NULL| 4   | NULL    | weird              |

Note:

- If we reverse the order of the two tables when using `LEFT JOIN`, this will be the same as using a `RIGHT JOIN`

## INNER JOIN

![inner-join](/assets/images/2024-02-02_12-01-13-join-sql-note.png)

- intersection between two tables

```sql
SELECT * FROM `new_schema`.`users`
INNER JOIN `new_schema`.`orders` ON `users`.`id` = `orders`.`user_id`;
```

Result:

| id  | name  | age | id  | user_id | note               |
|-----|-------|-----|-----|---------|--------------------|
| 1   | John  | 40  | 1   | 1       | some information   |
| 2   | May   | 30  | 2   | 2       | some comments      |
| 2   | May   | 30  | 3   | 2       | no comments        |

When selecting columns with the same name from multiple tables, you must specify the table name to avoid ambiguity. If the columns have unique names, you can write them directly. Here's a simple summary:

- **Same Name Columns:**

  - Use table name to specify the column when dealing with columns having the same name in different tables.
  - Example: `SELECT orders.id FROM orders;`
- **Unique Name Columns:**

  - If column names do not overlap, you can directly write the column name.
  - Example: `SELECT users.name, orders.note FROM users, orders;`
