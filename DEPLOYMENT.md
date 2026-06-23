# HostelHub Deployment Guide

This guide describes how to push your project to a new GitHub repository and deploy the full-stack application (Spring Boot + React + PostgreSQL) to production.

---

## 1. Push to GitHub

Since a new git repository has already been initialized locally and all files are committed, you just need to link it to your GitHub account:

1. Go to [GitHub](https://github.com/) and log in.
2. Click the **"+"** icon in the top-right corner and select **"New repository"**.
3. Name your repository `HostelHub` and click **"Create repository"** (do NOT initialize it with README, .gitignore, or license since we already have them).
4. Run the following commands in your terminal inside the project directory:

```bash
# Rename the default branch to 'main'
git branch -M main

# Add your GitHub repository as the remote origin (Replace with your actual GitHub URL)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/HostelHub.git

# Push your code to GitHub
git push -u origin main
```

---

## 2. Database & Backend Deployment

You can deploy the Spring Boot backend and PostgreSQL database on services like **Render** or **Railway**. Render is highly recommended since it is free and simple.

### Step A: Spin up a PostgreSQL Database on Render
1. Go to [Render](https://render.com/) and create a free account.
2. Click **"New"** in the top-right corner and select **"PostgreSQL"**.
3. Name it `hostelhub-db`, choose a region near you, and select the **"Free"** tier.
4. Click **"Create Database"**.
5. Once active, copy the **"Internal Database URL"** (used if deploying backend on Render) or **"External Database URL"** (used to connect from outside Render).

### Step B: Deploy the Backend on Render
1. Click **"New"** in the top-right and select **"Web Service"**.
2. Connect your GitHub account and choose your `HostelHub` repository.
3. Configure the Web Service:
   - **Name:** `hostelhub-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (Render will build a Dockerfile if present) or **Java** (select Maven build command).
     - *If choosing Maven build/run commands:*
     - **Build Command:** `./mvnw clean package -DskipTests`
     - **Start Command:** `java -jar target/hostelhub-0.0.1-SNAPSHOT.jar`
4. Click **"Advanced"** to add **Environment Variables**:
   - `SPRING_DATASOURCE_URL` = (Paste the Render Database URL)
   - `SPRING_DATASOURCE_USERNAME` = (Your database username from Render)
   - `SPRING_DATASOURCE_PASSWORD` = (Your database password from Render)
   - `APP_JWT_SECRET` = (Use a random 64-character hex string, e.g. `9a67a8698c42b039473fbcdb3cb306a4b18c0c4e1f7481c4e976db553a123bc6`)
   - `APP_BACKEND_URL` = (Your deployed backend's URL, e.g. `https://hostelhub-backend.onrender.com`)
   - **Note on Images:** Since Render has ephemeral storage (local files are deleted when the service restarts), fill in the **Cloudinary** credentials to store images permanently:
     - `CLOUDINARY_CLOUD_NAME` = (Your Cloudinary cloud name)
     - `CLOUDINARY_API_KEY` = (Your Cloudinary API key)
     - `CLOUDINARY_API_SECRET` = (Your Cloudinary API secret)
5. Click **"Create Web Service"**. Render will compile and launch the backend.

---

## 3. Frontend Deployment

You can deploy the React frontend on **Vercel** or **Netlify**. Both are free and link directly to your GitHub repository.

### Deploy on Netlify / Vercel:
1. Log in to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Select **"Import Project"** from GitHub and choose `HostelHub`.
3. Configure the build parameters:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://YOUR_BACKEND_URL.onrender.com/api` (Use the actual URL of your deployed Render backend web service, with `/api` appended).
5. Click **"Deploy"**. Your frontend will build and launch in seconds!

> [!NOTE]
> Netlify and Vercel automatically support single-page application routing, but if you encounter any `404` errors when reloading routes like `/marketplace` or `/login`, add a redirect file:
> - **For Netlify:** Create a file named `_redirects` inside the `public` folder with:
>   `/* /index.html 200`
> - **For Vercel:** Create a `vercel.json` file in the `frontend` folder with routing rewrites.
