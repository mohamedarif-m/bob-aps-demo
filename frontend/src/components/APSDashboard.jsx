import { useState, useEffect } from 'react';
import './APSDashboard.css';

const RenewableRing = ({ percent }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="renewable-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          className="ring-track"
          cx="36" cy="36" r={radius}
          fill="none" strokeWidth="6"
        />
        <circle
          className="ring-fill"
          cx="36" cy="36" r={radius}
          fill="none" strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="ring-label">{percent}%</span>
    </div>
  );
};

const APSDashboard = ({ clientName, apiBase }) => {
  const [stats, setStats] = useState(null);
  const [regions, setRegions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, statsRes, regionsRes, alertsRes] = await Promise.all([
        fetch(`${apiBase}/api/aps/status`),
        fetch(`${apiBase}/api/aps/stats`),
        fetch(`${apiBase}/api/aps/regions`),
        fetch(`${apiBase}/api/aps/alerts`)
      ]);

      const [statusData, statsData, regionsData, alertsData] = await Promise.all([
        statusRes.json(),
        statsRes.json(),
        regionsRes.json(),
        alertsRes.json()
      ]);

      setStatus(statusData.data);
      setStats(statsData.data);
      setRegions(regionsData.data || []);
      setAlerts(alertsData.data || []);
      setLastFetched(new Date());
    } catch (err) {
      setError('Unable to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading {clientName} grid data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aps-error">
        <h3>⚠️ Connection Error</h3>
        <p>{error}</p>
        <button className="btn-refresh" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="aps-dashboard">

      {/* Dashboard header row */}
      <div className="dash-header">
        <div className="dash-status">
          <span className={`status-dot ${status?.connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-label">
            {status?.connected ? 'Grid Connected' : 'Disconnected'}
          </span>
          {status?.lastSync && (
            <span className="last-sync">
              Last sync: {new Date(status.lastSync).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="dash-header-right">
          {lastFetched && (
            <span className="last-fetched">
              Updated: {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button className="btn-refresh" onClick={fetchData}>🔄 Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <section className="kpi-section">
          <div className="kpi-grid">
            <div className="kpi-card kpi-orange">
              <div className="kpi-icon">👥</div>
              <div className="kpi-value">{stats.totalCustomers.toLocaleString()}</div>
              <div className="kpi-label">Customers Served</div>
            </div>
            <div className={`kpi-card ${stats.activeOutages > 0 ? 'kpi-warning' : 'kpi-green'}`}>
              <div className="kpi-icon">⚠️</div>
              <div className="kpi-value">{stats.activeOutages}</div>
              <div className="kpi-label">Active Outages</div>
            </div>
            <div className={`kpi-card ${stats.gridCapacityPercent >= 85 ? 'kpi-warning' : 'kpi-blue'}`}>
              <div className="kpi-icon">⚡</div>
              <div className="kpi-value">{stats.gridCapacityPercent}%</div>
              <div className="kpi-label">Grid Capacity</div>
            </div>
            <div className="kpi-card kpi-green">
              <RenewableRing percent={stats.renewableMixPercent} />
              <div className="kpi-label">Renewable Mix</div>
            </div>
          </div>
        </section>
      )}

      {/* Service Regions */}
      <section className="section">
        <h2 className="section-title">🗺️ Service Regions</h2>
        <div className="regions-grid">
          {regions.map(region => (
            <div key={region.id} className={`region-card ${region.status}`}>
              <div className="region-header">
                <h3 className="region-name">{region.name}</h3>
                <span className={`badge badge-${region.status}`}>
                  {region.status === 'maintenance' ? '🔧 Maintenance' : '● Active'}
                </span>
              </div>
              <div className="region-stats">
                <div className="region-stat">
                  <span className="region-stat-value">{region.customers.toLocaleString()}</span>
                  <span className="region-stat-label">customers</span>
                </div>
                <div className="region-stat">
                  <span className="region-stat-value">{region.substations}</span>
                  <span className="region-stat-label">substations</span>
                </div>
                <div className="region-stat">
                  <span className={`region-stat-value ${region.loadPercent >= 85 ? 'load-high' : ''}`}>
                    {region.loadPercent}%
                  </span>
                  <span className="region-stat-label">load</span>
                </div>
              </div>
              <div className="load-bar-wrap">
                <div
                  className={`load-bar ${region.loadPercent >= 85 ? 'load-bar-high' : ''}`}
                  style={{ width: `${region.loadPercent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="section">
        <h2 className="section-title">🔔 Recent Alerts</h2>
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-row alert-${alert.severity}`}>
              <span className="alert-icon">
                {alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="alert-body">
                <p className="alert-message">{alert.message}</p>
                <p className="alert-meta">
                  {alert.region} · {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
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
