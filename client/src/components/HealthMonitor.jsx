import React, { useState, useEffect, useCallback } from 'react';
import healthService from '../services/healthService';

export const HealthMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showJson, setShowJson] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await healthService.checkHealth();
      setLatency(result.latencyMs);
      setLastChecked(new Date());

      if (result.success) {
        setHealthData(result.data);
      } else {
        setHealthData(null);
        setError(result.error);
      }
    } catch (err) {
      setError({ message: err.message || 'Unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]);

  // Periodic auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      performHealthCheck();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, performHealthCheck]);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const getSystemStatus = () => {
    if (loading && !healthData) return { label: 'Connecting...', color: 'status-loading' };
    if (error) return { label: 'API Offline', color: 'status-offline' };
    if (healthData?.status === 'operational') return { label: 'Operational', color: 'status-healthy' };
    if (healthData?.status === 'degraded') return { label: 'Degraded (No DB)', color: 'status-warning' };
    return { label: 'Unknown', color: 'status-unknown' };
  };

  const systemStatus = getSystemStatus();

  return (
    <section className="monitor-card">
      <div className="card-header">
        <div className="header-info">
          <div className="title-group">
            <span className={`status-pill ${systemStatus.color}`}>
              <span className="pulse-indicator"></span>
              {systemStatus.label}
            </span>
            <h2 className="card-title">Live Backend Health & Connectivity Monitor</h2>
          </div>
          <p className="card-desc">
            Direct real-time HTTP probe verifying communication between Vite React frontend and Express/MongoDB backend via Axios.
          </p>
        </div>

        <div className="header-actions">
          <label className="toggle-label" title="Automatically ping every 10 seconds">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="toggle-text">Auto-Refresh (10s)</span>
          </label>

          <button
            onClick={performHealthCheck}
            disabled={loading}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <span>⚡ Test Connection Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h4>Backend Connection Failed</h4>
            <p>{error.message}</p>
            <small>
              Ensure the server is running on port 5000: <code>npm run dev</code> inside <code>server/</code>
            </small>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">API Gateway</span>
          <span className="metric-value">
            {healthData ? 'HTTP 200 OK' : error ? 'Unreachable' : 'Pending'}
          </span>
          <span className="metric-sub">
            Target: <code>{import.meta.env.VITE_API_BASE_URL || '/api'}/health</code>
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Round-Trip Latency</span>
          <span className="metric-value">
            {latency !== null ? (
              <span className={latency < 100 ? 'text-green' : latency < 300 ? 'text-yellow' : 'text-orange'}>
                {latency} ms
              </span>
            ) : (
              '--'
            )}
          </span>
          <span className="metric-sub">Axios HTTP round-trip</span>
        </div>

        <div className="metric-box">
          <span className="metric-label">MongoDB State</span>
          <span className="metric-value">
            {healthData?.database ? (
              <span className={healthData.database.readyState === 1 ? 'text-green' : 'text-amber'}>
                {healthData.database.status.toUpperCase()}
              </span>
            ) : (
              'Disconnected'
            )}
          </span>
          <span className="metric-sub">
            ReadyState: {healthData?.database?.readyState ?? 0} (0: off, 1: on)
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Server Uptime</span>
          <span className="metric-value">
            {healthData ? formatUptime(healthData.uptimeSeconds) : '--'}
          </span>
          <span className="metric-sub">
            Env: {healthData?.environment || 'development'}
          </span>
        </div>
      </div>

      {/* Database Connection Detail Note */}
      {healthData && healthData.database?.readyState !== 1 && (
        <div className="notice-box">
          <div className="notice-icon">💡</div>
          <div className="notice-body">
            <strong>MongoDB Note:</strong> The Express server and Health API are running normally.
            MongoDB is currently disconnected because the local MongoDB service has not been started yet.
            Once you start MongoDB (or configure <code>MONGODB_URI</code> in <code>server/.env</code>),
            the readyState will automatically turn to <strong>CONNECTED</strong>.
          </div>
        </div>
      )}

      {/* Memory Diagnostics */}
      {healthData?.memory && (
        <div className="memory-strip">
          <span className="memory-item">
            <strong>Heap Used:</strong> {healthData.memory.heapUsed}
          </span>
          <span className="memory-divider">•</span>
          <span className="memory-item">
            <strong>Heap Total:</strong> {healthData.memory.heapTotal}
          </span>
          <span className="memory-divider">•</span>
          <span className="memory-item">
            <strong>RSS:</strong> {healthData.memory.rss}
          </span>
        </div>
      )}

      {/* Toggle raw JSON */}
      <div className="json-inspector-section">
        <button
          onClick={() => setShowJson(!showJson)}
          className="btn-link"
        >
          {showJson ? '▼ Hide Raw JSON Response' : '▶ View Raw JSON Response from /api/health'}
        </button>

        {showJson && (
          <pre className="json-code-block">
            {JSON.stringify(healthData || error, null, 2)}
          </pre>
        )}
      </div>

      <div className="card-footer">
        <span>
          Last pinged: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
        </span>
        <span className="status-synced">✓ Frontend-Backend Synced</span>
      </div>
    </section>
  );
};

export default HealthMonitor;

