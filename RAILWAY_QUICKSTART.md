# 🚂 Railway Quick Start Guide

Deploy Locus to Railway in 10 minutes!

## Step 1: Push to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your Locus repository

## Step 3: Configure Backend Service

Railway will create one service automatically. Configure it as the backend:

1. Click on the service → **Settings**
2. **General** → Name: `backend`
3. **Source**:
   - Root Directory: `/backend`
   - Build Command: Leave empty (uses package.json script)
   - Start Command: Leave empty (uses package.json script)

4. Click **Variables** tab → **+ New Variable** → **Add Reference** → **Public Domain**
   - This creates `RAILWAY_PUBLIC_DOMAIN` variable

5. Add these variables (click **+ New Variable** for each):
   ```
   PORT=4000
   CORS_ORIGIN=*
   DB_PATH=/app/data/locus.db
   ```

6. **Settings** → **Networking** → Click **Generate Domain**
   - Copy this URL (e.g., `backend-production-xxxx.railway.app`) ✅

7. **Settings** → **Volumes** → **+ New Volume**:
   - Mount Path: `/app/data`
   - Click **Add**

## Step 4: Create Frontend Service

1. Click **+ New** → **GitHub Repo** → Select your repository again
2. Click on the new service → **Settings**
3. **General** → Name: `frontend`
4. **Source**:
   - Root Directory: `/frontend`
   - Build Command: Leave empty
   - Start Command: Leave empty

5. Click **Variables** tab → Add this variable:
   ```
   VITE_API_URL=https://[YOUR-BACKEND-URL]
   ```
   Replace `[YOUR-BACKEND-URL]` with the backend URL from Step 3.6

6. **Settings** → **Networking** → Click **Generate Domain**
   - This is your app URL! 🎉

## Step 5: Deploy & Test

1. Both services will automatically deploy (watch the logs)
2. Once deployed, click the frontend domain to open your app
3. Test login with demo credentials:
   - **Email**: `admin@locus.edu`
   - **Password**: `password123`

## ✅ You're Done!

Your app is now live on Railway with:
- ✅ Real-time WebSocket updates
- ✅ Persistent SQLite database
- ✅ Automatic HTTPS
- ✅ Auto-deployments on git push

---

## Common Issues

### "Can't connect to backend"
- Check that `VITE_API_URL` in frontend variables matches your backend URL
- Make sure backend URL includes `https://`

### "Database not persisting"
- Verify volume is mounted at `/app/data` in backend service
- Check `DB_PATH=/app/data/locus.db` in backend variables

### Build fails
- Check the deployment logs for specific errors
- Verify `npm run build` works locally first

---

## Next Steps

- Update `CORS_ORIGIN` to your frontend URL (not `*`) for security
- Change default passwords
- Set up custom domain
- Monitor usage on Railway dashboard

Need more details? See `RAILWAY_DEPLOYMENT.md`
