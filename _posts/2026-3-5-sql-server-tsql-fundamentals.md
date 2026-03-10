---
layout: single
title: "SQL Server T-SQL Fundamentals: A Guide for Technical Interviews"
date: 2026-03-05
show_date: true
toc: true
toc_label: "Contents"
toc_sticky: true
classes: wide
tags:
  - Database
  - Interview Preparation
  - Performance
  - SQL Server
  - T-SQL
---

SQL Server and T-SQL (Transact-SQL) are the backbone of many enterprise-level applications. For technical interviews, it's not enough to know basic `SELECT` statements; you must understand joins, subqueries, window functions, and performance tuning to demonstrate senior-level proficiency.

---

## 1. Sample Dataset for Examples

To help you understand the queries below, let's assume we have two tables: `Departments` and `Employees`.

### `Departments` Table

| Id | Name |
| :--- | :--- |
| 1 | IT |
| 2 | HR |
| 3 | Sales |

### `Employees` Table

| Id | Name | DeptId | Salary | ManagerId | HireDate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 101 | Alice | 1 | 90000 | NULL | 2023-01-01 |
| 102 | Bob | 1 | 85000 | 101 | 2023-05-15 |
| 103 | Charlie | 2 | 75000 | 101 | 2022-10-10 |
| 104 | David | NULL | 60000 | 101 | 2024-02-20 |

### T-SQL Setup Script

You can copy and run the following script in SQL Server Management Studio (SSMS) or Azure Data Studio to create the sample schema and data.

```sql
-- 1. Create Tables
-- Note: You might want to run this in a scratch database
CREATE TABLE Departments (
    Id INT PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL
);

CREATE TABLE Employees (
    Id INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    DeptId INT NULL,
    Salary INT NOT NULL,
    ManagerId INT NULL,
    HireDate DATE NULL,
    FOREIGN KEY (DeptId) REFERENCES Departments(Id),
    FOREIGN KEY (ManagerId) REFERENCES Employees(Id)
);

-- 2. Insert Data
INSERT INTO Departments (Id, Name) 
VALUES (1, 'IT'), (2, 'HR'), (3, 'Sales');

INSERT INTO Employees (Id, Name, DeptId, Salary, ManagerId, HireDate)
VALUES 
    (101, 'Alice', 1, 90000, NULL, '2023-01-01'),
    (102, 'Bob', 1, 85000, 101, '2023-05-15'),
    (103, 'Charlie', 2, 75000, 101, '2022-10-10'),
    (104, 'David', NULL, 60000, 101, '2024-02-20');
```

---

## 2. Essential Query Syntax (The "Big Six")

Most data retrieval tasks rely on these six clauses. Although you write them in a specific order, SQL Server executes them in a logical order (e.g., `FROM` happens before `SELECT`).

1.  **`SELECT`**: Identifies the columns to retrieve.
2.  **`FROM`**: Specifies the source table.
3.  **`WHERE`**: Filters individual rows based on conditions (e.g., `WHERE Salary > 70000`).
4.  **`GROUP BY`**: Groups rows sharing the same values for aggregation.
5.  **`HAVING`**: Filters grouped results **after** aggregation (unlike `WHERE`).
6.  **`ORDER BY`**: Sorts results in ascending (`ASC`) or descending (`DESC`) order.

### Logical Query Execution Order
This is a frequent senior-level interview question:
**`FROM`** → **`WHERE`** → **`GROUP BY`** → **`HAVING`** → **`SELECT`** → **`ORDER BY`**

---

## 3. Core Data Manipulation (CRUD)

Beyond simple reading, these commands are used to modify data.

### DML (Data Manipulation Language)

```sql
-- INSERT INTO: Add a new employee
INSERT INTO Employees (Id, Name, DeptId, Salary)
VALUES (105, 'Eve', 1, 92000);

-- SELECT: Retrieve Alice and Bob
SELECT * FROM Employees WHERE Name IN ('Alice', 'Bob');

-- UPDATE / SET: Increase Bob's salary
UPDATE Employees 
SET Salary = 88000 
WHERE Name = 'Bob';

-- DELETE: Remove an employee
DELETE FROM Employees 
WHERE Name = 'David';
```

**Interview Tip: `DELETE` vs. `TRUNCATE`**
*   **`DELETE`**: DML. Can use `WHERE`. It logs individual row deletions. Slower.
*   **`TRUNCATE`**: DDL. Rapidly removes all rows from a table while keeping its structure. No `WHERE` allowed. Logs only page deallocations. Faster. **Resets identity seed**.

---

