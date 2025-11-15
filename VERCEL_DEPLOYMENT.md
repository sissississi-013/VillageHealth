# 🚀 Vercel Deployment Guide for VillageHealth

## ⚠️ Important Note About Architecture

VillageHealth has **TWO parts** that need separate deployments:
1. **Frontend** (React app) - Can deploy to Vercel ✅
2. **Backend** (Node.js API) - Cannot deploy to Vercel easily ❌

## 📋 What You Need to Know

### The Issue You're Facing
The 404 error happens because:
1. React Router needs proper configuration for client-side routing
2. You may be trying to deploy the whole repo instead of just the frontend
3. The backend needs to be deployed separately

## ✅ SOLUTION 1: Deploy Frontend Only to Vercel (RECOMMENDED)

This deploys just the React frontend. The backend will need to be deployed elsewhere.

### Step 1: Deploy Backend First

Your backend needs to be deployed to a platform that supports Node.js servers:

**Option A: Railway.app (Easiest)**
```bash
# 1. Go to https://railway.app/
# 2. Sign in with GitHub
# 3. Click "New Project" → "Deploy from GitHub repo"
# 4. Select VillageHealth repo
# 5. Choose "backend" as root directory
# 6. Add environment variable: ANTHROPIC_API_KEY=your_key
# 7. Deploy!
# 8. Copy the deployed URL (e.g., https://villagehealth-backend.up.railway.app)
```

**Option B: Render.com (Also Easy)**
```bash
# 1. Go to https://render.com/
# 2. Sign in with GitHub
# 3. New → Web Service
# 4. Connect VillageHealth repo
# 5. Root directory: backend
# 6. Build command: npm install
# 7. Start command: npm start
# 8. Add environment variable: ANTHROPIC_API_KEY=your_key
# 9. Deploy!
```

**Option C: Heroku**
```bash
# 1. Go to https://heroku.com/
# 2. Create new app
# 3. Connect GitHub repo
# 4. Set buildpack to Node.js
# 5. Add Config Var: ANTHROPIC_API_KEY=your_key
# 6. Deploy from "backend" directory
```

### Step 2: Deploy Frontend to Vercel

**A. Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **IMPORTANT: Configure these settings:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app/api` (use your actual backend URL from Step 1)

6. Click "Deploy"

**B. Via Vercel CLI (Alternative)**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and set:
# - Project name: villagehealth
# - Build Command: npm run build
# - Output Directory: dist

# Add environment variable
vercel env add VITE_API_URL
# Enter: https://your-backend-url.railway.app/api

# Deploy to production
vercel --prod
```

### Step 3: Verify Deployment

1. Visit your Vercel URL (e.g., `https://villagehealth.vercel.app`)
2. Click "Patient Records" - should show 3 demo patients
3. Try "New Patient Intake" - should connect to your backend

---

## ✅ SOLUTION 2: Deploy as Full-Stack on Vercel (Advanced)

Vercel supports backend APIs through Serverless Functions, but requires restructuring.

### Current Structure (Won't Work on Vercel)
```
VillageHealth/
├── backend/server.js (Express server - NOT serverless)
└── frontend/
```

### What Vercel Needs (Serverless Functions)
```
VillageHealth/
├── api/
│   ├── intake.js      (serverless function)
│   ├── patients.js    (serverless function)
│   └── ...
└── frontend/
```

**This requires significant refactoring.** I recommend Solution 1 instead.

---

## 🔧 Quick Fix for Current 404 Error

If you're getting 404 on Vercel right now, here's what to do:

### Fix #1: Correct Root Directory
In Vercel dashboard:
1. Go to your project settings
2. Click "General"
3. Set **Root Directory** to `frontend`
4. Save and redeploy

### Fix #2: Verify Build Settings
In Vercel dashboard:
1. Go to project settings
2. Click "Build & Development Settings"
3. Set:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Save and redeploy

### Fix #3: Check vercel.json
Make sure `/frontend/vercel.json` exists with:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📝 Complete Step-by-Step (From Scratch)

### Phase 1: Deploy Backend to Railway

