---
title: "A Week Passed"
date: 2023-12-08
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Journal Entry
  - CodeTrack
  - Daily Coding
---
# Personal Project development
Today, I dedicated my morning to advancing my CodeTrack project. The notable progress involved the addition of two essential buttons for import and export functionalities. The export button allows users to generate an Excel report, comprising multiple worksheets. The primary worksheet mirrors the website's table, color-coded for easy (green), medium (yellow), and hard (pink) difficulty levels. Adjacent to this table, a pie chart visually represents the distribution of difficulty levels. Other worksheets feature bar charts for timing and frequency, promoting detailed data analysis, and a radar chart for a comprehensive overview of strengths and weaknesses.

The export button not only serves to display statistics but also acts as an input to update the data table. Users can save the report locally, modify it by adding or removing entries, and then use the import button to upload the modified table. Behind the scenes, the import function involves deleting all records and parsing the Excel file to insert the updated data into the database.

The implementation, while conceptually straightforward, required meticulous logic fine-tuning. I invested significant time in mastering the usage of the EPPlus library in .NET for Excel generation. Despite the challenges, the development process was enjoyable, and today proved to be a successful and highly productive day.

[![CodeTrack](/assets/images/code-track-2023-12-08_01-03-46.png)](/assets/images/code-track-2023-12-08_01-03-46.png)
[![excel file](/assets/images/excel-file-2023-12-08_01-04-45.png)](/assets/images/excel-file-2023-12-08_01-04-45.png)

Functionality aside, the aesthetic aspects, such as frequency charts and seed buttons, were refined, adding to the overall user experience.

[![frequency chart](/assets/images/2023-12-08_01-05-33.png)](/assets/images/2023-12-08_01-05-33.png)
[![seed button](/assets/images/2023-12-08_01-06-14.png)](/assets/images/2023-12-08_01-06-14.png)

# Workout Exercises

Similar to previous days, I concluded my personal project work at 6:00 PM and transitioned to the gym. Today's workout focused on deadlifts, a weight training exercise challenging for someone like me, unaccustomed to lifting heavy objects. The session left me feeling muscle soreness around my biceps and triceps. Following this, we engaged in a plate hold exercise, a simple yet effective challenge of holding a 25lb plate for a minute.

# Leetcode

In the evening, I tackled a Leetcode problem centered around dynamic programming. Drawing from past experience, the problem proved relatively easy. Here's the Python solution:
```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
      matrix = [[1 for _ in range(m)] for _ in range(n)]
      for row in range(1, n):
        for col in range(1, m):
          matrix[row][col] = matrix[row - 1][col] + matrix[row][col - 1]
      
      return matrix[-1][-1]
            
```

# For Future Me
Life's essence lies in hard work and resilience. Achieving your goals requires dedication and effort. Instead of dwelling on complaints or overthinking, channel your energy and time into useful endeavors. Life is short, so use it wisely.