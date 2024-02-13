---
layout: single
title: "Review Repository Pattern in ASP.NET"
date: 2024-2-12
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - .NET
---

## OverView

The `repository` pattern in `ASP.NET` is a design approach where data access logic is abstracted into a separate layer called a `repository`. It provides a clean and organized way to interact with the database. The `repository` acts as a mediator between the application's business logic and the data storage, encapsulating database operations. This separation enhances code maintainability, testability, and allows for easy changes in the data access strategy without affecting the rest of the application. It typically includes methods for common database operations like `create, read, update, and delete (CRUD)`.

## Set up folders

- create `Repository` folder in the project

![img-1](/assets/images/2024-02-12_16-30-18-repository-pattern-img-1.png)

- Under `Repository` folder, create sub-folder called `IRepository`

```text
Repository
    |
    |
    -----> IRepository

```

- Create the interface `IVillaRepository.cs` under the `IRepository`

```text
Repository
    |
    |
    -----> IRepository
              |
              ----> IVillaRepository.cs

```

## Controller Example

For this journal, we will convert the following implementation of this controller to utilize the `Repository` design patter to interact with the database.

```csharp
// example controller without Repository
using AutoMapper;
using MagicVilla_VillaAPI.Data;
using MagicVilla_VillaAPI.Models;
using MagicVilla_VillaAPI.Models.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
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
            return Ok(_mapper.Map<List<VillaDTO>>(villaList));
        }

        [HttpGet("{id:int}", Name = "GetVilla")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<VillaDTO>> GetVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = await _db.Villas.FirstOrDefaultAsync(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<VillaDTO>(villa));
        }


        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<VillaDTO>> CreateVilla([FromBody] VillaCreateDTO createDTO)
        {
            if (await _db.Villas.FirstOrDefaultAsync(u => u.Name.ToLower() == createDTO.Name.ToLower()) != null)
            {
                ModelState.AddModelError("CustomError", "Villa already exists!");
                return BadRequest(ModelState);
            }

            if (createDTO == null)
            {
                return BadRequest(createDTO);
            }

            Villa model = _mapper.Map<Villa>(createDTO);

            await _db.Villas.AddAsync(model);
            await _db.SaveChangesAsync();

            return CreatedAtRoute("GetVilla", new { id = model.Id }, model);
        }

        [HttpDelete("{id:int}", Name = "DeleteVilla")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteVilla(int id)
        {
            if (id == 0)
            {
                return BadRequest();
            }

            var villa = await _db.Villas.FirstOrDefaultAsync(u => u.Id == id);

            if (villa == null)
            {
                return NotFound();
            }

            _db.Villas.Remove(villa);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id:int}", Name = "UpdateVilla")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateVilla(int id, [FromBody] VillaUpdateDTO updateDTO)
        {
            if (updateDTO == null || id != updateDTO.Id)
            {
                return BadRequest();
            }
            Villa model = _mapper.Map<Villa>(updateDTO);

            _db.Villas.Update(model);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:int}", Name = "UpdatePartialVilla")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdatePartialVilla(int id, JsonPatchDocument<VillaUpdateDTO> patchDTO)
        {
            if (patchDTO == null || id == 0)
            {
                return BadRequest();
            }

            var villa = await _db.Villas.FirstOrDefaultAsync(u => u.Id == id);

            if (villa == null)
            {
                return BadRequest();
            }

            var villaDTO = _mapper.Map<VillaUpdateDTO>(villa);

            patchDTO.ApplyTo(villaDTO, ModelState);

            var model = _mapper.Map<Villa>(villaDTO);

            _db.Villas.Update(model);
            await _db.SaveChangesAsync();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            return NoContent();
        }
    }
}
```

## Define Repository Interface

By observation, we notice that the above controller use the `DbContext` directly in order to make queries to the database. To delegate the data logic access to the `Repository`, we define the interface as following.

