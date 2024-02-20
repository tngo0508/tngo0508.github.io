---
layout: single
title: "C# ASP.NET - Add Foreign Key In Entity Framework"
date: 2024-2-19
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
---

## How to add relationship in EFCore

- For example, if we have the two classes as below.

```csharp
// VillaNumber.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicVilla_VillaAPI.Models
{
    public class VillaNumber
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int VillaNo { get; set; }
        public string SpecialDetails { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
```

```csharp
// Villa.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicVilla_VillaAPI.Models
{
    public class Villa
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Details { get; set; }
        public double Rate { get; set; }
        public int Sqft { get; set; }
        public int Occupancy { get; set; }
        public string ImageUrl { get; set; }
        public string Amenity { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
```

- To add `1-to-many` relationship for `Villa` and `VillaNumber`. Basically, we need to create a navigation property. We do the followings.

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MagicVilla_VillaAPI.Models
{
    public class VillaNumber
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int VillaNo { get; set; }
        #region Add relationship
        [ForeignKey("Villa")]
        public int VillaId { get; set; }
        public Villa Villa { get; set; }
        #endregion
        public string SpecialDetails { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }
}
```

- Then, we need to run the migration to update the database.

```shell
PM> add-migration AddFKToVillaTable
```

As a result, EFCore generates a migration snapshot file and if we take a closer look into this file, we will see that the foreign key is added.

```csharp
migrationBuilder.CreateIndex(
    name: "IX_VillaNumbers_VillaId",
    table: "VillaNumbers",
    column: "VillaId");

migrationBuilder.AddForeignKey(
    name: "FK_VillaNumbers_Villas_VillaId",
    table: "VillaNumbers",
    column: "VillaId",
    principalTable: "Villas",
    principalColumn: "Id",
    onDelete: ReferentialAction.Cascade);
```

Note:

- principleTable: `Villa` table
- principleColumn: the `Id` in the `Villa` table
- `onDelete: ReferentialAction.Cascade`: if the row on `Villa` is deleted, the related row of table `VillaNumber` is also deleted.

Last and not least, we need to run `PM> update-database` to update database so that the changes can take the effect.
