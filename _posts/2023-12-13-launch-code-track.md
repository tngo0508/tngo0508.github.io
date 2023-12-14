---
title: "Back in the Leetcode Arena After the CodeTrack Launch — Hardcore Mode Activated"
date: 2023-12-13
toc: true
toc_label: "Page Navigation"
toc_sticky: true
---
# Revised Plan
- [x] Landing/Home Page on CodeTrack
- [x] Deployment Project
- [x] Testing
- [ ] Figure out how to use Azure Key Vault to keep secret
- [x] Solve Leetcode problem
- [ ] Research DocFx for documentation

# Noteworthy Progress: Successful Deployment of CodeTrack's Initial Release
Over the past two days, my primary focus has been the CodeTrack project. I successfully implemented the landing/home page for the application, dedicating a substantial amount of time to researching and refining the UI for a visually appealing and user-friendly experience.

## Landing Page Design Details
My vision for the landing page involved dividing it into three distinct sections. In the first section, I incorporated a captivating video loop as the background, with centered text overlaid. To enhance this section, I utilized [Typed.js](https://github.com/mattboldt/typed.js) for engaging text animations. The second section featured a split layout, with each side showcasing images, demo charts, and compelling bullet points to grab users' attention. In the final section, I provided additional information about key features, such as import and export functionalities, to promote the web application.

## Implementation Challenges and Learning
Upon finalizing the page layout, I delved into the implementation phase, encountering challenges in fine-tuning various CSS properties and Bootstrap elements. Despite the meticulous nature of the task, it allowed me to gain valuable experience in creating aesthetically pleasing websites using HTML/CSS and Bootstrap.

One particularly valuable lesson learned during this process was how to create a wave divider between the two sections. Leveraging an excellent tool called [getwave](https://getwaves.io/), I generated a wave figure in SVG format and used CSS to position it at the bottom of a section. Additionally, I applied the overlay class to dim the background, enhancing text visibility for the user.

![homepage-first-section](/assets/images/homepage-first-section.gif)
For reference, below is the code snippet depicting how to create the wave divider.

```html
 <div class="row">
     <div id="video-container">
         <video id="background-video" autoplay muted loop>
             <source src="~/video/background-video.mp4" type="video/mp4">
             Your browser does not support the video tag.
         </video>
         <div class="overlay"></div>
         <div class="content">
             <div class="jumbotron text-center">
                 <h1 id="typed-output" class="text-white" style="min-height:10px"></h1>
                 <p>
                    Welcome to CodeTrack
                 </p>
             </div>
         </div>
         <svg class="wave-divider" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="white" fill-opacity="1" d="M0,224L80,208C160,192,320,160,480,176C640,192,800,256,960,261.3C1120,267,1280,213,1360,186.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
     </div>
 </div>
```

```css
#video-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100vh;
}
#background-video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    z-index: -1;
}
.content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    color: #fff;
    text-align: center;
    padding: 20px;
}
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Adjust the opacity here */
    z-index: 0;
}
.wave-divider {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: auto;
    /*transform: rotate(180deg);*/ /* Flip the wave upside down */
}
```


And here is the finalized version of my home page:
![final result](/assets/images/screencapture-codetrack-azurewebsites-net-2023-12-13-23_06_08.png)

# Deployment on Azure
After completing the home page, I delved into the deployment process for my application. I opted to use Microsoft Azure services to host my web application. This involved creating several Azure services, including SQL databases, App Services, and Key Vault, to facilitate a smooth deployment.
![Azure resource](/assets/images/azure-resources.png)

The deployment journey provided a significant learning experience. Initially, I encountered a deployment failure related to the version of .NET. To troubleshoot, I examined the CI/CD pipeline in GitHub Actions.

![deployment-log](/assets/images/2023-12-13_23-13-40-deployment-log.png)

![GitHub Action](/assets/images/2023-12-13_23-17-00-github-action.png)

Subsequently, I faced a peculiar issue. While I intended to add a secret to the Key Vault and configured the application to retrieve it, the deployed application showed an HTTP 500 error. Despite successful deployment status, the issue persisted. As a temporary solution, I rolled back to a previous commit and created `appsettings.production.json`. I plan to explore and share the solution for utilizing the Key Vault in future posts. For now, I've made my GitHub repository private to safeguard the secrets.

Voila! My web application is live and operational, despite some lingering bugs and issues. I'm content with the progress made. The next steps involve stabilizing the application and integrating Key Vault functionality.

Feel free to visit my web application at this URL: [CodeTrack Web Application](https://codetrack.azurewebsites.net/)

# For Future Me
Remember, progress is progress, no matter how small. Each step forward gets you closer to your goals. Don't give up—embrace the challenges, learn from them, and keep going.