## 4. Joins: Combining Data

Mastering joins is the most common requirement in SQL interviews.

| Join Type | Description | Result for David (DeptId NULL) |
| :--- | :--- | :--- |
| **`INNER JOIN`** | Returns records with matching values in both tables. | David is **excluded**. |
| **`LEFT JOIN`** | Returns all records from the left table and matched records from the right. | David is **included** (HR/Sales info is NULL). |
| **`RIGHT JOIN`** | Returns all records from the right table and matched records from the left. | David is **excluded** (Sales dept is included). |
| **`FULL JOIN`** | Returns all records when there is a match in either left or right table. | Both David and Sales are **included**. |
| **`CROSS JOIN`** | Returns the Cartesian product of the two tables. | Total 12 rows (4 employees * 3 depts). |
| **`SELF JOIN`** | A regular join, but the table is joined with itself (useful for hierarchies). | N/A |

```sql
-- Left Join: See all employees and their departments (if any)
SELECT E.Name, D.Name AS DeptName
FROM Employees E
LEFT JOIN Departments D ON E.DeptId = D.Id;

/* 
Result:
Alice - IT
Bob - IT
Charlie - HR
David - NULL (Department doesn't exist for him)
*/

-- Self Join Example (Manager Hierarchy)
SELECT E.Name AS Employee, M.Name AS Manager
FROM Employees E
LEFT JOIN Employees M ON E.ManagerId = M.Id;
```

---

## 5. Subqueries: Nested Queries

Sometimes you need to use the result of one query inside another.

### Non-Correlated Subquery
The subquery executes independently of the outer query.

```sql
-- Find employees who earn more than the average salary
SELECT Name, Salary 
FROM Employees
WHERE Salary > (SELECT AVG(Salary) FROM Employees);
```

### Correlated Subquery
The subquery references columns from the outer query and executes once for each row evaluated by the outer query.

```sql
-- Find employees who earn more than the average salary in their own department
SELECT E.Name, E.Salary, E.DeptId
FROM Employees E
WHERE E.Salary > (
    SELECT AVG(Salary) 
    FROM Employees Sub 
    WHERE Sub.DeptId = E.DeptId
);
```

---

## 6. Aggregations & Grouping

Aggregations collapse multiple rows into summary values.

### Important Built-in Functions: Aggregates
*   **`COUNT()`**: Returns the number of rows.
*   **`SUM()`**: Returns the total sum of a numeric column.
*   **`AVG()`**: Returns the average value.
*   **`MIN()`**: Returns the smallest value.
*   **`MAX()`**: Returns the largest value.

### `GROUP BY` and `HAVING`
When using `GROUP BY`, every column in the `SELECT` list that is not part of an aggregate function **must** be included in the `GROUP BY` clause.

```sql
-- Find total and average salary per department
SELECT 
    DeptId,
    COUNT(*) as EmpCount,
    MIN(Salary) as MinSalary,
    MAX(Salary) as MaxSalary,
    AVG(Salary) as AvgSalary
FROM Employees
GROUP BY DeptId;
```

### Multiple Column Grouping
You can group by multiple columns for more granular data.

```sql
-- Count employees by department and manager
SELECT DeptId, ManagerId, COUNT(*) as Count
FROM Employees
GROUP BY DeptId, ManagerId;
```

**Interview Tip: `WHERE` vs. `HAVING`**
*   `WHERE` filters rows **before** aggregation.
*   `HAVING` filters groups **after** aggregation (e.g., `HAVING COUNT(*) > 5`).

```sql
-- Find departments with more than 1 high-earning employee
SELECT DeptId, COUNT(*) AS TotalHighEarners
FROM Employees
WHERE Salary > 70000 -- Filter rows first
GROUP BY DeptId
HAVING COUNT(*) > 1; -- Then filter the resulting groups
```

**Expert Tip: `COUNT(DISTINCT)`**
Use `COUNT(DISTINCT Column)` to find the number of unique values in a group.
```sql
-- How many different managers are in each department?
SELECT DeptId, COUNT(DISTINCT ManagerId) as UniqueManagers
FROM Employees
GROUP BY DeptId;
```

---

## 7. Common Table Expressions (CTE)

CTEs improve readability and are essential for recursive queries. They act as temporary result sets that only exist for the duration of a single query.

```sql
WITH HighEarners AS (
    SELECT Name, Salary, DeptId
    FROM Employees
    WHERE Salary > 80000
)
SELECT * FROM HighEarners WHERE DeptId = 1;
```

---

## 8. Set Operations

