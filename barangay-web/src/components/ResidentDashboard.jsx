import { useEffect, useState } from 'react';
import { statsAPI } from '../api';

export default function ResidentDashboard({ setPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.getStats()
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Loading dashboard...</div>;

  return (
    <div className="page">
      <h1>Resident Dashboard</h1>
      <p className="welcome-text">Welcome back, resident.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.total_requests ?? 0}</h3>
          <p>My Requests</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#856404' }}>{stats?.pending ?? 0}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#155724' }}>{stats?.approved_released ?? 0}</h3>
          <p>Approved / Released</p>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPage('request')}>
            New Request
          </button>
          <button className="btn btn-outline" onClick={() => setPage('my-requests')}>
            Track My Requests
          </button>
          <button className="btn btn-outline" onClick={() => setPage('profile')}>
            Edit Profile
          </button>
          <button className="btn btn-outline" onClick={() => setPage('chat')}>
            Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
