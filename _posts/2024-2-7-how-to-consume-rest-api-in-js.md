---
title: "How to consume API and review JavaScript"
date: 2024-2-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - JavaScript
---

The purpose of this journal is to review and practice how to make API calls in javascript via a simple REST API endpoints. This is the practice that I do in order to prepare for my interview on next week.

I am using this [jsonplaceholder](https://jsonplaceholder.typicode.com/) for my review and practice.

## Use Fetch API for GET request

We utilized the `fetch` function to initiate a GET request to the API URL, which returns a Promise. Subsequently, the `.then()` method is employed to manage the asynchronous response from the server. To validate the response, we check the `response.ok` property. Following successful validation, we proceed to parse the JSON data utilizing the `response.json()` method. Ultimately, the data is logged to the console, and any potential errors are appropriately handled.

```js
const ORIGIN = 'https://jsonplaceholder.typicode.com/'

const POST = '/posts'
const COMMENTS = '/comments'
const ALBUMS = '/albums'
const PHOTO = '/photos'
const TODOS = '/todos'
const USERS = '/users'

const apiUrl = ORIGIN + POST

// Make a GET request
fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Error Handling using Fetch

Handling errors is crucial when making API calls in JavaScript due to potential issues like network problems, server issues, or incorrect URLs.

In our earlier examples, we employed fetch's promise-based error handling, utilizing the catch block.

You can enhance error understanding by checking the HTTP status code using response.status to identify the error type.

```js
fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Data not found');
      } else if (response.status === 500) {
        throw new Error('Server error');
      } else {
        throw new Error('Network response was not ok');
      }
    }
    return response.json();
  })
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
    // outputElement.textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## To make POST request using FETCH

Source from <https://www.freecodecamp.org/news/make-api-calls-in-javascript/>

```js
const apiUrl = 'https://api.example.com/data';
const data = {
  name: 'John Doe',
  email: 'johndoe@example.com',
};

const requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
};

fetch(apiUrl, requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    outputElement.textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Work with API keys

```js
const apiKey = 'your_api_key_here';
const apiUrl = 'https://api.example.com/data';

const requestOptions = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
};

fetch(apiUrl, requestOptions)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    outputElement.textContent = JSON.stringify(data, null, 2);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

## Async in JavaScript

API calls in JavaScript are asynchronous, meaning they don't block your code's execution while waiting for a response. This non-blocking feature is vital for keeping your web application responsive, especially during potentially slow network requests.

To manage asynchronous operations, promises and the `.then()` method are used. When you call `fetch`, it immediately returns a promise, and you use `.then()` to specify actions upon successful resolution or failure.

Your main JavaScript thread can continue running other tasks outside of `.then()` blocks while waiting for the API response. This ensures your application stays responsive and doesn't freeze during data retrieval.

## Post an HTML form to server

>idea: use FormData to extract information from HTML form and append it the request's body

```html
<form id="contact-form">
  <input type="text" name="name" placeholder="Name">
  <input type="email" name="email" placeholder="Email">
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Submit</button>
</form>
<div id="response-message"></div>
```

```js
const apiUrl = 'https://api.example.com/submit';

const contactForm = document.getElementById('contact-form');
const responseMessage = document.getElementById('response-message');

contactForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData(contactForm);

  const requestOptions = {
    method: 'POST',
    body: formData,
  };

  fetch(apiUrl, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    })
    .then(data => {
      responseMessage.textContent = data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
```

## Reference

- <https://www.freecodecamp.org/news/make-api-calls-in-javascript/>
- <https://jsonplaceholder.typicode.com/>
