# 🚨 QUICK FIX: Vercel 404 Error

## The Problem
Vercel is trying to deploy the entire repo, but needs to deploy only the `frontend` folder with special routing configuration for React Router.

## ⚡ IMMEDIATE FIX (3 Steps)

### Step 1: Update Vercel Project Settings

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your VillageHealth project
3. Go to **Settings** (top navigation)
4. Click **General** (left sidebar)
5. Scroll to **Root Directory**
6. Click **Edit**
7. Enter: `frontend`
8. Click **Save**

### Step 2: Configure Build Settings

Still in Settings:
1. Click **Build & Development Settings** (left sidebar)
2. Set these values:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes
5. Visit your site!

---

## ✅ Should Work Now!

After these steps, your frontend should load correctly.

## ⚠️ BUT WAIT - You'll Need Backend Too!

Your frontend is now deployed, but it needs to connect to a backend API. The backend **cannot** run on Vercel.

### Quick Backend Deployment (5 minutes)

**Option 1: Railway.app (Recommended)**

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Select your VillageHealth repository
5. **Important:** Click "Add variables"
   - Add: `ROOT` = `/backend`
   - Add: `ANTHROPIC_API_KEY` = `your_api_key_here`
6. Click "Deploy"
7. Wait for deployment (2-3 min)
8. Copy your Railway URL (e.g., `https://villagehealth-backend-production-abc123.up.railway.app`)

### Connect Frontend to Backend

1. Go back to Vercel dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-railway-url.up.railway.app/api` (use your actual Railway URL + `/api`)
4. Click **Save**
5. Go to **Deployments** → **Redeploy**

---

## 🎯 Verification Steps

After both are deployed:

1. ✅ Visit your Vercel URL
2. ✅ Click "Patient Records" - should show 3 demo patients (Amara, Kofi, Zara)
3. ✅ Click on a patient - should load details
4. ✅ Try "Patient Intake" - should work (if you have valid Anthropic API key)

---

## 🆘 Still Getting 404?

### Check These:

**In Vercel Dashboard:**
- Settings → General → Root Directory = `frontend` ✓
- Settings → Build Settings → Output Directory = `dist` ✓
- Check deployment logs for errors

**If patients not showing:**
- Verify backend is running on Railway (should say "Running")
- Check VITE_API_URL in Vercel environment variables
- Open browser console (F12) and look for errors

---

## 📞 Need Help?

Check the full guide: **VERCEL_DEPLOYMENT.md**

Or paste your error message and I'll help debug!
