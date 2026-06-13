# 🚀 Locus Deployment Guide

This guide will help you deploy the Locus Library Desk Management System to production.

## 📋 Prerequisites

- GitHub account (already set up ✓)
- Vercel account (free tier)
- Render account (free tier)

---

## 🎯 Deployment Strategy

**Frontend**: Vercel (React/Vite app)  
**Backend**: Render (Node.js/Express API)  
**Database**: SQLite (included with backend)

---

## 🌐 Part 1: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project

1. Click "Add New" → "Project"
2. Find "Locus" repository and click "Import"
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables (Optional)

In Vercel project settings → Environment Variables:
```
VITE_API_URL=your-backend-url-here (add this after deploying backend)
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://locus-abc123.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 🔧 Part 2: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub

### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository "Locus"
3. Configure:
   - **Name**: `locus-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables

In Render dashboard → Environment:
```
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./locus.db
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. You'll get a URL like: `https://locus-backend.onrender.com`

### Step 5: Update Frontend API URL

1. Go back to Vercel
2. Project Settings → Environment Variables
3. Update `VITE_API_URL` to your Render backend URL
4. Redeploy frontend

---

## 🔄 Part 3: Connect Frontend & Backend

### Update Frontend API Calls

Before deploying, update the API URL in your frontend:

**Option A: Environment Variable (Recommended)**

1. Create `frontend/.env.production`:
```env
VITE_API_URL=https://locus-backend.onrender.com
```

2. Update fetch calls to use environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
fetch(`${API_URL}/api/desks`)
```

**Option B: Direct URL**

Replace all `http://localhost:4000` with your Render backend URL in:
- `frontend/src/pages/StudentDashboard.tsx`
- `frontend/src/pages/SeatFinder.tsx`
- `frontend/src/pages/CheckIn.tsx`
- `frontend/src/pages/MapView.tsx`
- `frontend/src/pages/DeskList.tsx`

### Enable CORS on Backend

Make sure your backend allows your frontend domain:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://locus-abc123.vercel.app',  // Add your Vercel URL
    'https://your-custom-domain.com'     // Add custom domain if any
  ],
  credentials: true
}));
```

---

## 📱 Alternative Deployment Options

### Option 2: Netlify (Frontend Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select your GitHub repo
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Deploy

### Option 3: Railway (Backend Alternative)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select Locus repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

### Option 4: Full Stack on Render

Deploy both frontend and backend on Render:

**Frontend**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

**Backend**: Web Service (same as above)

---

## 🔐 Security Checklist

Before going live:

- [ ] Remove all console.log statements
- [ ] Add rate limiting to API endpoints
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up proper CORS origins
- [ ] Add authentication for staff portal
- [ ] Implement proper error handling
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure environment variables securely
- [ ] Add .env files to .gitignore
- [ ] Review and minimize exposed API endpoints

---

## 🎨 Post-Deployment Steps

### 1. Test Your Deployment

- [ ] Visit your Vercel URL
- [ ] Test all navigation links
- [ ] Check student portal functionality
- [ ] Test staff portal features
- [ ] Verify map view loads correctly
- [ ] Test check-in functionality
- [ ] Check mobile responsiveness

### 2. Monitor Performance

**Vercel Analytics** (Free):
- Go to Project → Analytics
- Monitor page views, performance metrics

**Render Metrics**:
- Check CPU, memory usage
- Monitor response times
- View logs for errors

### 3. Set Up Custom Domain

**Vercel**:
1. Buy domain from Namecheap, Google Domains, etc.
2. Add domain in Vercel project settings
3. Update DNS records as instructed

**Example**: `www.locus-library.com`

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails**:
```bash
cd frontend
npm install
npm run build
```
Check console for specific errors.

**Blank page after deployment**:
- Check browser console for errors
- Verify API URL is correct
- Check CORS settings on backend

### Backend Issues

**API not responding**:
- Check Render logs
- Verify environment variables
- Test API directly: `https://your-backend.onrender.com/api/desks`

**Database errors**:
- Ensure SQLite file is created
- Check write permissions
- Verify DATABASE_URL env variable

### CORS Errors

Add frontend URL to backend CORS:
```typescript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

---

## 💰 Cost Breakdown

### Free Tier (Sufficient for Development)

**Vercel**:
- ✓ 100 GB bandwidth/month
- ✓ Unlimited projects
- ✓ Automatic HTTPS
- ✓ Custom domains

**Render**:
- ✓ 750 hours/month free
- ✓ Automatic HTTPS
- ✓ 512 MB RAM
- ⚠️ Sleeps after 15 min inactivity (1-2 sec cold start)

**Total**: $0/month

### Paid Plans (For Production)

**Vercel Pro** ($20/month):
- More bandwidth
- Better performance
- Team collaboration

**Render Starter** ($7/month):
- No sleep
- More RAM/CPU
- Better uptime

**Total**: ~$27/month for production-ready

---

## 🚀 Quick Deploy Commands

### Build Frontend Locally
```bash
cd frontend
npm run build
```

### Test Production Build Locally
```bash
cd frontend
npm run preview
```

### Build Backend Locally
```bash
cd backend
npm run build
npm start
```

---

## 📊 Monitoring & Analytics

### Recommended Tools (Free Tiers)

1. **Google Analytics** - User tracking
2. **Sentry** - Error monitoring
3. **Uptime Robot** - Uptime monitoring
4. **Vercel Analytics** - Built-in performance metrics
5. **Render Metrics** - Built-in server monitoring

---

## ✅ Deployment Checklist

- [ ] Build frontend succeeds (`npm run build`)
- [ ] Build backend succeeds (TypeScript compiles)
- [ ] All environment variables configured
- [ ] CORS configured correctly
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] API URL updated in frontend
- [ ] Test all features work in production
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled (automatic)
- [ ] Monitoring tools set up
- [ ] Error tracking configured

---

## 🎓 Learning Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🆘 Need Help?

1. Check deployment logs on Vercel/Render
2. Review browser console for frontend errors
3. Test API endpoints directly
4. Check GitHub Actions for build errors
5. Review this guide's troubleshooting section

---

**Ready to deploy? Start with Part 1: Deploy Frontend to Vercel! 🚀**
