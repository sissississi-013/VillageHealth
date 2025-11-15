import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './PatientDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function PatientDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [confirmedTasks, setConfirmedTasks] = useState(new Set());

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

  const generateTasks = () => {
    const tasks = [];
    patients.forEach((patient) => {
      const patientName = patient.patientInfo?.name || patient.name;

      // Urgent referral tasks
      if (patient.urgentReferral) {
        tasks.push({
          id: `${patient.id}-urgent-referral`,
          patientId: patient.id,
          patientName,
          task: `${patientName} needs URGENT referral to hospital`,
          priority: 'critical',
          type: 'referral'
        });
      }

      // Regular referral tasks
      if (patient.referralNeeded && !patient.urgentReferral) {
        tasks.push({
          id: `${patient.id}-referral`,
          patientId: patient.id,
          patientName,
          task: `${patientName} needs referral to health facility`,
          priority: 'high',
          type: 'referral'
        });
      }

      // Treatment tasks from diagnoses
      if (patient.diagnoses && patient.diagnoses.length > 0) {
        patient.diagnoses.forEach((diagnosis, index) => {
          if (diagnosis.treatment) {
            const treatmentSummary = diagnosis.treatment.split('.')[0]; // Get first sentence
            tasks.push({
              id: `${patient.id}-treatment-${index}`,
              patientId: patient.id,
              patientName,
              task: `${patientName}: ${treatmentSummary}`,
              priority: diagnosis.severity === 'critical' ? 'critical' : diagnosis.severity === 'moderate' ? 'high' : 'normal',
              type: 'treatment'
            });
          }
        });
      }

      // Follow-up tasks
      if (patient.followUp && patient.followUp.length > 0) {
        patient.followUp.forEach((followUp, index) => {
          tasks.push({
            id: `${patient.id}-followup-${index}`,
            patientId: patient.id,
            patientName,
            task: `${patientName}: Follow-up ${followUp.condition} in ${followUp.timeline}`,
            priority: 'normal',
            type: 'followup'
          });
        });
      }
    });

    // Sort by priority: critical > high > normal
    return tasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const confirmTask = async (task) => {
    try {
      // Call backend to mark task as complete in patient record
      await axios.post(`${API_URL}/patients/${task.patientId}/complete-task`, {
        task: {
          id: task.id,
          task: task.task,
          type: task.type,
          priority: task.priority,
          completedAt: new Date().toISOString()
        }
      });

      // Mark task as confirmed locally
      setConfirmedTasks(prev => new Set([...prev, task.id]));
      setCompletedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });

      // Refresh patient list to reflect changes
      await fetchPatients();
    } catch (err) {
      console.error('Error confirming task:', err);
      alert('Failed to confirm task. Please try again.');
    }
  };

  const tasks = generateTasks().filter(task => !confirmedTasks.has(task.id));

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

      <div className="dashboard-content">
        <div className="patients-section">
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

        {tasks.length > 0 && (
          <div className="task-sidebar">
            <div className="task-sidebar-header">
              <h3>🎯 Urgent Tasks</h3>
              <span className="task-count">{tasks.filter(t => !completedTasks.has(t.id)).length} pending</span>
            </div>
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id}>
                  <div
                    className={`task-item ${task.priority} ${completedTasks.has(task.id) ? 'completed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={completedTasks.has(task.id)}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <div className="task-content">
                      <div className="task-text">{task.task}</div>
                      <Link to={`/patients/${task.patientId}`} className="task-patient-link">
                        View patient →
                      </Link>
                    </div>
                    <div className={`task-priority-indicator ${task.priority}`}>
                      {task.priority === 'critical' && '🚨'}
                      {task.priority === 'high' && '⚠️'}
                      {task.priority === 'normal' && '📋'}
                    </div>
                  </div>
                  {completedTasks.has(task.id) && (
                    <button
                      onClick={() => confirmTask(task)}
                      className="confirm-task-button"
                    >
                      ✓ Confirm Completion
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;