Used to combine the results of two or more queries into a single result set. Both queries must have the same number of columns and compatible data types.

### `UNION` vs. `UNION ALL`

| Operation | Action | Performance | Result for `(1, 1)` |
| :--- | :--- | :--- | :--- |
| **`UNION`** | Combines results and **removes duplicates**. | Slower (requires an internal sort/hash). | `(1)` |
| **`UNION ALL`** | Combines results and **keeps duplicates**. | **Faster** (no sorting required). | `(1, 1)` |

**Expert Rule of Thumb:** Always use `UNION ALL` unless you explicitly need to remove duplicates. It is significantly more efficient for large datasets.

```sql
-- Find all names from Employees and Departments
SELECT Name FROM Employees
UNION
SELECT Name FROM Departments;

-- UNION ALL: Includes David even if another person is named David
SELECT Name FROM Employees WHERE DeptId = 1
UNION ALL
SELECT Name FROM Employees WHERE Salary > 80000;
```

### `INTERSECT` and `EXCEPT`
*   **`INTERSECT`:** Returns only the common records between two queries.
*   **`EXCEPT`:** Returns records from the first query that are not present in the second.

```sql
-- High earners who are also in Department 1
SELECT Name FROM Employees WHERE Salary > 80000
INTERSECT
SELECT Name FROM Employees WHERE DeptId = 1;
```

---

## 9. Window Functions

Window functions perform calculations across a set of rows related to the current row without collapsing them (unlike `GROUP BY`).

### `PARTITION BY`: Resetting the Window
The `PARTITION BY` clause divides the result set into partitions. The window function is applied separately to each partition, and the calculation "restarts" at the beginning of each new partition.

```sql
-- Rank employees by salary WITHIN each department
SELECT Name, DeptId, Salary,
       RANK() OVER (PARTITION BY DeptId ORDER BY Salary DESC) as DeptRank
FROM Employees;
```

### Comparing RANK, DENSE_RANK, and ROW_NUMBER
These functions behave differently when they encounter "ties" (identical values in the `ORDER BY` column).

| Function | Handling Ties (e.g., 90k, 90k, 80k) | Next Number |
| :--- | :--- | :--- |
| **`ROW_NUMBER()`** | Assigns sequential numbers (1, 2, 3). | 4 |
| **`RANK()`** | Same rank for ties (1, 1, 3). | **3** (Skips rank 2) |
| **`DENSE_RANK()`** | Same rank for ties (1, 1, 2). | **2** (No skipping) |

```sql
-- Example showing all three
SELECT Name, Salary,
       ROW_NUMBER() OVER (ORDER BY Salary DESC) as RowNum,
       RANK()       OVER (ORDER BY Salary DESC) as RankNum,
       DENSE_RANK() OVER (ORDER BY Salary DESC) as DenseRankNum
FROM Employees;
```

### Navigation: LAG and LEAD
Used to access data from previous or subsequent rows without using a self-join.

```sql
-- Comparison with Previous Row: LAG()
SELECT Name, Salary,
       LAG(Salary) OVER (ORDER BY Salary) as PreviousSalary,
       Salary - LAG(Salary) OVER (ORDER BY Salary) as DiffFromPrevious
FROM Employees;
```

**Expert Tip: Frame Clauses (`ROWS BETWEEN`)**
For "Expert" level, you can define exactly which rows to include in the window (e.g., a rolling average).
```sql
-- Rolling Sum: Sum of current row and the previous 2 rows
SELECT Name, Salary,
       SUM(Salary) OVER (ORDER BY HireDate ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as RollingSum
FROM Employees;
```

---

## 10. Variables and Control Flow

T-SQL allows you to use variables and standard programming logic inside scripts, stored procedures, and triggers.

### Variables
```sql
DECLARE @TargetDeptId INT = 1;
DECLARE @AverageSalary DECIMAL(18,2);

-- Assigning values
SET @TargetDeptId = 2; -- Option 1: SET
SELECT @AverageSalary = AVG(Salary) FROM Employees; -- Option 2: SELECT
```

### CASE: The T-SQL SWITCH
The `CASE` expression is used to create conditional logic in queries. It can be used in `SELECT`, `WHERE`, `ORDER BY`, and even `HAVING`.

#### Simple CASE
Compares one expression to multiple potential values.
```sql
SELECT Name, 
       CASE DeptId
           WHEN 1 THEN 'IT'
           WHEN 2 THEN 'HR'
           WHEN 3 THEN 'Sales'
           ELSE 'Unassigned'
       END as DeptName
FROM Employees;
```

