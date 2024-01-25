---
layout: single
title: "SQL Review - Part 5"
date: 2024-1-24
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
# classes: wide
tags:
  - SQL
---
Tonight, I encountered a SQL question, and through this experience, I discovered the existence of the conditional function `IF` in SQL. This function allows performing a conditional check and returning different values based on the result of the condition. The syntax is as follows:
```sql
IF(condition, value_if_true, value_if_false)
```

Assume we have a table named employees with columns `employee_id`, `name`, and `salary`. We want to create a new column called `bonus` where employees with a salary greater than 5000 get a bonus of 1000, and others get a bonus of 500.

```sql
-- Creating the employees table
CREATE TABLE employees (
    employee_id INT,
    name VARCHAR(50),
    salary INT
);

-- Inserting some sample data
INSERT INTO employees VALUES
(1, 'Alice', 4800),
(2, 'Bob', 5200),
(3, 'Charlie', 4900);

-- Adding the bonus column using IF
SELECT 
    employee_id,
    name,
    salary,
    IF(salary > 5000, 1000, 500) AS bonus
FROM employees;

```

In this example, the IF function checks whether the salary is greater than 5000. If true, it returns 1000 as the bonus; otherwise, it returns 500. The result of the query would be:

| employee_id | name    | salary | bonus |
|-------------|---------|--------|-------|
| 1           | Alice   | 4800   | 500   |
| 2           | Bob     | 5200   | 1000  |
| 3           | Charlie | 4900   | 500   |


# Exercise Problem
Let's do the example below to practice our understanding.

Table: Employees

| Column Name | Type    |
|-------------|---------|
| employee_id | int     |
| name        | varchar |
| salary      | int     |

employee_id is the primary key (column with unique values) for this table.
Each row of this table indicates the employee ID, employee name, and salary.
 

Write a solution to calculate the bonus of each employee. The bonus of an employee is 100% of their salary if the ID of the employee is an odd number and the employee's name does not start with the character 'M'. The bonus of an employee is 0 otherwise.

Return the result table ordered by employee_id.

The result format is in the following example.

 

Example 1:

Input: 
Employees table:

| employee_id | name    | salary |
|-------------|---------|--------|
| 2           | Meir    | 3000   |
| 3           | Michael | 3800   |
| 7           | Addilyn | 7400   |
| 8           | Juan    | 6100   |
| 9           | Kannon  | 7700   |

Output: 

| employee_id | bonus |
|-------------|-------|
| 2           | 0     |
| 3           | 0     |
| 7           | 7400  |
| 8           | 0     |
| 9           | 7700  |

Explanation: 
The employees with IDs 2 and 8 get 0 bonus because they have an even employee_id.
The employee with ID 3 gets 0 bonus because their name starts with 'M'.
The rest of the employees get a 100% bonus.

# My Solution
```sql
SELECT
    employee_id,
    IF(MOD(employee_id, 2) = 0 OR name LIKE 'M%', 0, salary) AS bonus
FROM
    Employees
ORDER BY
    employee_id
```

# Editorial Solution
```sql
SELECT 
    employee_id,
    IF(employee_id % 2 = 1 AND name NOT REGEXP '^M', salary, 0) AS bonus 
FROM 
    employees 
ORDER BY 
    employee_id
```