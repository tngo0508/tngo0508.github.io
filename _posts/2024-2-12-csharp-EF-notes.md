---
layout: single
title: "C# .NET - Entity Framework notes"
date: 2024-2-12
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
---

## AsNoTracking

In Entity Framework, `AsNoTracking` is a method that can be applied to a query to tell EF not to track changes to the entities retrieved from the database.

1. **Entity Tracking:**

   - Entity Framework keeps track of the entities (objects) it retrieves from the database.
   - When you retrieve an entity, EF starts tracking its changes. This is called "entity tracking."

2. **AsNoTracking:**

   - When you use `AsNoTracking` in your query, you're telling EF not to keep track of changes for the entities retrieved by that query.
   - It's useful when you are fetching data for read-only purposes or when you don't intend to update the entities and don't want the overhead of change tracking.

3. **Benefits:**

   - **Performance:**
     - Without change tracking, EF doesn't need to keep a record of changes, leading to better performance, especially when dealing with a large amount of data.
   - **Reduced Memory Usage:**
     - Since EF doesn't need to store information about changes, it reduces memory usage.

4. **Use Cases:**

   - **Read-Only Operations:**
     - If you're only retrieving data for displaying or read-only purposes, using `AsNoTracking` can be more efficient.
   - **Large Datasets:**
     - When dealing with large datasets, turning off change tracking can lead to performance improvements.

For example

```csharp
 [HttpPatch("{id:int}", Name = "UpdatePartialVilla")]
 [ProducesResponseType(StatusCodes.Status204NoContent)]
 [ProducesResponseType(StatusCodes.Status400BadRequest)]
 public IActionResult UpdatePartialVilla(int id, JsonPatchDocument<VillaDTO> patchDTO)
 {
     if (patchDTO == null || id == 0)
     {
         return BadRequest();
     }

    // tell EF not track this record
     var villa = _db.Villas.AsNoTracking().FirstOrDefault(u => u.Id == id);

     if (villa == null)
     {
         return BadRequest();
     }

     VillaDTO villaDTO = new VillaDTO()
     {
         Amenity = villa.Amenity,
         Details = villa.Details,
         Id = villa.Id,
         ImageUrl = villa.ImageUrl,
         Name = villa.Name,
         Occupancy = villa.Occupancy,
         Rate = villa.Rate,
         Sqft = villa.Sqft,
     };

     patchDTO.ApplyTo(villaDTO, ModelState);

     Villa model = new Villa()
     {
         Amenity = villaDTO.Amenity,
         Details = villaDTO.Details,
         Id = villaDTO.Id,
         ImageUrl = villaDTO.ImageUrl,
         Name = villaDTO.Name,
         Occupancy = villaDTO.Occupancy,
         Rate = villaDTO.Rate,
         Sqft = villaDTO.Sqft,
     };

     _db.Villas.Update(model);
     _db.SaveChanges();

     if (!ModelState.IsValid)
     {
         return BadRequest(ModelState);
     }

     return NoContent();
 }
```

`AsNoTracking` is a method provided by Entity Framework that tells the framework not to keep track of changes made to the retrieved entities. In this specific code, it's applied to the query that fetches a `Villa` entity from the database based on its ID.

The purpose of using `AsNoTracking` in this scenario is likely to improve performance. When you're fetching data for read-only operations or scenarios where you don't intend to modify and update the entities, turning off change tracking (with `AsNoTracking`) can reduce the overhead on Entity Framework, making the operation faster and more efficient.

So, in this code, `AsNoTracking` is used when retrieving a `Villa` entity to indicate that the framework doesn't need to track changes for this particular query, which is beneficial for read-only operations.

## Review DTOs in ASP.NET

`DTO` stands for `Data Transfer Object`. In `ASP.NET`, a `DTO` is an object that carries data between processes, typically between the data access layer and the presentation layer. It's a simple container for data without any business logic.

**Why do we need it?**

1. **Reduced Data Transfer Overhead:**

   - DTOs allow you to transfer only the necessary data between layers, minimizing the amount of data sent over the network.

2. **Encapsulation:**

   - DTOs encapsulate the data required by the presentation layer, abstracting away the complexity of the underlying data structures.

3. **Flexibility and Versioning:**

   - DTOs provide flexibility in evolving the data structures independently in different layers, supporting changes without affecting other parts of the application.

4. **Security:**

   - DTOs help in controlling and exposing only specific data to the presentation layer, enhancing security by limiting access to sensitive information.

In summary, DTOs simplify data exchange between different parts of an ASP.NET application, promoting efficient communication, encapsulation, and adaptability to changes in data structures.

## Set up AutoMapper and Mapping Config

- Use Nuget Package to install the `AutoMapper` dependency package in the project.

- Create file called `MappingConfig.cs` and inherited from `Profile`

```csharp
using AutoMapper;
using MagicVilla_VillaAPI.Models;
using MagicVilla_VillaAPI.Models.Dto;

namespace MagicVilla_VillaAPI
{
    public class MappingConfig: Profile
    {
        public MappingConfig()
        {
            CreateMap<Villa, VillaDTO>();
            CreateMap<VillaDTO, Villa>();
            CreateMap<VillaDTO, VillaCreateDTO>().ReverseMap();
            CreateMap<VillaDTO, VillaUpdateDTO>().ReverseMap();
        }
    }
}
```

Explain:

- AutoMapper simplifies the process of mapping properties between objects, especially when dealing with entities and DTOs.
- `CreateMap` establishes a mapping relationship between two types.
- The `ReverseMap` method allows bidirectional mapping, meaning the configuration works in both directions (e.g., from `VillaDTO` to `VillaCreateDTO` and vice versa).
- These mappings are useful for automatically converting instances of one class to another, which is common in scenarios like data transfer between the application layers or mapping to and from a database model.

- Inside the `Program.cs`, we need to inject or register the `AutoMapper` to our App's services.

```csharp
using MagicVilla_VillaAPI;
using MagicVilla_VillaAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(
    option =>
    {
        option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultSQLConnection"));
    });

builder.Services.AddAutoMapper(typeof(MappingConfig)); // register AutoMapper Here

builder.Services.AddControllers(option =>
{
    //option.ReturnHttpNotAcceptable = true;
}).AddNewtonsoftJson().AddXmlDataContractSerializerFormatters();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
```

- To use this `AutoMapper`, we need to do constructor dependency injection in our controller. See the example below.

```csharp
using AutoMapper;
using MagicVilla_VillaAPI.Data;
using MagicVilla_VillaAPI.Models;
using MagicVilla_VillaAPI.Models.Dto;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MagicVilla_VillaAPI.Controllers
{
    [Route("api/VillaAPI")]
    [ApiController]
    public class VillaAPIController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;

        public VillaAPIController(ApplicationDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VillaDTO>>> GetVillas()
        {
            IEnumerable<Villa> villaList = await _db.Villas.ToListAsync();
            return Ok(_mapper.Map<VillaDTO>(villaList));
        }
    ...
    }
}
```