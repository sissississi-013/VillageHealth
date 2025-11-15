import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FormIntake.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function FormIntake() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Demographics
    name: '',
    ageYears: '',
    ageMonths: '',
    sex: '',
    weight: '',

    // Chief Complaint
    chiefComplaint: [],

    // Danger Signs
    convulsions: false,
    unconscious: false,
    lethargic: false,
    cannotDrink: false,
    cannotEat: false,
    vomitsEverything: false,
    chestIndrawing: false,

    // Respiratory
    hasCough: '',
    coughDuration: '',
    respiratoryRate: '',
    stridorWhenCalm: false,

    // Diarrhea
    hasDiarrhea: '',
    diarrheaDuration: '',
    bloodInStool: false,
    sunkenEyes: false,
    drinksEagerly: false,
    restless: false,
    skinPinch: '',

    // Fever
    hasFever: '',
    feverDuration: '',
    temperature: '',
    hasStiffNeck: false,
    hasBulgingFontanelle: false,
    malariaRiskArea: true,
    malariaTestPositive: '',

    // Nutrition
    muac: '',
    bilateralFootEdema: false
  });

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

  const canProceedToNextStep = () => {
    switch(step) {
      case 1: // Demographics
        return formData.name && formData.sex && (formData.ageYears || formData.ageMonths);
      case 2: // Chief Complaint
        return formData.chiefComplaint.length > 0;
      case 3: // Danger Signs
        return true; // Always can proceed
      case 4: // Respiratory
        return formData.hasCough !== '';
      case 5: // Diarrhea
        return formData.hasDiarrhea !== '';
      case 6: // Fever
        return formData.hasFever !== '';
      case 7: // Nutrition
        return true; // Always can proceed
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Calculate age in months
      const ageInMonths = parseInt(formData.ageYears || 0) * 12 + parseInt(formData.ageMonths || 0);

      // Format age display
      const ageDisplay = formData.ageYears
        ? `${formData.ageYears} year${formData.ageYears > 1 ? 's' : ''}${formData.ageMonths ? ` ${formData.ageMonths} month${formData.ageMonths > 1 ? 's' : ''}` : ''}`
        : `${formData.ageMonths} month${formData.ageMonths > 1 ? 's' : ''}`;

      // Prepare patient data for diagnosis engine
      const patientData = {
        name: formData.name,
        age: ageDisplay,
        ageInMonths: ageInMonths,
        sex: formData.sex,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        chiefComplaint: formData.chiefComplaint.join(', '),

        // Danger signs
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

        // Respiratory
        hasCough: formData.hasCough === 'yes',
        coughDuration: formData.coughDuration ? parseInt(formData.coughDuration) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
        stridorWhenCalm: formData.stridorWhenCalm,

        // Diarrhea
        hasDiarrhea: formData.hasDiarrhea === 'yes',
        diarrheaDuration: formData.diarrheaDuration ? parseInt(formData.diarrheaDuration) : null,
        bloodInStool: formData.bloodInStool,
        sunkenEyes: formData.sunkenEyes,
        drinksEagerly: formData.drinksEagerly,
        restless: formData.restless,
        skinPinch: formData.skinPinch,

        // Fever
        hasFever: formData.hasFever === 'yes',
        feverDuration: formData.feverDuration ? parseInt(formData.feverDuration) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        hasStiffNeck: formData.hasStiffNeck,
        hasBulgingFontanelle: formData.hasBulgingFontanelle,
        malariaRiskArea: formData.malariaRiskArea,
        malariaTestPositive: formData.malariaTestPositive === 'yes',

        // Nutrition
        muac: formData.muac,
        bilateralFootEdema: formData.bilateralFootEdema
      };

      // Call backend directly with structured data (bypass AI extraction)
      const response = await axios.post(`${API_URL}/intake-direct`, {
        patientData: patientData
      });

      // Navigate to patient detail page
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
        <div className="progress-text">Step {step} of 8</div>
      </div>
    );
  };

  return (
    <div className="form-intake-container">
      <div className="form-header">
        <h2>Patient Assessment Form</h2>
        <p className="subtitle">Follow the WHO IMCI clinical assessment workflow</p>
      </div>

      {renderProgressBar()}

      <div className="form-card">
        {/* Step 1: Demographics */}
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
                  max="11"
                  value={formData.ageMonths}
                  onChange={(e) => handleChange('ageMonths', e.target.value)}
                  placeholder="0-11"
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
                  Male
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.sex === 'Female' ? 'selected' : ''}`}
                  onClick={() => handleChange('sex', 'Female')}
                >
                  Female
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

        {/* Step 3: Danger Signs */}
        {step === 3 && (
          <div className="form-step">
            <h3>Step 3: Danger Signs Check</h3>
            <p className="step-description danger-text">⚠️ Check for ANY signs that require immediate referral</p>

            <div className="danger-signs-grid">
              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="convulsions"
                  checked={formData.convulsions}
                  onChange={() => handleCheckboxToggle('convulsions')}
                />
                <label htmlFor="convulsions">
                  <strong>Convulsions</strong>
                  <span className="hint">History of seizures or fits</span>
                </label>
              </div>

              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="unconscious"
                  checked={formData.unconscious}
                  onChange={() => handleCheckboxToggle('unconscious')}
                />
                <label htmlFor="unconscious">
                  <strong>Unconscious</strong>
                  <span className="hint">Not responding to voice or touch</span>
                </label>
              </div>

              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="lethargic"
                  checked={formData.lethargic}
                  onChange={() => handleCheckboxToggle('lethargic')}
                />
                <label htmlFor="lethargic">
                  <strong>Lethargic or Floppy</strong>
                  <span className="hint">Very weak, not moving normally</span>
                </label>
              </div>

              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="cannotDrink"
                  checked={formData.cannotDrink}
                  onChange={() => handleCheckboxToggle('cannotDrink')}
                />
                <label htmlFor="cannotDrink">
                  <strong>Cannot Drink or Breastfeed</strong>
                  <span className="hint">Unable to take any fluids</span>
                </label>
              </div>

              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="vomitsEverything"
                  checked={formData.vomitsEverything}
                  onChange={() => handleCheckboxToggle('vomitsEverything')}
                />
                <label htmlFor="vomitsEverything">
                  <strong>Vomits Everything</strong>
                  <span className="hint">Cannot keep anything down</span>
                </label>
              </div>

              <div className="danger-sign-item">
                <input
                  type="checkbox"
                  id="chestIndrawing"
                  checked={formData.chestIndrawing}
                  onChange={() => handleCheckboxToggle('chestIndrawing')}
                />
                <label htmlFor="chestIndrawing">
                  <strong>Chest Indrawing</strong>
                  <span className="hint">Lower chest wall pulls in with breathing</span>
                </label>
              </div>
            </div>

            {(formData.convulsions || formData.unconscious || formData.lethargic ||
              formData.cannotDrink || formData.vomitsEverything || formData.chestIndrawing) && (
              <div className="danger-alert">
                <strong>⚠️ DANGER SIGNS DETECTED</strong>
                <p>This patient will require urgent referral to a health facility.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Respiratory Assessment */}
        {step === 4 && (
          <div className="form-step">
            <h3>Step 4: Respiratory Assessment</h3>
            <p className="step-description">Check for cough or difficulty breathing</p>

            <div className="form-group">
              <label>Does the child have a cough or difficult breathing? *</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${formData.hasCough === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasCough', 'yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.hasCough === 'no' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasCough', 'no')}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasCough === 'yes' && (
              <>
                <div className="form-group">
                  <label>For how many days?</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.coughDuration}
                    onChange={(e) => handleChange('coughDuration', e.target.value)}
                    placeholder="Number of days"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Respiratory Rate (breaths per minute)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.respiratoryRate}
                    onChange={(e) => handleChange('respiratoryRate', e.target.value)}
                    placeholder="Count for 1 full minute"
                    className="form-input"
                  />
                  <div className="hint-box">
                    <strong>Normal ranges:</strong> &lt;2 months: &lt;60, 2-11 months: &lt;50, 12+ months: &lt;40
                  </div>
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    id="stridorWhenCalm"
                    checked={formData.stridorWhenCalm}
                    onChange={() => handleCheckboxToggle('stridorWhenCalm')}
                  />
                  <label htmlFor="stridorWhenCalm">
                    Stridor when calm (harsh noise when breathing in)
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 5: Diarrhea Assessment */}
        {step === 5 && (
          <div className="form-step">
            <h3>Step 5: Diarrhea Assessment</h3>
            <p className="step-description">Check for diarrhea and dehydration</p>

            <div className="form-group">
              <label>Does the child have diarrhea? *</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${formData.hasDiarrhea === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasDiarrhea', 'yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.hasDiarrhea === 'no' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasDiarrhea', 'no')}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasDiarrhea === 'yes' && (
              <>
                <div className="form-group">
                  <label>For how many days?</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.diarrheaDuration}
                    onChange={(e) => handleChange('diarrheaDuration', e.target.value)}
                    placeholder="Number of days"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    id="bloodInStool"
                    checked={formData.bloodInStool}
                    onChange={() => handleCheckboxToggle('bloodInStool')}
                  />
                  <label htmlFor="bloodInStool">
                    <strong>Blood in stool</strong> (visible blood in diarrhea)
                  </label>
                </div>

                <div className="dehydration-section">
                  <h4>Dehydration Signs:</h4>

                  <div className="form-group">
                    <input
                      type="checkbox"
                      id="sunkenEyes"
                      checked={formData.sunkenEyes}
                      onChange={() => handleCheckboxToggle('sunkenEyes')}
                    />
                    <label htmlFor="sunkenEyes">Sunken eyes</label>
                  </div>

                  <div className="form-group">
                    <input
                      type="checkbox"
                      id="drinksEagerly"
                      checked={formData.drinksEagerly}
                      onChange={() => handleCheckboxToggle('drinksEagerly')}
                    />
                    <label htmlFor="drinksEagerly">Drinks eagerly or thirsty</label>
                  </div>

                  <div className="form-group">
                    <input
                      type="checkbox"
                      id="restless"
                      checked={formData.restless}
                      onChange={() => handleCheckboxToggle('restless')}
                    />
                    <label htmlFor="restless">Restless or irritable</label>
                  </div>

                  <div className="form-group">
                    <label>Skin pinch (pinch skin of abdomen)</label>
                    <div className="button-group">
                      <button
                        type="button"
                        className={`option-button small ${formData.skinPinch === 'normal' ? 'selected' : ''}`}
                        onClick={() => handleChange('skinPinch', 'normal')}
                      >
                        Goes back quickly
                      </button>
                      <button
                        type="button"
                        className={`option-button small ${formData.skinPinch === 'slow' ? 'selected' : ''}`}
                        onClick={() => handleChange('skinPinch', 'slow')}
                      >
                        Goes back slowly
                      </button>
                      <button
                        type="button"
                        className={`option-button small ${formData.skinPinch === 'very slow' ? 'selected' : ''}`}
                        onClick={() => handleChange('skinPinch', 'very slow')}
                      >
                        Goes back very slowly
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 6: Fever Assessment */}
        {step === 6 && (
          <div className="form-step">
            <h3>Step 6: Fever Assessment</h3>
            <p className="step-description">Check for fever and related conditions</p>

            <div className="form-group">
              <label>Does the child have fever? *</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${formData.hasFever === 'yes' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasFever', 'yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.hasFever === 'no' ? 'selected' : ''}`}
                  onClick={() => handleChange('hasFever', 'no')}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasFever === 'yes' && (
              <>
                <div className="form-group">
                  <label>For how many days?</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.feverDuration}
                    onChange={(e) => handleChange('feverDuration', e.target.value)}
                    placeholder="Number of days"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Temperature (°C) - Optional</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="43"
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    placeholder="e.g., 38.5"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    id="hasStiffNeck"
                    checked={formData.hasStiffNeck}
                    onChange={() => handleCheckboxToggle('hasStiffNeck')}
                  />
                  <label htmlFor="hasStiffNeck">
                    <strong>Stiff neck</strong> (cannot touch chin to chest)
                  </label>
                </div>

                <div className="form-group">
                  <input
                    type="checkbox"
                    id="hasBulgingFontanelle"
                    checked={formData.hasBulgingFontanelle}
                    onChange={() => handleCheckboxToggle('hasBulgingFontanelle')}
                  />
                  <label htmlFor="hasBulgingFontanelle">
                    <strong>Bulging fontanelle</strong> (soft spot on head is bulging)
                  </label>
                </div>

                <div className="form-group">
                  <label>Is this area at risk for malaria?</label>
                  <div className="button-group">
                    <button
                      type="button"
                      className={`option-button ${formData.malariaRiskArea === true ? 'selected' : ''}`}
                      onClick={() => handleChange('malariaRiskArea', true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`option-button ${formData.malariaRiskArea === false ? 'selected' : ''}`}
                      onClick={() => handleChange('malariaRiskArea', false)}
                    >
                      No
                    </button>
                  </div>
                </div>

                {formData.malariaRiskArea && (
                  <div className="form-group">
                    <label>Malaria rapid test result</label>
                    <div className="button-group">
                      <button
                        type="button"
                        className={`option-button ${formData.malariaTestPositive === 'yes' ? 'selected' : ''}`}
                        onClick={() => handleChange('malariaTestPositive', 'yes')}
                      >
                        Positive
                      </button>
                      <button
                        type="button"
                        className={`option-button ${formData.malariaTestPositive === 'no' ? 'selected' : ''}`}
                        onClick={() => handleChange('malariaTestPositive', 'no')}
                      >
                        Negative
                      </button>
                      <button
                        type="button"
                        className={`option-button ${formData.malariaTestPositive === 'not tested' ? 'selected' : ''}`}
                        onClick={() => handleChange('malariaTestPositive', 'not tested')}
                      >
                        Not Tested
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 7: Nutrition Assessment */}
        {step === 7 && (
          <div className="form-step">
            <h3>Step 7: Nutrition Assessment</h3>
            <p className="step-description">Check nutritional status</p>

            <div className="form-group">
              <label>MUAC (Mid-Upper Arm Circumference) measurement</label>
              <div className="muac-buttons">
                <button
                  type="button"
                  className={`muac-button red ${formData.muac === 'red' ? 'selected' : ''}`}
                  onClick={() => handleChange('muac', 'red')}
                >
                  <span className="muac-color red-band"></span>
                  Red (&lt;115mm)
                  <span className="muac-label">Severe</span>
                </button>
                <button
                  type="button"
                  className={`muac-button yellow ${formData.muac === 'yellow' ? 'selected' : ''}`}
                  onClick={() => handleChange('muac', 'yellow')}
                >
                  <span className="muac-color yellow-band"></span>
                  Yellow (115-125mm)
                  <span className="muac-label">Moderate</span>
                </button>
                <button
                  type="button"
                  className={`muac-button green ${formData.muac === 'green' ? 'selected' : ''}`}
                  onClick={() => handleChange('muac', 'green')}
                >
                  <span className="muac-color green-band"></span>
                  Green (&gt;125mm)
                  <span className="muac-label">Normal</span>
                </button>
                <button
                  type="button"
                  className={`muac-button ${formData.muac === 'not measured' ? 'selected' : ''}`}
                  onClick={() => handleChange('muac', 'not measured')}
                >
                  Not Measured
                </button>
              </div>
            </div>

            <div className="form-group">
              <input
                type="checkbox"
                id="bilateralFootEdema"
                checked={formData.bilateralFootEdema}
                onChange={() => handleCheckboxToggle('bilateralFootEdema')}
              />
              <label htmlFor="bilateralFootEdema">
                <strong>Bilateral foot edema</strong> (swelling of both feet)
              </label>
            </div>
          </div>
        )}

        {/* Step 8: Review and Submit */}
        {step === 8 && (
          <div className="form-step">
            <h3>Step 8: Review and Submit</h3>
            <p className="step-description">Review the assessment before submitting</p>

            <div className="review-summary">
              <div className="review-section">
                <h4>Patient Information</h4>
                <p><strong>Name:</strong> {formData.name}</p>
                <p><strong>Age:</strong> {formData.ageYears && `${formData.ageYears} year(s)`} {formData.ageMonths && `${formData.ageMonths} month(s)`}</p>
                <p><strong>Sex:</strong> {formData.sex}</p>
                {formData.weight && <p><strong>Weight:</strong> {formData.weight} kg</p>}
              </div>

              <div className="review-section">
                <h4>Chief Complaint</h4>
                <p>{formData.chiefComplaint.join(', ')}</p>
              </div>

              {(formData.convulsions || formData.unconscious || formData.lethargic ||
                formData.cannotDrink || formData.vomitsEverything || formData.chestIndrawing) && (
                <div className="review-section danger">
                  <h4>⚠️ Danger Signs Present</h4>
                  <ul>
                    {formData.convulsions && <li>Convulsions</li>}
                    {formData.unconscious && <li>Unconscious</li>}
                    {formData.lethargic && <li>Lethargic</li>}
                    {formData.cannotDrink && <li>Cannot drink</li>}
                    {formData.vomitsEverything && <li>Vomits everything</li>}
                    {formData.chestIndrawing && <li>Chest indrawing</li>}
                  </ul>
                </div>
              )}

              {formData.hasCough === 'yes' && (
                <div className="review-section">
                  <h4>Respiratory</h4>
                  <p>Cough present for {formData.coughDuration} days</p>
                  {formData.respiratoryRate && <p>Respiratory rate: {formData.respiratoryRate}/min</p>}
                </div>
              )}

              {formData.hasDiarrhea === 'yes' && (
                <div className="review-section">
                  <h4>Diarrhea</h4>
                  <p>Diarrhea present for {formData.diarrheaDuration} days</p>
                  {formData.bloodInStool && <p>Blood in stool: Yes</p>}
                </div>
              )}

              {formData.hasFever === 'yes' && (
                <div className="review-section">
                  <h4>Fever</h4>
                  <p>Fever present for {formData.feverDuration} days</p>
                  {formData.temperature && <p>Temperature: {formData.temperature}°C</p>}
                </div>
              )}

              {formData.muac && formData.muac !== 'not measured' && (
                <div className="review-section">
                  <h4>Nutrition</h4>
                  <p>MUAC: {formData.muac.toUpperCase()}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="error-box">
                <strong>Error:</strong> {error}
              </div>
            )}
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
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="nav-button submit"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Assessment...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormIntake;
