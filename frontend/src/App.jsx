import { useState, useEffect } from 'react';
import APSDashboard from './components/APSDashboard';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [clientName, setClientName] = useState(import.meta.env.VITE_CLIENT_NAME || 'APS');

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(r => r.json())
      .then(data => { if (data.clientName) { setClientName(data.clientName); document.title = `${data.clientName} Grid Operations`; } })
      .catch(() => {});
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">⚡</span>
            <div>
              <div className="logo-text"><span>{clientName}</span> Grid Operations</div>
              <div className="tagline">Arizona Public Service — Real-time Dashboard</div>
            </div>
          </div>
          <div className="header-meta">Built by Bob AI Developer</div>
        </div>
      </header>
      <main className="main-content">
        <APSDashboard clientName={clientName} apiBase={API_BASE} />
      </main>
      <footer className="app-footer">
        <p>© 2024 {clientName} · React + Vite · Express.js · Bob AI Developer</p>
      </footer>
    </div>
  );
}

export default App;
// Made with Bob
