import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import ChatInterface from './components/ChatInterface';
import PatientDashboard from './components/PatientDashboard';
import PatientDetail from './components/PatientDetail';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>🏥 VillageHealth</h1>
          <p className="tagline">Intelligent Health Services</p>
        </div>
        <div className="nav-links">
          <Link
            to="/"
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Patient Intake
          </Link>
          <Link
            to="/patients"
            className={location.pathname === '/patients' ? 'nav-link active' : 'nav-link'}
          >
            Patient Records
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ChatInterface />} />
            <Route path="/patients" element={<PatientDashboard />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
