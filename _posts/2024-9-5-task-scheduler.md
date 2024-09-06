---
layout: single
title: "Windows Task Scheduler"
date: 2024-9/5
show_date: true
toc: true
toc_label: "Page Navigation"
toc_sticky: true
classes: wide
tags:
  - Task Scheduler
---

Sometimes, we need to run daily task or schedule a process to run on a window server. This can be tedious and time consuming. So, it's better to find a way to automate these boring and repeated task for us. One of the ways that can help us to delegate these responsibilies is to use the task scheduler on windows.

## Find the Task Scheduler in windows.

![task-scheduler](/assets/images/task-scheduler.png)

## Create Task Scheduler Folder

![create-folder](/assets/images/create-new-folder-task-scheduler.png)

Right click > Create Basic Task

![basic-task](/assets/images/create-basic-task-9-5.png)

Enter Name of the task that we want to automate

![task-name](/assets/images/name-test.png)

## Choose Task trigger

![task-trigger](/assets/images/task-trigger.png)

## Daily Occurrence setting

![daily-task](/assets/images/daily-occurence.png)

## Action Task

![action-task](/assets/images/action-task.png)

## Start Program

Notes: Here we can start any program and pass the arguments to our target program. The program can be anything. For instance, we can start powershell to run a simple `echo` command. We use python, nodejs, cmd.exe, etc.

![start-program](/assets/images/start-program-args.png)

## Task scheduler List

![last-step](/assets/images/finish-creating-task-scheduler.png)

Once all of daily tasks are set up, we will see the list populated and there are few options for us to check. 

![list-task](/assets/images/list-task.png)

Right click on the task > properties. We need to adjust a few options to make sure the task run smoothly without interruption.

![properties](/assets/images/properties-task.png)

## General tab setting

![general-tab](/assets/images/general-tab.png)

To change from running program from once per day to hourly. We can do the following:

![hourly-task](/assets/images/run-task-hourly.png)

## Real-life example

The following is the real-life examples that I have set up to run a task in my workplace. First I created a powershell script to trigger an API endpoint to validate all the records in the database.

```ps
$token = <JWT TOKEN>
$url = "https://fr-sud.ochca.com/api/provider/maintenance?code=<SECRET CODE>"
 
$headers = @{
    Authorization = "Bearer $token"
}
 
$response = Invoke-WebRequest -Uri $url -Headers $headers -Method Post -Body ''

Write-Output $response
```

Then, I stored it as a script on the window server to prepare for the daily task.

![example-1](/assets/images/example-1.png)

Modify the task to add arguments to trigger the powershell script

![last-step](/assets/images/last-step.png)

And there we go. Now, we have learned to automate our daily task with ease on a windows server.