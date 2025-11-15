import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientDetail.css';

const API_URL = 'http://localhost:3001/api';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportText, setExportText] = useState(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/patients/${id}`);
      setPatient(response.data.patient);
      setError(null);
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Patient not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_URL}/patients/${id}/export`);
      setExportText(response.data.referralText);
      setShowExport(true);
    } catch (err) {
      console.error('Error exporting patient:', err);
      alert('Failed to generate referral summary.');
    }
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportText);
    alert('Referral summary copied to clipboard!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading">Loading patient record...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="detail-container">
        <div className="error-message">{error || 'Patient not found'}</div>
        <Link to="/patients" className="back-button">
          ← Back to Patient Records
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <Link to="/patients" className="back-link">
          ← Back to Records
        </Link>
        <div className="detail-actions">
          <button onClick={handleExport} className="export-button">
            📋 Export Referral
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <div>
            <h1>{patient.patientInfo?.name || patient.name}</h1>
            <p className="timestamp">{formatDate(patient.timestamp)}</p>
          </div>
          {patient.urgentReferral && (
            <span className="urgent-badge-large">🚨 URGENT REFERRAL</span>
          )}
        </div>

        <div className="detail-section">
          <h2>Patient Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Age</span>
              <span className="info-value">{patient.patientInfo?.age || patient.age}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sex</span>
              <span className="info-value">{patient.patientInfo?.sex || patient.sex}</span>
            </div>
            {patient.patientInfo?.weight && (
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">{patient.patientInfo.weight} kg</span>
              </div>
            )}
            {patient.patientInfo?.muac && (
              <div className="info-item">
                <span className="info-label">MUAC</span>
                <span className="info-value">{patient.patientInfo.muac}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h2>Chief Complaint</h2>
          <p className="chief-complaint-text">{patient.chiefComplaint}</p>
        </div>

        {patient.dangerSigns && patient.dangerSigns.length > 0 && (
          <div className="detail-section danger-section">
            <h2>⚠️ Danger Signs Present</h2>
            <ul className="danger-signs-list">
              {patient.dangerSigns.map((sign, index) => (
                <li key={index}>{sign}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="detail-section">
          <h2>Diagnosis & Classification</h2>
          {patient.diagnoses && patient.diagnoses.map((diagnosis, index) => (
            <div key={index} className={`diagnosis-detail-card ${getSeverityClass(diagnosis.severity)}`}>
              <div className="diagnosis-header">
                <h3>{diagnosis.classification}</h3>
                {diagnosis.severity && (
                  <span className="severity-tag">{diagnosis.severity.toUpperCase()}</span>
                )}
              </div>
              <div className="diagnosis-content">
                <div className="diagnosis-row">
                  <strong>Action:</strong>
                  <span>{diagnosis.action}</span>
                </div>
                {diagnosis.treatment && (
                  <div className="diagnosis-row">
                    <strong>Treatment:</strong>
                    <span>{diagnosis.treatment}</span>
                  </div>
                )}
                {diagnosis.dosing && (
                  <div className="diagnosis-row">
                    <strong>Dosing:</strong>
                    <span>{diagnosis.dosing}</span>
                  </div>
                )}
                {diagnosis.followUp && (
                  <div className="diagnosis-row">
                    <strong>Follow-up:</strong>
                    <span>{diagnosis.followUp}</span>
                  </div>
                )}
                {diagnosis.dangerSigns && diagnosis.dangerSigns.length > 0 && (
                  <div className="diagnosis-row">
                    <strong>Danger Signs:</strong>
                    <span>{diagnosis.dangerSigns.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {patient.treatments && patient.treatments.length > 0 && (
          <div className="detail-section">
            <h2>Treatment Plan</h2>
            {patient.treatments.map((treatment, index) => (
              <div key={index} className="treatment-card">
                <h4>{treatment.condition}</h4>
                <p>{treatment.treatment}</p>
                {treatment.dosing && <p className="dosing-info">{treatment.dosing}</p>}
              </div>
            ))}
          </div>
        )}

        {patient.followUp && patient.followUp.length > 0 && (
          <div className="detail-section">
            <h2>Follow-up Schedule</h2>
            {patient.followUp.map((followUp, index) => (
              <div key={index} className="followup-card">
                <strong>{followUp.condition}:</strong>
                <span>{followUp.timeline}</span>
              </div>
            ))}
          </div>
        )}

        {patient.referralNeeded && (
          <div className={`referral-notice ${patient.urgentReferral ? 'urgent' : ''}`}>
            <h3>
              {patient.urgentReferral ? '🚨 URGENT REFERRAL REQUIRED' : '📋 Referral Recommended'}
            </h3>
            <p>
              {patient.urgentReferral
                ? 'This patient requires immediate transfer to a health facility.'
                : 'Patient should be referred to the next level of care.'}
            </p>
          </div>
        )}

        {patient.confirmationSummary && (
          <div className="detail-section">
            <h2>Assessment Summary</h2>
            <p className="summary-text">{patient.confirmationSummary}</p>
          </div>
        )}
      </div>

      {showExport && exportText && (
        <div className="export-modal">
          <div className="export-modal-content">
            <div className="export-modal-header">
              <h2>Referral Summary</h2>
              <button onClick={() => setShowExport(false)} className="close-button">
                ✕
              </button>
            </div>
            <pre className="export-text">{exportText}</pre>
            <div className="export-modal-actions">
              <button onClick={handleCopyExport} className="copy-button">
                📋 Copy to Clipboard
              </button>
              <button onClick={() => setShowExport(false)} className="close-modal-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDetail;
