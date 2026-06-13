# Deployment Guide

Your project is now fully prepared to be hosted on Railway (backend) and Vercel (frontend). 

## 1. Deploying the Backend to Railway
Railway is perfect for this backend because it allows attaching a "Volume" (persistent storage) so your SQLite database isn't deleted when the server restarts.

1. Create an account at [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `Locus` repository. 
   *(Note: Since your backend is in a subfolder, you need to go to your new service's settings, find **Root Directory**, and set it to `/backend`).*
4. Once the service is created, configure the following in Railway:
   - Go to **Settings** -> **Build** -> **Build Command** and ensure it runs `npm run build` (which we've mapped to `tsc`).
   - Go to **Settings** -> **Deploy** -> **Start Command** and ensure it runs `npm start` (which we've mapped to `node dist/index.js`).
   - Go to **Variables** and add a new variable: `PORT` with value `4000` (or whatever you prefer).
   - Go to **Volumes** -> Click **Create Volume** and attach it to the mount path `/app/data`.
   - Go back to **Variables** and add: `DB_PATH` with value `/app/data/locus.db`. This ensures your database lives on the persistent volume!
5. Finally, go to the **Settings** -> **Networking** and click **Generate Domain** to get a public URL for your backend (e.g., `locus-backend.up.railway.app`).
   *Copy this URL for the next step.*

## 2. Deploying the Frontend to Vercel
Vercel will automatically detect your Vite configuration and deploy the React app.

1. Create an account at [Vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your `Locus` repository.
4. Set the **Root Directory** to `frontend`.
5. Expand the **Framework Preset** section and ensure it detected **Vite**.
6. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Railway backend URL from the previous step (e.g., `https://locus-backend.up.railway.app`). Make sure you include `https://` and don't put a trailing slash.
7. Click **Deploy**.

## That's it!
Your app will now be live on Vercel, and it will communicate with your live Railway backend. The backend will automatically create the `locus.db` file in the persistent volume and seed the 8 desks if it doesn't exist.
