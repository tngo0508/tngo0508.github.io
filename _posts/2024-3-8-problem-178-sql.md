---
layout: single
title: "SQL problem - Rank Scores"
date: 2024-3-8
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - SQL
---

## Problem

[![problem-178](/assets/images/2024-03-08_15-45-52-problem-178.png)](/assets/images/2024-03-08_15-45-52-problem-178.png)

## Query

```sql
SELECT
    s.score,
    DENSE_RANK() OVER w AS 'rank'
FROM
    Scores As s
WINDOW w AS (ORDER BY s.score DESC);
```

## Editorial Solution

### Approach 1: DENSE_RANK

```sql
SELECT
  S.score,
  DENSE_RANK() OVER (
    ORDER BY
      S.score DESC
  ) AS 'rank'
FROM
  Scores S;
```

### Approach 2: Correlated subquery with `COUNT(DISTINCT ...)`

```sql
SELECT
  S1.score,
  (
    SELECT
      COUNT(DISTINCT S2.score)
    FROM
      Scores S2
    WHERE
      S2.score >= S1.score
  ) AS 'rank'
FROM
  Scores S1
ORDER BY
  S1.score DESC;
```
