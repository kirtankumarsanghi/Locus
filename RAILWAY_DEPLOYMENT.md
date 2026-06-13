# Railway Deployment Guide for Locus

This guide will help you deploy the Locus Library Desk Management System to Railway.

## Prerequisites

1. A Railway account ([railway.app](https://railway.app))
2. GitHub account with your code pushed to a repository
3. Railway CLI (optional, but recommended): `npm i -g @railway/cli`

---

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your Locus repository

### 2. Create Two Services

Railway will automatically detect your monorepo. You need to create two services:

#### Service 1: Backend

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `locus-backend`
3. Go to **Settings** → **Source**:
   - Root Directory: `/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Go to **Variables** tab and add:
   ```
   PORT=4000
   CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
   DB_PATH=/app/data/locus.db
   ```
5. Go to **Settings** → **Networking**:
   - Enable **"Public Networking"**
   - Note the public URL (e.g., `locus-backend-production.up.railway.app`)

#### Service 2: Frontend

1. Click **"+ New"** → **"Empty Service"**
2. Name it: `locus-frontend`
3. Go to **Settings** → **Source**:
   - Root Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx vite preview --host 0.0.0.0 --port $PORT`
4. Go to **Variables** tab and add:
   ```
   VITE_API_URL=https://[YOUR-BACKEND-URL].railway.app
   ```
   (Replace with your actual backend URL from step 5 above)
5. Go to **Settings** → **Networking**:
   - Enable **"Public Networking"**

### 3. Add Persistent Storage (for Backend)

SQLite needs a persistent volume to store data:

1. In the **backend service**, click **"+ New"** → **"Volume"**
2. Mount Path: `/app/data`
3. This ensures your database persists across deployments

### 4. Deploy

Railway will automatically build and deploy both services. Monitor the deployment logs for any errors.

---

## Environment Variables Reference

### Backend Service
```bash
PORT=4000                          # Railway will set this automatically
CORS_ORIGIN=*                      # Allow all origins (or specify frontend URL)
DB_PATH=/app/data/locus.db         # Path to SQLite database on persistent volume
MAX_AWAY_MINUTES=20                # Optional: Away timeout in minutes
MAX_INACTIVE_MINUTES=120           # Optional: Inactive timeout in minutes
```

### Frontend Service
```bash
VITE_API_URL=https://locus-backend-production.up.railway.app
```

---

## Post-Deployment

### 1. Update Frontend API URL

After backend deployment, update the frontend's `VITE_API_URL` environment variable with the actual backend URL.

### 2. Test the Application

1. Visit your frontend URL
2. Try logging in with demo credentials:
   - **Student**: `student@locus.edu` / `password123`
   - **Staff**: `staff@locus.edu` / `password123`
   - **Admin**: `admin@locus.edu` / `password123`

### 3. Verify WebSocket Connection

Open browser console and look for Socket.IO connection messages. You should see:
```
🔌 Connected to Locus real-time server
```

---

## Troubleshooting

### Backend Won't Start

- Check that `npm run build` completes successfully
- Verify the start command is `npm start` (not `npm run dev`)
- Check logs for TypeScript compilation errors

### Frontend Can't Connect to Backend

- Ensure `VITE_API_URL` is set correctly in frontend environment variables
- Verify CORS_ORIGIN is set in backend (use `*` for development)
- Check that backend networking is enabled

### WebSocket Issues

- Railway supports WebSockets by default
- Check browser console for connection errors
- Verify Socket.IO is connecting to the correct backend URL

### Database Not Persisting

- Ensure volume is mounted at `/app/data`
- Check that `DB_PATH` environment variable points to `/app/data/locus.db`
- Verify volume is attached to the backend service

### Build Failures

**Backend:**
- Ensure all TypeScript files compile without errors
- Check that all dependencies are in `package.json`

**Frontend:**
- Run `npm run build` locally first to catch any issues
- Verify all environment variables are set during build

---

## Custom Domain (Optional)

1. In your service settings, go to **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Follow Railway's instructions to configure DNS

---

## Monitoring and Logs

- **View Logs**: Click on each service → **"Deployments"** tab
- **Metrics**: Railway provides CPU, memory, and network usage metrics
- **Restarts**: Services automatically restart on crashes (configured in railway.json)

---

## Scaling

- Railway's free tier includes 500 execution hours per month
- For production use, consider upgrading to the Developer plan ($5/month)
- Each service can be scaled independently

---

## Alternative: Single Service Deployment (Not Recommended)

If you prefer to run both frontend and backend in a single service:

1. Create a root `package.json` that runs both
2. Use a process manager like `concurrently`
3. Configure build to output frontend static files
4. Serve frontend through Express

**Note**: This approach is less flexible and harder to scale.

---

## Useful Railway CLI Commands

```bash
# Login to Railway
railway login

# Link to your project
railway link

# View logs
railway logs

# Open project in browser
railway open

# Set environment variable
railway variables set KEY=value

# Deploy manually
railway up
```

---

## Security Recommendations

1. **Change default passwords** in production
2. **Set CORS_ORIGIN** to your frontend URL (not `*`)
3. **Enable Railway's environment variable encryption**
4. **Use Railway's secrets** for sensitive data
5. **Set up proper user authentication** (replace demo auth)

---

## Next Steps

1. Set up a proper authentication system (JWT, OAuth, etc.)
2. Configure SSL/TLS (Railway provides this automatically)
3. Set up monitoring and alerts
4. Create backup strategy for SQLite database
5. Consider migrating to PostgreSQL for production (Railway provides free PostgreSQL)

---

## Cost Estimate

**Free Tier:**
- 500 execution hours/month
- 512 MB RAM per service
- 1 GB storage

**Developer Plan ($5/month):**
- Unlimited execution hours
- 8 GB RAM
- 100 GB storage
- Priority support

For a small library with moderate traffic, the free tier should be sufficient initially.

---

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- GitHub Issues: Create issues in your repository

