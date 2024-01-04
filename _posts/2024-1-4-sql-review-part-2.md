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
- **Datetime**: `DATE`, `MONTH`, `YEAR`, `DATETIME`, `TIMESTAMP` for handling date and time data.

- **Text**: `CHAR`, `VARCHAR` for plain text, `TEXT`, `LONGTEXT` for variable-length or large text.
  
# Special Data Types
- `BINARY`, `BLOB`: Store file-type data like images or videos.
- `BOOLEAN`: Stores logical operand data (true or false).
- `JSON`: Common in modern data exchange.

# Column Attribute Functions
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