```csharp
// IVillaRepository.cs
using MagicVilla_VillaAPI.Models;
using System.Linq.Expressions;

namespace MagicVilla_VillaAPI.Repository.IRepository
{
    public interface IVillaRepository
    {
        Task<List<Villa>> GetAll(Expression<Func<Villa, bool>> filter = null);
        Task<Villa> Get(Expression<Func<Villa, bool>> filter = null, bool tracked=true);
        Task Create(Villa entity);
        Task Remove(Villa entity);
        Task Save();
    }
}

```

## Implement Repository

Next, we need to implement this interface. The first thing we need to add/inject is the `ApplicationDbContext` which allows us to interact with our database through `EFCore`. Do not forget to create the `VillaRepository.cs` for our implementation. See the tree below.

```text
Repository
    |
    |
    -----> IRepository
    |          |
    |          ----> IVillaRepository.cs
    |
    -----> VillaRepository.cs
```

```csharp
// VillaRepository.cs
using MagicVilla_VillaAPI.Data;
using MagicVilla_VillaAPI.Models;
using MagicVilla_VillaAPI.Repository.IRepository;
using System.Linq.Expressions;

namespace MagicVilla_VillaAPI.Repository
{
    public class VillaRepository : IVillaRepository
    {
        private readonly ApplicationDbContext _db;

        public VillaRepository(ApplicationDbContext db)
        {
            _db = db;
        }
    }
}

```

After that, we implement the all methods declared in the interface.

```csharp
// Import necessary namespaces
using MagicVilla_VillaAPI.Data;
using MagicVilla_VillaAPI.Models;
using MagicVilla_VillaAPI.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

// Define the repository class that implements the IVillaRepository interface
namespace MagicVilla_VillaAPI.Repository
{
    public class VillaRepository : IVillaRepository
    {
        // Private field to store the database context
        private readonly ApplicationDbContext _db;

        // Constructor that injects the ApplicationDbContext into the repository
        public VillaRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        // Method to create a new Villa entity in the database
        public async Task Create(Villa entity)
        {
            await _db.Villas.AddAsync(entity);
            await Save(); // Save changes to the database
        }

        // Method to retrieve a Villa entity based on a filter expression
        // The 'tracked' parameter determines whether the entity should be tracked by EF for changes
        public async Task<Villa> Get(Expression<Func<Villa, bool>> filter = null, bool tracked = true)
        {
            IQueryable<Villa> query = _db.Villas.AsQueryable();
            if (!tracked)
            {
                query = query.AsNoTracking(); // If not tracked, use AsNoTracking()
            }
            if (filter != null)
            {
                query = query.Where(filter); // Apply the provided filter
            }
            return await query.FirstOrDefaultAsync(); // Return the first matching entity or null
        }

        // Method to retrieve a list of Villa entities based on a filter expression
        public async Task<List<Villa>> GetAll(Expression<Func<Villa, bool>> filter = null)
        {
            IQueryable<Villa> query = _db.Villas.AsQueryable();
            if (filter != null)
            {
                query = query.Where(filter); // Apply the provided filter
            }
            return await query.ToListAsync(); // Return a list of matching entities
        }

        // Method to remove a Villa entity from the database
        public async Task Remove(Villa entity)
        {
            _db.Villas.Remove(entity);
            await Save(); // Save changes to the database
        }

        // Method to save changes to the database
        public async Task Save()
        {
            await _db.SaveChangesAsync();
        }
    }
}

```

- Notes:
  - **Expression<Func<Villa, bool>> filter = null:**
    - `Expression` is a type in C# that represents a strongly-typed lambda expression, which is a way to represent code as data.
    - `Func<Villa, bool>` is a delegate that represents a function taking a `Villa` parameter and returning a `bool`.
    - Together, `Expression<Func<Villa, bool>>` is a lambda expression that can be passed as a parameter to methods and used to filter data.
  - **IQueryable<Villa> query = \_db.Villas.AsQueryable():**
    - `IQueryable<T>` is an interface in C# representing a collection of objects that can be queried.
    - `_db.Villas` is the DbSet of the `Villa` entity within the `ApplicationDbContext`.
    - `.AsQueryable()` converts the DbSet into an `IQueryable<Villa>`, allowing for LINQ queries.
