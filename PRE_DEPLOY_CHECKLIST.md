# 📝 Pre-Deployment Checklist for Vercel

Before you deploy, make sure:

## ✅ Code is Ready

- [ ] All changes are saved
- [ ] No TypeScript errors (check with `cd frontend && npm run build`)
- [ ] API dependencies are correct (check `api/package.json`)

## ✅ Git is Set Up

- [ ] Code is committed to Git
  ```bash
  git add .
  git commit -m "Prepare for Vercel deployment"
  ```

- [ ] Code is pushed to GitHub/GitLab/Bitbucket (if using dashboard method)
  ```bash
  git push origin main
  ```

## ✅ Files Are Configured

- [ ] `vercel.json` exists in root
- [ ] `api/index.ts` exists with your API endpoints
- [ ] `api/package.json` has correct dependencies
- [ ] `frontend/.env.production` template exists
- [ ] `.vercelignore` excludes backend folder and database files

## ✅ You're Ready to Deploy!

### Method 1: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Click "Deploy"

### Method 2: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📝 After Deployment

- [ ] Note your deployment URL (e.g., `https://locus-xxx.vercel.app`)
- [ ] Test API health: `https://your-url.vercel.app/api/health`
- [ ] Test frontend: `https://your-url.vercel.app/`
- [ ] Update environment variable `VITE_API_URL` in Vercel dashboard
- [ ] Redeploy after setting environment variable

## ⚠️ Remember

Your current setup uses **in-memory storage**. For production:
- Migrate to Vercel Postgres, Supabase, or PlanetScale
- See `api/README.md` for database migration guides

---

**All checked?** You're ready to deploy! 🚀

Follow the detailed steps in `deploy-to-vercel.md`
