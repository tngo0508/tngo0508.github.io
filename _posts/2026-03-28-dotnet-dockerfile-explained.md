---
title: "Explaining the .NET Multi-Stage Dockerfile"
excerpt: "A deep dive into the standard .NET Dockerfile structure, explaining multi-stage builds and how each step contributes to a lean production image."
date: 2026-03-28
categories:
  - Docker
  - .NET
tags:
  - Docker
  - .NET
  - DevOps
  - Beginners
toc: true
toc_label: "In this post"
---

### 1. Introduction to Multi-Stage Builds

If you've created a .NET project in Visual Studio and enabled Docker support, you've likely seen a `Dockerfile` that looks a bit complex. It uses **multi-stage builds**, a powerful feature that allows you to use one large image for building your code (containing the SDK) and a much smaller image for running it (containing only the runtime).

This results in a smaller, more secure production image.

### 2. The Dockerfile Structure

Here is the standard .NET Dockerfile we'll be breaking down:

```dockerfile
# Stage 1: Runtime Base
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Stage 2: Build Environment
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Gateway.Ocelot/Gateway.Ocelot.csproj", "Gateway.Ocelot/"]
RUN dotnet restore "./Gateway.Ocelot/Gateway.Ocelot.csproj"
COPY . .
WORKDIR "/src/Gateway.Ocelot"
RUN dotnet build "./Gateway.Ocelot.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Gateway.Ocelot.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final Production Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Gateway.Ocelot.dll"]
```

---

### 3. Breaking Down Each Stage

#### Stage 1: `base`
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
```
- **`FROM ... AS base`**: This uses the .NET **ASP.NET Runtime** image. It's lightweight because it doesn't include the compiler (SDK).
- **`USER $APP_UID`**: Runs the application as a non-root user for better security.
- **`WORKDIR /app`**: Sets the working directory inside the container to `/app`.
- **`EXPOSE`**: Documents that the container will listen on ports 8080 and 8081.

#### Stage 2: `build`
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Gateway.Ocelot/Gateway.Ocelot.csproj", "Gateway.Ocelot/"]
RUN dotnet restore "./Gateway.Ocelot/Gateway.Ocelot.csproj"
COPY . .
WORKDIR "/src/Gateway.Ocelot"
RUN dotnet build "./Gateway.Ocelot.csproj" -c $BUILD_CONFIGURATION -o /app/build
```
- **`FROM ... AS build`**: Switches to the **.NET SDK** image, which contains all the tools needed to compile the code.
- **`ARG BUILD_CONFIGURATION=Release`**: Defines a variable that can be passed to the build process (e.g., `Debug` or `Release`).
- **`WORKDIR /src`**: Sets the working directory for subsequent instructions.
- **`COPY ... .csproj`**: We copy the project file first and then run **`dotnet restore`**. This is a trick to speed up builds; Docker will cache the restored packages as long as the `.csproj` file doesn't change.
- **`COPY . .`**: Copies the rest of your source code.
- **`dotnet build`**: Compiles the application.

#### Stage 3: `publish`
```dockerfile
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Gateway.Ocelot.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
```
- This stage inherits from the `build` stage.
- **`ARG ...`**: Passes the build configuration to the publish step.
- **`dotnet publish`**: Prepares the application for deployment (collects the DLLs, dependencies, etc.) into the `/app/publish` folder.

#### Stage 4: `final`
```dockerfile
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Gateway.Ocelot.dll"]
```
- **`FROM base AS final`**: This is the most important part! We switch *back* to our small runtime image from Stage 1.
- **`WORKDIR /app`**: Returns to the app directory.
- **`COPY --from=publish`**: We only copy the final compiled files from the `publish` stage. The massive SDK and your source code are discarded.
- **`ENTRYPOINT`**: Defines the command that runs when the container starts.

---

### 4. Key Instructions Reference

Here is a quick reference for the keywords used in this Dockerfile:

| Instruction | Explanation |
| :--- | :--- |
| **FROM** | Starts a new build stage and sets the **Base Image**. Multi-stage builds use multiple `FROM` statements. |
| **AS** | Creates an alias for a stage (e.g., `AS build`), allowing you to refer to it later. |
| **ARG** | Defines a variable that can be passed to the builder at build-time (e.g., `Release` vs `Debug`). |
| **WORKDIR** | Sets the working directory for any subsequent instructions (like `RUN` or `COPY`). |
| **COPY** | Copies files or directories from your local machine into the container. |
| **RUN** | Executes a command inside the container during the build process. |
| **EXPOSE** | Tells Docker that the container will listen on specific ports at runtime. |
| **USER** | Sets the user ID (UID) to run the application, improving security by not running as root. |
| **ENTRYPOINT** | Configures the container to run as an executable (e.g., starting the .NET app). |

---

### 5. How to Build and Run Your Image

To build and run this image manually from your terminal, follow these steps:

#### Step 1: Build the Image
Open your terminal at the project root (where the `.sln` file usually is) and run:
```bash
docker build -t gateway-ocelot -f Gateway.Ocelot/Dockerfile .
```
- `-t gateway-ocelot`: Tags the image name.
- `-f Gateway.Ocelot/Dockerfile`: Specifies where the Dockerfile is located.
- `.`: The context (tells Docker to use the current folder as the base for file paths).

#### Step 2: Run the Container
```bash
docker run -d -p 8080:8080 --name my-gateway gateway-ocelot
```
- `-d`: Runs the container in the background (detached).
- `-p 8080:8080`: Maps your computer's port 8080 to the container's port 8080.

---

### 6. Summary
Multi-stage builds allow you to have a **heavy build environment** and a **slim runtime environment** in a single Dockerfile. By the time you deploy, your image only contains exactly what it needs to run, keeping it small and fast.

### 7. Further Reading
- [Docker Documentation - Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [.NET Docker Documentation](https://learn.microsoft.com/en-us/dotnet/core/docker/introduction)
