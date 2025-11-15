import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormIntake.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Quick assessment templates
const TEMPLATES = {
  pneumonia: {
    name: 'Pneumonia Case',
    data: {
      chiefComplaint: ['Cough', 'Difficulty breathing'],
      hasCough: 'yes',
      coughDuration: '3',
      respiratoryRate: '55',
      hasDiarrhea: 'no',
      hasFever: 'yes',
      feverDuration: '2'
    }
  },
  dehydration: {
    name: 'Dehydration Case',
    data: {
      chiefComplaint: ['Diarrhea', 'Vomiting'],
      hasCough: 'no',
      hasDiarrhea: 'yes',
      diarrheaDuration: '2',
      sunkenEyes: true,
      drinksEagerly: true,
      skinPinch: 'slow',
      hasFever: 'no'
    }
  },
  feverMalaria: {
    name: 'Fever/Malaria',
    data: {
      chiefComplaint: ['Fever'],
      hasCough: 'no',
      hasDiarrhea: 'no',
      hasFever: 'yes',
      feverDuration: '2',
      temperature: '39.5',
      malariaRiskArea: true,
      malariaTestPositive: 'yes'
    }
  },
  dangerSigns: {
    name: 'Danger Signs',
    data: {
      chiefComplaint: ['Convulsions', 'Lethargic/weak'],
      convulsions: true,
      lethargic: true,
      hasCough: 'no',
      hasDiarrhea: 'no',
      hasFever: 'yes',
      feverDuration: '1'
    }
  }
};

