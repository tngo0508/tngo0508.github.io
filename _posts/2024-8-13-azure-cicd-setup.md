---
layout: single
title: "Azure Devops: CICD Setup"
date: 2024-8-12
show_date: true
classes: wide
tags:
  - Azure
---

## Create A Repo on Azure DevOps

Before diving into how to set up the CICD on Azure Devops, we need to create a repo and store our project inside the DevOps

![repo](/assets/images/image-azure-devops.png)

## Create Agent

Next, we need to create an agent that will help us to build and publish the artifacts.

![agent](</assets/images/2024-08-13 15_48_23-agent-1.png>)

Click on New agent, we will see a window popup that guides us to create a new agent inside our windows server.

![new-agent](</assets/images/2024-08-13 15_52_38-new-agent.png>)

![new-agent-command](</assets/images/2024-08-13 15_53_33-new-agent-command.png>)

We can also download the agent from this [Download the agent](https://vstsagentpackage.azureedge.net/agent/2.153.1/vsts-agent-win-x64-2.153.1.zip)

Create the Agent command

```ps
PS C:\> mkdir agent ; cd agent
PS C:\agent> Add-Type -AssemblyName System.IO.Compression.FileSystem ; [System.IO.Compression.ZipFile]::ExtractToDirectory("$HOME\Downloads\vsts-agent-win-x64-2.153.1.zip", "$PWD")
```

Configure the agent command

```ps
PS C:\agent> .\config.cmd
```

Run agent

```ps
PS C:\agent> .\run.cmd
```

There is a very useful tool that I used to remote desktop to the windows server. It's called `RDBMan`. It's one of the `SysinternalsSuite` that Microsoft developed and collected. 

[Link to download SysinternalsSuite](https://learn.microsoft.com/en-us/sysinternals/)

With that said, we can now use the tools and commands that we learn to create new agent inside the windows server.

![windows-server](</assets/images/2024-08-13 16_03_33-sysinternals-rdpman.png>)

### Generate PAT
During the create new agent, we will be asked to provide `PAT (Personal Access Token)`, we can generate the token as following.

![pat-generation](/assets/images/pat-generation.png)

![new-token-dialog](/assets/images/new-access-token-dialog.png)

![new-token-filled](/assets/images/new-token-filled.png)

**Note: Choose All Accessible Organizations for the `Organization` field**

![success-token](/assets/images/success-token.png)

Make sure to save the token on a text file or somewhere so that we can use it later.

### Create Deployment Group

When we create release pipeline, Azure Devops will require us to select a deployment group. So we need to create one if there is no deployment group available.

![depl-group](/assets/images/deployment-group.png)

![depl-group-cmd](/assets/images/depl-group-cmd.png)

Sample of the deployment group command.

```ps
$ErrorActionPreference="Stop";If(-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent() ).IsInRole( [Security.Principal.WindowsBuiltInRole] “Administrator”)){ throw "Run command in an administrator PowerShell prompt"};If($PSVersionTable.PSVersion -lt (New-Object System.Version("3.0"))){ throw "The minimum version of Windows PowerShell that is required by the script (3.0) does not match the currently running version of Windows PowerShell." };If(-NOT (Test-Path $env:SystemDrive\'azagent')){mkdir $env:SystemDrive\'azagent'}; cd $env:SystemDrive\'azagent'; for($i=1; $i -lt 100; $i++){$destFolder="A"+$i.ToString();if(-NOT (Test-Path ($destFolder))){mkdir $destFolder;cd $destFolder;break;}}; $agentZip="$PWD\agent.zip";$DefaultProxy=[System.Net.WebRequest]::DefaultWebProxy;$securityProtocol=@();$securityProtocol+=[Net.ServicePointManager]::SecurityProtocol;$securityProtocol+=[Net.SecurityProtocolType]::Tls12;[Net.ServicePointManager]::SecurityProtocol=$securityProtocol;$WebClient=New-Object Net.WebClient; $Uri='https://vstsagentpackage.azureedge.net/agent/2.153.1/vsts-agent-win-x64-2.153.1.zip';if($DefaultProxy -and (-not $DefaultProxy.IsBypassed($Uri))){$WebClient.Proxy= New-Object Net.WebProxy($DefaultProxy.GetProxy($Uri).OriginalString, $True);}; $WebClient.DownloadFile($Uri, $agentZip);Add-Type -AssemblyName System.IO.Compression.FileSystem;[System.IO.Compression.ZipFile]::ExtractToDirectory( $agentZip, "$PWD");.\config.cmd --deploymentgroup --deploymentgroupname "depl-group-1" --agent $env:COMPUTERNAME --runasservice --work '_work' --url 'https://hcaweb50.ochca.com/' --collectionname 'Prod' --projectname 'test-cicd'; Remove-Item $agentZip;
```

![run-depl-grp-cmd](/assets/images/run-deployment-group-cmd.png)

Use the PAT that we generate from the above step.

If we encounter the issue `Resource not available for anonymous access. Client authentication required.` , we need to check the deployment group token, make sure this token is used to access all organization.

Issue:

![issue](/assets/images/error-depl-grp.png)

Resolve:

![resolve-img](/assets/images/resolve-issue-depl-grp.png)

Success:

![success-dpl-grp-img](/assets/images/success-depl-grp.png)

### Create Agent in Windows Server

Now, log into the Windows Server that has Azure Devops deployed and open the powershell or CMD prompt as adminsistration.
Note: Make sure to download the agent from the steps above, if you have not done so, use this [Download the agent](https://vstsagentpackage.azureedge.net/agent/2.153.1/vsts-agent-win-x64-2.153.1.zip) and place downloaded content on the server.

![create-agentt-cmd](/assets/images/create-agent-cmd.png)

For the Server URL, we can find it inside the deployment group command (see above). it's the `--url` in the command.

Note: we encounter `Resource not available for anonymous access. Client authentication required.`. Make sure the token is valid for specific url level. For example:

- If we entered the url `https://hcaweb50.ochca.com/`, the token must have the organization set to `All Accessible Organization`
- If we entered the url `https://hcaweb50.ochca.com/Prod`, the token must be `Prod`

![issue-agent-token](/assets/images/issue-agent-token.png)

Success:

![success-create-agent](/assets/images/success-creating-agent.png)

Go to the Azure DevOps UI to check, we will see the new agent is created.

![check-agent-pool](/assets/images/check-agent-pool-ui.png)

## Set up Build Pipepline (CI - Continueous Integration)

Next, we need to set up the build pipeline. 

![build-pipeline-1](/assets/images/create-build-pipeline.png)

![build-pipeline-2](/assets/images/build-pipeline-2.png)

![build-pipeline-3](/assets/images/build-pipeline-3.png)

![build-pipeline-4](/assets/images/build-pipeline-4.png)

We can use minimal list for now.

Here is the sample of pipeline to build, publish and create artifacts. Copy and paste this template into the yaml pipeline.

```yaml

# Start with a minimal pipeline that you can customize to build and deploy your code.
# Add steps that build, run tests, deploy, and more:
# https://aka.ms/yaml

trigger:
- master

pool:
  name: default
  demands:
  - Agent.Version -gtVersion 2.153.1
  - Agent.Name -equals agent1

variables:
  solution: '**/*.sln'
  buildPlatform: 'Any CPU'
  buildConfiguration: 'Release'

steps:
- task: DotNetCoreCLI@2
  inputs:
    command: 'build'
    projects: '$(solution)'
    configuration: '$(buildConfiguration)'

- task: DotNetCoreCLI@2
  inputs:
    command: 'publish'
    publishWebProjects: true
    zipAfterPublish: false
    arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'

- task: DotNetCoreCLI@2
  displayName: Publish
  inputs:
    command: publish
    publishWebProjects: True
    arguments: '--configuration $(BuildConfiguration) --output $(build.artifactstagingdirectory)'
    zipAfterPublish: false

- task: PublishBuildArtifacts@1
  displayName: 'Publish Artifact'
  inputs:
    PathtoPublish: '$(build.artifactstagingdirectory)'
    ArtifactName: publish
  condition: succeededOrFailed()
```

Click on Save and Run the build pipeline. It will show you success or fail.

![build-pipeline-sample](/assets/images/build-pipeline-final.png)

If the build is success, we can click on the build history and check the artifact.

![check-build-pipeline](/assets/images/check-build-pipeline.png)

![check-artifact](/assets/images/check-artifact.png)

## Set up Release Pipepline (CD - Continueous Deployment)

Next, we create the Release Pipeline and deploy to IIS.

### Create a new website on IIS

First, we need to create the new site on the windows server using IIS

![create-iis-website](/assets/images/create-iis-website.png)

On our developmentt machine or local machine, go to `C:\Windows\System32\drivers\etc` and edit this file to map the ip address to the name of the website

Example:

![mapping-ip](/assets/images/mapping-ip.png)

### Create Release Pipeline

![create-release-pipeline](/assets/images/createt-release-pipeline.png)



## Deploy the artifact to another server

Sometime, we do not want host/deploy the website on the same server contains Azure Devops site. We could deploy the artifact on another server by following steps.

Modify the release pipeline (physical path) to point to the other location on server that we want to deploy the code.

The origninal path is

```
%SystemDrive%\inetpub\test-cicd\wwwroot
```

For the original path, the code will be stored at `C:\inetpub\test-cicd\wwwroot` on windows server.


We could change it to something like this

```
\\hcaweb38\d$\inetpub\test-cicd
```

We may encounter the issue below.

Issue: Access is denied

![access-denied](/assets/images/access-denied.png)

To resolve this issue, we can make the Azure Devops server (hcaweb38) to become a local admin of the server (hcaweb50) that we want to push the code. To do this, open the `Computer Management` on hcaweb38 and add the hcaweb50 as new user

When add user > click search > select computer as Object Type

![local-admin](/assets/images/local-admin.png)

Note: users and computer are all Active Directory Objects


## Reference Links

- https://learn.microsoft.com/en-us/azure/devops/pipelines/architectures/devops-pipelines-baseline-architecture?view=azure-devops