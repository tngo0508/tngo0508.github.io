---
layout: single
title: "SQL problem - Daily Leads and Partners"
date: 2024-2-2
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
classes: wide
tags:
  - SQL
---

# Problem

[![problem](/assets/images/2024-02-02_08-25-37-daily-leads-and-partners.png)](/assets/images/2024-02-02_08-25-37-daily-leads-and-partners.png)

# Query
```sql
SELECT
    date_id,
    make_name,
    COUNT(DISTINCT lead_id) AS unique_leads,
    COUNT(DISTINCT partner_id) AS unique_partners
FROM
    DailySales
GROUP BY date_id, make_name;
```

*   **FROM DailySales**: This part of the query specifies the source table from which the data will be retrieved. In this case, it is the "DailySales" table.
    
*   **GROUP BY date\_id, make\_name**: The GROUP BY clause is used to group the rows of the result set based on the specified columns. In this query, the grouping is done based on the "date\_id" and "make\_name" columns.
    
*   **COUNT(DISTINCT lead\_id) AS unique\_leads**: This part calculates the count of distinct lead\_ids for each group formed by the GROUP BY clause. It creates a new column named "unique\_leads" to store these counts.
    
*   **COUNT(DISTINCT partner\_id) AS unique\_partners**: Similarly, this part calculates the count of distinct partner\_ids for each group formed by the GROUP BY clause. It creates a new column named "unique\_partners" to store these counts.
    
*   **SELECT date\_id, make\_name, ...**: Finally, the SELECT clause specifies the columns to be included in the result set. In this case, it includes "date\_id," "make\_name," "unique\_leads," and "unique\_partners."