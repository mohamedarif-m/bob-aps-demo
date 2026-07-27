import { useState, useEffect } from 'react';
import APSDashboard from './components/APSDashboard';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULTS = {
  clientName:     import.meta.env.VITE_CLIENT_NAME || 'APS',
  clientTagline:  'Arizona Public Service — Real-time Dashboard',
  colorPrimary:   '#003087',
  colorSecondary: '#E87722',
};

function App() {
  const [config, setConfig] = useState(DEFAULTS);

  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(r => r.json())
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }));
        document.title = `${data.clientName || DEFAULTS.clientName} Grid Operations`;
        // Apply branding colours as CSS variables so the whole UI re-themes at runtime
        if (data.colorPrimary)   document.documentElement.style.setProperty('--color-primary',   data.colorPrimary);
        if (data.colorSecondary) document.documentElement.style.setProperty('--color-secondary', data.colorSecondary);
      })
      .catch(() => {/* fallback stays */});
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">⚡</span>
            <div>
              <div className="logo-text">
                <span>{config.clientName}</span> Grid Operations
              </div>
              <div className="tagline">{config.clientTagline}</div>
            </div>
          </div>
          <div className="header-meta">Built by Bob AI Developer</div>
        </div>
      </header>

      <main className="main-content">
        <APSDashboard clientName={config.clientName} apiBase={API_BASE} />
      </main>

      <footer className="app-footer">
        <p>© 2024 {config.clientName} · Powered by React + Vite · Backend: Express.js · AI: Bob Developer</p>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
