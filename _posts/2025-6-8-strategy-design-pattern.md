---
layout: single
title: "Design Pattern: Strategy design pattern"
date: 2024-8-4
# toc: true
# toc_label: "Page Navigation"
# toc_sticky: true
show_date: true
classes: wide
tags:
  - Design Patterns C#
---

## Reference

- [Architecting ASP.NET Core applications](https://www.packtpub.com/en-us/product/architecting-aspnet-core-applications-9781805123385)

## Motivation

- Aims to extract algorithm (a strategy) from the host class that needs it (the context or consumer). That allows the consumer to decide on the strategy (algorithm) to use at runtime.

- Advantage: this pattern abstracts the implementation of the logic from both `Context` class and its consumers. This allows us to change the strategy or implementation during either object creation or at runtime without the instance object knowing.

## Participants

- **Context**

  - Method: `+ SomeOperation(): void`
  - Holds a reference to an `IStrategy` and delegates the algorithm execution to it.

- **IStrategy (Interface)**

  - Method: `+ ExecuteAlgo(): void`
  - Declares a method that all supported strategies must implement.

- **ConcreteStrategy1**

  - Inherits: `IStrategy`
  - Implements: `+ ExecuteAlgo(): void`

- **ConcreteStrategy2**
  - Inherits: `IStrategy`
  - Implements: `+ ExecuteAlgo(): void`

## Example Implementation

Here is a simple example implementation of the Strategy Pattern. The goal is to demonstrate and understand how the Strategy Design Pattern helps simplify and organize logic during runtime. In this example, we implement sorting logic. Depending on the scenario, we need to dynamically switch the sorting logic to either ascending or descending order.

### ISortStrategy

```csharp
namespace MySortingMachine;

public interface ISortStrategy
{
    IOrderedEnumerable<string> Sort(IEnumerable<string> input);
}
```

### SortableCollection

```csharp
using System.Collections.Immutable;

namespace MySortingMachine;

public sealed class SortableCollection
{
    private ISortStrategy _sortStrategy;

    private ImmutableArray<string> _items;
    public IEnumerable<string> Items => _items;
    public SortableCollection(IEnumerable<string> items)
    {
        _items = items.ToImmutableArray();
        _sortStrategy = new SortAscendingStrategy();
    }

    public void SetSortStrategy(ISortStrategy strategy)
        => _sortStrategy = strategy;

    public void Sort()
    {
        _items = _sortStrategy
            .Sort(Items)
            .ToImmutableArray()
        ;
    }
}

```

### SortAscendingStrategy

```csharp
namespace MySortingMachine;

public class SortAscendingStrategy : ISortStrategy
{
    public IOrderedEnumerable<string> Sort(IEnumerable<string> input)
        => input.OrderBy(x => x);
}
```

### SortDescendingStrategy

```csharp
namespace MySortingMachine;

public class SortDescendingStrategy : ISortStrategy
{
    public IOrderedEnumerable<string> Sort(IEnumerable<string> input)
        => input.OrderByDescending(x => x);
}

public class SortDescendingStrategyClassic : ISortStrategy
{
    public IOrderedEnumerable<string> Sort(IEnumerable<string> input)
    {
        return input.OrderByDescending(x => x);
    }
}
```

### Consumer Code

```csharp
using MySortingMachine;
using System.Text.Json;
using System.Text.Json.Serialization;

SortableCollection data = new(new[] { "Lorem", "ipsum", "dolor", "sit", "amet." });

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureHttpJsonOptions(options => {
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
var app = builder.Build();

app.MapGet("/", () => data);
app.MapPut("/", (ReplaceSortStrategy sortStrategy) =>
{
    ISortStrategy strategy = sortStrategy.SortOrder == SortOrder.Ascending
        ? new SortAscendingStrategy()
        : new SortDescendingStrategy();
    data.SetSortStrategy(strategy);
    data.Sort();
    return data;
});

app.Run();

public enum SortOrder
{
    Ascending,
    Descending
}

public record class ReplaceSortStrategy(SortOrder SortOrder);
```

## Conclusion

- Strategy pattern is very effective to delegate the responsiblity to other objects.
- Strategy pattern allows us to have a rich interface (context) with behaviors that can change at a runtime.
