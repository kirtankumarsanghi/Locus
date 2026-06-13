# Local Development vs Vercel Production

## 🏠 Local Development (What you have now)

### Backend
- **Location**: `backend/src/index.ts`
- **Server**: Express.js running on `http://localhost:4000`
- **Database**: SQLite (`backend/locus.db`)
- **Start command**: `cd backend && npm run dev`
- **Data**: Persistent on your computer

### Frontend
- **Location**: `frontend/src/`
- **Server**: Vite dev server on `http://localhost:5173`
- **API URL**: `http://localhost:4000`
- **Start command**: `cd frontend && npm run dev`

---

## ☁️ Vercel Production (What you're deploying)

### Backend
- **Location**: `api/index.ts`
- **Server**: Vercel Serverless Functions
- **Database**: In-memory (⚠️ temporary - needs migration)
- **URL**: `https://your-app.vercel.app/api/*`
- **Data**: Resets on cold starts

### Frontend
- **Location**: `frontend/dist/` (built files)
- **Server**: Vercel CDN (static hosting)
- **API URL**: `https://your-app.vercel.app/api/`
- **URL**: `https://your-app.vercel.app/`

---

## 🔄 Key Differences

| Feature | Local | Production |
|---------|-------|------------|
| **Server Type** | Traditional Express | Serverless Functions |
| **Database** | SQLite (file-based) | Needs cloud database |
| **Data Persistence** | ✅ Saved to disk | ❌ In-memory (temporary) |
| **Cold Starts** | N/A | First request may be slow |
| **Scaling** | Single instance | Auto-scales |
| **Cost** | Free (your computer) | Free tier (Vercel) |
| **URL** | localhost | vercel.app |

---

## 🎯 Why Two Backends?

### `backend/` (Keep for local development)
- Full Express server with SQLite
- Good for development and testing
- Fast and easy to work with
- No internet required

### `api/` (For Vercel deployment)
- Serverless functions
- No persistent file storage
- Requires cloud database for production
- Auto-scales with traffic

---

## 💡 Workflow Recommendation

### For Development (Local)
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

### For Production (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Or push to Git (auto-deploys)
git push origin main
```

Visit: `https://your-app.vercel.app`

---

## 🔧 Switching Between Environments

### Frontend Environment Variables

**Local** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:4000
```

**Production** (Vercel Environment Variables):
```
VITE_API_URL=https://your-app.vercel.app
```

Vite automatically uses `.env.local` for dev and production variables for build.

---

## 🗄️ Database: The Critical Difference

### Local
```
SQLite Database (backend/locus.db)
├── Persistent
├── File-based
└── Works offline
```

### Production (Current - Temporary)
```
In-Memory Arrays
├── Resets on cold start
├── Not suitable for production
└── Demo only
```

### Production (Recommended)
```
Cloud Database (Vercel Postgres / Supabase / PlanetScale)
├── Persistent
├── Scalable
└── Production-ready
```

---

## 📊 What Happens During Deployment

1. **Build Phase**:
   - Installs `frontend/` dependencies
   - Installs `api/` dependencies
   - Runs `npm run build` in frontend
   - TypeScript compilation for API

2. **Deploy Phase**:
   - Uploads static files from `frontend/dist/` to CDN
   - Creates serverless functions from `api/index.ts`
   - Sets up URL routing

3. **Runtime**:
   - Frontend served from CDN (fast)
   - API runs on-demand (serverless)
   - Each API request may trigger a "cold start" if function is idle

---

## 🚨 Important Notes

### Data Persistence
- **Local**: Your SQLite database persists between restarts
- **Production**: Currently uses in-memory storage - **DATA RESETS**

### Environment Variables
- **Local**: Stored in `.env.local` files
- **Production**: Set in Vercel dashboard (Settings → Environment Variables)

### Logs
- **Local**: See in your terminal
- **Production**: View in Vercel dashboard (Deployments → Functions → Logs)

---

## 🎓 Next Steps

1. ✅ **Deploy as-is** to see it working (with temporary in-memory data)
2. ⚠️ **Migrate to cloud database** for production use
3. 🎉 **Enjoy your deployed app!**

See `api/README.md` for database migration guides.