#### Searched CASE
Evaluates multiple Boolean expressions. This is more powerful and flexible.
```sql
SELECT Name, Salary,
       CASE 
           WHEN Salary >= 90000 THEN 'Executive'
           WHEN Salary >= 75000 THEN 'Senior'
           WHEN Salary >= 60000 THEN 'Junior'
           ELSE 'Intern/Entry'
       END as CareerLevel
FROM Employees;
```

### IF...ELSE
Used for control flow in scripts and stored procedures. Unlike `CASE`, `IF...ELSE` is a statement, not an expression (it cannot be used inside a `SELECT` list).
```sql
DECLARE @EmpSalary DECIMAL(18,2) = 90000;

IF @EmpSalary > 100000
    PRINT 'Executive Grade';
ELSE IF @EmpSalary > 50000
    PRINT 'Professional Grade';
ELSE
    PRINT 'Entry Grade';
```

### WHILE Loop
```sql
DECLARE @Counter INT = 1;

WHILE @Counter <= 3
BEGIN
    PRINT 'Current Step: ' + CAST(@Counter AS VARCHAR);
    SET @Counter = @Counter + 1;
END;
```

---

## 11. Database Objects: Procedures, Views, Indexes

### Stored Procedures
Pre-compiled batches of T-SQL code for repeated tasks. Can return multiple values, have output parameters, and perform DML operations.

```sql
CREATE PROCEDURE GetEmployeesByDept
    @DeptId INT
AS
BEGIN
    SELECT * FROM Employees WHERE DeptId = @DeptId;
END;

-- Execution: EXEC GetEmployeesByDept 1;
```

### Views
Virtual tables based on a stored `SELECT` query. They do not store data themselves but provide a way to simplify complex queries or restrict access to data.

```sql
CREATE VIEW IT_Employees AS
SELECT Name, Salary
FROM Employees
WHERE DeptId = 1;

-- Usage: SELECT * FROM IT_Employees;
```

### User-Defined Functions (UDF)
Must return a value. Cannot perform DML operations.

```sql
CREATE FUNCTION GetAnnualTax (@Salary DECIMAL(18,2))
RETURNS DECIMAL(18,2)
AS
BEGIN
    RETURN @Salary * 0.20; -- Simplified 20% tax
END;
```

### Indexes
Structural elements used to speed up data retrieval.
*   **Clustered Index:** Defines the physical order of data on the disk. Only **one** per table.
*   **Non-Clustered Index:** A separate structure that points to the physical data. You can have **multiple**.

---

## 12. Built-in Functions: Formatting, Logic & Date/Time

### Formatting and Logic
*   **`CASE`**: Provides "if-then" logic inside queries (see Section 10).
*   **`COALESCE(val1, val2, ...)`**: Returns the first non-NULL value in a list. Excellent for handling NULLs.
*   **`CAST` and `CONVERT`**: Used to change data types. `CONVERT` is T-SQL specific and offers more formatting options (especially for dates).

```sql
-- COALESCE Example
SELECT Name, COALESCE(DeptId, 0) as DeptId -- If NULL, show 0
FROM Employees;

-- CAST Example
SELECT 'The salary is ' + CAST(Salary AS VARCHAR) FROM Employees;
```

### Date and Time Functions
*   **`GETDATE()`**: Returns the current system date and time.
*   **`DATEDIFF(unit, start, end)`**: Returns the difference between two dates.
*   **`DATEADD(unit, amount, date)`**: Adds an interval to a date.

```sql
-- Find how many days ago an employee was hired
SELECT Name, HireDate, DATEDIFF(day, HireDate, GETDATE()) as DaysSinceHired
FROM Employees;
```

---

## 13. Transactions

Transactions ensure data integrity by grouping operations that must all succeed or all fail together (**ACID**).

*   **`BEGIN TRANSACTION`**: Starts the transaction.
*   **`COMMIT`**: Saves the changes permanently.
*   **`ROLLBACK`**: Reverts the changes if an error occurs.

```sql
BEGIN TRY
    BEGIN TRANSACTION;
        -- Update Bob's salary
        UPDATE Employees SET Salary = 90000 WHERE Id = 102;
        -- Transfer some of it? (Example logic)
        UPDATE Employees SET Salary = 80000 WHERE Id = 101;
    COMMIT;
END TRY
BEGIN CATCH
    ROLLBACK;
    PRINT 'Transaction failed and was rolled back.';
END CATCH;
```

---

## 14. Performance: SARGability & Indexing

