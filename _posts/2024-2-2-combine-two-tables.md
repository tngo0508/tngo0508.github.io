---
layout: single
title: "SQL problem - Combine Two Tables"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---

## Problem

[![problem](/assets/images/2024-02-02_12-31-26-combine-two-tables.png)](/assets/images/2024-02-02_12-31-26-combine-two-tables.png)

## Query

```sql
SELECT firstName, lastName, city, state
FROM Person AS p
LEFT JOIN Address as a
ON p.personId = a.personId
```