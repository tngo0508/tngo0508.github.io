---
layout: single
title: "Angular Learning - Day 2"
date: 2024-1-16
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

I attempted to change the code in the application. I realized that we could do interpolation by add variable inside the component file and display on HTML such as following.

```ts
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'thomas app';
  name = 'testing'
}
```
Then, inside app.component.html, I can render my data like this.
```
<h1>my first app</h1>
<p>{{name}}</p>
```

Also, I have learned about `directives`. Basically, it tells Angular to listen to any user's input and store information into the variable `name`
```ts
<input type="text" [(ngModel)]="name">
<p>{{name}}</p>
```

I got into the issue
>NG8002: Can't bind to 'ngModel' since it isn't a known property of 'input'.

This happens because Angular is split into multiple modules or sub-packages. That means that we need to add them if we want to use a certain feature from them.

The `app.module.ts` file. This is basically where we tell Angular which pieces belong to our app. This is where we add something to imports and to import another package from Angular.

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

In the above code, I imported the `FormsModule` in order to let Typescript knows where things are. By doing this, I basically tell Angular that I want to import some form features. The directive that I used above (`ngModel`) is such a form feature.
**Note: This is not an Angular feature; it's a Typescript feature.**
```ts
import {FormsModule} from '@angular/forms';
```
and
```ts
  imports: [
    BrowserModule,
    FormsModule
  ],
```

And after I saved the changes, I could type and see the data binding happening.

# What is Typescript?
- a super set to JavaScript
- offers more features than vanilla JS like classes, interfaces
- strong typed
- [See more detail here](2024-1-16-typescript-learning.md)

![binding](</assets/images/Screenshot 2024-01-16 at 12.15.44 PM.png>)


# Install bootstrap
```
npm install bootstrap bootstrap-icons
```

Then, I need to make Angular aware of this styling package that I want to use. Basically, I need to modify the `angular.json` file

```json
"styles": [
  "node_modules/bootstrap/scss/bootstrap.scss",
  "node_modules/bootstrap-icons/font/bootstrap-icons.css",
  "src/styles.scss"
],
"scripts": [
  "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
]
```

Note: the `src/styles.scss` is where we can edit our own css style for entire application.

# Resources
- https://angular.io
- https://www.udemy.com/course/the-complete-guide-to-angular-2/
- https://www.freecodecamp.org/news/how-to-add-bootstrap-css-framework-to-an-angular-application/