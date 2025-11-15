import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PatientDashboard.css';

const API_URL = 'http://localhost:3001/api';

function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/patients`);
      setPatients(response.data.patients);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patient records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      <div className="dashboard-container">
        <div className="loading">Loading patient records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchPatients} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Patient Records</h2>
        <p className="subtitle">View and manage patient encounters</p>
        <Link to="/" className="new-intake-button">
          + New Patient Intake
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <p>No patient records yet.</p>
          <Link to="/" className="start-button">
            Start First Assessment
          </Link>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="patient-card"
            >
              <div className="patient-card-header">
                <div className="patient-info">
                  <h3>{patient.patientInfo?.name || patient.name}</h3>
                  <span className="patient-meta">
                    {patient.patientInfo?.age || patient.age} • {patient.patientInfo?.sex || patient.sex}
                  </span>
                </div>
                {patient.urgentReferral && (
                  <span className="urgent-badge">URGENT</span>
                )}
                {patient.referralNeeded && !patient.urgentReferral && (
                  <span className="referral-badge">REFERRAL</span>
                )}
              </div>

              <div className="patient-card-body">
                <div className="chief-complaint-section">
                  <span className="label">Chief Complaint:</span>
                  <p>{patient.chiefComplaint}</p>
                </div>

                {patient.diagnoses && patient.diagnoses.length > 0 && (
                  <div className="diagnosis-preview">
                    <div className={`diagnosis-badge ${getSeverityClass(patient.diagnoses[0].severity)}`}>
                      {patient.diagnoses[0].classification}
                    </div>
                    {patient.diagnoses.length > 1 && (
                      <span className="more-diagnoses">
                        +{patient.diagnoses.length - 1} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="patient-card-footer">
                <span className="timestamp">{formatDate(patient.timestamp)}</span>
                <span className="view-link">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
