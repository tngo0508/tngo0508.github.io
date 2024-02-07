---
title: ".NET C# - RESTful Web API Note (continue)"
date: 2024-2-7
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
---

The code is pushed to this [GitHub repo](https://github.com/tngo0508/MagicVilla_API).

## Status Code in Endpoints

Review validation in `ASP.NET`

```csharp
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
        public ActionResult<IEnumerable<VillaDTO>> GetVillas()
        {
            return Ok(VillaStore.villaList);
        }

        [HttpGet("{id:int}")]
        public ActionResult<VillaDTO> GetVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            return Ok(villa);
        }
    }
}
```

## Response Types

Here we can add Data annotation to document the response type

```csharp
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
        public ActionResult<IEnumerable<VillaDTO>> GetVillas()
        {
            return Ok(VillaStore.villaList);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public ActionResult<VillaDTO> GetVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            return Ok(villa);
        }
    }
}
```

Here, after adding the attribute `ProducesResponseType` above each API, we can see multiple response that are possible in swagger API.

![possible-res](/assets/images/2024-02-07_10-38-13-response-type.png)

In the above example, since we specify `VillaDTO` in the `ActionResult` we can see the example value. If we don't specify, we won't see that information.

Likewise, instead of providing the data type in `ActionResult`, we could do the following as well.

```csharp
[HttpGet("{id:int}")]
[ProducesResponseType(200, Type = typeof(VillaDTO))]
[ProducesResponseType(404)]
[ProducesResponseType(400)]
public ActionResult GetVilla(int id)
{
    if (id == 0)
    {
        return BadRequest();
    }

    var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

    if (villa == null)
    {
        return NotFound();
    }

    return Ok(villa);
}
```

Take it further, if we want to make the code more readable and cleaner. We could do this.

```csharp
[HttpGet("{id:int}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<VillaDTO> GetVilla(int id)
{
    if (id == 0)
    {
        return BadRequest();
    }

    var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

    if (villa == null)
    {
        return NotFound();
    }

    return Ok(villa);
}
```

## HTTP Post in Action

Add the `CreateVilla` endpoint to add new item to the in-memory database.

```csharp
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
        public ActionResult<IEnumerable<VillaDTO>> GetVillas()
        {
            return Ok(VillaStore.villaList);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<VillaDTO> GetVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            return Ok(villa);
        }

        #region this is new
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<VillaDTO> CreateVilla([FromBody] VillaDTO villaDTO)
        {
            if (villaDTO == null)
            {
                return BadRequest(villaDTO);
            }

            if (villaDTO.Id > 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            villaDTO.Id = VillaStore.villaList.OrderByDescending(u => u.Id).FirstOrDefault().Id + 1;
            VillaStore.villaList.Add(villaDTO);

            return Ok(villaDTO);
        }
        #endregion
    }
}
```

## CreatedAtRoute

In ASP.NET, `CreatedAtRoute` is an action result that returns a `201 Created status code` along with a Location header, which contains the URI of the newly created resource. This is commonly used in RESTful APIs to indicate that a resource has been successfully created.

Here's a basic example of how you can use `CreatedAtRoute` in an ASP.NET MVC or ASP.NET Core controller:

```csharp
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
        public ActionResult<IEnumerable<VillaDTO>> GetVillas()
        {
            return Ok(VillaStore.villaList);
        }

        [HttpGet("{id:int}", Name = "GetVilla")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<VillaDTO> GetVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            return Ok(villa);
        }


        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<VillaDTO> CreateVilla([FromBody] VillaDTO villaDTO)
        {
            if (villaDTO == null)
            {
                return BadRequest(villaDTO);
            }

            if (villaDTO.Id > 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            villaDTO.Id = VillaStore.villaList.OrderByDescending(u => u.Id).FirstOrDefault().Id + 1;
            VillaStore.villaList.Add(villaDTO);

            return CreatedAtRoute("GetVilla", new { id = villaDTO.Id }, villaDTO);
        }
    }
}
```

notice that we need to add `Name = "GetVilla"` to

```csharp
[HttpGet("{id:int}", Name = "GetVilla")]
```

And when we return, we invoke the `CreatedAtRoute` and pass in the necessary information.

```csharp
return CreatedAtRoute("GetVilla", new { id = villaDTO.Id }, villaDTO);
```

As result, we can see that the location of the resource after the CREATE api is called.

[![location-api](/assets/images/2024-02-07_12-03-23-create-location-api.png)](/assets/images/2024-02-07_12-03-23-create-location-api.png)

Also, make sure to fix the `status code 201` for creating a resource successfully.

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<VillaDTO> CreateVilla([FromBody] VillaDTO villaDTO)
{
    if (villaDTO == null)
    {
        return BadRequest(villaDTO);
    }

    if (villaDTO.Id > 0)
    {
        return StatusCode(StatusCodes.Status500InternalServerError);
    }

    villaDTO.Id = VillaStore.villaList.OrderByDescending(u => u.Id).FirstOrDefault().Id + 1;
    VillaStore.villaList.Add(villaDTO);

    return CreatedAtRoute("GetVilla", new { id = villaDTO.Id }, villaDTO);
}
```

## ModelState Vaidations

Again, using data annotation for this.

```csharp
using System.ComponentModel.DataAnnotations;

namespace MagicVilla_VillaAPI.Models.Dto
{
    public class VillaDTO
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(30)]
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
```

For instance, if we send the request to the CREATE endpoint API, we will get this response.

[![modelstate-validation](/assets/images/2024-02-07_12-09-04-modelstate-validation.png)](/assets/images/2024-02-07_12-09-04-modelstate-validation.png)

In addition, we can use `ModelState.IsValid` to valid the user input

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<VillaDTO> CreateVilla([FromBody] VillaDTO villaDTO)
{
    if ( !ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }
    if (villaDTO == null)
    {
        return BadRequest(villaDTO);
    }

    if (villaDTO.Id > 0)
    {
        return StatusCode(StatusCodes.Status500InternalServerError);
    }

    villaDTO.Id = VillaStore.villaList.OrderByDescending(u => u.Id).FirstOrDefault().Id + 1;
    VillaStore.villaList.Add(villaDTO);

    return CreatedAtRoute("GetVilla", new { id = villaDTO.Id }, villaDTO);
}
```

## Custom ModelState Validation

```csharp
[HttpPost]
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public ActionResult<VillaDTO> CreateVilla([FromBody] VillaDTO villaDTO)
{
    //if ( !ModelState.IsValid)
    //{
    //    return BadRequest(ModelState);
    //}

    if (VillaStore.villaList.FirstOrDefault(u => u.Name.ToLower() == villaDTO.Name.ToLower()) != null)
    {
        ModelState.AddModelError("CustomError", "Villa already exists!");
        return BadRequest(ModelState);
    }

    if (villaDTO == null)
    {
        return BadRequest(villaDTO);
    }

    if (villaDTO.Id > 0)
    {
        return StatusCode(StatusCodes.Status500InternalServerError);
    }

    villaDTO.Id = VillaStore.villaList.OrderByDescending(u => u.Id).FirstOrDefault().Id + 1;
    VillaStore.villaList.Add(villaDTO);

    return CreatedAtRoute("GetVilla", new { id = villaDTO.Id }, villaDTO);
}
```

![custom-modelstate](/assets/images/2024-02-07_12-18-27-custom-modelstate.png)

## Http Delete

Usually, when we delete a resource, we just return the `NoContent` action which is `HTTP 204`

```csharp
[HttpDelete("{id:int}", Name = "DeleteVilla")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public IActionResult DeleteVilla(int id)
{
    if (id == 0)
    {
        return BadRequest();
    }

    var villa = VillaStore.villaList.FirstOrDefault(u => u.Id == id);

    if (villa == null)
    {
        return NotFound();
    }

    VillaStore.villaList.Remove(villa);

    return NoContent();
}
```
