---
layout: single
title: "SQL Review - Part 8"
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

- Common SQL keywords for statistics such as COUNT, SUM, AVG, and others.
- Usage for common SQL functions and practical considerations.

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
  (3, 'Tim', 25, 180),
  (4, 'Jay', 40, 160);

```

Result:

| id  | name | age | height |
| --- | ---- | --- | ------ |
| 1   | John | 40  | 150    |
| 2   | May  | 30  | 140    |
| 3   | Tim  | 25  | 180    |
| 4   | Jay  | 40  | 160    |

# Counting: COUNT

`COUNT()` can help us make a simple calculation about how many pieces of eligible data records exist:

```sql
SELECT COUNT(*) AS `user_count` FROM `new_schema`.`users` WHERE id > 1;
```

Result:

| user_count |
| ---------- |
| 3          |

This tells us that there are 3 users with an id greater than 1. Specifically, May, Tim, and Jay.

# Total: SUM

`SUM` can help us to aggregate the final results of a specific column. It is a very common function. In practice, it will be used to aggregate different data such as order price, user points...etc.

```sql
SELECT SUM(`age`) AS `sum_of_user_ages` FROM `new_schema`.`users`;
```

Result:

| sum_of_user_ages |
| ---------------- |
| 135              |

# Average: AVG

```sql
SELECT AVG(`height`) AS `avg_user_height` FROM `new_schema`.`users`;
```

# Minimum & Maximum: MIN & MAX

```sql
SELECT MIN(`height`) AS `user_min` FROM `new_schema`.`users`;
SELECT MAX(`height`) AS `user_max` FROM `new_schema`.`users`;
```