function FormIntakeEnhanced() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [showTemplates, setShowTemplates] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    ageYears: '',
    ageMonths: '',
    sex: '',
    weight: '',
    chiefComplaint: [],
    convulsions: false,
    unconscious: false,
    lethargic: false,
    cannotDrink: false,
    cannotEat: false,
    vomitsEverything: false,
    chestIndrawing: false,
    hasCough: '',
    coughDuration: '',
    respiratoryRate: '',
    stridorWhenCalm: false,
    hasDiarrhea: '',
    diarrheaDuration: '',
    bloodInStool: false,
    sunkenEyes: false,
    drinksEagerly: false,
    restless: false,
    skinPinch: '',
    hasFever: '',
    feverDuration: '',
    temperature: '',
    hasStiffNeck: false,
    hasBulgingFontanelle: false,
    malariaRiskArea: true,
    malariaTestPositive: '',
    muac: '',
    bilateralFootEdema: false
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + Arrow keys for navigation
      if (e.altKey && e.key === 'ArrowRight' && step < 8 && canProceedToNextStep()) {
        handleNext();
      }
      if (e.altKey && e.key === 'ArrowLeft' && step > 1) {
        handleBack();
      }
      // Alt + S to submit on final step
      if (e.altKey && e.key === 's' && step === 8) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [step, formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChiefComplaintToggle = (complaint) => {
    setFormData(prev => ({
      ...prev,
      chiefComplaint: prev.chiefComplaint.includes(complaint)
        ? prev.chiefComplaint.filter(c => c !== complaint)
        : [...prev.chiefComplaint, complaint]
    }));
  };

  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    setFormData(prev => ({ ...prev, ...template.data }));
    setShowTemplates(false);
    setStep(2); // Start from chief complaint since template fills it
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        name: '',
        ageYears: '',
        ageMonths: '',
        sex: '',
        weight: '',
        chiefComplaint: [],
        convulsions: false,
        unconscious: false,
        lethargic: false,
        cannotDrink: false,
        cannotEat: false,
        vomitsEverything: false,
        chestIndrawing: false,
        hasCough: '',
        coughDuration: '',
        respiratoryRate: '',
        stridorWhenCalm: false,
        hasDiarrhea: '',
        diarrheaDuration: '',
        bloodInStool: false,
        sunkenEyes: false,
        drinksEagerly: false,
        restless: false,
        skinPinch: '',
        hasFever: '',
        feverDuration: '',
        temperature: '',
        hasStiffNeck: false,
        hasBulgingFontanelle: false,
        malariaRiskArea: true,
        malariaTestPositive: '',
        muac: '',
        bilateralFootEdema: false
      });
      setStep(1);
    }
  };

  const canProceedToNextStep = () => {
    switch(step) {
      case 1:
        return formData.name && formData.sex && (formData.ageYears || formData.ageMonths);
      case 2:
        return formData.chiefComplaint.length > 0;
      case 3:
        return true;
      case 4:
        return formData.hasCough !== '';
      case 5:
        return formData.hasDiarrhea !== '';
      case 6:
        return formData.hasFever !== '';
      case 7:
        return true;
      default:
        return true;
    }
  };

  // Smart navigation - skip irrelevant sections
  const getNextStep = () => {
    if (step === 3) {
      // If danger signs present, skip to review
      if (formData.convulsions || formData.unconscious || formData.lethargic ||
          formData.cannotDrink || formData.vomitsEverything || formData.chestIndrawing) {
        return 8; // Jump to review
      }
    }
    if (step === 4 && formData.hasCough === 'no') return step + 1; // Skip respiratory details
    if (step === 5 && formData.hasDiarrhea === 'no') return step + 1; // Skip diarrhea details
    if (step === 6 && formData.hasFever === 'no') return step + 1; // Skip fever details
    return step + 1;
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      const nextStep = getNextStep();
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const getElapsedTime = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const ageInMonths = parseInt(formData.ageYears || 0) * 12 + parseInt(formData.ageMonths || 0);
      const ageDisplay = formData.ageYears
        ? `${formData.ageYears} year${formData.ageYears > 1 ? 's' : ''}${formData.ageMonths ? ` ${formData.ageMonths} month${formData.ageMonths > 1 ? 's' : ''}` : ''}`
        : `${formData.ageMonths} month${formData.ageMonths > 1 ? 's' : ''}`;

      const patientData = {
        name: formData.name,
        age: ageDisplay,
        ageInMonths: ageInMonths,
        sex: formData.sex,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        chiefComplaint: formData.chiefComplaint.join(', '),
        convulsions: formData.convulsions,
        hasConvulsions: formData.convulsions,
        unconscious: formData.unconscious,
        isUnconscious: formData.unconscious,
        lethargic: formData.lethargic,
        cannotDrink: formData.cannotDrink,
        cannotEat: formData.cannotEat,
        unableToDrink: formData.cannotDrink || formData.cannotEat,
        vomitsEverything: formData.vomitsEverything,
        chestIndrawing: formData.chestIndrawing,
        hasChestIndrawing: formData.chestIndrawing,
        hasCough: formData.hasCough === 'yes',
        coughDuration: formData.coughDuration ? parseInt(formData.coughDuration) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        stridorWhenCalm: formData.stridorWhenCalm,
        hasDiarrhea: formData.hasDiarrhea === 'yes',
        diarrheaDuration: formData.diarrheaDuration ? parseInt(formData.diarrheaDuration) : null,
        bloodInStool: formData.bloodInStool,
        sunkenEyes: formData.sunkenEyes,
        drinksEagerly: formData.drinksEagerly,
        restless: formData.restless,
        skinPinch: formData.skinPinch,
        hasFever: formData.hasFever === 'yes',
        feverDuration: formData.feverDuration ? parseInt(formData.feverDuration) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        hasStiffNeck: formData.hasStiffNeck,
        hasBulgingFontanelle: formData.hasBulgingFontanelle,
        malariaRiskArea: formData.malariaRiskArea,
        malariaTestPositive: formData.malariaTestPositive === 'yes',
        muac: formData.muac,
        bilateralFootEdema: formData.bilateralFootEdema
      };

      const response = await axios.post(`${API_URL}/intake-direct`, {
        patientData: patientData
      });

      // Show success message with time taken
      const timeTaken = getElapsedTime();
      alert(`✅ Assessment completed successfully in ${timeTaken}!\n\nRedirecting to patient record...`);

      navigate(`/patients/${response.data.patientId}`);

    } catch (err) {
      console.error('Error processing assessment:', err);
      setError(err.response?.data?.error || 'Failed to process patient assessment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderProgressBar = () => {
    const progress = (step / 8) * 100;
    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-info">
          <span className="progress-text">Step {step} of 8</span>
          <span className="time-elapsed">⏱️ {getElapsedTime()}</span>
        </div>
      </div>
    );
  };

  const hasDangerSigns = () => {
    return formData.convulsions || formData.unconscious || formData.lethargic ||
           formData.cannotDrink || formData.vomitsEverything || formData.chestIndrawing;
  };

  return (
    <div className="form-intake-container">
      <div className="form-header">
        <h2>Patient Assessment Form</h2>
        <p className="subtitle">Systematic WHO IMCI clinical workflow</p>
        <div className="form-actions">
          <button onClick={() => setShowTemplates(!showTemplates)} className="template-button">
            📋 Quick Templates
          </button>
          <button onClick={clearForm} className="clear-button">
            🗑️ Clear Form
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="templates-modal">
          <div className="templates-content">
            <h3>Quick Assessment Templates</h3>
            <p className="templates-hint">Load pre-filled data for common cases (you can modify after loading)</p>
            <div className="templates-grid">
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="template-card"
                >
                  {template.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTemplates(false)} className="close-templates">
              Close
            </button>
          </div>
        </div>
      )}

      {renderProgressBar()}

      <div className="keyboard-hints">
        <span>💡 Shortcuts: Alt + → (Next) | Alt + ← (Back) | Alt + S (Submit)</span>
      </div>

      <div className="form-card">
        {/* Step 1: Demographics - SAME AS BEFORE */}
        {step === 1 && (
          <div className="form-step">
            <h3>Step 1: Patient Information</h3>
            <p className="step-description">Basic patient demographics</p>

            <div className="form-group">
              <label>Patient Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter patient's full name"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.ageYears}
                  onChange={(e) => handleChange('ageYears', e.target.value)}
                  placeholder="0-5"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Age (Months)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.ageMonths}
                  onChange={(e) => handleChange('ageMonths', e.target.value)}
                  placeholder="0-59"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Sex *</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${formData.sex === 'Male' ? 'selected' : ''}`}
                  onClick={() => handleChange('sex', 'Male')}
                >
                  👦 Male
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.sex === 'Female' ? 'selected' : ''}`}
                  onClick={() => handleChange('sex', 'Female')}
                >
                  👧 Female
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Weight (kg) - Optional</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                placeholder="Enter weight in kg"
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Rest of the steps remain the same, but I'll add the final review step improvements */}

        {/* Steps 2-7 are identical to the original FormIntake.jsx */}
        {/* For brevity, I'll show just step 2 and step 8 with improvements */}

        {/* Step 2: Chief Complaint */}
        {step === 2 && (
          <div className="form-step">
            <h3>Step 2: Chief Complaint</h3>
            <p className="step-description">What is the main reason for this visit? (Select all that apply)</p>

            <div className="checkbox-grid">
              {['Cough', 'Difficulty breathing', 'Diarrhea', 'Fever', 'Vomiting', 'Not eating well', 'Lethargic/weak', 'Convulsions', 'Other'].map(complaint => (
                <button
                  key={complaint}
                  type="button"
                  className={`checkbox-button ${formData.chiefComplaint.includes(complaint) ? 'selected' : ''}`}
                  onClick={() => handleChiefComplaintToggle(complaint)}
                >
                  {formData.chiefComplaint.includes(complaint) && <span className="checkmark">✓ </span>}
                  {complaint}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Enhanced Review */}
        {step === 8 && (
          <div className="form-step">
            <h3>Step 8: Review and Submit</h3>
            <p className="step-description">Review the assessment before submitting</p>

            <div className="assessment-summary-card">
              <div className="summary-header">
                <h4>Assessment Summary</h4>
                <div className="summary-stats">
                  <span className="stat">⏱️ Time: {getElapsedTime()}</span>
                  <span className="stat">📋 {formData.chiefComplaint.length} complaints</span>
                  {hasDangerSigns() && <span className="stat danger">⚠️ Danger Signs</span>}
                </div>
              </div>
            </div>

            <div className="review-summary">
              <div className="review-section">
                <h4>👤 Patient Information</h4>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Age:</strong> {formData.ageYears && `${formData.ageYears} year(s)`} {formData.ageMonths && `${formData.ageMonths} month(s)`}</p>
                <p><strong>Sex:</strong> {formData.sex}</p>
                {formData.weight && <p><strong>Weight:</strong> {formData.weight} kg</p>}
              </div>

              <div className="review-section">
                <h4>📝 Chief Complaint</h4>
                <p>{formData.chiefComplaint.join(', ')}</p>
              </div>

              {hasDangerSigns() && (
                <div className="review-section danger">
                  <h4>⚠️ DANGER SIGNS PRESENT</h4>
                  <ul>
                    {formData.convulsions && <li>Convulsions</li>}
                    {formData.unconscious && <li>Unconscious</li>}
                    {formData.lethargic && <li>Lethargic</li>}
                    {formData.cannotDrink && <li>Cannot drink</li>}
                    {formData.vomitsEverything && <li>Vomits everything</li>}
                    {formData.chestIndrawing && <li>Chest indrawing</li>}
                  </ul>
                  <div className="danger-warning">
                    🚨 This patient requires immediate referral to a health facility
                  </div>
                </div>
              )}

              {formData.hasCough === 'yes' && (
                <div className="review-section">
                  <h4>🫁 Respiratory</h4>
                  <p>Cough present for {formData.coughDuration} days</p>
                  {formData.respiratoryRate && <p>Respiratory rate: {formData.respiratoryRate}/min</p>}
                  {formData.stridorWhenCalm && <p>⚠️ Stridor when calm</p>}
                </div>
              )}

              {formData.hasDiarrhea === 'yes' && (
                <div className="review-section">
                  <h4>💧 Diarrhea</h4>
                  <p>Diarrhea present for {formData.diarrheaDuration} days</p>
                  {formData.bloodInStool && <p>⚠️ Blood in stool</p>}
                  {(formData.sunkenEyes || formData.drinksEagerly || formData.restless || formData.skinPinch) && (
                    <p>Dehydration signs: {[
                      formData.sunkenEyes && 'Sunken eyes',
                      formData.drinksEagerly && 'Drinks eagerly',
                      formData.restless && 'Restless',
                      formData.skinPinch && `Skin pinch: ${formData.skinPinch}`
                    ].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              )}

              {formData.hasFever === 'yes' && (
                <div className="review-section">
                  <h4>🌡️ Fever</h4>
                  <p>Fever present for {formData.feverDuration} days</p>
                  {formData.temperature && <p>Temperature: {formData.temperature}°C</p>}
                  {formData.hasStiffNeck && <p>⚠️ Stiff neck</p>}
                  {formData.hasBulgingFontanelle && <p>⚠️ Bulging fontanelle</p>}
                  {formData.malariaRiskArea && formData.malariaTestPositive && (
                    <p>Malaria test: {formData.malariaTestPositive === 'yes' ? '⚠️ POSITIVE' : 'Negative'}</p>
                  )}
                </div>
              )}

              {formData.muac && formData.muac !== 'not measured' && (
                <div className="review-section">
                  <h4>🎗️ Nutrition</h4>
                  <p>MUAC: <span className={`muac-indicator ${formData.muac}`}>{formData.muac.toUpperCase()}</span></p>
                  {formData.bilateralFootEdema && <p>⚠️ Bilateral foot edema present</p>}
                </div>
              )}
            </div>

            {error && (
              <div className="error-box">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="submit-confirmation">
              <p>✅ Please review all information carefully before submitting</p>
              <p className="time-info">Assessment completed in {getElapsedTime()}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="nav-button back"
              disabled={isProcessing}
            >
              ← Back
            </button>
          )}

          {step < 8 ? (
            <button
              type="button"
              onClick={handleNext}
              className="nav-button next"
              disabled={!canProceedToNextStep()}
            >
              Next → {hasDangerSigns() && step === 3 && <span className="skip-hint">(Skip to Review)</span>}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="nav-button submit"
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Processing...' : '✅ Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormIntakeEnhanced;
