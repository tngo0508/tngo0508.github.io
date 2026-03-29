---
title: "Dockerfile for Beginners: A Step-by-Step Guide"
excerpt: "Learn the basics of Dockerfiles, how they work, and how to create your first container image from scratch."
date: 2026-03-28
categories:
  - Docker
  - DevOps
tags:
  - Docker
  - Containers
  - Beginners
toc: true
toc_label: "In this post"
---

### 1. What is a Dockerfile?

A **Dockerfile** is a simple text document that contains all the commands a user could call on the command line to assemble an image. 

Think of it as a **recipe**: 
- The **Dockerfile** is the recipe.
- The **Image** is the dish you've prepared (but not eaten yet).
- The **Container** is the actual meal on the table, ready to be enjoyed.

By using a Dockerfile, you can automate the process of creating Docker images, ensuring that your application runs the same way every time, regardless of where it's deployed.

### 2. Common Dockerfile Instructions

Here are the most common instructions you'll see in a Dockerfile:

| Instruction | What it does |
| :--- | :--- |
| **FROM** | Sets the base image (e.g., `node:18`, `python:3.9`, `ubuntu:latest`). |
| **WORKDIR** | Sets the working directory inside the container. |
| **COPY** | Copies files from your local machine into the container. |
| **RUN** | Executes commands during the build process (e.g., `apt-get install` or `npm install`). |
| **EXPOSE** | Documents which port the container will listen on at runtime. |
| **CMD** | Provides the default command to run when the container starts. |

### 3. A Simple Example

Let's create a simple Dockerfile for a "Hello World" Python script.

**app.py**
```python
print("Hello from inside the Docker container!")
```

**Dockerfile**
```dockerfile
# 1. Use an official Python runtime as a parent image
FROM python:3.9-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy the current directory contents into the container at /app
COPY . .

# 4. Run the application when the container launches
CMD ["python", "app.py"]
```

### 4. How to Build and Run

Once you have your `Dockerfile` and `app.py` in the same folder, you can build your image and run it using the following commands:

#### Step 1: Build the Image
```bash
docker build -t my-first-image .
```
- `-t my-first-image`: This "tags" your image with a friendly name.
- `.`: This tells Docker to look for the Dockerfile in the current directory.

#### Step 2: Run the Container
```bash
docker run my-first-image
```
You should see the output: `Hello from inside the Docker container!`

### 5. Best Practices for Beginners

1.  **Keep it Small**: Use "slim" or "alpine" versions of base images to reduce the size.
2.  **Order Matters**: Docker uses a "layer cache." Put instructions that change frequently (like `COPY . .`) near the bottom of the file.
3.  **One Process Per Container**: A container should generally do one thing (e.g., run a web server, not a web server and a database).

### 6. Summary

The Dockerfile is the foundation of containerization. It allows you to define your environment as code, making your applications portable and reproducible. Start simple, use official images, and gradually add more complexity as your needs grow.

### 7. Further Reading
- [Explaining the .NET Multi-Stage Dockerfile]({{ site.baseurl }}{% post_url 2026-03-28-dotnet-dockerfile-explained %})
- [Docker Documentation - Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
