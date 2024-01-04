---
layout: single
title: "SQL Review - Part 1"
date: 2024-1-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---
In this post, I wanted to review my basic knowledge about SQL. The materials are from the [Leet Code SQL card](https://leetcode.com/explore/learn/card/sql-language/)

To try to play around or test SQL syntax, I use [DB Fiddle](https://www.db-fiddle.com/). It's an awesome tool to have quick way to test queries without the need to set up database on local machine.


# Schema Syntax
```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
- Keywords, written in all capital letters, are essential vocabulary in the SQL programming language. These words have special meanings in SQL and cannot be used to name schemas, tables, etc.
- Enclosed within a pair of backticks (`), the term "new_schema" signifies user input, indicating that we want to create a schema named "new_schema."

## Create Schema
creates a Schema and gives it a name.
```sql
CREATE SCHEMA `new_schema`
```
Establishing character encoding is crucial due to the diverse symbol systems used in human languages. For instance, Japanese and Arabic employ different sets of symbols, leading to various character encoding methods in software. In this context, we adopt the widely used 4-Byte UTF-8 Unicode Encoding series as a common character encoding standard.
```sql
DEFAULT CHARACTER SET utf8mb4
```
The example here uses utf8mb4_unicode_ci, which is a derivative that can use emoji-related symbols.
```sql
COLLATE utf8mb4_unicode_ci;
```

# Create Table
```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`new_table` (
  `id` INT NOT NULL COMMENT 'This is a primary index',
  PRIMARY KEY (`id`)
);
```
The statement is split into three parts:
- The initial part is straightforward, yet the syntax shifts from `SCHEMA` to `TABLE`, indicating the creation of the table itself. It's crucial to note the statement "**new_schema.new_table**" as our database software may have numerous schemas. We need to specify in which schema the table should be created. Lastly, "**new_table**" represents the desired name for the table we intend to create.
- The next section involves specifying the details for each field. We'll delve into a comprehensive explanation of this part in the following chapter. For now, let's provide a brief overview of the syntax's significance.


```sql
`id` INT NOT NULL COMMENT 'This is a primary index';
```

- `id` is the column name
- `INT` is the data type that will be stored in this column.
- `NOT NULL` is a kind of column attribute function. We will cover this in more - detail in the next chapter.
- This column has a `COMMENT` with the display text `This is a primary index`.

- The final step is to define the metadata for this table, excluding information related to columns. As an illustration, setting the primary key for this table to "**id**" is an example of how this can be accomplished.

```sql
PRIMARY KEY (`id`)
```
>**The Primary Key** is crucial in a database table, serving as a unique identifier. It can be a single column or a combination of several columns, and a table can have only one primary key. The primary key's value must be distinct and cannot be null.
>
>This field plays a vital role in connecting data tables and enhancing data retrieval efficiency.

# Read Table
Use the `SHOW FULL COLUMNS` to check if the column settings are configured as we specified or if there are any typos in the column names.
```sql
SHOW FULL COLUMNS FROM `new_schema`.`new_table`;
```
![example](/assets/images/2024-01-04_11-36-56-sql-example-1.png)

`SHOW` is a very common statement when retrieving information from the database system level. See more details [here](https://dev.mysql.com/doc/refman/8.2/en/show.html).

# Destroy Table
```sql
DROP TABLE `new_schema`.`new_table`;
```
The `DROP` keyword is used to delete a table in the database, but it's a risky operation. If not used carefully, important data might be lost. Due to this risk, in practical applications, we tend to avoid using this statement frequently.

# Clean Table
```sql
TRUNCATE `new_schema`.`new_table`;
```

Although deleting tables is infrequent, during application testing, we often need to reset the data state within a table. To achieve this, we commonly use the `TRUNCATE` statement to clear all data from the table without removing the table itself.

# DROP vs. TRUNCATE:

## DROP
- Purpose: Removes an entire table, including its structure.
- Effect: Deletes the table and its data permanently.
- Use with Caution: Risk of data loss is high.

## TRUNCATE
- Purpose: Clears all data from a table but retains the table structure.
- Effect: Deletes all rows, but the table remains.
- Use with Caution: Safer than DROP, but still removes data.

**Keep It Simple, Stupid! (KISS)**
- `DROP`: Think of it as throwing away the entire table—structure, and all.
- `TRUNCATE`: Picture it as clearing the table but keeping the table itself for future use.
