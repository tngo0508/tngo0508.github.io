---
layout: single
title: "SQL Review - Part 6"
date: 2024-2-1
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---
In this post, we learn how to use SQL to work with JSON data inside the table.

# Alter table
The data type of the column can be set to "JSON", which is convenient to use JSON-related syntax to retrieve data.
```sql
ALTER TABLE `new_schema`.`users` 
ADD COLUMN `contact` JSON NULL AFTER `id`;
```

Sample:
```sql
CREATE SCHEMA `new_schema` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `new_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'This is the primary index',
  `name` VARCHAR(45) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`id`)
);

ALTER TABLE `new_schema`.`users` ADD COLUMN `contact` JSON NULL AFTER `id`;

INSERT INTO `new_schema`.`users` (`id`, `name`, `contact`) VALUES 
  (1, 'John', JSON_OBJECT('phone', '123-456', 'address', 'New York')),
  (2, 'May', JSON_OBJECT('phone', '888-99', 'address', 'LA')),
  (3, 'Tim', JSON_OBJECT('phone', '1236')),
  (4, 'Jay', JSON_OBJECT('phone', '321-6', 'address', 'Boston'));
```

output:

| id | name | contact                                       |
|----|------|-----------------------------------------------|
| 1  | John | {"phone": "123-456", "address": "New York"}  |
| 2  | May  | {"phone": "888-99", "address": "LA"}         |
| 3  | Tim  | {"phone": "1236"}                            |
| 4  | Jay  | {"phone": "321-6", "address": "Boston"}      |


# Read Data
```sql
SELECT `id`, JSON_EXTRACT(contact, '$.phone') AS phone
FROM `new_schema`.`users`;
```

*   **JSON\_EXTRACT:**
    
    *   **Usage:** This keyword is used for extracting specific data from a JSON column in a database.
    *   **Syntax:** `JSON_EXTRACT(outer_column, '$.json_column')`
    *   **Components:**
        *   `JSON_EXTRACT`: The main function keyword.
        *   `outer_column`: The name of the outer column containing JSON data.
        *   `$.json_column`: The JSON path specifying the nested data to be extracted.
        *   The entire expression is enclosed in parentheses.
*   **AS:**
    
    *   **Usage:** The AS keyword is used for aliasing or renaming columns in the result set.
    *   **Syntax:** `AS alias_name`
    *   **Components:**
        *   `AS`: The keyword for aliasing.
        *   `alias_name`: The name by which the selected column will be referred to in the result set.
    *   **Purpose:** If AS is used, it allows renaming the column, providing a more meaningful or concise name. Without AS, the result column retains the original expression name (e.g., `JSON_EXTRACT(contact, '$.phone')`).
  

Output:

| id | phone    |
|----|----------|
| 1  | "123-456" |
| 2  | "888-99"  |
| 3  | "1236"    |
| 4  | "321-6"   |

>*The data entry in the above table has double quotes. It's recommended* to use **JSON_UNQUOTE** to remove them.

```sql
SELECT `id`, JSON_UNQUOTE(JSON_EXTRACT(contact, '$.phone')) AS phone
FROM `new_schema`.`users`;
```

Output:

| id | phone  |
|----|--------|
| 1  | 123-456|
| 2  | 888-99 |
| 3  | 1236   |
| 4  | 321-6  |

# Add Data

```sql
INSERT INTO `new_schema`.`users` (`id`, `name`, `contact`) VALUES (5, 'Harry', JSON_OBJECT('phone', '1231123', 'address', 'Miami'));
```

# Updates

use `JSON_SET` for updating the information inside the json.

```sql
UPDATE `new_schema`.`users` SET `contact` = JSON_SET(contact, '$.phone', '6666', '$.phone_2', '888') WHERE `id` = 2;
```