```bash
# 1. Go to railway.app and sign in
# 2. New Project → Deploy from GitHub
# 3. Select VillageHealth
# 4. Add these settings:
#    - Root Directory: /backend
#    - Start Command: npm start
#    - Environment Variables:
#      ANTHROPIC_API_KEY=your_actual_key_here
#      PORT=3001
# 5. Click Deploy
# 6. Wait for deployment (2-3 minutes)
# 7. Copy your Railway URL: https://villagehealth-backend-production-xxxx.up.railway.app
```

### Phase 2: Deploy Frontend to Vercel

```bash
# 1. Go to vercel.com and sign in
# 2. Add New → Project
# 3. Import VillageHealth from GitHub
# 4. Configure:
#    Root Directory: frontend
#    Framework: Vite
#    Build Command: npm run build
#    Output Directory: dist
# 5. Add Environment Variable:
#    Name: VITE_API_URL
#    Value: https://villagehealth-backend-production-xxxx.up.railway.app/api
# 6. Deploy
# 7. Visit your URL: https://villagehealth-xxxx.vercel.app
```

---

## 🧪 Testing Your Deployment

### Test Checklist
1. ✅ Visit your Vercel URL - homepage loads
2. ✅ Click "Patient Records" - see 3 demo patients
3. ✅ Click on a patient - see details
4. ✅ Click "Export Referral" - modal appears
5. ✅ Go to "Patient Intake" - form appears
6. ✅ Try example prompt - AI processes (requires valid API key)

### If Something Doesn't Work

**Frontend loads but no patients showing:**
- Check browser console for errors
- Verify VITE_API_URL is set correctly in Vercel
- Make sure backend is running (visit backend URL directly)

**AI processing fails:**
- Check backend logs on Railway/Render
- Verify ANTHROPIC_API_KEY is set in backend
- Check API key is valid and has credits

**404 on patient detail pages:**
- Make sure `frontend/vercel.json` has rewrites configured
- Redeploy frontend

---

## 🎯 Recommended Deployment Stack

For production, I recommend:

| Component | Platform | Why |
|-----------|----------|-----|
| Frontend | **Vercel** | Best for React/Vite, free tier, fast CDN |
| Backend | **Railway.app** | Easy Node.js hosting, free tier, simple setup |
| Alternative Backend | **Render.com** | Also great for Node.js, free tier |

---

## 💰 Cost Estimate

**Free Tier (Perfect for Demo/MVP):**
- Vercel: Free (generous limits)
- Railway: $5 free credit/month
- Anthropic API: Pay-as-you-go (~$0.003 per request)

**Total for demo:** Essentially FREE for first month

---

## 🚨 Common Errors & Solutions

### Error: "404 Not Found"
**Solution:** Set Root Directory to `frontend` in Vercel settings

### Error: "Failed to fetch"
**Solution:** Check VITE_API_URL environment variable is set

### Error: "ANTHROPIC_API_KEY is required"
**Solution:** Add API key to backend environment variables

### Error: "Build failed"
**Solution:** Make sure you're building from `frontend` directory

### Error: "Cannot find module 'express'"
**Solution:** Backend needs to be deployed separately, not on Vercel

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [React Router on Vercel](https://vercel.com/guides/deploying-react-with-vercel)

---

## ✅ Final Checklist

Before going live:

- [ ] Backend deployed and running (Railway/Render)
- [ ] Backend has valid ANTHROPIC_API_KEY
- [ ] Frontend deployed to Vercel
- [ ] Frontend has VITE_API_URL pointing to backend
- [ ] Tested all pages (home, records, detail)
- [ ] Tested AI patient intake
- [ ] Verified export functionality
- [ ] Checked mobile responsiveness

---

## 🎉 You're Done!

Your VillageHealth app should now be live and accessible to anyone with the URL!

**Frontend URL:** `https://villagehealth-xxxx.vercel.app`
**Backend URL:** `https://villagehealth-backend-xxxx.railway.app`

Share the frontend URL with CHWs and start saving lives! 🏥

---

## 🆘 Still Having Issues?

If you're still getting 404 or other errors, check:

1. **Vercel Dashboard → Project Settings → General**
   - Root Directory should be: `frontend`

2. **Vercel Dashboard → Project Settings → Environment Variables**
   - Should have: `VITE_API_URL` = your backend URL

3. **Vercel Dashboard → Deployments**
   - Check latest deployment logs for errors

4. **Railway Dashboard → Your Backend**
   - Check it's running (green status)
   - Check environment variables are set

If you need help, paste the error message and I'll help you debug!
