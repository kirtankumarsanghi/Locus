# Quick Deploy to Vercel - Step by Step

## Option A: Using Vercel Dashboard (No CLI needed)

### 1. Create a GitHub Repository (if you haven't already)

Go to [github.com](https://github.com) and create a new repository, then:

```bash
git init
git add .
git commit -m "Initial commit - Locus app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (use GitHub account for easier setup)
3. Click **"Add New Project"**
4. Click **"Import Git Repository"**
5. Select your Locus repository
6. Vercel will auto-detect settings from `vercel.json`
7. Click **"Deploy"**

### 3. Wait for Build

- Vercel will install dependencies and build your app
- This takes 2-5 minutes
- You'll get a URL like: `https://locus-xxxx.vercel.app`

### 4. Done! 🎉

Your app is now live. But remember:
- **Database is in-memory** - data resets on cold starts
- For production, you need a real database (see database options below)

---

## Option B: Using Vercel CLI (For Developers)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

From your project root:

```bash
# Development deployment (preview)
vercel

# Production deployment
vercel --prod
```

---

## Next Steps: Add a Real Database

### Option 1: Vercel Postgres (Recommended)

1. In Vercel dashboard, go to your project
2. Click **Storage** → **Create Database**
3. Choose **Postgres**
4. Click **Create**
5. Copy the connection details

Then update your `api/index.ts`:

```typescript
import { sql } from '@vercel/postgres';

// Example: Fetch desks
app.get('/api/desks', async (req, res) => {
  const { rows } = await sql`SELECT * FROM desks ORDER BY number ASC`;
  res.json(rows);
});
```

Install the package:
```bash
cd api
npm install @vercel/postgres
```

Then redeploy:
```bash
vercel --prod
```

### Option 2: Supabase (Free PostgreSQL)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and API key
4. Add to Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

Update `api/package.json`:
```bash
cd api
npm install @supabase/supabase-js
```

Update `api/index.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Example: Fetch desks
app.get('/api/desks', async (req, res) => {
  const { data, error } = await supabase
    .from('desks')
    .select('*')
    .order('number');
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
```

---

## Viewing Your Deployed App

After deployment, you'll get URLs like:

- **Production**: `https://locus.vercel.app`
- **API Health Check**: `https://locus.vercel.app/api/health`
- **Frontend**: `https://locus.vercel.app/`

---

## Updating Your App

### If using Git + Vercel:
```bash
git add .
git commit -m "Update app"
git push
```
Vercel will auto-deploy!

### If using Vercel CLI:
```bash
vercel --prod
```

---

## Common Issues

### Issue: "Build failed"
**Solution**: Check the build logs in Vercel dashboard. Usually a missing dependency.

### Issue: "API returns 500 error"
**Solution**: Check function logs in Vercel dashboard → Deployments → (click your deployment) → Functions.

### Issue: "Data keeps resetting"
**Solution**: This is expected with in-memory storage. Migrate to a cloud database (see above).

### Issue: "CORS errors"
**Solution**: The API already has CORS enabled. If issues persist, check that your frontend is requesting from the correct domain.

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- Check the `VERCEL_DEPLOYMENT.md` file for detailed information
