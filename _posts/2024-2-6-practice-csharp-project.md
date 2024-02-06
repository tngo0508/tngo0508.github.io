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

![controller](/assets/images/2024-02-06_11-21-23-basic-controller-dotnet.png)

Require Annotation `[ApiController]` and inherit from `ControllerBase` class

## Basic Model

![model](/assets/images/2024-02-06_11-24-55-basic-model.png)

If there is no route or endpoint API set up properly. We will see this

![missing-endpoint-error](/assets/images/2024-02-06_11-27-47-no-route-error.png)

We need to add the route

![route](/assets/images/2024-02-06_11-29-42-add-route.png)

However, we will get the error if we forgot to add the HTTP verb/method

![missing-http-method](/assets/images/2024-02-06_11-30-54-missing-http-method.png)

resolve:

![add-endpoint-method](/assets/images/2024-02-06_11-32-12-add-get-endpoint.png)

![result](/assets/images/2024-02-06_11-33-05-result.png)

Note:

- `[Route("api/VillaAPI")]` can be changed to `[Route("api/[controller]")]`
- It would be better to keep the hardcode controller name since the class name could be changed