**Interview Tip: SARGability**
Search ARGumentable queries can leverage indexes. 
*   **Non-SARGable:** `WHERE YEAR(HireDate) = 2023` (The function around the column prevents the index from being used).
*   **SARGable:** `WHERE HireDate >= '2023-01-01' AND HireDate < '2024-01-01'`.

---

## 15. Transaction Isolation Levels

How one transaction perceives changes made by other transactions.

1.  **READ UNCOMMITTED:** Can see uncommitted changes (Dirty Reads).
2.  **READ COMMITTED:** (Default) Can only see committed changes. Prevents Dirty Reads.
3.  **REPEATABLE READ:** Ensures that if a row is read twice, it has the same value. Prevents Non-Repeatable Reads.
4.  **SERIALIZABLE:** Most restrictive. Prevents Phantom Reads.

---

## 16. Constraints & Data Integrity

*   **`PRIMARY KEY`**: Unique identification for each row.
*   **`FOREIGN KEY`**: Enforces referential integrity between tables.
*   **`UNIQUE`**: Ensures all values in a column are different.
*   **`CHECK`**: Ensures that values in a column satisfy a specific condition (e.g., `Age >= 18`).

---

## 17. ACID Properties

Every senior dev must know ACID in the context of transactions:
1.  **Atomicity:** All or nothing. If one part fails, the whole transaction fails.
2.  **Consistency:** Database transitions from one valid state to another.
3.  **Isolation:** Transactions occur independently without interference.
4.  **Durability:** Once committed, changes are permanent even if the system crashes.

---

## 18. Top SQL Interview Questions

1.  **`UNION` vs. `UNION ALL`:** `UNION` removes duplicates (slower); `UNION ALL` includes duplicates (faster).
2.  **`COALESCE` vs. `ISNULL`:** `COALESCE` is SQL standard and takes multiple arguments. `ISNULL` is T-SQL specific and takes two.
3.  **Find Duplicates:** Use `GROUP BY` with `HAVING COUNT(*) > 1`.
4.  **Stored Procedures vs. Functions:** Procedures can return multiple values, have output parameters, and perform DML. Functions must return a value and cannot perform permanent side-effects (DML).
5.  **What is a Deadlock?** Two processes waiting for each other to release a lock.

---

## 19. References & Further Reading
*   **Microsoft Learn:** [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/sql-server/)
*   **Microsoft Learn:** [Transact-SQL (T-SQL) Language Reference](https://learn.microsoft.com/en-us/sql/t-sql/language-reference)
*   **Microsoft Learn:** [SQL Server Index Architecture and Design Guide](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/indexes)
*   **Blog:** [SARGable Queries: Why they matter for performance](https://www.sqlshack.com/how-to-write-sargable-queries-in-sql-server/)
*   **Blog:** [Understanding SQL Server Transaction Isolation Levels](https://rehansaeed.com/sql-server-transaction-isolation-levels/)

---

## C# Interview Series
* [Part 1: Key Concepts and Knowledge]({{ site.baseurl }}{% post_url 2026-3-5-csharp-review %})
* [Part 2: LINQ and Sorting]({{ site.baseurl }}{% post_url 2026-3-5-csharp-linq-sorting %})
* [Part 3: LeetCode Tips and Tricks]({{ site.baseurl }}{% post_url 2026-3-5-csharp-leetcode-tips %})
* [Part 4: Entity Framework Core Mastery]({{ site.baseurl }}{% post_url 2026-3-5-ef-core-mastery %})
* [Part 5: ADO.NET Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-ado-net-fundamentals %})
* [Part 6: SQL Server T-SQL Fundamentals]({{ site.baseurl }}{% post_url 2026-3-5-sql-server-tsql-fundamentals %})
* [Part 7: Clean Architecture: Principles, Layers, and Best Practices]({{ site.baseurl }}{% post_url 2026-3-5-clean-architecture %})
* [Part 8: N-Tier Architecture: Structure, Layers, and Beginner Guide]({{ site.baseurl }}{% post_url 2026-3-5-n-tier-architecture %})
* [Part 9: Repository and Unit of Work Patterns: Implementation and Benefits]({{ site.baseurl }}{% post_url 2026-3-5-repository-unit-of-work %})
* [Part 10: TDD and Unit Testing in .NET: Production-Ready Strategies]({{ site.baseurl }}{% post_url 2026-3-6-tdd-unit-testing %})
* [Part 11: xUnit Testing: Facts, Theories, and Data-Driven Tests]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})
* [Part 12: FluentAssertions: Write More Readable Unit Tests]({{ site.baseurl }}{% post_url 2026-3-7-fluent-assertions %})
