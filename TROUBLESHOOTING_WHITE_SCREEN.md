# 🔍 WHITE SCREEN TROUBLESHOOTING GUIDE

## ✅ Latest Fix Applied - Commit: 7bca539

---

## 🚨 IMMEDIATE STEPS TO FIX YOUR DEPLOYMENT

### Step 1: Push Latest Changes
```bash
git push origin main
```

### Step 2: Wait for Railway to Rebuild (2-3 minutes)
Railway will automatically rebuild your frontend service.

### Step 3: Test These URLs (Replace with your Railway frontend URL)

```bash
# Test 1: Check if server is running
https://your-frontend.up.railway.app/health

# Expected response:
{
  "status": "ok",
  "port": 3000,
  "distPath": "/app/dist",
  "time": "2026-06-14T..."
}

# Test 2: Check if files exist
https://your-frontend.up.railway.app/debug

# Expected response:
{
  "distPath": "/app/dist",
  "indexPath": "/app/dist/index.html",
  "indexExists": true,
  ...
}

# Test 3: Simple test page
https://your-frontend.up.railway.app/test.html

# Should show: "✅ Server is Working!"

# Test 4: Main app
https://your-frontend.up.railway.app/

# Should load your React app
```

---

## 🔧 WHAT WE FIXED

### Fix #1: Removed `dist/` from .railwayignore
**Problem**: dist folder was being excluded  
**Solution**: Removed exclusion (Railway builds it during deployment anyway)

### Fix #2: Added Debug Endpoints
- `/health` - Check if server is running
- `/debug` - Check if dist files exist
- `/test.html` - Simple HTML page to test server

### Fix #3: Enhanced Error Handling
```javascript
res.sendFile(indexPath, (err) => {
  if (err) {
    console.error('Error sending index.html:', err);
    res.status(500).send('Error loading application');
  }
});
```

### Fix #4: Better Logging
Server now logs:
- Port number
- dist path
- Health check URL
- Debug URL

---

## 🐛 DEBUGGING CHECKLIST

### If Still White Screen:

#### 1. Check Railway Deployment Logs
Go to Railway → Your Frontend Service → Deployments → Latest Build

**Look for**:
```
✓ built in 18s
Frontend server running on port 3000
Serving static files from: /app/dist
Health check available at: http://0.0.0.0:3000/health
```

#### 2. Check Browser Console (F12)
**Should see:**
```
Locus Frontend Starting...
API URL: https://your-backend.up.railway.app
Root element found, rendering app...
App rendered successfully
```

**If you see errors**, note them and check below.

#### 3. Check Browser Network Tab (F12 → Network)
**Should see:**
- ✅ `/` → 200 (text/html)
- ✅ `/assets/index-*.js` → 200 (application/javascript)
- ✅ `/assets/index-*.css` → 200 (text/css)

**If 404 errors**, the dist folder wasn't built properly.

#### 4. Test Debug Endpoints

```bash
# Test health
curl https://your-frontend.up.railway.app/health

# Test debug
curl https://your-frontend.up.railway.app/debug
```

---

## 🚑 COMMON ISSUES & SOLUTIONS

### Issue 1: `/debug` shows `indexExists: false`
**Problem**: dist folder not built during deployment  
**Solution**:
1. Check Railway logs for build errors
2. Verify `npm run build` works locally
3. Check `nixpacks.toml` has: `cmds = ["npm run build"]`

### Issue 2: 404 on `/assets/*.js`
**Problem**: Static files not being served  
**Solution**:
1. Check server.js has `express.static`  BEFORE catch-all route
2. Verify dist/assets/ folder exists in deployment
3. Test `/test.html` - if this works, static serving is working

### Issue 3: MIME Type Error Still Appears
**Problem**: Catch-all intercept ing assets OR wrong content-type  
**Solution**: Check server.js has asset exclusions in catch-all route

### Issue 4: "Module not found" errors
**Problem**: Missing environment variable VITE_API_URL during build  
**Solution**: 
1. Check Railway environment variables
2. VITE_API_URL must be set BEFORE build
3. Verify in debug output

### Issue 5: Blank page, no errors
**Problem**: React app failing silently  
**Solution**:
1. Check if error boundary is showing errors
2. Test if backend is accessible: `curl https://backend-url/api/health`
3. Check CORS - backend must allow frontend domain

