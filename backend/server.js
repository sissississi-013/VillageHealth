import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { diagnosePatient } from './clinicalDecisionEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database in production)
let patients = [
  // Demo data - sample patient encounters
  {
    id: 1,
    name: 'Amara',
    age: '18 months',
    ageInMonths: 18,
    sex: 'Female',
    chiefComplaint: 'Cough for 3 days, fast breathing',
    timestamp: new Date('2024-11-13T10:30:00').toISOString(),
    diagnoses: [
      {
        classification: 'PNEUMONIA',
        severity: 'moderate',
        action: 'Treat with oral antibiotics',
        treatment: 'Amoxicillin (age-appropriate dosing) for 5 days',
        followUp: '2 days (or sooner if worse)'
      }
    ],
    referralNeeded: false,
    urgentReferral: false
  },
  {
    id: 2,
    name: 'Kofi',
    age: '3 years',
    ageInMonths: 36,
    sex: 'Male',
    chiefComplaint: 'Diarrhea for 2 days, sunken eyes',
    timestamp: new Date('2024-11-12T14:15:00').toISOString(),
    diagnoses: [
      {
        classification: 'DIARRHEA WITH SOME DEHYDRATION',
        severity: 'moderate',
        action: 'Give ORS solution over 4 hours',
        treatment: 'ORS: 75ml/kg over 4 hours + zinc for 10-14 days',
        followUp: 'Reassess after 4 hours, then 2 days'
      }
    ],
    referralNeeded: false,
    urgentReferral: false
  },
  {
    id: 3,
    name: 'Zara',
    age: '2 years',
    ageInMonths: 24,
    sex: 'Female',
    chiefComplaint: 'High fever, convulsion episode, lethargic',
    timestamp: new Date('2024-11-14T08:00:00').toISOString(),
    diagnoses: [
      {
        classification: 'DANGER SIGNS PRESENT',
        severity: 'critical',
        action: 'REFER URGENTLY to hospital immediately',
        dangerSigns: ['Convulsions', 'Unconsciousness/Lethargy'],
        treatment: 'Pre-referral treatment: Keep warm, give nothing by mouth if unconscious',
        followUp: 'IMMEDIATE REFERRAL'
      }
    ],
    referralNeeded: true,
    urgentReferral: true
  }
];

let nextPatientId = 4;

/**
 * Extract structured patient data from CHW's conversational input using Claude
 */
