---
layout: single
title: "SQL problem - Game Play Analysis I"
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

[![problem](/assets/images/2024-02-02_09-11-04-game-play-analysis-i.png)](/assets/images/2024-02-02_09-11-04-game-play-analysis-i.png)

## Query

The idea is to `GROUP BY` clause to group all `player_id`, then apply aggregation function `MIN` on `event_date`

```sql
SELECT
    player_id, MIN(event_date) AS first_login
FROM
    Activity
GROUP BY player_id
```