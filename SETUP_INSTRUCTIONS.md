# VillageHealth Setup Instructions

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy the API key (starts with `sk-ant-...`)

### Step 2: Configure Backend

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
EOF

# Replace 'your_api_key_here' with your actual API key
# For example:
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

Or manually create `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
PORT=3001
```

### Step 3: Start Backend Server

```bash
# From the backend directory
npm start
```

You should see:
```
🏥 VillageHealth Backend running on http://localhost:3001
📊 API endpoints:
   - POST /api/intake - Process patient intake
   - GET  /api/patients - Get all patients
   ...
```

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open Application

Navigate to **http://localhost:5173** in your browser.

---

## 🧪 Testing the Application

### Test 1: Simple Pneumonia Case

1. Go to **Patient Intake** page
2. Enter this prompt:
```
Baby Amara, 18 months old, has had a cough for 3 days.
She's breathing fast - I counted 52 breaths per minute.
No chest indrawing. She's alert and feeding okay.
```
3. Click **Assess Patient**
4. You should see:
   - Diagnosis: PNEUMONIA (moderate severity)
   - Treatment: Amoxicillin for 5 days
   - Follow-up: 2 days

### Test 2: Danger Signs Case

1. Click **New Patient Assessment**
2. Enter this prompt:
```
Zara, 2 years old girl. High fever since yesterday.
She had a convulsion this morning.
She's very lethargic now and not responding normally.
```
3. Click **Assess Patient**
4. You should see:
   - DANGER SIGNS PRESENT alert (red)
   - URGENT REFERRAL REQUIRED
   - Pre-referral treatment instructions

### Test 3: View Patient Records

1. Click **Patient Records** in navigation
2. You should see 3 demo patients plus any you created
3. Click on any patient card
4. View full details
5. Click **Export Referral**
6. Copy the referral summary

---

## 🔧 Troubleshooting

### Backend won't start

**Problem**: `Error: ANTHROPIC_API_KEY is required`

**Solution**:
- Check that `backend/.env` file exists
- Verify API key is correct (starts with `sk-ant-`)
- Make sure there are no extra spaces or quotes

### Frontend can't connect to backend

**Problem**: `Failed to process patient intake`

**Solution**:
- Verify backend is running on port 3001
- Check console for CORS errors
- Ensure both servers are running simultaneously

### API calls failing

**Problem**: `Error 401: Invalid API Key`

**Solution**:
- Verify your Anthropic API key is valid
- Check you have credits in your Anthropic account
- Try generating a new API key

### Port already in use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

---

## 🎯 Next Steps

Once everything is working:

1. **Test all features**:
   - Patient intake with different scenarios
   - View patient records
   - Export referral summaries

2. **Review the code**:
   - `backend/clinicalDecisionEngine.js` - WHO logic
   - `backend/server.js` - API endpoints
   - `frontend/src/components/` - React components

3. **Customize for your needs**:
   - Add more clinical conditions
   - Adjust decision thresholds
   - Customize UI/UX

4. **Read the full documentation**:
   - See `PROJECT_README.md` for detailed architecture
   - Review WHO guidelines in included PDF
   - Check data dictionaries in Excel files

---

## 📞 Need Help?

If you encounter issues:

1. Check the console logs (browser and terminal)
2. Review the API response errors
3. Verify your API key is valid
4. Make sure all dependencies are installed (`npm install`)

---

**Happy coding! 🏥**
