# 🚀 Deployment Guide

Complete guide to deploy the ApexAPI Testing Platform (both backend and frontend).

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Recommended Platforms](#recommended-platforms)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Database Setup](#database-setup)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment Steps](#post-deployment-steps)
9. [Alternative: Railway Deployment](#alternative-railway-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Deployment Overview

This project consists of:
- **Backend**: Node.js/Express API server with PostgreSQL database
- **Frontend**: React/Vite application

**Recommended Deployment Strategy:**
- **Frontend**: Vercel (Best for React/Vite, free tier, automatic deployments)
- **Backend**: Render (Good for Node.js, free tier, PostgreSQL support)
- **Database**: Render PostgreSQL (Free tier available)

---

## ✅ Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** (for connecting repositories)
2. **Render Account** (sign up at [render.com](https://render.com))
3. **Vercel Account** (sign up at [vercel.com](https://vercel.com))
4. **Git Repository** (push your code to GitHub/GitLab/Bitbucket)

---

## 🏆 Recommended Platforms

### Why Vercel for Frontend?
- ✅ Zero-config deployment for React/Vite
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier with generous limits
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs

### Why Render for Backend?
- ✅ Free tier available
- ✅ PostgreSQL database included
- ✅ Automatic deployments from Git
- ✅ Environment variable management
- ✅ Built-in SSL certificates
- ✅ Easy scaling

### Alternative: Railway
- ✅ All-in-one platform (backend + database)
- ✅ Simpler setup
- ✅ Free tier available
- ✅ Automatic deployments

---

## 🗄️ Database Setup

### Option 1: Render PostgreSQL (Recommended)

1. **Create PostgreSQL Database on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `apexapi-db`
   - Database: `apexapi`
   - User: `apexapi_user`
   - Region: Choose closest to your backend
   - Plan: **Free** (or paid for production)
   - Click **"Create Database"**

2. **Copy Connection String:**
   - After creation, you'll see **"Internal Database URL"** and **"External Database URL"**
   - Copy the **External Database URL** (for backend connection)
   - Format: `postgresql://user:password@host:port/database`

### Option 2: Railway PostgreSQL

1. Go to [Railway Dashboard](https://railway.app)
2. Create new project → **"New Database"** → **"PostgreSQL"**
3. Copy the connection string from the database variables

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Create `render.yaml` in backend folder** (optional, for infrastructure as code):

```yaml
services:
  - type: web
    name: apexapi-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: apexapi-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

2. **Create `Procfile` in backend folder** (if not using render.yaml):

```
web: node src/server.js
```

3. **Update `package.json` start script** (already done):
```json
"start": "node src/server.js"
```

### Step 2: Deploy Backend to Render

1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select the repository containing your project

2. **Configure Service:**
   - **Name**: `apexapi-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (or paid for production)

3. **Add Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"** and add:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your-postgresql-connection-string>
   JWT_SECRET=<generate-a-random-secret-key>
   SMTP_HOST=<your-smtp-host-if-using-email>
   SMTP_PORT=587
   SMTP_USER=<your-smtp-email>
   SMTP_PASS=<your-smtp-password>
   SMTP_FROM=<your-from-email>
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Link Database:**
   - In the **"Environment"** section, click **"Link Database"**
   - Select your PostgreSQL database
   - Render will automatically add `DATABASE_URL` if linked

5. **Deploy:**
   - Click **"Create Web Service"**
   - Render will build and deploy your backend
   - Wait for deployment to complete (5-10 minutes)
   - Copy your backend URL (e.g., `https://apexapi-backend.onrender.com`)

### Step 3: Run Database Migrations

After deployment, you need to initialize the database:

1. **Option A: SSH into Render instance** (not available on free tier)
2. **Option B: Create a one-time script** (recommended)

Create `backend/deploy-setup.js`:

```javascript
import pool from './src/config/db.js';
import { ensureDefaultUser } from './src/utils/defaultUser.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
    try {
        console.log('Setting up database...');
        
        // Run fix-database.js logic or import it
        const { default: fixDatabase } = await import('./fix-database.js');
        await fixDatabase();
        
        // Ensure default user
        await ensureDefaultUser();
        
        console.log('✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
```

Then run it manually or add to package.json:
```json
"setup:deploy": "node deploy-setup.js"
```

**Or use Render's Shell** (if available):
- Go to your service → **"Shell"**
- Run: `cd backend && node deploy-setup.js`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. **Update API URL in production:**
   
   The frontend already uses `import.meta.env.VITE_API_URL`, so you just need to set it in Vercel.

2. **Create `vercel.json` in frontend/apitesting folder** (optional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional, can use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Web Interface:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**
   - Import your Git repository
   - Configure project:
     - **Framework Preset**: `Vite`
     - **Root Directory**: `frontend/apitesting`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables:**
   Click **"Environment Variables"** and add:
   ```
   VITE_API_URL=https://apexapi-backend.onrender.com
   ```
   (Replace with your actual backend URL)

4. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Update CORS in Backend

Make sure your backend allows requests from your Vercel domain:

In `backend/src/app.js`, update CORS origins:

```javascript
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-project.vercel.app', // Add your Vercel URL
    'https://*.vercel.app' // Or use wildcard for preview deployments
];
```

Redeploy backend after this change.

---

## 🔐 Environment Variables

### Backend Environment Variables (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` (Render default) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-random-secret-key` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | `your-app-password` |
| `SMTP_FROM` | From email address | `noreply@yourapp.com` |
| `SMTP_SECURE` | Use SSL/TLS | `false` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://apexapi-backend.onrender.com` |

---

## 📝 Post-Deployment Steps

### 1. Initialize Database

After backend is deployed, initialize the database:

**Option A: Use Render Shell** (if available)
```bash
cd backend
node fix-database.js
```

**Option B: Create a setup endpoint** (temporary, remove after use)

Add to `backend/src/app.js`:
```javascript
app.post('/api/setup', async (req, res) => {
    try {
        const { default: fixDatabase } = await import('./fix-database.js');
        await fixDatabase();
        res.json({ success: true, message: 'Database initialized' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
```

Call it once: `POST https://your-backend.onrender.com/api/setup`
Then remove the endpoint.

### 2. Test Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in/signing up
   - Test API requests

### 3. Set Up Custom Domains (Optional)

**Vercel:**
- Go to project settings → **Domains**
- Add your custom domain
- Update DNS records as instructed

**Render:**
- Go to service settings → **Custom Domains**
- Add your domain
- Update DNS records

### 4. Enable Monitoring

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor backend logs in Render dashboard
- Monitor frontend analytics in Vercel

---

## 🚂 Alternative: Railway Deployment

Railway is an all-in-one platform that can host both backend and database.

### Deploy Backend to Railway

1. **Sign up at [railway.app](https://railway.app)**

2. **Create New Project:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository

3. **Add PostgreSQL:**
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
   - Railway automatically creates the database

4. **Configure Backend Service:**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your repository
   - Railway auto-detects Node.js
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `npm start`

5. **Add Environment Variables:**
   - Railway automatically adds `DATABASE_URL` from linked database
   - Add other variables:
     ```
     NODE_ENV=production
     JWT_SECRET=<your-secret>
     PORT=3000
     ```

6. **Deploy:**
   - Railway automatically deploys on every push
   - Get your backend URL from the service

### Deploy Frontend to Railway

1. **Add New Service:**
   - In same project, click **"+ New"** → **"GitHub Repo"**
   - Select repository
   - Set **Root Directory**: `frontend/apitesting`
   - Set **Build Command**: `npm run build`
   - Set **Start Command**: `npx serve -s dist -l 3000`

2. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

3. **Deploy:**
   - Railway builds and deploys automatically

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Database connection fails**
- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure database is accessible (not paused on free tier)
- ✅ Check firewall rules if using external database

**Problem: Build fails**
- ✅ Check Node.js version (Render uses Node 18+)
- ✅ Ensure all dependencies are in `package.json`
- ✅ Check build logs in Render dashboard

**Problem: App crashes on startup**
- ✅ Check environment variables are set
- ✅ Review logs in Render dashboard
- ✅ Test locally with production environment variables

**Problem: CORS errors**
- ✅ Update `allowedOrigins` in `backend/src/app.js`
- ✅ Include your Vercel domain
- ✅ Redeploy backend after changes

### Frontend Issues

**Problem: API calls fail**
- ✅ Check `VITE_API_URL` is set correctly
- ✅ Ensure backend URL is accessible
- ✅ Check browser console for errors
- ✅ Verify CORS is configured in backend

**Problem: Build fails**
- ✅ Check for linting errors: `npm run lint`
- ✅ Ensure all dependencies are installed
- ✅ Check Vercel build logs

**Problem: Blank page after deployment**
- ✅ Check browser console for errors
- ✅ Verify `index.html` is in `dist` folder
- ✅ Check Vercel routing configuration

### Database Issues

**Problem: Tables don't exist**
- ✅ Run `fix-database.js` script
- ✅ Check database connection
- ✅ Review migration scripts

**Problem: Foreign key errors**
- ✅ Ensure all tables are created in order
- ✅ Run `fix-database.js` to add constraints

---

## 📊 Cost Comparison

### Free Tier Limits

**Vercel (Frontend):**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN

**Render (Backend):**
- ⚠️ Free tier spins down after 15 minutes of inactivity
- ✅ 750 hours/month free
- ✅ 512MB RAM
- ✅ Automatic SSL

**Render (PostgreSQL):**
- ✅ 90 days free trial
- ⚠️ Then $7/month for smallest plan

**Railway:**
- ✅ $5 free credit/month
- ✅ Pay-as-you-go after
- ✅ No spin-down

### Production Recommendations

For production, consider:
- **Render**: Paid plan ($7/month) for always-on backend
- **Vercel**: Pro plan ($20/month) for team features
- **Database**: Render PostgreSQL ($7/month) or Railway PostgreSQL

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

1. **Push to `main` branch** → Automatic production deployment
2. **Push to other branches** → Preview deployments (Vercel)
3. **Pull Requests** → Preview deployments for testing

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

## ✅ Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Database created (Render/Railway)
- [ ] Backend deployed to Render/Railway
- [ ] Backend environment variables set
- [ ] Database initialized (run migrations)
- [ ] Backend URL obtained
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set (VITE_API_URL)
- [ ] CORS updated in backend
- [ ] Tested login/signup
- [ ] Tested API requests
- [ ] Custom domains configured (optional)
- [ ] Monitoring set up (optional)

---

## 🎉 You're Done!

Your ApexAPI Testing Platform should now be live! 

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://apexapi-backend.onrender.com`

If you encounter any issues, check the troubleshooting section or review the deployment logs in your platform's dashboard.

