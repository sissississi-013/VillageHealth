# VillageHealth - AI-Powered Patient Intake Assistant

An AI-powered administrative back-office agent for Community Health Workers (CHWs) in low-resource settings. Reduces patient intake review from 10-20 minutes to less than 5 minutes.

## 🎯 Overview

VillageHealth uses Claude AI to:
- Extract structured patient data from conversational input
- Apply WHO IMCI (Integrated Management of Childhood Illness) clinical decision logic
- Generate diagnosis, treatment recommendations, and referral decisions
- Provide clean, actionable reports for CHWs

### Target Users
- Community Health Workers in low-resource settings
- Healthcare workers managing 2+ billion people without access to basic healthcare

### Problem Solved
- Manual data collection bottleneck
- Undertrained and under-resourced CHWs
- Time-consuming diagnosis assessment (10-20 min → <5 min)

---

## 🏗️ Architecture

### Frontend
- **React + Vite** - Fast, modern UI
- **React Router** - Navigation
- **Axios** - API communication
- **Clean, minimal design** - Perplexity-style interface

### Backend
- **Node.js + Express** - REST API
- **Claude API (Anthropic)** - AI-powered data extraction
- **Clinical Decision Engine** - WHO IMCI guidelines implementation
- **In-memory storage** - Demo (replace with database for production)

### Key Components
1. **Main Page (ChatInterface)** - Voice/text-based patient intake
2. **Management Page (PatientDashboard)** - View all patient records
3. **Patient Detail Page** - Full record with export functionality
4. **Clinical Decision Engine** - WHO-based diagnosis logic
5. **Data Extraction Service** - Claude-powered NLP

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### 1. Clone and Setup

```bash
cd VillageHealth
```

### 2. Backend Setup

```bash
cd backend

# Create .env file with your Anthropic API key
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
echo "PORT=3001" >> .env

# Start backend server
npm start
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Open Application

Navigate to `http://localhost:5173` in your browser.

---

## 📋 Usage

### Patient Intake Flow

1. **Navigate to Patient Intake** (home page)
2. **Describe patient conversationally**, for example:
   ```
   Baby Amara, 18 months old, has had a cough for 3 days.
   She's breathing fast - I counted 52 breaths per minute.
   No chest indrawing. She's alert and feeding okay.
   ```
3. **Click "Assess Patient"**
4. **Review AI-generated diagnosis and treatment plan**
5. **Export referral if needed**

### Example Prompts

#### Pneumonia Case
```
Baby Amara, 18 months old, has cough for 3 days.
Respiratory rate is 52. No chest indrawing, alert, feeding okay.
```

#### Dehydration Case
```
Kofi is 3 years old. He has diarrhea for 2 days.
His eyes look sunken and he drinks water eagerly.
MUAC band is green. He's restless but alert.
```

#### Danger Signs Case
```
Zara, 2 years old girl. High fever since yesterday.
She had a convulsion this morning.
She's very lethargic now and not responding normally.
```

### Managing Patient Records

1. **Navigate to "Patient Records"**
2. **View all patient encounters** sorted by most recent
3. **Click on any patient card** to view full details
4. **Export referral summaries** for handoff to clinics

---

## 🧠 Clinical Decision Logic

Based on **WHO IMCI (Integrated Management of Childhood Illness)** guidelines:

### Danger Signs (Immediate Referral)
- Convulsions
- Unconsciousness/Lethargy
- Unable to drink or eat
- Chest indrawing
- Severe dehydration
- Severe malnutrition (MUAC red band)

### Respiratory Assessment
- **Fast breathing thresholds** (age-specific):
  - <2 months: ≥60 breaths/min
  - 2-11 months: ≥50 breaths/min
  - 12+ months: ≥40 breaths/min
- **Pneumonia**: Fast breathing + no danger signs → Amoxicillin treatment
- **Severe Pneumonia**: Chest indrawing → Urgent referral

### Diarrhea Assessment
- **Dehydration signs**: Sunken eyes, skin pinch, drinking pattern
- **Dysentery**: Blood in stool → Urgent referral
- **No dehydration**: ORS + zinc, home care
- **Some dehydration**: ORS 75ml/kg over 4 hours + zinc

### Fever Assessment
- **Malaria**: Test positive in endemic area → ACT treatment
- **Meningitis signs**: Stiff neck, bulging fontanelle → Urgent referral
- **General fever**: Paracetamol, monitor

### Malnutrition
- **MUAC Red**: Severe acute malnutrition → RUTF program
- **MUAC Yellow**: Moderate malnutrition → Supplementary feeding

---

## 📊 Data Extraction

Uses Claude AI to extract structured data from conversational input:

### Extracted Fields
- **Demographics**: Name, age, sex, weight, MUAC
- **Symptoms**: Cough, diarrhea, fever (with duration)
- **Vital Signs**: Respiratory rate, temperature
- **Danger Signs**: Convulsions, chest indrawing, unconsciousness, etc.
- **Clinical Signs**: Sunken eyes, skin pinch, dehydration indicators

### Extraction Process
1. CHW describes patient conversationally
2. Claude API extracts structured JSON
3. Clinical decision engine processes data
4. Returns diagnosis, treatment, and follow-up plan

---

## 🎨 UI/UX Design

### Design Philosophy
- **Fast and clean** - No jargon
- **Clear visual hierarchy** - Diagnosis → Treatment → Next Steps
- **One primary action per screen**
- **Reassuring copy** - "This summary is ready to send to your clinic"
- **Color-coded severity** - Critical (red), Severe (orange), Moderate (yellow), Mild (green)