---

## 🎯 VERIFY ENVIRONMENT VARIABLES

### In Railway Dashboard:

**Frontend Service → Variables:**
```bash
VITE_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
PORT=3000  # Auto-set by Railway
```

**Backend Service → Variables:**
```bash
CORS_ORIGIN=https://your-frontend.up.railway.app
DB_PATH=/data/locus.db
NODE_ENV=production
PORT=4000  # Auto-set by Railway
```

---

## 📝 STEP-BY-STEP DEBUGGING

### Step 1: Is the server running?
```bash
curl https://your-frontend.up.railway.app/health
```
- ✅ **200 response**: Server is running → Go to Step 2
- ❌ **No response/error**: Check Railway logs, service might be crashed

### Step 2: Do the files exist?
```bash
curl https://your-frontend.up.railway.app/debug
```
- ✅ **`indexExists: true`**: Files built → Go to Step 3
- ❌ **`indexExists: false`**: Build failed → Check Railway build logs

### Step 3: Can you access test page?
```bash
curl https://your-frontend.up.railway.app/test.html
```
- ✅ **HTML returned**: Static serving works → Go to Step 4
- ❌ **404 or error**: Static middleware issue → Check server.js

### Step 4: Can you access main app?
Open browser: `https://your-frontend.up.railway.app/`
- ✅ **App loads**: Success! 🎉
- ❌ **White screen**: Check browser console for React errors

### Step 5: Check browser console
Open DevTools (F12) → Console tab
- Look for: "Locus Frontend Starting..."
- Look for any red errors
- Check Network tab for failed requests

---

## 🔄 FORCE CLEAN DEPLOYMENT

If nothing works, try a clean deployment:

```bash
# 1. Delete node_modules and dist locally
rm -rf frontend/node_modules frontend/dist

# 2. Rebuild locally to verify it works
cd frontend
npm install
npm run build
npm start
# Visit http://localhost:3000 - should work

# 3. If local works, push and redeploy
git add -A
git commit -m "Clean rebuild"
git push origin main

# 4. In Railway dashboard:
# - Go to Frontend Service → Deployments
# - Click "Redeploy" on latest deployment
# - Or trigger new deployment by pushing empty commit:
git commit --allow-empty -m "Trigger Railway rebuild"
git push origin main
```

---

## 🆘 EMERGENCY FIX: Use Vercel Instead

If Railway continues to have issues, deploy frontend to Vercel:

```bash
cd frontend
npx vercel --prod

# Set environment variable in Vercel dashboard:
VITE_API_URL=https://your-backend.up.railway.app

# Update backend CORS_ORIGIN to Vercel URL
```

---

## 📊 CHECKLIST BEFORE ASKING FOR HELP

If you need to ask for help, provide:

- [ ] Railway deployment logs (full output)
- [ ] Browser console screenshot (with errors)
- [ ] Browser Network tab screenshot (showing failed requests)
- [ ] Output of: `curl https://your-frontend.up.railway.app/health`
- [ ] Output of: `curl https://your-frontend.up.railway.app/debug`
- [ ] Railway environment variables (frontend and backend)
- [ ] Latest git commit hash: `git log -1 --oneline`

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

1. ✅ `/health` returns `{"status":"ok"}`
2. ✅ `/debug` returns `"indexExists":true`
3. ✅ `/test.html` shows "Server is Working!"
4. ✅ Browser console shows "App rendered successfully"
5. ✅ No 404 errors in Network tab
6. ✅ Landing page displays correctly
7. ✅ Can navigate to /login
8. ✅ Can interact with the app

---

## 🎯 FINAL NOTES

**All fixes have been applied in commit 7bca539.**

**Push to GitHub now:**
```bash
git push origin main
```

**Then test the URLs above to diagnose any remaining issues.**

If you still see white screen after:
1. Pushing latest changes
2. Waiting for Railway to rebuild
3. Testing /health, /debug, /test.html

Then send me the output of those test URLs and browser console errors.

---

**Status**: 🟡 Awaiting Railway rebuild  
**Next Step**: Push to GitHub and test debug endpoints  
**ETA**: App should work after deployment completes (2-3 min)
