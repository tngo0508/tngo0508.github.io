---
layout: single
title: "Design Pattern: Factories"
date: 2024-8-4
# toc: true
# toc_label: "Page Navigation"
# toc_sticky: true
show_date: true
classes: wide
tags:
  - Design Patterns C#
---

## Motivation

- Object creation logic becomes too convoluted
- Constructor is not descriptive
  - Name mandated by name of containing type
  - Cannot overload with same sets of arguments with different names
  - Can turn into 'optional parameter hell'
- Object creation (non-piecewise, unlike builder) can be outsourced to
  - A separate function (Factory Method)
  - That may exist in a separate class (Factory)
  - Can create hierarchy of factories with Abstract Factory

**Factory**: A component responsible solely for the wholesale (not piecewise) creation of objects

## Point Example

Suppose you want to store information about a `Point` in Cartesian space. You would implement something like the following. Then, you realize that you might need to initialize the point from Polar coordinates. You go back to the code and introduce the enum `CoordinateSystem`

```csharp
    public enum CoordinateSystem
    {
        Cartesian,
        Polar
    }
    public class Point
    {
        private double x, y;

        /// <summary>
        /// Initializes a point from either cartesian or polar
        /// </summary>
        /// <param name="a">x if cartesian, rho if polar</param>
        /// <param name="b"></param>
        /// <param name="system"></param>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public Point(double a, double b, CoordinateSystem system = CoordinateSystem.Cartesian)
        {
            switch (system)
            {
                case CoordinateSystem.Cartesian:
                    x = a;
                    y = b;
                    break;
                case CoordinateSystem.Polar:
                    x = a * Math.Cos(b);
                    y = a * Math.Sin(b);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(system), system, null);
            }
        }
    }
```

Problem: it's not clear about the parameter names. They can be `x` for cartesian or `rho` for polar. We don't which coordinates are passed as arguments into the constructor. That means that we can no longer afford telling the user which coordinates system whose values should come from.
=> This is a clear loss of expressivity when compared with x, y rho, and theta to communicate intent.

## Factory Method

```csharp
    public class Point
    {
        // factory method
        public static Point NewCartesianPoint(double x, double y) { return new Point(x, y); }
        public static Point NewPolarPoint(double rho, double theta)
        {
            return new Point(rho * Math.Cos(theta), rho*Math.Sin(theta));
        }
        private double x, y;

        private Point(double x, double y)
        {
            this.x = x;
            this.y = y;
        }

        public override string ToString()
        {
            return $"{nameof(x)}: {x}, {nameof(y)}: {y}";
        }
    }

    public class Demo
    {
        static void Main(string[] args)
        {
            var point = Point.NewPolarPoint(1.0, Math.PI / 2);
            Console.WriteLine(point);
        }
    }
```

As shown above, each static methods is called a Factory Method. All it does is create a Point and return it, the advantages being that both the name of the method and the names of the arguments clearly communicate what kind of coordinates are required.

## Factory

Take all the Point-creating functions out of Point and put them into a separate class that call a Factory. Note that, the Point constructor can no longer be private or protected because it needs to externally accessible.

```csharp
public class PointFactory
{
    public static Point NewCartesianPoint(double x, double y)
    {
        return new Point(x, y); // needs to be public
    }
    public static Point NewPolarPoint(double rho, double theta)
    {
        return new Point(rho * Math.Cos(theta), rho*Math.Sin(theta));
    }
}
public class Point
{
    private Point(double x, double y)
    {
        this.x = x;
        this.y = y;
    }

    public override string ToString()
    {
        return $"{nameof(x)}: {x}, {nameof(y)}: {y}";
    }
}
```

To use this factory, we can do the following in the main function

```csharp
var point = PointFactory.NewCartesianPoint(3, 4);
```
