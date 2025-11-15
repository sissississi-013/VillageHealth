# 🏥 VillageHealth
**Intelligent Health Services for Community Health Workers**

AI-powered patient intake and diagnosis assistant that reduces administrative burden from 10-20 minutes to less than 5 minutes per patient.

---

## 🎯 What is VillageHealth?

VillageHealth is an AI-powered back-office agent designed for Community Health Workers (CHWs) in low-resource settings. It uses Claude AI to:

- 📝 **Extract structured data** from conversational patient descriptions
- 🏥 **Apply WHO clinical guidelines** (IMCI) for diagnosis
- 💊 **Generate treatment recommendations** with age-appropriate dosing
- 🚨 **Identify danger signs** requiring urgent referral
- 📋 **Create referral summaries** for facility handoff

### Target Impact
- **2+ billion people** in low-income countries lack basic healthcare access
- **Community Health Workers** serve as the first point of contact
- **Time saved**: 10-20 minutes → **<5 minutes** per patient

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- Anthropic API key ([Get one free](https://console.anthropic.com/))

### 2. Setup Backend
```bash
cd backend

# Create .env file with your API key
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env

# Install dependencies and start
npm install
npm start
```

### 3. Setup Frontend (New Terminal)
```bash
cd frontend

# Install dependencies and start
npm install
npm run dev
```

### 4. Open Application
Navigate to **http://localhost:5173**

---

## 📚 Documentation

- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup guide with troubleshooting
- **[PROJECT_README.md](PROJECT_README.md)** - Full architecture, API docs, and clinical logic
- **WHO files** - Clinical guidelines and data dictionaries (included in repo)

---

## 🎮 Try It Out

### Example 1: Pneumonia Assessment
```
Baby Amara, 18 months old, has had a cough for 3 days.
She's breathing fast - I counted 52 breaths per minute.
No chest indrawing. She's alert and feeding okay.
```

**Result**: Pneumonia diagnosis → Amoxicillin treatment → 2-day follow-up

### Example 2: Danger Signs
```
Zara, 2 years old girl. High fever since yesterday.
She had a convulsion this morning. She's very lethargic now.
```

**Result**: URGENT REFERRAL → Pre-referral treatment → Immediate transfer

---

## 🏗️ Tech Stack

- **Frontend**: React + Vite + React Router
- **Backend**: Node.js + Express + Claude API
- **Clinical Logic**: WHO IMCI guidelines implementation
- **UI Design**: Clean, minimal, Perplexity-style interface

---

## 📊 Features

### ✅ Implemented
- [x] Conversational patient intake interface
- [x] AI-powered data extraction (Claude)
- [x] WHO IMCI clinical decision engine
- [x] Diagnosis with treatment recommendations
- [x] Danger signs detection
- [x] Urgent referral identification
- [x] Patient records dashboard
- [x] Detailed patient view
- [x] Referral summary export
- [x] Demo data with 3 sample patients

### 🚧 Future Enhancements
- [ ] Voice input (Web Speech API)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Authentication & authorization
- [ ] Offline capability (PWA)
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Additional clinical conditions (TB, malaria, malnutrition)

---

## 🌍 Impact & Use Cases

### Who Benefits?
- **Community Health Workers** in rural areas
- **Humanitarian organizations** during crises
- **Telemedicine providers** in remote consultations
- **CHW training programs** for IMCI education

### Clinical Conditions Supported
- Respiratory infections (pneumonia, cough, cold)
- Diarrhea & dehydration
- Fever (malaria, other causes)
- Malnutrition (MUAC-based assessment)
- Danger signs (convulsions, unconsciousness, etc.)

---

## 🤝 Contributing

We welcome contributions! Areas for improvement:

1. Additional clinical conditions
2. Voice input integration
3. Offline functionality
4. Multi-language support
5. Database integration
6. Authentication system
7. Automated testing
8. Mobile app version

---

## 📝 License

This project is for demonstration and educational purposes.

WHO Guidelines © World Health Organization. CC BY-NC-SA 3.0 IGO licence.

---

## 📞 Support

- **Setup Issues**: See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Architecture Details**: See [PROJECT_README.md](PROJECT_README.md)
- **WHO Guidelines**: See included PDF and Excel files

---

**Built with ❤️ for Community Health Workers worldwide**
