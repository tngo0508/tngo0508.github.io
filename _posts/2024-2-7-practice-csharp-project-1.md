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
