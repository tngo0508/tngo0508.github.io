---
layout: single
title: "SQL Review - Part 2"
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
- Understanding different data types and their use cases.
- Common column attribute functions in SQL.
- Creating and updating column settings.

# Column Types
- **Number**: Represented by `BIGINT`, `INT`, `MEDIUMINT`, `SMALLINT`, `TINYINT` for integers, and `DOUBLE`, `FLOAT`, `DECIMAL` for decimals.
  - **Recommendation**: For high-accuracy data, use `DECIMAL` instead of DOUBLE or FLOAT.
  
  >It should be noted that the values stored in **DOUBLE** and **FLOAT** are not precise. When you store **2.5** for related operations, it is likely to be calculated as **2.500000002**.
- **Datetime**: `DATE`, `MONTH`, `YEAR`, `DATETIME`, `TIMESTAMP` for handling date and time data.
  
  >**DATETIME** can accept a purely datetime value format like *8888-01-01 00:00:00*, but **TIMESTAMP** is limited to between *1970-01-01 00:00:01* and *2038-01-19 03:14:07*

- **Text**: `CHAR`, `VARCHAR` for plain text, `TEXT`, `LONGTEXT` for variable-length or large text.
>**CHAR**: Use for fixed-length text, like currency abbreviations.
>**VARCHAR**: Ideal for variable-length text; set the maximum length. Common default: VARCHAR(45) for MySQL (45 characters). Beware: Setting a size too small can lead to exceeding the column size limit error, a common mistake for SQL beginners.
>**TEXT, LONGTEXT**: If you want to store text data whose maximum length is unknown, you can use TEXT related data type settings.
  
# Special Data Types
- `BINARY`, `BLOB`: Store file-type data like images or videos.

>**BINARY**: Used for storing file-type data like images or videos.
>**BLOB** (Binary Large Object): Suitable for large, unstructured data. However, it's rarely used in practice due to the complexity of managing files through database software.

- `BOOLEAN`: Stores logical operand data (true or false).

>**BOOLEAN**: Store the data of the logical operand. In simple terms, it is the data **true** or **false**. The database will replace it with **1** or **0** respectively. Suppose there is a column called **is_alive**, then each value is either **true** or **false**. 

- `JSON`: Common in modern data exchange.

# Column Attribute Functions
The purpose of the column attribute function is to ensure that when new data is added to the table, the database will process the data format or content in advance. (Maintain Correctness of data)

- `NOT NULL`: Ensures the field cannot be NULL, meaning it must always contain a value.

- `AUTO_INCREMENT`: Automatically generates column values, useful for serial numbers.

- `DEFAULT`: Sets a default value for the column, handling empty field scenarios.

- Example:
Suppose we create a new table with columns (id and name) having different attribute settings:

```sql
CREATE TABLE example_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL DEFAULT 'Unknown'
);
```

**Notes**: In various database systems, similar functionalities may have different representations. For instance, in PostgreSQL, `AUTO_INCREMENT` is replaced by `SERIAL`, and Oracle uses `IDENTITY`. By understanding the purpose of each function rather than fixating on its name, you can adapt more easily to different database systems. 
>focusing on **what each function can do** rather than "**what each function is**"

# Create and Update Column
Columns in a table aren't fixed; they can change over time. To add or modify columns, we use specific SQL statements based on the example of creating a table.

## Create Column
```sql
ALTER TABLE `new_schema`.`users`
ADD COLUMN `age` INT NULL AFTER `name`;
```

- `ALTER TABLE`: Declares the intention to modify the table.
- `ADD COLUMN`: Adds a new column, with optional settings. Use `AFTER` to specify column order for better readability.

## Update Column
>In the SQL, **updating** a column is more like generate a new rule and overwrite original version

```sql
ALTER TABLE `new_schema`.`users`
CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT,
CHANGE COLUMN `name` `user_name` VARCHAR(45) NOT NULL DEFAULT 'No Name';
```

- `CHANGE COLUMN`: Updates an existing column, introducing new rules.
- Syntax: Corresponds `existing column name` to `new column name`, followed by `new rules`.

Example:
Schema SQL
```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'This is the primary index',
  `name` VARCHAR(45) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`)
);
```

Query SQL
```sql
ALTER TABLE `new_schema`.`users`
ADD COLUMN `age` INT NULL AFTER `name`;

ALTER TABLE `new_schema`.`users`
CHANGE COLUMN `id` `id` INT(11) NOT NULL AUTO_INCREMENT,
CHANGE COLUMN `name` `user_name` VARCHAR(45) NOT NULL DEFAULT 'No Name';

SHOW FULL COLUMNS FROM `new_schema`.`users`;
```

Output:
[![example](/assets/images/2024-01-04_12-21-10-sql-example-2.png)](/assets/images/2024-01-04_12-21-10-sql-example-2.png)