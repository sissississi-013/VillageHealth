import { useState } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function ChatInterface() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/intake`, {
        chwInput: input
      });

      setResult(response.data);
      setInput(''); // Clear input after successful submission
    } catch (err) {
      console.error('Error processing intake:', err);
      setError(err.response?.data?.error || 'Failed to process patient intake. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewPatient = () => {
    setResult(null);
    setError(null);
    setInput('');
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'severity-critical';
      case 'severe':
        return 'severity-severe';
      case 'moderate':
        return 'severity-moderate';
      case 'mild':
        return 'severity-mild';
      default:
        return 'severity-none';
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Patient Intake Assistant</h2>
        <p className="subtitle">Describe the patient's symptoms and vital signs conversationally</p>
      </div>

      {!result && (
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <div className="example-prompts">
              <p className="example-label">Example prompts:</p>
              <button
                type="button"
                className="example-chip"
                onClick={() => setInput("Baby Amara, 18 months old, has had a cough for 3 days. She's breathing fast - I counted 52 breaths per minute. No chest indrawing. She's alert and feeding okay.")}
              >
                Cough & Fast Breathing
              </button>
              <button
                type="button"
                className="example-chip"
                onClick={() => setInput("Kofi is 3 years old. He has diarrhea for 2 days. His eyes look sunken and he drinks water eagerly. MUAC band is green. He's restless but alert.")}
              >
                Diarrhea & Dehydration
              </button>
              <button
                type="button"
                className="example-chip"
                onClick={() => setInput("Zara, 2 years old girl. High fever since yesterday. She had a convulsion this morning. She's very lethargic now and not responding normally.")}
              >
                Danger Signs
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: 'Baby Amara, 18 months, has cough for 3 days and fast breathing. Respiratory rate is 52. No chest indrawing, alert, feeding okay.'"
              rows={6}
              disabled={isProcessing}
              className="chat-input"
            />

            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="submit-button"
            >
              {isProcessing ? 'Processing...' : 'Assess Patient'}
            </button>
          </form>

          {error && (
            <div className="error-box">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="result-section">
          <div className="confirmation-box">
            <h3>✓ Assessment Complete</h3>
            <p className="confirmation-text">{result.confirmationSummary}</p>
          </div>

          <div className="diagnosis-card">
            <div className="card-header">
              <h3>Patient Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{result.diagnosis.patientInfo?.name || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Age:</span>
                  <span className="info-value">{result.diagnosis.patientInfo?.age || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sex:</span>
                  <span className="info-value">{result.diagnosis.patientInfo?.sex || 'N/A'}</span>
                </div>
                {result.diagnosis.patientInfo?.weight && (
                  <div className="info-item">
                    <span className="info-label">Weight:</span>
                    <span className="info-value">{result.diagnosis.patientInfo.weight} kg</span>
                  </div>
                )}
              </div>
              <div className="chief-complaint">
                <span className="info-label">Chief Complaint:</span>
                <p>{result.diagnosis.chiefComplaint}</p>
              </div>
            </div>
          </div>

          {result.diagnosis.dangerSigns && result.diagnosis.dangerSigns.length > 0 && (
            <div className="danger-signs-alert">
              <h4>⚠️ DANGER SIGNS PRESENT</h4>
              <ul>
                {result.diagnosis.dangerSigns.map((sign, index) => (
                  <li key={index}>{sign}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="diagnosis-card">
            <div className="card-header">
              <h3>Diagnosis & Classification</h3>
            </div>
            <div className="card-content">
              {result.diagnosis.diagnoses.map((diagnosis, index) => (
                <div key={index} className={`diagnosis-item ${getSeverityClass(diagnosis.severity)}`}>
                  <div className="diagnosis-classification">
                    <span className="classification-badge">{diagnosis.classification}</span>
                    {diagnosis.severity && (
                      <span className="severity-badge">{diagnosis.severity.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="diagnosis-details">
                    <p><strong>Action:</strong> {diagnosis.action}</p>
                    {diagnosis.treatment && <p><strong>Treatment:</strong> {diagnosis.treatment}</p>}
                    {diagnosis.dosing && <p><strong>Dosing:</strong> {diagnosis.dosing}</p>}
                    {diagnosis.followUp && <p><strong>Follow-up:</strong> {diagnosis.followUp}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.diagnosis.referralNeeded && (
            <div className={`referral-box ${result.diagnosis.urgentReferral ? 'urgent' : ''}`}>
              <h4>
                {result.diagnosis.urgentReferral ? '🚨 URGENT REFERRAL REQUIRED' : '📋 Referral Recommended'}
              </h4>
              <p>
                {result.diagnosis.urgentReferral
                  ? 'This patient requires immediate transfer to a health facility.'
                  : 'Patient should be referred to the next level of care.'}
              </p>
            </div>
          )}

          <div className="action-buttons">
            <button onClick={handleNewPatient} className="new-patient-button">
              New Patient Assessment
            </button>
            <a href={`/patients/${result.patientId}`} className="view-details-button">
              View Full Record
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatInterface;
