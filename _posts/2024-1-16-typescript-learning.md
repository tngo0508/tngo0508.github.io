---
layout: single
title: "Typescript Basic Learning"
date: 2024-1-16
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - Typescript
---
In this journal, I wanted to grasp a quick overview about the understanding of Typescript to support my Angular learning.

In general, Typescript adds `static typing` to JavaScript because JS is dynamic typed.

# Installing and using Typescript
```bash
npm install typescript --save-dev
```

To ensure everyone using the same version of the language, use the following commands
``` bash
npx tsc
```

Basically, the command `npx tsc` will compile the `*.ts` to `*.js`. Also, after installing typescript, I could see error hint in my VS Code.

```bash
npx tsc with-typescript.ts 
```

![hint](</assets/images/Screenshot 2024-01-16 at 1.06.40 PM.png>)

In vanilla JS, we used to implement code like this
```js
function add(a, b) {
    return a + b;
}
var result = add(2, 5);
console.log(result);

```

In Typescript, we can strengthen the type checking for parameter before passing them into the function like this.
```ts
function add(a: number, b: number) {
  return a + b;
}

const result = add(2, 5);

console.log(result);
```

# Basic Typescript
```ts
// Primitives: number, string, boolean
// More complex types: arrays, objects
// Function types, parameters

// Primitives

let age: number;

age = 12;

let userName: string | string[];

userName = 'Max';

let isInstructor: boolean;

isInstructor = true;

// More complex types

// array type
let hobbies: string[]; 

hobbies = ['Sports', 'Cooking'];

// object type
type Person = {
  name: string;
  age: number;
};

let person: Person;

person = {
  name: 'Max',
  age: 32,
};

// person = {
//   isEmployee: true
// };

let people: Person[];

// Type inference

let course: string | number = 'React - The Complete Guide';

course = 12341;

// Functions & types

function addNumbers(a: number, b: number) {
  return a + b;
}

function printOutput(value: any) {
  console.log(value);
}

// Generics

function insertAtBeginning<T>(array: T[], value: T) {
  const newArray = [value, ...array];
  return newArray;
}

const demoArray = [1, 2, 3];

const updatedArray = insertAtBeginning(demoArray, -1); // [-1, 1, 2, 3]
const stringArray = insertAtBeginning(['a', 'b', 'c'], 'd');

// updatedArray[0].split('');

class Student {
  // firstName: string;
  // lastName: string;
  // age: number;
  // private courses: string[];

  constructor(
    public firstName: string,
    public lastName: string,
    public age: number,
    private courses: string[]
  ) {}

  enrol(courseName: string) {
    this.courses.push(courseName);
  }

  listCourses() {
    return this.courses.slice();
  }
}

const student = new Student('Max', 'Schwarz', 32, ['Angular']);
student.enrol('React');
// student.listCourses(); => Angular, React

// student.courses => Angular, React

interface Human {
  firstName: string;
  age: number;

  greet: () => void;
}

let max: Human;

max = {
  firstName: 'Max',
  age: 32,
  greet() {
    console.log('Hello!');
  },
};

class Instructor implements Human {
  firstName: string;
  age: number;
  greet() {
    console.log('Hello!!!!');
  }
}
```

Note:

```ts
// This is the array of type people
let people = {
    name: string;
    age: number;
}[];

// union type
let course: string | number = 'React - The Complete Guide';
```

# Resources
- https://www.typescriptlang.org/
- https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/26105546#overview
- https://learnxinyminutes.com/docs/typescript/