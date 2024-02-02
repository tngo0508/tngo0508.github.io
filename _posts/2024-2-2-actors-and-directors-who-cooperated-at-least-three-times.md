---
layout: single
title: "SQL problem - Actors and Directors Who Cooperated At Least Three Times"
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

[![problem](/assets/images/2024-02-02_09-33-00-actors-and-directors-who-cooperated-at-least-three-times.png)](/assets/images/2024-02-02_09-33-00-actors-and-directors-who-cooperated-at-least-three-times.png)

## Query

```sql
SELECT
    actor_id,
    director_id
FROM
    ActorDirector
GROUP BY
    actor_id,
    director_id
HAVING COUNT(timestamp) >= 3
```
