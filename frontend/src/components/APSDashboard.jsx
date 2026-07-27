import { useState, useEffect } from 'react';
import './APSDashboard.css';

const APSDashboard = ({ clientName, apiBase }) => {
  const [stats, setStats] = useState(null);
  const [regions, setRegions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true); setError(null);
      const [sR, stR, rR, aR] = await Promise.all([
        fetch(`${apiBase}/api/aps/status`), fetch(`${apiBase}/api/aps/stats`),
        fetch(`${apiBase}/api/aps/regions`), fetch(`${apiBase}/api/aps/alerts`)
      ]);
      const [sd, std, rd, ad] = await Promise.all([sR.json(), stR.json(), rR.json(), aR.json()]);
      setStatus(sd.data); setStats(std.data); setRegions(rd.data || []); setAlerts(ad.data || []);
    } catch (err) { setError('Unable to load dashboard data: ' + err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (<div className="loading-screen"><div className="spinner"></div><p>Loading {clientName} grid data…</p></div>);
  if (error)   return (<div className="aps-error"><h3>⚠️ Connection Error</h3><p>{error}</p><button className="btn-refresh" onClick={fetchData}>Retry</button></div>);

  return (
    <div className="aps-dashboard">
      <div className="dash-header">
        <div className="dash-status">
          <span className={`status-dot ${status?.connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-label">{status?.connected ? 'Grid Connected' : 'Disconnected'}</span>
          {status?.lastSync && <span className="last-sync">Last sync: {new Date(status.lastSync).toLocaleTimeString()}</span>}
        </div>
        <button className="btn-refresh" onClick={fetchData}>🔄 Refresh</button>
      </div>

      {stats && (
        <section className="kpi-section">
          <div className="kpi-grid">
            <div className="kpi-card kpi-orange"><div className="kpi-icon">👥</div><div className="kpi-value">{stats.totalCustomers.toLocaleString()}</div><div className="kpi-label">Customers Served</div></div>
            <div className={`kpi-card ${stats.activeOutages > 0 ? 'kpi-warning' : 'kpi-green'}`}><div className="kpi-icon">⚠️</div><div className="kpi-value">{stats.activeOutages}</div><div className="kpi-label">Active Outages</div></div>
            <div className={`kpi-card ${stats.gridCapacityPercent >= 85 ? 'kpi-warning' : 'kpi-blue'}`}><div className="kpi-icon">⚡</div><div className="kpi-value">{stats.gridCapacityPercent}%</div><div className="kpi-label">Grid Capacity</div></div>
            <div className="kpi-card kpi-green"><div className="kpi-icon">🌿</div><div className="kpi-value">{stats.renewableMixPercent}%</div><div className="kpi-label">Renewable Mix</div></div>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">🗺️ Service Regions</h2>
        <div className="regions-grid">
          {regions.map(r => (
            <div key={r.id} className={`region-card ${r.status}`}>
              <div className="region-header">
                <h3 className="region-name">{r.name}</h3>
                <span className={`badge badge-${r.status}`}>{r.status === 'maintenance' ? '🔧 Maintenance' : '● Active'}</span>
              </div>
              <div className="region-stats">
                <div className="region-stat"><span className="region-stat-value">{r.customers.toLocaleString()}</span><span className="region-stat-label">customers</span></div>
                <div className="region-stat"><span className="region-stat-value">{r.substations}</span><span className="region-stat-label">substations</span></div>
                <div className="region-stat"><span className={`region-stat-value ${r.loadPercent >= 85 ? 'load-high' : ''}`}>{r.loadPercent}%</span><span className="region-stat-label">load</span></div>
              </div>
              <div className="load-bar-wrap"><div className={`load-bar ${r.loadPercent >= 85 ? 'load-bar-high' : ''}`} style={{ width: `${r.loadPercent}%` }}></div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">🔔 Recent Alerts</h2>
        <div className="alerts-list">
          {alerts.map(a => (
            <div key={a.id} className={`alert-row alert-${a.severity}`}>
              <span className="alert-icon">{a.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <div className="alert-body">
                <p className="alert-message">{a.message}</p>
                <p className="alert-meta">{a.region} · {new Date(a.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default APSDashboard;
// Made with Bob
