---
layout: single
title: "Design Pattern: Prototype"
date: 2024-8-28
show_date: true
toc: true
toc_label: "Page Navigation"
toc_sticky: true
classes: wide
tags:
  - Design Patterns C#
---

## Motivation

- Complicated objects (e.g., cares) are not designed from scratch
  - They reiterate existing designs
- An existing (partially or fully constructed) design is a Prototype
- We make a copy (clone) the prototype and customize it
  - Requires "deep copy" support
- We make the cloning convenient (e.g., via a Factory)

Prototype = A partially or fully initialized object that you copy (clone) and make use of

## IClonable is bad

In C#, implementing the `ICloneable` interface allows us to create a copy of a class object using the `Clone()` method. However, relying on `ICloneable` can lead to potential issues, especially with shallow copies. A shallow copy only duplicates the object's references, not the actual data. This means that if an object contains references to other objects, those references are shared between the original and the cloned object. As a result, changes made to the properties or fields in one instance may unintentionally affect the other instance.

To avoid these issues, we must carefully implement the `Clone()` method in all derived classes to ensure a deep copy is made where appropriate. Failing to do so can result in unintended behavior, making `ICloneable` problematic in scenarios where a deep copy is required.

Consider the following example:

```csharp
public class Address
{
    public string City { get; set; }
}

public class Person : ICloneable
{
    public string Name { get; set; }
    public Address Address { get; set; }

    public object Clone()
    {
        return this.MemberwiseClone(); // Shallow copy
    }
}

public class Program
{
    public static void Main()
    {
        Person original = new Person { Name = "John", Address = new Address { City = "New York" } };
        Person clone = (Person)original.Clone();

        clone.Name = "Jane";
        clone.Address.City = "Los Angeles";

        Console.WriteLine($"Original Name: {original.Name}"); // Output: Original Name: John
        Console.WriteLine($"Original City: {original.Address.City}"); // Output: Original City: Los Angeles
    }
}
```

In this example, the Person class implements `ICloneable` and uses `MemberwiseClone()` to create a shallow copy. While the `Name` field is properly copied, the `Address` field remains a reference to the same `Address` object. As a result, changing the `City` property in the clone also affects the `original`, which may not be the desired behavior.

To avoid this issue, a deep copy implementation should be used:

```csharp
public object Clone()
{
    return new Person
    {
        Name = this.Name,
        Address = new Address { City = this.Address.City } // Deep copy
    };
}
```

This ensures that changes to the `clone` do not affect the `original`, preventing unintended side effects.

With that said, if we want to implement the `deep copy`, we should use the `prototype` design pattern.

Alternatively, **we could use `Copy Constructor` to mitigate the problem of shallow copy**. Using a copy constructor is a common and effective way to create a deep copy of an object in C#. A copy constructor creates a new object by copying the fields from an existing object, ensuring that any reference types are also properly duplicated to avoid the issues associated with shallow copies.

For instance:

```csharp
public class Address
{
    public string City { get; set; }

    // Copy constructor for Address
    public Address(Address other)
    {
        City = other.City;
    }
}

public class Person
{
    public string Name { get; set; }
    public Address Address { get; set; }

    // Copy constructor for Person
    public Person(Person other)
    {
        Name = other.Name;
        Address = new Address(other.Address); // Use the copy constructor of Address
    }

    // Regular constructor for Person
    public Person(string name, string city)
    {
        Name = name;
        Address = new Address { City = city };
    }
}

public class Program
{
    public static void Main()
    {
        Person original = new Person("John", "New York");
        Person copy = new Person(original); // Create a deep copy using the copy constructor

        copy.Name = "Jane";
        copy.Address.City = "Los Angeles";

        Console.WriteLine($"Original Name: {original.Name}"); // Output: Original Name: John
        Console.WriteLine($"Original City: {original.Address.City}"); // Output: Original City: New York
    }
}
```
