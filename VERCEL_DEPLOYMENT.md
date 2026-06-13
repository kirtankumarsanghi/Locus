# Deploying Locus to Vercel

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Method 1: Deploy via Vercel Dashboard (Recommended for Beginners)

### Step 1: Push Your Code to Git

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click **"Deploy"**

### Step 3: Set Environment Variables (Optional)

In the Vercel dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add any needed variables:
   - `NODE_ENV` = `production` (optional, auto-set)

### Step 4: Update Frontend API URL

After deployment, Vercel will give you a URL like `https://your-app.vercel.app`

Update `frontend/.env.local` or add environment variable in Vercel:
```
VITE_API_URL=https://your-app.vercel.app
```

Then redeploy (Vercel auto-deploys on git push).

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project root:

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N** (for first time)
- Project name? (default or custom)
- In which directory is your code? **.**
- Want to override settings? **N** (we already have vercel.json)

### Step 4: Deploy to Production

```bash
vercel --prod
```

---

## Important Notes

### ⚠️ Database Limitation

**SQLite does NOT work on Vercel** because serverless functions are stateless. Your backend currently uses in-memory storage which will reset on each cold start.

### Solutions for Persistent Database:

1. **Vercel Postgres** (Recommended)
   - Built-in integration
   - Free tier available
   - [Setup Guide](https://vercel.com/docs/storage/vercel-postgres)

2. **Supabase** (PostgreSQL)
   - Free tier with 500MB
   - [supabase.com](https://supabase.com)

3. **PlanetScale** (MySQL)
   - Generous free tier
   - [planetscale.com](https://planetscale.com)

4. **MongoDB Atlas**
   - Free tier with 512MB
   - [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### Migrating from SQLite:

1. Choose a cloud database provider
2. Update `api/index.ts` to use the new database client
3. Set database connection string in Vercel environment variables
4. Redeploy

---

## File Structure for Vercel

```
Locus/
├── api/                    # Serverless API functions
│   ├── index.ts           # Main API handler
│   ├── package.json       # API dependencies
│   └── tsconfig.json      # TypeScript config for API
├── frontend/              # React frontend
│   ├── dist/             # Build output (auto-generated)
│   ├── src/
│   └── package.json
├── vercel.json           # Vercel configuration
└── .vercelignore         # Files to ignore during deployment
```

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally: `cd frontend && npm run build`

### API Routes Not Working
- Check that API requests go to `/api/*`
- Verify `vercel.json` rewrites configuration
- Check function logs in Vercel dashboard

### Environment Variables Not Working
- Make sure to redeploy after adding environment variables
- Use `VITE_` prefix for frontend variables
- Don't commit `.env.local` to git

### Cold Start Issues
- First request after inactivity may be slow
- Consider upgrading to Vercel Pro for better performance
- Use a database connection pool

---

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS settings as instructed by Vercel

---

## Continuous Deployment

Once connected to Git:
- Push to `main` branch → auto-deploys to production
- Push to other branches → creates preview deployments
- Pull requests → automatic preview URLs

---

## Cost

- **Free tier** includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless function execution
  - HTTPS & SSL

For more information, visit [Vercel Pricing](https://vercel.com/pricing).
