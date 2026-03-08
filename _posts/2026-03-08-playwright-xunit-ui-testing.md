---
layout: single
title: "Part 12: UI Testing with Playwright and xUnit: A Step-by-Step Guide"
date: 2026-03-08
show_date: true
toc: true
toc_label: "Playwright with xUnit"
toc_icon: "vials"
classes: wide
tags:
  - .NET
  - C#
  - xUnit
  - Playwright
  - UI Testing
  - Automated Testing
---

Following our deep dive into **xUnit** ([Part 11]({{ site.baseurl }}{% post_url 2026-3-7-xunit-deep-dive %})), it's time to take our testing to the user interface level. 

In modern web development, UI testing is crucial for ensuring that the front-end behaves as expected. **Playwright**, developed by Microsoft, has quickly become the gold standard for UI automation due to its speed, reliability across browsers (Chromium, Firefox, WebKit), and powerful features like automatic waiting and trace viewing.

In this guide, we'll learn how to combine **Playwright** with **xUnit** to build a robust UI testing suite.

---

## 1. Setting Up Your Project

First, you need a .NET test project. If you don't have one, you can create it via the CLI:

```bash
dotnet new xunit -n MyProject.UITests
cd MyProject.UITests
```

### Install Required NuGet Packages
Add the Playwright for .NET package and the xUnit-specific Playwright helpers:

```bash
dotnet add package Microsoft.Playwright.xunit
```

*(Note: `Microsoft.Playwright.xunit` includes `Microsoft.Playwright` and provides convenient base classes for xUnit tests.)*

### Install Browsers
Playwright requires its own browser binaries. Run the following command (you might need to build the project first):

```bash
dotnet build
# On Windows
pwsh bin/Debug/netX.X/playwright.ps1 install
# On macOS/Linux
./bin/Debug/netX.X/playwright.sh install
```

---

## 2. Your First UI Test

The easiest way to start is by inheriting from `PageTest`, which provides a fresh `IPage` instance for every test.

```csharp
using Microsoft.Playwright;
using Microsoft.Playwright.Xunit;

namespace MyProject.UITests;

public class GitHubTests : PageTest
{
    [Fact]
    public async Task SearchGitHub_ShouldShowResults()
    {
        // 1. Navigate to the page
        await Page.GotoAsync("https://github.com/");

        // 2. Perform actions (using locators)
        var searchInput = Page.GetByRole(AriaRole.Button, new() { Name = "Search or jump to..." });
        await searchInput.ClickAsync();
        
        var queryInput = Page.GetByPlaceholder("Search GitHub");
        await queryInput.FillAsync("playwright dotnet");
        await queryInput.PressAsync("Enter");

        // 3. Assertions (using Playwright's built-in assertions)
        await Expect(Page).ToHaveURLAsync(new Regex("q=playwright\\+dotnet"));
        
        var firstResult = Page.Locator(".repo-list-item").First;
        await Expect(firstResult).ToBeVisibleAsync();
    }
}
```

### Why use `Expect(Page).ToHaveURLAsync()`?
Playwright assertions are **auto-retrying**. Instead of using `Assert.Equal()`, which might fail if the page hasn't finished loading, `Expect` will wait up to 5 seconds (by default) for the condition to be met.

---

## 3. The Power of Locators

Forget `FindElementByXPath` or CSS selectors when possible. Playwright encourages **User-Centric Locators**, which make tests more resilient to UI changes:

- `GetByRole(AriaRole.Button, ...)`
- `GetByLabel("Username")`
- `GetByPlaceholder("Enter email")`
- `GetByText("Login")`

This mimics how a user interacts with the page, making your tests more "professional" and easier to maintain.

---

## 4. Advanced: Page Object Model (POM)

For larger projects, you should use the **Page Object Model** to separate test logic from page structure.

```csharp
public class LoginPage
{
    private readonly IPage _page;
    public LoginPage(IPage page) => _page = page;

    public ILocator UsernameInput => _page.GetByLabel("Username");
    public ILocator PasswordInput => _page.GetByLabel("Password");
    public ILocator LoginButton => _page.GetByRole(AriaRole.Button, new() { Name = "Log in" });

    public async Task LoginAsync(string user, string pass)
    {
        await UsernameInput.FillAsync(user);
        await PasswordInput.FillAsync(pass);
        await LoginButton.ClickAsync();
    }
}
```

Then, in your test:

```csharp
[Fact]
public async Task ValidLogin_ShouldRedirectToDashboard()
{
    var loginPage = new LoginPage(Page);
    await Page.GotoAsync("https://example.com/login");
    
    await loginPage.LoginAsync("admin", "p@ssword!");
    
    await Expect(Page).ToHaveURLAsync("https://example.com/dashboard");
}
```

---

## 5. Running Tests and Debugging

### Running Tests
Use the standard .NET command:
```bash
dotnet test
```

### Viewing Traces
Playwright's **Trace Viewer** is a game-changer. It records everything (network, console, snapshots) during the test. To enable it locally for debugging:

```bash
# Run tests with the inspector
PWDEBUG=1 dotnet test
```

Or configure your test setup to save a zip file on failure, which you can open at [trace.playwright.dev](https://trace.playwright.dev).

---

## 6. How to Prevent Flaky Tests

One of the biggest challenges in UI testing is **flakiness**—tests that pass sometimes and fail at other times. Playwright is designed to minimize this, but here are some professional tips to keep your suite stable:

### 1. Leverage Auto-Waiting
Avoid using `Thread.Sleep()` at all costs. Playwright automatically waits for elements to be "actionable" (visible, stable, enabled) before performing actions like `ClickAsync()`. If you need to wait for a specific state, use:
- `Page.WaitForURLAsync()`
- `Locator.WaitForAsync()`

### 2. Use Web-First Assertions
Always use `Expect(locator).ToBeVisibleAsync()` instead of `Assert.True(await locator.IsVisibleAsync())`. The `Expect` method will retry the assertion for a period of time (defaulting to 5 seconds) until the condition is met, whereas standard xUnit assertions will fail immediately if the condition isn't true at that exact millisecond.

### 3. Ensure Test Isolation
Each test should be independent. Avoid shared state between tests. Playwright's `PageTest` base class helps by providing a fresh `BrowserContext` and `Page` for every test, ensuring that cookies or local storage from one test don't affect the next.

### 4. Use Stable Locators
Rely on **User-Facing Locators** (like `GetByRole` or `GetByText`) rather than fragile CSS selectors or XPaths that depend on the DOM structure. If the layout changes but the "Login" button is still a button with that text, your test will still pass.

---

## Conclusion

Combining **xUnit** and **Playwright** gives you the best of both worlds: a battle-tested .NET testing framework and a modern, high-performance UI automation tool. 

**Key Takeaways:**
1. Use `Microsoft.Playwright.xunit` for easy setup.
2. Prefer `PageTest` base class for isolated tests.
3. Always use `Expect` for auto-retrying assertions.
4. Implement **POM** early to keep your suite manageable.
5. Apply anti-flakiness patterns to ensure reliability.

Happy testing! 🚀
