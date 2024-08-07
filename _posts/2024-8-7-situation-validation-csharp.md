---
layout: single
title: "Situation Validation in C#"
date: 2024-08-07
show_date: true
classes: wide
tags:
  - C#
  - Blazor
---

## Introduction

When working with form submissions in C# .NET, business logic may require dependencies between form fields. For example, if a form has two fields, `Type License` and `DEA Number`, selecting the option `MD - Physician` should make the `DEA Number` field required.

![screenshot1](/assets/images/2024-08-07_09-01-17-situational-validation-1.png)

How do we achieve this?

- Use custom validation or `ValidationAttribute`
- Create a dependent or situational validator

## Create Situational Validator

```csharp
public class SituationalValidator : ValidationAttribute
{
    public string DependentField { get; set; }

    // Constructor to initialize the dependent field
    public SituationalValidator(string dependentField)
    {
        DependentField = dependentField;
    }

    // Override the IsValid method to include custom validation logic
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        // Get the object instance and validation context
        object instance = validationContext.ObjectInstance;
        if (validationContext != null && instance != null && !String.IsNullOrWhiteSpace(validationContext.MemberName))
        {
            Type type = instance.GetType();
            PropertyInfo dependentInfo = type.GetProperty(DependentField);
            if (dependentInfo == null)
                return new ValidationResult(String.Format("Invalid dependency: {0}", DependentField));

            // Get the value of the dependent field
            object dependentValue = dependentInfo.GetValue(validationContext.ObjectInstance, null);
            if (dependentValue == null || String.IsNullOrWhiteSpace(dependentValue.ToString()))
                return ValidationResult.Success;

            // Check if the dependent field condition is met
            bool conditionMatched = false;
            if (dependentInfo.PropertyType == typeof(bool) || dependentInfo.PropertyType == typeof(bool?))
            {
                if (!Boolean.TryParse(dependentValue.ToString(), out conditionMatched))
                    conditionMatched = false;
            }

            if (!conditionMatched)
                return ValidationResult.Success;

            // Get the value of the field being validated
            PropertyInfo propertyInfo = type.GetProperty(validationContext.MemberName);
            if (propertyInfo == null)
                return new ValidationResult(String.Format("Invalid object member: {0}", validationContext.MemberName));

            object memberValue = propertyInfo.GetValue(validationContext.ObjectInstance, null);
            if (memberValue == null || String.IsNullOrWhiteSpace(memberValue.ToString()) || memberValue.ToString() == Int16.MinValue.ToString())
                return new ValidationResult(ErrorMessage != null ? ErrorMessage : String.Format("[{0}] is required.", validationContext.MemberName));

            return ValidationResult.Success;
        }
        return new ValidationResult(String.Format("Invalid value: {0}", value));
    }
}
```

Next, create the dependent field `IsDEARequired` and use the `SituationalValidator` attribute on the `DEA Number` property.

```csharp
// Declare the dependency field
[Newtonsoft.Json.JsonIgnore]
public bool IsDEARequired
{
    get
    {
        // Specify the conditions under which the DEA Number is required
        return LicenseType == "MD" || LicenseType == "NPA" || LicenseType == "PAS";
    }
}


```

```csharp
// Apply the SituationalValidator attribute to the DEA Number property
[SituationalValidator(nameof(IsDEARequired), ErrorMessage="[DEA Number] is required.")]
public virtual string DEANumber
{
    get
    {
        // Business logic here (if any)
    }
    set
    {
        // Business logic here (if any)
    }
}

```

As a result, the validation will display as shown below.

![screenshot2](/assets/images/2024-08-07_09-14-20-situational-validation-2.png)