### Accessibility
- High contrast colors
- Clear typography
- Mobile-responsive
- Keyboard navigation

---

## 🔧 API Endpoints

### Backend API

#### Health Check
```
GET /api/health
```

#### Process Patient Intake
```
POST /api/intake
Body: { chwInput: "patient description..." }
Response: { success, patientId, diagnosis, confirmationSummary, extractedData }
```

#### Get All Patients
```
GET /api/patients
Response: { patients: [...] }
```

#### Get Patient Details
```
GET /api/patients/:id
Response: { patient: {...} }
```

#### Export Referral
```
GET /api/patients/:id/export
Response: { patientId, referralText, referralNeeded, urgentReferral }
```

---

## 📦 Project Structure

```
VillageHealth/
├── backend/
│   ├── server.js                    # Express server + API routes
│   ├── clinicalDecisionEngine.js    # WHO IMCI logic implementation
│   ├── package.json
│   ├── .env.example
│   └── .env (create this)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx    # Patient intake page
│   │   │   ├── ChatInterface.css
│   │   │   ├── PatientDashboard.jsx # Patient records list
│   │   │   ├── PatientDashboard.css
│   │   │   ├── PatientDetail.jsx    # Individual patient view
│   │   │   └── PatientDetail.css
│   │   ├── App.jsx                  # Main app + routing
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── WHO CHW guide 2012 (1).pdf       # WHO guidelines reference
├── WHO Crisis kids CCC DAK_*.xlsx   # WHO data dictionaries
└── PROJECT_README.md                # This file
```

---

## 🚧 Production Considerations

### Before Production Deployment

1. **Replace in-memory storage with a database**
   - PostgreSQL, MongoDB, or similar
   - Store patient records, audit logs

2. **Add authentication & authorization**
   - CHW login system
   - Role-based access control
   - Secure API endpoints

3. **Implement proper error handling**
   - Graceful degradation
   - Retry logic for API calls
   - User-friendly error messages

4. **Add data validation**
   - Input sanitization
   - Schema validation
   - Data integrity checks

5. **HIPAA/Privacy compliance**
   - Encrypt sensitive data
   - Audit trails
   - Data retention policies

6. **Offline capability**
   - Progressive Web App (PWA)
   - Local storage for areas with poor connectivity
   - Sync when online

7. **Voice input (future enhancement)**
   - Web Speech API integration
   - Voice-to-text transcription
   - Multi-language support

8. **Testing**
   - Unit tests for clinical logic
   - Integration tests for API
   - E2E tests for critical flows

9. **Monitoring & Analytics**
   - Error tracking (Sentry, etc.)
   - Usage analytics
   - Performance monitoring

10. **Localization**
    - Multi-language support
    - Cultural adaptations
    - Local clinical guidelines

---

## 🌍 Impact

### Target Population
- 2+ billion people in low-income countries without basic healthcare access
- Community Health Workers serving remote communities

### Key Metrics
- **Time saved**: 10-20 minutes → <5 minutes per patient
- **Accuracy**: WHO IMCI-compliant decision logic
- **Scalability**: Can serve thousands of CHWs with cloud deployment

### Use Cases
1. **Rural health posts** - CHWs with limited training
2. **Humanitarian crises** - Rapid patient triage
3. **Telemedicine** - Support for remote consultations
4. **Training tool** - Help CHWs learn IMCI guidelines

---

## 🤝 Contributing

### Areas for Contribution
1. Additional clinical conditions (malaria, TB, malnutrition)
2. Voice input integration
3. Offline functionality
4. Multi-language support
5. Mobile app version
6. Database integration
7. Authentication system
8. Automated testing

---

## 📚 References

### WHO Guidelines
- [WHO IMCI Guidelines](https://www.who.int/maternal_child_adolescent/topics/child/imci/en/)
- WHO CHW Guide 2012 (included in repo)
- WHO Crisis Kids CCC DAK (data dictionaries included)

### Technologies
- [Claude API Documentation](https://docs.anthropic.com/)
- [React Documentation](https://react.dev/)
- [Express Documentation](https://expressjs.com/)

---

## 📝 License

This project is for demonstration and educational purposes.

WHO Guidelines are © World Health Organization. Some rights reserved under CC BY-NC-SA 3.0 IGO licence.

---

## 🎯 Next Steps

1. **Set up your API key** in backend/.env
2. **Run both servers** (backend and frontend)
3. **Try the example prompts** to see the system in action
4. **Review patient records** in the dashboard
5. **Export a referral summary**

---

## 💡 Tips for CHWs

### Getting the Best Results

1. **Be conversational** - Describe the patient naturally
2. **Include key details**:
   - Name, age, sex
   - Chief complaint and duration
   - Vital signs if available (breathing rate, temperature)
   - Danger signs (convulsions, lethargy, etc.)
   - Nutrition status (MUAC color if measured)

3. **Example good input**:
   ```
   This is baby Amina, 9 months old girl. She's had diarrhea for 3 days,
   about 5 watery stools per day. Her eyes look sunken and when I offer
   water she drinks very eagerly. Skin pinch goes back slowly.
   No blood in stool. MUAC is green. She's alert but restless.
   ```

4. **Follow the treatment plan** - The system provides WHO-compliant recommendations
5. **Refer when advised** - Urgent referrals are critical for saving lives

---

**Built with ❤️ for Community Health Workers worldwide**
