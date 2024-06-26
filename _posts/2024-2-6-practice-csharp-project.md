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

we will get this error again.

![error-again](/assets/images/2024-02-06_12-00-39-error-again.png)

To debug this, we navigate to the old working API `https://localhost:7255/api/villaAPI`, we will see the information below. Basically, it complains about `AmbiguousMatchException`.

[![ambiguous-match-expression](/assets/images/2024-02-06_12-02-41-ambiguous-match-expression-exception.png)](/assets/images/2024-02-06_12-02-41-ambiguous-match-expression-exception.png)

This happens because .NET does not which API endpoint to use. That request matched multiple endpoints in our case.

why is it getting confused?

We have defined in GetVilla that an ID is needed.

So if the ID is not present, it should by default, take the `GetVillas` (first api endpoint) that will return multiple villas.

In order to resolve this issue, we need to explicitly add `id` in our `HTTPGet` method as below for the second API

```cs
using MagicVilla_VillaAPI.Data;
using MagicVilla_VillaAPI.Models.Dto;
using Microsoft.AspNetCore.Mvc;

namespace MagicVilla_VillaAPI.Controllers
{
    [Route("api/VillaAPI")]
    [ApiController]
    public class VillaAPIController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<VillaDTO> GetVillas()
        {
            return VillaStore.villaList;
        }

        [HttpGet("id")]
        public VillaDTO GetVilla(int id)
        {
            return VillaStore.villaList.FirstOrDefault(u => u.Id == id);
        }
    }
}
```

To be more specific, we can also tell .NET that we are expecting the `integer` data type for the param as following.

```cs
[HttpGet("{id:int}")]
public VillaDTO GetVilla(int id)
{
    return VillaStore.villaList.FirstOrDefault(u => u.Id == id);
}
```

## Model Binding

Model binding is the process of mapping data from Http requests to the parameters of an action method.

source: from <https://www.udemy.com/course/complete-web-api-course/learn/lecture/38660798#reviews>
[![http-req-info](/assets/images/2024-02-06_15-42-31-http-req-info.png)](/assets/images/2024-02-06_15-42-31-http-req-info.png)

The ID is mapped from the root of the HTTP request into the integer parameter of the "`GetShirtById`" action method. In the following example, the `id` and `color` are mapped from the route to parameters passed into the function.

```csharp
[HttpGet("{id}/{color}")]
public string GetShirtById(int id, string color) {
    return $"Reading shirt: {id}";
}
```

