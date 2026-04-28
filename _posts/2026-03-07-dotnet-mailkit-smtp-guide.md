---
layout: single
title: "Sending Emails in .NET with MailKit: A Complete Guide"
date: 2026-3-7
show_date: true
classes: wide
tags:
  - .NET
  - MailKit
  - SMTP
  - C#
---

For a long time, `SmtpClient` was the go-to class for sending emails in .NET. However, it's now officially deprecated for many use cases and replaced by more robust libraries. This post explores how to use **MailKit**, the recommended library for modern .NET applications, to handle everything from basic SMTP to complex HTML emails with attachments.

## Why MailKit?

`System.Net.Mail.SmtpClient` is old and doesn't support modern protocols like OAuth2 or some security features effectively. Microsoft itself recommends using **MailKit** for new projects.

- **High Performance**: Built from the ground up for speed and memory efficiency.
- **Protocol Support**: Full support for SMTP, POP3, and IMAP.
- **Security**: Robust handling of SSL/TLS and modern authentication (OAuth2).

## 1. Getting Started

First, install the `MailKit` NuGet package in your project:

```bash
dotnet add package MailKit
```

## 2. Sending a Basic Email

To send a basic email, you'll need the `MimeMessage` class (to build the email) and the `SmtpClient` from the `MailKit.Net.Smtp` namespace.

```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

public async Task SendBasicEmailAsync()
{
    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("Your Name", "your-email@example.com"));
    message.To.Add(new MailboxAddress("Recipient Name", "recipient@example.com"));
    message.Subject = "Hello from .NET 10!";

    message.Body = new TextPart("plain")
    {
        Text = @"Hi there,

This is a test email sent using MailKit in .NET 10."
    };

    using var client = new SmtpClient();
    try
    {
        // Connect to the SMTP server (e.g., Mailtrap, Gmail, etc.)
        await client.ConnectAsync("smtp.mailtrap.io", 587, SecureSocketOptions.StartTls);

        // Authenticate
        await client.AuthenticateAsync("your-username", "your-password");

        // Send the email
        await client.SendAsync(message);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error sending email: {ex.Message}");
    }
    finally
    {
        // Always disconnect cleanly
        await client.DisconnectAsync(true);
    }
}
```

## 3. Configuring SMTP for Common Providers

Each email service has its own specific settings. Here's a quick reference for common providers:

### Gmail
- **Host**: `smtp.gmail.com`
- **Port**: `587` (STARTTLS) or `465` (SSL/TLS)
- **Authentication**: Requires an **App Password** (if 2FA is enabled) or OAuth2.

### Outlook / Office 365
- **Host**: `smtp.office365.com`
- **Port**: `587` (STARTTLS)
- **Security**: `SecureSocketOptions.StartTls`

### Mailtrap (For Testing)
- **Host**: `smtp.mailtrap.io`
- **Port**: `2525`, `587`, or `25`
- **Security**: `SecureSocketOptions.StartTls`

## 4. Sending HTML Emails and Attachments

To send more complex emails, use the `BodyBuilder` class. It simplifies adding HTML content and file attachments.

```csharp
public async Task SendComplexEmailAsync(string toEmail, string filePath)
{
    var message = new MimeMessage();
    message.From.Add(new MailboxAddress("Sender", "sender@example.com"));
    message.To.Add(new MailboxAddress("Recipient", toEmail));
    message.Subject = "Daily Report with Attachment";

    var builder = new BodyBuilder();

    // Set the HTML version of the message text
    builder.HtmlBody = "<h1>Daily Report</h1><p>Please find the report attached below.</p>";

    // Set the plain-text version (for older email clients)
    builder.TextBody = "Daily Report\n\nPlease find the report attached below.";

    // Add an attachment
    builder.Attachments.Add(filePath);

    message.Body = builder.ToMessageBody();

    using var client = new SmtpClient();
    await client.ConnectAsync("smtp.example.com", 587, SecureSocketOptions.StartTls);
    await client.AuthenticateAsync("user", "password");
    await client.SendAsync(message);
    await client.DisconnectAsync(true);
}
```

## 5. Integrating with Dependency Injection

In real-world applications, you should use the **Options Pattern** and inject an email service.

### Define Configuration
```csharp
public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

### Create an Email Service
```csharp
public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public class MailKitEmailService : IEmailService
{
    private readonly SmtpOptions _options;

    public MailKitEmailService(IOptions<SmtpOptions> options)
    {
        _options = options.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("App Name", _options.Username));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_options.Username, _options.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
```

### Register the Service
```csharp
// In Program.cs
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("SmtpSettings"));
builder.Services.AddTransient<IEmailService, MailKitEmailService>();
```

## Conclusion

MailKit is the standard for sending emails in .NET. It's powerful, secure, and easy to integrate with modern patterns like Dependency Injection. Whether you're sending simple notifications or complex reports with attachments, MailKit has you covered.

## Further Reading

- [MailKit Documentation](http://www.mimekit.net/docs/html/Introduction.htm)
- [MimeKit Documentation](http://www.mimekit.net/docs/html/Introduction.htm)
- [Official MailKit GitHub Repository](https://github.com/jstedfast/MailKit)
- [Microsoft Guidance: SmtpClient is obsolete](https://learn.microsoft.com/en-us/dotnet/api/system.net.mail.smtpclient?view=net-8.0#remarks)
