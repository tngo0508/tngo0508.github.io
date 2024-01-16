---
layout: single
title: "Angular Learning - Part 1"
date: 2024-1-15
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Angular
---
# Installing Angular CLI
This CLI requires nodejs, so we need to install the nodejs first before running following command.
```
npm install -g @angular/cli --no-strict --standalone false --routing false
```

--no-strict: prevent strict mode, make life a bit easier when first learn angular

Note: use `sudo` to bypass the permission error

```
ng new my-first-app
```

After that, I ran `ng serve` to launch the application. However, I got into some issues with dependencies. To resolve this, I ran `npm install` to get all the necessary deps.

[![note1](</assets/images/Screenshot 2024-01-16 at 11.34.58 AM.png>)](</assets/images/Screenshot 2024-01-16 at 11.34.58 AM.png>)

And Voila, I got my first Angular app running!

![angular-app](</assets/images/Screenshot 2024-01-16 at 11.38.28 AM.png>)

# Resources
- https://angular.io
- https://www.udemy.com/course/the-complete-guide-to-angular-2/