we can also specify where the data coming from by using the followings ([source](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-8.0#sources))

- [FromQuery] - Gets values from the query string.
- [FromRoute] - Gets values from route data.
- [FromForm] - Gets values from posted form fields.
- [FromBody] - Gets values from the request body.
- [FromHeader] - Gets values from HTTP headers.

Example: FromRoute

```csharp
[HttpGet("{id}/{color}")]
public string GetShirtById(int id, [FromRoute] string color) {
    return $"Reading shirt: {id}";
}
```

Example: FromHeader

```csharp
public void OnGet([FromHeader(Name = "Accept-Language")] string language)
```

## Model Validation

- happens after model binding.
- used to validate user input in an ASP.NET Core app

Example:
we need to put data annotation inside the model.

```csharp
public class Shirt
{
  public int ShirtId {get; set;}

  [Required]
  public string? Brand {get; set;}

  [Required]
  public string? Color {get; set;}

  public double? Price {get; set;}
}
```

[More info](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation?view=aspnetcore-8.0&source=recommendations)

### Custom Validation Attribute

- Create a custom validation class

```csharp
public class Shirt_EnsureCorrectSizingAttribute : ValidationAttribute
{
  protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
  {
    var shirt = validationContext.ObjectInstance as Shirt;

    if (shirt != null && !string.IsNullOrWhiteSpace(shirt.Gender))
    {
      if (shirt.Gender.Equals("men", StringComparison.OrdinalIgnoreCase) && shirt.Size < 9)
      {
        return new ValidationResult("For men, the size has to be greater or equal to 8.");
      }
      else if (shirt.Gender.Equals("women", StringComparison.OrdinalIgnoreCase) && shirt.Size < 6)
      {
        return new ValidationResult("For women, the size has to be greater or equal to 6.");
      }
    }

    return ValidationResult.Success;
  }
}
```

- Add the custom data annotation on the property that we want to add custom validation

```csharp
public class Shirt
{
  public int ShirtId {get; set;}

  [Required]
  public string? Brand {get; set;}

  [Required]
  public string? Color {get; set;}

  public double? Price {get; set;}

  [Shirt_EnsureCorrectSizingAttribute]
  public int? Size {get; set;}

  public string? Gender {get; set}
}
```

## Return Types

- `IActionResult` for return type in RESTFul Web API
- use `OK()` indicate the HTTP code 200 for success
- `NotFound` for HTTP 404

Example:

```csharp
[HttpGet("{id}")]
public IActionResult GetShirtById(int id)
{
  var shirt = shirts.FirstOrDefault(x => x.ShirtId == id);
  if (shirt == null)
  {
    return NotFound();
  }

  return Ok(shirt);
}
```

## ActionFilter Attribute

In ASP.NET, Action Filters are attributes that you can apply to either a controller action method or an entire controller. They allow you to run code before or after the execution of controller action methods. Action Filters can be used for tasks such as logging, authentication, caching, and more.

Example 1: Create `Shirt_ValidateShirtIdFilterAttribute`

```csharp
// Shirt_ValidateShirtIdFilterAttribute.cs
public class Shirt_ValidateShirtIdFilterAttribute: ActionFilterAttribute
{
  public override void OnActionExecuting(ActionExecutingContext context)
  {
    var shirtId = context.ActionArguments["id"] as int?;
    if (shirtId.HasValue)
    {
      if (shirtId.Value <= 0)
      {
        context.ModelState.AddModelError("ShirtId", "ShirtId is invalid.");
        var problemDetails = new ValidationProblemDetails(context.ModelState)
        {
          Status = StatusCodes.Status400BadRequest
        };
        context.Result = new BadRequestObjectResult(problemDetails)
      }
    }
    else if (!ShirtRepository.ShirtExists(shirtId.Value))
    {
      context.ModelState.AddModelError("ShirtId", "Shirt doesn't exist.");
      var problemDetails = new ValidationProblemDetails(context.ModelState)
      {
        Status = StatusCodes.Status404NotFound
      };
      context.Result = new NotFoundObjectResult(problemDetails)
    }
  }
}
```

Example 2: we create a new class, say `Shirt_ValidateUpdateShirtFilterAttribute`, and inherit the functionality from `ActionFilterAttribute`. Then, override the method `OnActionExecuting`.

```csharp
public class Shirt_ValidateUpdateShirtFilterAttribute: ActionFilterAttribute
{
  public override void OnActionExecuting(ActionExecutingContext context)
  {
    base.OnActionExecuting(context);

    var id = context.ActionArguments["id"] as int?;
    var shirt = context.ActionArguments["shirt"] as Shirt;

    if (id.HasValue && shirt != null && id != shirt.ShirtId)
    {
      context.ModelState.AddModelError("ShirtId", "Shirt is not the same as id.");
      var problemDetails = new ValidationProblemDetails(context.ModelState)
      {
        Status = StatusCodes.Status404NotFound
      };
      context.Result = new NotFoundObjectResult(problemDetails)
    }
  }
}
```

Finally, in the controller, we use the custom filter attribute that we've just created.

```csharp
// ShirtsController.cs
public class ShirtsController: ControllerBase
{
  [HttpPut("id")]
  [Shirt_ValidateShirtIdFilter]
  [Shirt_ValidateUpdateShirtFilterAttribute]
  public IActionResult UpdateShirt(int id, Shirt shirt)
  {
    try
    {
      ShirtRepository.UpdateShirt(shirt);
    }
    catch
    {
      if (!ShirtRepository.ShirtExists(id)) return NotFound();
      throw;
    }

    return NoContent();
  }
}

```
