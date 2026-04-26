# Deployment Guide: TaskFlow Pro 🚀

This guide provides step-by-step instructions to deploy your project into a full production environment exactly as it works locally.
- **Frontend**: Netlify (Free and excellent for React apps)
- **Backend**: Render (Reliable and free Python hosting)
- **Database**: Render PostgreSQL (Managed cloud database)

---

## Part 1: Prepare Your Project for GitHub
Both Netlify and Render deploy your code automatically when you push the code to a Git repository.
1. Go to [GitHub](https://github.com/) and create a new, empty repository.
2. In your local project terminal (Command Prompt or PowerShell), run:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

---

## Part 2: Deploy the Database (Render)
1. Sign up/Log in to [Render.com](https://render.com/).
2. Click **New** -> **PostgreSQL**.
3. Fill in the details:
   - **Name**: `taskflow-db`
   - **Database**: `taskflow`
   - **User**: (Leave random or pick one)
   - **Region**: Pick the one closest to you.
   - **Instance Type**: Free
4. Click **Create Database**.
5. Once created, look for the **Internal Database URL** and **External Database URL**. 
   *Keep this page open! You will need the Internal URL for the Backend deployment.*

---

## Part 3: Deploy the Backend (Render)
*Since the database and backend are both on Render, they can communicate securely via the internal network.*

1. In the Render Dashboard, click **New** -> **Web Service**.
2. Connect your GitHub account and select your repository.
3. Configure the Web Service:
   - **Name**: `taskflow-backend` (or similar)
   - **Root Directory**: `backend` *(Crucial!)*
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
4. Scroll down to **Environment Variables** and add the following:
   - `PYTHON_VERSION`: `3.11.9` *(Crucial! Prevents psycopg2 deployment errors)*
   - `DATABASE_URL`: *(Paste the **Internal Database URL** generated in Part 2)*
   - `SECRET_KEY`: *(Generate one securely: run `python -c "import secrets; print(secrets.token_hex(32))"` in any terminal and paste the result here)*
   - `ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `43200`
   - **SendGrid Email configuration (No SMTP blockages)**:
     - `SENDGRID_API_KEY`: *(Get this from app.sendgrid.com -> Settings -> API Keys)*
     - `SENDGRID_FROM_EMAIL`: *(Your verified sender email in SendGrid)*
5. Click **Create Web Service**.
6. Wait 3-5 minutes for the build to finish. Once it says **Live**, copy your backend's unique URL (e.g., `https://taskflow-backend.onrender.com`).

---

## Part 4: Connect Frontend to the Deployed Backend
Your frontend proxy setting in `package.json` (`http://127.0.0.1:8000`) only works for local development. We need to point the frontend to the real backend URL!

1. Open your frontend source code (e.g., `frontend/src/services/api.js` or wherever you make Axios/fetch requests).
2. Look for the base API URL setup. It should be dynamically pointing to an environment variable, like this:

   ```javascript
   // Change from localhost to use an environment variable:
   const API_URL = process.env.REACT_APP_API_URL || '';
   ```
   *If your frontend currently relies purely on the proxy in `package.json`, you must update all your `axios.get('/api/...')` endpoints to be `axios.get(`${process.env.REACT_APP_API_URL}/api/...`)*

3. Once you make this codebase change, commit and push it to GitHub:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

---

## Part 5: Deploy the Frontend (Netlify)
1. Sign up/Log in to [Netlify.com](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize it. Pick your project repository.
4. Configure the build settings:
   - **Base directory**: `frontend` *(Crucial!)*
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. Click **Show advanced** -> **New Variable** and add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: *(Paste your Render backend URL from Part 3, e.g., `https://taskflow-backend.onrender.com`)*
   *(Note: Make sure there's no trailing slash at the end of the URL!)*
6. Click **Deploy site**.
7. Netlify will build your React application. Because we already have the `netlify.toml` file in the root, client-side routing (React Router) will work perfectly!
8. When the deployment finishes, Netlify will give you a live public URL! 

---

### 🎉 You're Done!
Go to the public Netlify URL. Your application is now fully live, communicating securely with your hosted Render python backend, which is storing data in your Render managed PostgreSQL database!
