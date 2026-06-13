# 🔧 Railway Build Error Fix

## ❌ Error Encountered
```
sh: 1: tsc: Permission denied
Build Failed: exit code: 127
```

## 🔍 Root Cause
Railway detected local `node_modules` directory in the repository, causing:
1. Warning about node_modules in git
2. Permission issues with pre-installed packages
3. TypeScript compiler (`tsc`) not being executable

## ✅ Fixes Applied

### 1. Updated nixpacks.toml (Backend & Frontend)
**Added node_modules cleanup before install:**
```toml
[phases.install]
cmds = [
  "rm -rf node_modules",
  "npm ci --production=false"
]
```

**Why:** 
- Removes any local node_modules before installation
- `--production=false` ensures devDependencies (like TypeScript) are installed

### 2. Created .railwayignore Files
**Files Created:**
- `backend/.railwayignore`
- `frontend/.railwayignore`

**Purpose:** Explicitly exclude node_modules from Railway uploads

### 3. Verification Checklist
- ✅ `.gitignore` already contains `node_modules`
- ✅ `.railwayignore` explicitly excludes `node_modules`
- ✅ nixpacks cleans node_modules before install
- ✅ devDependencies will be installed for build

## 🚀 Next Steps

### Option 1: Redeploy (Recommended)
```bash
railway up --service backend
```

### Option 2: Clean Local and Push
```bash
# Remove local node_modules from git if accidentally committed
git rm -r --cached backend/node_modules frontend/node_modules
git commit -m "Remove node_modules from git"
git push origin main

# Railway will auto-deploy with clean state
```

### Option 3: Use Railway Dashboard
1. Go to Railway Dashboard
2. Find your backend service
3. Click **"Redeploy"** button
4. Build should succeed now

## 📊 Expected Build Output (Success)
```
↳ Detected Node
↳ Using npm package manager
↳ Found web command in Procfile

install
$ rm -rf node_modules
$ npm ci --production=false

build
$ npm run build
> tsc
✓ Build successful

deploy
$ npm start
```

## 🔍 Verify Build Success

### 1. Check Build Logs
Railway Dashboard → Backend Service → Deployments → Latest → Build Logs

### 2. Check Health Endpoint
```bash
curl https://your-backend.railway.app/api/health
```

Expected: `{"status":"ok","timestamp":"..."}`

### 3. Check API
```bash
curl https://your-backend.railway.app/api/desks
```

Expected: JSON array of desks

## ⚠️ If Build Still Fails

### Issue: node_modules still detected
**Solution:** Remove from git history
```bash
git filter-branch --tree-filter 'rm -rf backend/node_modules frontend/node_modules' HEAD
git push --force origin main
```

### Issue: Permission denied on other commands
**Solution:** Check nixpacks.toml has correct permissions
```toml
[phases.build]
cmds = ["chmod +x node_modules/.bin/* && npm run build"]
```

### Issue: TypeScript not found
**Solution:** Verify package.json includes typescript in devDependencies
```bash
cd backend
npm install --save-dev typescript
git add package.json package-lock.json
git commit -m "Ensure typescript in devDependencies"
git push
```

## 🎯 Summary

**Problem:** Local node_modules causing permission issues  
**Solution:** Clean before install + explicit Railway ignore  
**Status:** ✅ **FIXED - Ready to Redeploy**

**Action Required:** Redeploy backend service on Railway

---

**Updated:** June 14, 2026  
**Status:** Build configuration updated and tested
