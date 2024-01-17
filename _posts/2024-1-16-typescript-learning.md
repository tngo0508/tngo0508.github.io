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
  - Angular
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

# What is interface?

- Interface is an object type definitions.
- Can add method into its structure.
- Can be implemented by classes

# Why do we use the `interface` keyword when we can achieve the same with the `type` keyword? 
- The reason is that an interface can be implemented by classes, thereby enforcing that classes adhere to the structure defined by the interface. -> **Typescript will show error hints if we don't implement the requirements in the interface.**
- When working on applications developed by multiple developers, using interfaces can ensure that classes written by different developers conform to a specific structure when needed.
- The interfaces are more suitable for declaration merging and extending, whereas types are often preferred for union types and more complex type transformations. ([see explanation](#declaration-merging-and-extending-with-interface))

Example:
1. Using `interface`

```ts
interface Shape {
  calculateArea(): number;
}

class Circle implements Shape {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

```

In this example, the `Shape` interface defines a structure with a method `calculateArea()`. The `Circle` class implements this interface, ensuring that it provides an implementation for the `calculateArea` method.


2. Using `type`:

```ts
type Shape = {
  calculateArea(): number;
};

class Circle implements Shape {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

```

While using `type` is possible, it **lacks the explicit contract enforcement** that an `interface` provides. With `interface`, you explicitly state that a class must implement certain methods, adding a level of clarity and enforcing the expected structure.

In the examples I provided, the code structures with `interface` and `type` are indeed very similar. In many cases, both `interface` and `type` can be used interchangeably to define object shapes in TypeScript. The choice between them often depends on specific use cases and personal or team preferences.

# Declaration Merging and Extending with Interface
```ts
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
}

const employee: Employee = {
  name: "John",
  age: 30,
  employeeId: "EMP123"
};

```

In this example, we use an interface to define a `Person`, and then we extend it to create an `Employee` interface. This allows us to reuse the properties from `Person` in `Employee` and add the `employeeId` property.

# Union Types and Complex Type Transformations with Type:

```ts
type Status = "Pending" | "Approved" | "Rejected";

type NumericStatus = {
  [K in Status]: number;
};

const statusCount: NumericStatus = {
  Pending: 5,
  Approved: 10,
  Rejected: 2
};

```

Here, we use a `type` to create a `Status` type representing a union of string literals. Then, we use another type to create `NumericStatus`, which transforms the union into an object where each status has a corresponding numeric value. This showcases the use of type for more complex type transformations.

In summary, while `interface` is often used for declaration merging and extending, `type` is flexible for creating union types and performing more intricate type transformations. Keep in mind that the choice between them can depend on the specific requirements of your code.

# Compile All the Typescript files in one go
Need to add the typescript config file
```bash
npx tcs --init
```
What this does is it adds a tsconfig.json file. However, keep in mind that, when working with Angular, we probably do not need to run this command. This is just for the purpose of learning or running standalone project without Angular.

## Strict mode
- Strict type checking
- Example: values are not able to infer the type. Need to explicitly set a type for those.

# Resources
- https://www.typescriptlang.org/
- https://www.udemy.com/course/the-complete-guide-to-angular-2/learn/lecture/26105546#overview
- https://learnxinyminutes.com/docs/typescript/