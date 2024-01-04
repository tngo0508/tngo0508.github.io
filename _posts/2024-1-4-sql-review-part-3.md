---
layout: single
title: "SQL Review - Part 3"
date: 2024-1-4
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
- Basic syntax about how to read, create, modify, and remove data.
- Basic modifications to the syntax for actual scenarios.

# Basic Syntax:
Let's explore the fundamental structure of SQL syntax:
```sql
SELECT `id`, `name` FROM `new_schema`.`users`;
```

In this snippet:

- `SELECT` and `FROM` are SQL keywords, which we'll delve into later.
- `id` and name are column names.
- `new_schema` is the schema name.
- `users` is the table name.

Sample Data:
To illustrate the results of executing an SQL statement, let's consider a sample table named users.

|id|name|age|
|--|----|---|
|1|John|50|
|2|May|40|
|3|Tim|10|

Schema SQL
```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'This is the primary index',
  `name` VARCHAR(45) NOT NULL DEFAULT 'N/A',
  `age` INT NULL,
  `height` INT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `new_schema`.`users` (`id`, `name`, `age`, `height`) VALUES (1, 'John', 50, 180);
INSERT INTO `new_schema`.`users` (`id`, `name`, `age`) VALUES (2, 'May', 40);
INSERT INTO `new_schema`.`users` (`id`, `name`, `age`, `height`) VALUES (3, 'Tim', 10, 170);
INSERT INTO `new_schema`.`users` (`id`, `name`, `age`, `height`) VALUES (4, 'Jay', 20, 155);
```

Query SQL
```sql
SELECT * FROM `new_schema`.`users`;
```
[![example](/assets/images/2024-01-04_13-01-55-review-sql-part-3-1.png)](/assets/images/2024-01-04_13-01-55-review-sql-part-3-1.png)

# Create data: INSERT
```sql
INSERT INTO `new_schema`.`users` (`id`, `name`, `age`) VALUES (4, 'Harry', 33);
```

- **INSERT INTO**: This phrase specifies the target database table (users) and the columns (id, name, age) where the data will be added.

- **VALUES**: Following this keyword, the actual values corresponding to the specified columns are set. In this example, a new entry with an id of 4, name of 'Harry', and age of 33 will be inserted into the database.

When crafting an `INSERT` statement, it's crucial to ensure that the field names and values are correctly aligned. Unlike the more intricate syntax of the `SELECT` statement, the `INSERT` statement is relatively straightforward.

# Create Multiple New Records
```sql
INSERT INTO `new_schema`.`users` (`id`, `name`, `age`) VALUES (4, 'Harry', 33), (5, 'Tom', 30);
```

Result:
|id|name|age|
|--|----|---|
|1|John|50|
|2|May|40|
|3|Tim|10|
|4|Harry|33|
|5|Tom|30|

# Read Data: SELECT
```sql
SELECT `id`, `name` 
FROM `new_schema`.`users`;
```
- **FROM**: This keyword signifies the source table and database for the operation. In this example, it indicates that the operation is from the users table within the new_schema database.

- **SELECT**: This keyword specifies which columns to include in the displayed results. In the example, it instructs the system to show the id and name columns in the output.

# Read All
```sql
SELECT * FROM `new_schema`.`users`;
```
Using an asterisk ('*'), instead of listing the column names, will fetch all of the columns in the table

Note: if the data in the table is very large, the performance of **SELECT * may be very slow**.

# Conditions
```sql
SELECT * 
FROM `new_schema`.`users` 
WHERE `id` = 2;
```

# Modify Data: UPDATE
In the context of an SQL query, two key terms are employed:
```sql
UPDATE `new_schema`.`users` SET `name` = 'Andy', `age` = 100 WHERE `id` = 2;
```

- **UPDATE**: This keyword is followed by the name of the table that requires updating (users in this case).

- **SET**: Following this keyword are the values that should replace existing data. When updating multiple columns, separate them with commas.

Additionally:

The `WHERE` keyword is often used to filter data, making the update specific. While optional, omitting it results in a full table update, which is generally rare.
Many database software has default safeguards against such potentially risky operations.
After execution, with the inclusion of the `WHERE` clause, only the record with an id of 2 will be updated, setting the name to 'Andy' and the age to 100.

# Remove Data: DELETE
```sql
DELETE FROM `new_schema`.`users` WHERE `id` = 1;
```

- **DELETE**: This keyword signifies the intention to remove data from the specified table.

- **FROM**: Similar to the `SELECT` and `UPDATE` queries, this keyword indicates the table from which data should be deleted (users in this example).

Additionally:

The `WHERE` keyword is often used to narrow down the data range to be removed. While not mandatory, it is rare in practice to delete all data from a table without any filtering.
In this example, the query intends to delete the record with an id of 2 from the users table. The `WHERE` clause restricts the deletion to a specific subset of data.