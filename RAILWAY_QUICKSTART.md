# 🚂 Railway Quick Start Guide - WHITE SCREEN FIXED ✅

Deploy Locus to Railway in 10 minutes!

> **⚠️ Important Update**: The white screen issue has been fixed by replacing `serve` with Express.js static server.

## Step 1: Push Latest Changes to GitHub

Make sure the latest fixes are pushed to your GitHub repository:

```bash
git add .
git commit -m "fix: Replace serve with Express for Railway deployment"
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
   NODE_ENV=production
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

5. Click **Variables** tab → Add these variables:
   ```
   VITE_API_URL=https://[YOUR-BACKEND-URL]
   NODE_ENV=production
   ```
   Replace `[YOUR-BACKEND-URL]` with the backend URL from Step 3.6

6. **Settings** → **Networking** → Click **Generate Domain**
   - This is your app URL! 🎉

## Step 5: Deploy & Test

1. Both services will automatically deploy (watch the logs)
2. Once deployed, click the frontend domain to open your app
3. **Open Browser DevTools → Console** to see debug logs:
   ```
   Locus Frontend Starting...
   API URL: https://your-backend.up.railway.app
   Root element found, rendering app...
   App rendered successfully
   ```
4. Test login with demo credentials:
   - **Email**: `admin@locus.edu`
   - **Password**: `password123`

## ✅ You're Done!

Your app is now live on Railway with:
- ✅ Real-time WebSocket updates
- ✅ Persistent SQLite database
- ✅ Automatic HTTPS
- ✅ Auto-deployments on git push
- ✅ **WHITE SCREEN FIXED** - Now uses Express.js for static file serving
- ✅ Error boundary for better error handling
- ✅ Debug logging for troubleshooting

---

## Common Issues

### White Screen (FIXED ✅)
**Solution Applied**:
- Replaced `serve` with Express.js static server
- Added error boundary component
- Added debug logging in console
- Updated `frontend/server.js`, `Procfile`, `nixpacks.toml`

**To verify fix**:
1. Open browser DevTools → Console tab
2. Look for: "Locus Frontend Starting..." and "App rendered successfully"
3. Check Network tab for 200 status on `/assets/*` files

### "Can't connect to backend"
- Check that `VITE_API_URL` in frontend variables matches your backend URL
- Make sure backend URL includes `https://`
- Verify backend service is running (check logs)

### "Database not persisting"
- Verify volume is mounted at `/app/data` in backend service
- Check `DB_PATH=/app/data/locus.db` in backend variables

### Build fails
- Check the deployment logs for specific errors
- Verify `npm run build` works locally first
- Ensure `server.js` exists in frontend directory

### MIME type errors
- ✅ Fixed by using Express.js instead of `serve`
- Express properly serves JavaScript with `application/javascript` MIME type

---

## What Changed in the Fix

### Files Modified:
1. ✅ `frontend/server.js` (NEW) - Express static file server
2. ✅ `frontend/package.json` - Added `express`, removed `serve`, added `start` script
3. ✅ `frontend/Procfile` - Changed to `node server.js`
4. ✅ `frontend/nixpacks.toml` - Changed start command
5. ✅ `frontend/.railwayignore` - Added `server.js`
6. ✅ `frontend/src/main.tsx` - Added error boundary and logging
7. ✅ `frontend/src/components/ErrorBoundary.tsx` (NEW)

### Why Express?
- ✅ Reliable static file serving
- ✅ Correct MIME types for JavaScript modules
- ✅ SPA routing support (catch-all route)
- ✅ Better error handling
- ✅ Production-ready

---

## Next Steps

- Update `CORS_ORIGIN` to your frontend URL (not `*`) for security
- Change default passwords
- Set up custom domain
- Monitor usage on Railway dashboard
- Check browser console for any warnings or errors

Need more details? See:
- `RAILWAY_DEPLOYMENT.md` - Full deployment guide
- `WHITE_SCREEN_FIX.md` - Detailed fix documentation

---

**Last Updated**: 2026-06-14  
**Status**: ✅ Production Ready (White Screen Fixed)
