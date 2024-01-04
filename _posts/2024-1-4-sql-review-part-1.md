---
layout: single
title: "SQL Review - Part 1"
date: 2024-1-4
toc: true
toc_label: "Page Navigation"
toc_sticky: true
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