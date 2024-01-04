---
title: "Stabilize the CodeTrack Project"
date: 2023-12-21
toc: true
toc_label: "Page Navigation"
toc_sticky: true
show_date: true
tags:
  - C#
  - .NET
  - Azure
  - CodeTrack
---
# Figure out how to set up Azure Key Vault
Today, I dedicated the entire morning to configuring Azure Key Vault for my CodeTrack application, aiming to securely store and retrieve secrets. Thanks to [Codewrinkles' video](https://www.youtube.com/watch?v=I8p8j5MuMAo), I successfully achieved this goal. Here are the steps I took:

## Access Configuration in Azure Key Vault
I adjusted the settings for Access configuration inside the Azure Key Vault, as shown below:
[Access Configuration](/assets/images/access-configuration.png)
## Set up Access Policies
I configured the `Access Policies` to allow the CodeTrack app service to access the Key Vault and retrieve secrets. The Object ID, crucial for the Principal tab, was obtained from the app service:

Go to App Service > Identity > Copy the Object (principal) ID.
[![create-access-policy](/assets/images/2023-12-21_15-31-22-create-access-policy.png)](/assets/images/2023-12-21_15-31-22-create-access-policy.png)

For the `Principal` tab, the object ID can be obtained from the app service. Basically, we need to go App Service > Identity > copy the Object (principal) ID
[![create-access-policy-1](/assets/images/2023-12-21_15-34-53-create-access-policy-1.png)](/assets/images/2023-12-21_15-34-53-create-access-policy-1.png)

Then, click on Create button to generate the new access policy
[![create-access-policy-2](/assets/images/2023-12-21_15-37-02-create-access-policy-2.png)](/assets/images/2023-12-21_15-37-02-create-access-policy-2.png)

## Update appsettings.json
   
Sensitive information was removed from appsettings.json, and the KeyVaultUrl was added for use in `Program.cs`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CodePracticeTrackingApp;Trusted_Connection=True;TrustServerCertificate=true;Integrated Security=True;"
  },
  "SendGrid": {
    "SecretKey": ""
  },
  "KeyVaultUrl": "https://codetrack.vault.azure.net/"
}
```

## Configure Azure Key Vault in ASP.NET MVC Application

I modified the code in Program.cs to integrate Azure Key Vault into the application.
[![key-vault-img](/assets/images/2023-12-21_15-43-19-key-vault-img.png)](/assets/images/2023-12-21_15-43-19-key-vault-img.png)

```csharp
if (builder.Environment.IsDevelopment())
{
    // dependecy injection
    // tell .net to use EF and connect to SQL server 
    builder.Services.AddDbContext<DatabaseContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    // Add Azure Key Vault configuration
    var KeyVaultUrl = new Uri(builder.Configuration.GetSection("KeyVaultUrl").Value!);
    var azureCredential = new DefaultAzureCredential();

    builder.Configuration.AddAzureKeyVault(KeyVaultUrl, azureCredential);

    // using Azure Key Vault. The Key Vault Name is ConnectionString in this case
    builder.Services.AddDbContext<DatabaseContext>(options => options.UseSqlServer(builder.Configuration["ConnectionString"]));
}
```

```csharp
using Microsoft.AspNetCore.Identity.UI.Services;
using SendGrid.Helpers.Mail;
using SendGrid;

namespace CodePracticeTrackingApp.Utilities
{
    public class EmailSender : IEmailSender
    {
        public string SendGridSecret { get; set; }
        public EmailSender(IConfiguration _config) => SendGridSecret = _config["SendGridSecret"] ??= _config.GetValue<string>("SendGrid:SecretKey");
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            // logic to send email

            var client = new SendGridClient(SendGridSecret);

            var from = new EmailAddress("tngo0508@gmail.com", "CodeTrack");
            var to = new EmailAddress(email);
            var message = MailHelper.CreateSingleEmail(from, to, subject, "", htmlMessage);

            return client.SendEmailAsync(message);
        }
    }
}

```
Additionally, I ensured that the email sender class utilized the SendGrid secret from Azure Key Vault.

This effort enhances the security of the CodeTrack application by utilizing Azure Key Vault to manage sensitive information.

# Fix UI for the Mobile Screen
Addressing feedback, I focused on improving the mobile screen UI. By adjusting Bootstrap classes in the views (cshtml), I made the website more responsive using the `d-*-none` and `d-*-block` classes for different screen sizes.

Here's a snippet illustrating the approach:
```html
<div class="d-none d-md-block">
    <div class="row d-flex flex-column my-5 justify-content-center align-content-center">
        <div class="row justify-content-center align-content-center pb-5">
            <div class="col align-self-center justify-content-center">
                <div class="row h-100 align-content-center justify-content-center">
                    <div class="col-8 my-auto">
                        <ul class="custom-list">
                            <li class="mb-5">Visualize the frequency of each problem</li>
                            <li class="mb-5">Each bar represents a problem, and the height corresponds to the frequency</li>
                            <li class="mb-5">Help identify which problems are more common</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col text-center justify-content-center align-content-center">
                <div class="row h-100 align-content-center justify-content-center">
                    <div class="col-8 my-auto">
                        <div class="card shadow">
                            <div class="card-body">
                                <canvas id="barChartDemo"></canvas>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>

    ...
</div>
```

I applied this technique to enhance the Home Page and Problem Page UI, making it more user-friendly on mobile devices.

# Refine User Input Form

In response to user feedback, I refined the user input form by adding placeholders to provide hints for each field. This enhancement aims to make it clearer for users what information is expected when creating a new problem.

[![refine-user-input](/assets/images/2023-12-21_16-18-38-refine-user-input.png)](/assets/images/2023-12-21_16-18-38-refine-user-input.png)

# Conclusion
Today's efforts focused on improving both the security and user experience aspects of the CodeTrack application. The integration of Azure Key Vault enhances the security of sensitive information, while UI adjustments cater to a better user experience, especially on mobile devices. The CodeTrack repository is now public, inviting users to explore and provide feedback. Feel free to check out the [CodeTrack repository](https://github.com/tngo0508/CodePracticeTrackingApp) and give it a star!