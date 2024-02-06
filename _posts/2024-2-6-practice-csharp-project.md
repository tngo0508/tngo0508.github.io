---
title: ".NET C# - RESTful Web API Note"
date: 2024-2-6
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
---

## The Request Object

- GET: fetches/requests resource
- POST: creates/inserts resource
- PUT: updates/modifies resource
- PATCH: updates/modifies partial resource
- DELETE: deletes/removes resource

### Request's Metadata

- Content Type: Content's format
- Content Length: Size of the content
- Authorization: who is making the request
- Accept: What are the accepted type(s)

### Request's Content

- HTML, CSS, XML, JSON
- Information for the request
- Blobs

## The Response Object

### Status Codes for Operation Result

- 100-199: Informational
- 200-299: Success
  - 200: OK (most common)
  - 201: created
  - 204: No Content
- 300-399: Redirection
- 400-499: Client Errors
  - 400: Bad Request
  - 404: Not Found (common client error)
  - 409: Conflict
- 500-599: Server Errors
  - 500: Internal Server Error (common server error)

### Response's Metadata

- Content type: content's format
- Content Length: size of the content
- Expires: when is this valid

### Response's Content

- HTML, CSS, XML, JSON
- Blobs

## Basic Controller

[![controller](/assets/images/2024-02-06_11-21-23-basic-controller-dotnet.png)](/assets/images/2024-02-06_11-21-23-basic-controller-dotnet.png)

Require Annotation `[ApiController]` and inherit from `ControllerBase` class

## Basic Model

[![model](/assets/images/2024-02-06_11-24-55-basic-model.png)](/assets/images/2024-02-06_11-24-55-basic-model.png)

If there is no route or endpoint API set up properly. We will see this

[![missing-endpoint-error](/assets/images/2024-02-06_11-27-47-no-route-error.png)](/assets/images/2024-02-06_11-27-47-no-route-error.png)

We need to add the route

[![route](/assets/images/2024-02-06_11-29-42-add-route.png)](/assets/images/2024-02-06_11-29-42-add-route.png)

However, we will get the error if we forgot to add the HTTP verb/method

[![missing-http-method](/assets/images/2024-02-06_11-30-54-missing-http-method.png)](/assets/images/2024-02-06_11-30-54-missing-http-method.png)

resolve:

[![add-endpoint-method](/assets/images/2024-02-06_11-32-12-add-get-endpoint.png)](/assets/images/2024-02-06_11-32-12-add-get-endpoint.png)

[![result](/assets/images/2024-02-06_11-33-05-result.png)](/assets/images/2024-02-06_11-33-05-result.png)

Note:

- `[Route("api/VillaAPI")]` can be changed to `[Route("api/[controller]")]`
- It would be better to keep the hardcode controller name since the class name could be changed

## Data Transfer Objects - DTO

> In brief, DTOs provide a wrapper between the entity or the database model and what is being exposed from the API

In a conventional real-world scenario involving API integration within our controllers, it is common practice to refrain from directly utilizing the Villa model. This approach is considered suboptimal for production applications. Instead, a more preferable methodology involves the incorporation of `Data Transfer Objects (DTOs)`.

DTOs serve as an intermediary layer between the `entity or database model` and the `data exposed through the API`. This abstraction ensures a more structured and secure handling of data, contributing to improved code maintainability and overall system robustness in a production environment.

### Create DTO

[![villa-dto](/assets/images/2024-02-06_11-43-15-create-villa-dto.png)](/assets/images/2024-02-06_11-43-15-create-villa-dto.png)

### Replace DTO in controller

[![replace-dto](/assets/images/2024-02-06_11-44-22-replace-dto.png)](/assets/images/2024-02-06_11-44-22-replace-dto.png)

## Add Data folder

Next, we want to set up the data folder to store the database logic. Later, we will convert this to use Entity Framework (EF) to make CRUD operation to the database.

[![setup-data-store](/assets/images/2024-02-06_11-48-43-setup-datastore.png)](/assets/images/2024-02-06_11-48-43-setup-datastore.png)

Do not forget to use `VillaStore` that we just create.

[![use-villa-store](/assets/images/2024-02-06_11-51-31-use-villastore.png)](/assets/images/2024-02-06_11-51-31-use-villastore.png)

## Add another endpoint

![note-endpoint-httpget](/assets/images/2024-02-06_11-54-58-note.png)