async function extractPatientData(chwInput) {
  const extractionPrompt = `You are a medical data extraction assistant for Community Health Workers (CHWs) in low-resource settings. Extract structured patient data from the CHW's report below.

CHW Report:
"${chwInput}"

Extract and return ONLY a JSON object with these fields (use null for missing data):

{
  "name": "patient name",
  "age": "age with unit (e.g., 18 months, 3 years)",
  "ageInMonths": numeric age in months,
  "sex": "Male/Female",
  "weight": weight in kg (number or null),
  "chiefComplaint": "main reason for visit",

  "hasCough": true/false,
  "coughDuration": days (number or null),
  "hasDiarrhea": true/false,
  "diarrheaDuration": days (number or null),
  "bloodInStool": true/false,
  "hasFever": true/false,
  "feverDuration": days (number or null),

  "respiratoryRate": breaths per minute (number or null),
  "temperature": temperature in celsius (number or null),

  "convulsions": true/false,
  "hasConvulsions": true/false,
  "chestIndrawing": true/false,
  "hasChestIndrawing": true/false,
  "unconscious": true/false,
  "isUnconscious": true/false,
  "lethargic": true/false,
  "cannotDrink": true/false,
  "cannotEat": true/false,
  "unableToDrink": true/false,
  "vomitsEverything": true/false,
  "stridorWhenCalm": true/false,

  "sunkenEyes": true/false,
  "drinksEagerly": true/false,
  "restless": true/false,
  "skinPinch": "normal"/"slow"/"very slow"/null,

  "muac": "red"/"yellow"/"green"/null (MUAC measurement color),
  "bilateralFootEdema": true/false,

  "malariaTestPositive": true/false/null,
  "malariaRiskArea": true/false,
  "hasStiffNeck": true/false,
  "hasBulgingFontanelle": true/false
}

Important extraction rules:
- For age: Convert to months. Examples: "18 months" = 18, "2 years" = 24, "3 years old" = 36
- For respiratory rate: Look for "breathing fast", "breaths per minute", "RR". Normal is <40 for >1yr, <50 for infants
- For duration: Look for "3 days", "since yesterday" (1 day), "for a week" (7 days)
- For MUAC: "red band" = "red", "yellow band" = "yellow", "green band" = "green", "good nutrition" = "green"
- Assume malariaRiskArea = true unless specifically stated otherwise (most rural areas are malaria-endemic)
- Set danger signs (convulsions, unconscious, lethargic, etc.) to true only if explicitly mentioned
- Use clinical judgment: "not feeding well" = cannotEat: true, "drinks poorly" = cannotDrink: true

Return ONLY the JSON object, no additional text or formatting.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: extractionPrompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (in case Claude adds any formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const patientData = JSON.parse(jsonMatch[0]);
    return patientData;

  } catch (error) {
    console.error('Error extracting patient data:', error);
    throw error;
  }
}

/**
 * Generate a verbal summary confirmation for the CHW
 */
async function generateConfirmationSummary(patientData, diagnosis) {
  const summaryPrompt = `Generate a brief, clear verbal confirmation (2-3 sentences) for a Community Health Worker based on this patient assessment:

Patient: ${patientData.name}, ${patientData.age}
Chief Complaint: ${patientData.chiefComplaint}
Primary Diagnosis: ${diagnosis.diagnoses[0]?.classification}
Action: ${diagnosis.diagnoses[0]?.action}

Make it reassuring and actionable. Example: "Let me confirm: This is Amara, 18 months old, with cough and fast breathing for 3 days. Based on the assessment, this looks like pneumonia. We'll treat with oral antibiotics and follow up in 2 days."`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: summaryPrompt
      }]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Assessment complete. Please review the diagnosis and treatment plan.';
  }
}

// Routes

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'VillageHealth API is running' });
});

/**
 * Process patient intake - Main AI endpoint
 */
app.post('/api/intake', async (req, res) => {
  try {
    const { chwInput } = req.body;

    if (!chwInput || chwInput.trim().length === 0) {
      return res.status(400).json({ error: 'CHW input is required' });
    }

    // Step 1: Extract structured data using Claude
    console.log('Extracting patient data...');
    const patientData = await extractPatientData(chwInput);

    // Step 2: Run clinical decision engine
    console.log('Running clinical decision engine...');
    const diagnosis = diagnosePatient(patientData);

    // Step 3: Generate confirmation summary
    console.log('Generating confirmation summary...');
    const confirmationSummary = await generateConfirmationSummary(patientData, diagnosis);

    // Step 4: Save patient encounter
    const patientRecord = {
      id: nextPatientId++,
      ...diagnosis,
      rawInput: chwInput,
      confirmationSummary: confirmationSummary
    };
    patients.push(patientRecord);

    res.json({
      success: true,
      patientId: patientRecord.id,
      diagnosis: diagnosis,
      confirmationSummary: confirmationSummary,
      extractedData: patientData
    });

  } catch (error) {
    console.error('Error processing intake:', error);
    res.status(500).json({
      error: 'Failed to process patient intake',
      details: error.message
    });
  }
});

/**
 * Process patient intake with structured data (Form-based, no AI extraction)
 */
app.post('/api/intake-direct', async (req, res) => {
  try {
    const { patientData } = req.body;

    if (!patientData) {
      return res.status(400).json({ error: 'Patient data is required' });
    }

    console.log('Processing structured patient data...');

    // Step 1: Run clinical decision engine directly (skip AI extraction)
    const diagnosis = diagnosePatient(patientData);

    // Step 2: Generate simple confirmation summary
    const confirmationSummary = `Assessment complete for ${patientData.name}, ${patientData.age}. ${diagnosis.diagnoses[0]?.classification || 'Assessment completed'}.`;

    // Step 3: Save patient encounter
    const patientRecord = {
      id: nextPatientId++,
      ...diagnosis,
      confirmationSummary: confirmationSummary
    };
    patients.push(patientRecord);

    res.json({
      success: true,
      patientId: patientRecord.id,
      diagnosis: diagnosis,
      confirmationSummary: confirmationSummary
    });

  } catch (error) {
    console.error('Error processing intake:', error);
    res.status(500).json({
      error: 'Failed to process patient intake',
      details: error.message
    });
  }
});

/**
 * Get all patient records
 */
app.get('/api/patients', (req, res) => {
  // Return patients sorted by most recent first
  const sortedPatients = [...patients].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json({ patients: sortedPatients });
});

/**
 * Get single patient record
 */
app.get('/api/patients/:id', (req, res) => {
  const patientId = parseInt(req.params.id);
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  res.json({ patient });
});

/**
 * Update patient record (for follow-up assessments)
 */
app.put('/api/patients/:id', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { patientData } = req.body;

    if (!patientData) {
      return res.status(400).json({ error: 'Patient data is required' });
    }

    const patientIndex = patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    console.log(`Updating patient record ${patientId}...`);

    // Run clinical decision engine with new assessment data
    const diagnosis = diagnosePatient(patientData);

    // Generate new confirmation summary
    const confirmationSummary = `Follow-up assessment complete for ${patientData.name}, ${patientData.age}. ${diagnosis.diagnoses[0]?.classification || 'Assessment completed'}.`;

    // Check if new assessment has urgent conditions that override previous assessment
    const hasNewUrgentCondition = diagnosis.urgentReferral;
    const previouslyUrgent = patients[patientIndex].urgentReferral;

    // Update the patient record, preserving the original ID and timestamp of first visit
    const originalTimestamp = patients[patientIndex].timestamp;
    const updatedRecord = {
      id: patientId,
      ...diagnosis,
      confirmationSummary: confirmationSummary,
      timestamp: originalTimestamp, // Keep original timestamp
      lastUpdated: new Date().toISOString(), // Add last updated timestamp
      isFollowUp: true
    };

    patients[patientIndex] = updatedRecord;

    res.json({
      success: true,
      patientId: patientId,
      diagnosis: diagnosis,
      confirmationSummary: confirmationSummary,
      wasUpdatedToUrgent: hasNewUrgentCondition && !previouslyUrgent
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      error: 'Failed to update patient record',
      details: error.message
    });
  }
});

/**
 * Mark task as completed and move to patient history
 */
app.post('/api/patients/:id/complete-task', (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task data is required' });
    }

    const patientIndex = patients.findIndex(p => p.id === patientId);

    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    console.log(`Marking task complete for patient ${patientId}:`, task.task);

    // Initialize completedTasks array if it doesn't exist
    if (!patients[patientIndex].completedTasks) {
      patients[patientIndex].completedTasks = [];
    }

    // Add task to completed tasks history
    patients[patientIndex].completedTasks.push({
      ...task,
      completedAt: task.completedAt || new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Task marked as complete',
      patientId: patientId
    });

  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      error: 'Failed to complete task',
      details: error.message
    });
  }
});

/**
 * Export patient record for referral
 */
app.get('/api/patients/:id/export', (req, res) => {
  const patientId = parseInt(req.params.id);
  const patient = patients.find(p => p.id === patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // Generate referral summary
  const referralText = `
PATIENT REFERRAL SUMMARY
========================

Patient Information:
- Name: ${patient.patientInfo?.name || patient.name}
- Age: ${patient.patientInfo?.age || patient.age}
- Sex: ${patient.patientInfo?.sex || patient.sex}
- Weight: ${patient.patientInfo?.weight || 'Not recorded'} kg
- Date: ${new Date(patient.timestamp).toLocaleString()}

Chief Complaint:
${patient.chiefComplaint}

Diagnoses:
${patient.diagnoses && patient.diagnoses.length > 0 ? patient.diagnoses.map((d, i) => `${i + 1}. ${d.classification} (${d.severity || 'unspecified'})
   Action: ${d.action}
   Treatment: ${d.treatment}`).join('\n\n') : 'No diagnoses recorded'}

${patient.dangerSigns && patient.dangerSigns.length > 0 ? `
DANGER SIGNS PRESENT:
${patient.dangerSigns.map(sign => `- ${sign}`).join('\n')}
` : ''}

Referral Status: ${patient.urgentReferral ? 'URGENT' : patient.referralNeeded ? 'ROUTINE' : 'NOT REQUIRED'}

Follow-up:
${patient.followUp && patient.followUp.length > 0 ? patient.followUp.map(f => `- ${f.condition}: ${f.timeline}`).join('\n') : 'No follow-up scheduled'}

---
Generated by VillageHealth AI Assistant
Community Health Worker: [CHW Name]
  `.trim();

  res.json({
    patientId: patient.id,
    referralText: referralText,
    referralNeeded: patient.referralNeeded,
    urgentReferral: patient.urgentReferral
  });
});

/**
 * Chatbot endpoint for WHO IMCI assistant
 */
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a helpful WHO IMCI (Integrated Management of Childhood Illness) clinical assistant helping Community Health Workers (CHWs) and nurses.

Your role is to:
- Answer questions about the IMCI assessment form and clinical guidelines
- Clarify danger signs, symptoms, and treatment protocols
- Provide quick reference information about WHO IMCI standards
- Help interpret clinical findings
- Offer guidance on when to refer patients

Be concise, clear, and clinically accurate. Use simple language appropriate for CHWs. Always emphasize patient safety and proper referral when needed.`;

    const chatMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: message
      }]
    });

    res.json({
      success: true,
      response: chatMessage.content[0].text
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Failed to process chatbot message',
      details: error.message
    });
  }
});

/**
 * Delete patient record (for demo purposes)
 */
app.delete('/api/patients/:id', (req, res) => {
  const patientId = parseInt(req.params.id);
  const index = patients.findIndex(p => p.id === patientId);

  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  patients.splice(index, 1);
  res.json({ success: true, message: 'Patient record deleted' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏥 VillageHealth Backend running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - POST /api/intake - Process patient intake`);
  console.log(`   - GET  /api/patients - Get all patients`);
  console.log(`   - GET  /api/patients/:id - Get patient details`);
  console.log(`   - GET  /api/patients/:id/export - Export referral`);
  console.log(`\n🔑 Make sure ANTHROPIC_API_KEY is set in .env file\n`);
});
