import { useEffect, useState } from 'react';
import { statsAPI } from '../api';

export default function AdminDashboard({ setPage }) {
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

  const pending = stats?.pending ?? 0;

  return (
    <div className="page">
      {/* Hero (kapareho ng resident home) */}
      <div className="mhero">
        <div className="mhero-kicker">🏛️ BARANGAY SAN JOSE — MAIN HALL · ADMIN</div>
        <div className="mhero-title">Kumusta, Administrator!</div>
        <div className="mhero-sub">
          {pending > 0
            ? `May ${pending} pending request${pending > 1 ? 's' : ''} na naghintay ng review mo ngayong araw.`
            : 'Walang pending requests — lahat ayos na! 👏'}
        </div>
        <button className="mhero-btn" onClick={() => setPage('requests')}>
          📋 Manage Requests →
        </button>
      </div>

      {/* Stats */}
      <div className="msection-head">
        <div className="msection-title">Overview</div>
        <div className="msection-sub">Real-time na bilang mula sa database</div>
      </div>
      <div className="mstat-row">
        <div className="mstat-card">
          <div className="mstat-icon">📥</div>
          <strong>{stats?.total_requests ?? 0}</strong>
          <small>Total Requests</small>
        </div>
        <div className="mstat-card">
          <div className="mstat-icon">⏳</div>
          <strong style={{ color: '#d97706' }}>{pending}</strong>
          <small>Pending</small>
        </div>
        <div className="mstat-card">
          <div className="mstat-icon">✅</div>
          <strong style={{ color: '#16a34a' }}>{stats?.approved ?? 0}</strong>
          <small>Approved</small>
        </div>
        <div className="mstat-card">
          <div className="mstat-icon">📤</div>
          <strong style={{ color: '#2563eb' }}>{stats?.released ?? 0}</strong>
          <small>Released</small>
        </div>
        <div className="mstat-card">
          <div className="mstat-icon">👥</div>
          <strong>{stats?.total_residents ?? 0}</strong>
          <small>Residents</small>
        </div>
      </div>

      {/* Per-service totals */}
      <div className="msection-head">
        <div className="msection-title">Total Requests per Service</div>
        <div className="msection-sub">Bilang ng request sa bawat serbisyo</div>
      </div>
      <div className="mservice-list" style={{ marginBottom: '1.4rem' }}>
        {(stats?.by_service || []).map((s) => (
          <div className="mservice" key={s.type} style={{ cursor: 'default' }}>
            <div className="mservice-icon" style={{ background: '#fde8d7' }}>
              {{ clearance: '📋', indigency: '🧾', low_income: '📑', guardianship: '👶', cohabitation: '💞', id: '🪪' }[s.type] || '📄'}
            </div>
            <div className="mservice-body">
              <div className="mservice-title">{{ clearance: 'Barangay Clearance', indigency: 'Certificate of Indigency', low_income: 'Low Income Certificate (BIR)', guardianship: 'Guardianship Certificate', cohabitation: 'Cohabitation Certificate', id: 'Barangay ID Application' }[s.type] || s.type}</div>
              <div className="mservice-desc">{s.count} request{s.count !== 1 ? 's' : ''}</div>
            </div>
            <div className="mservice-chev" style={{ fontWeight: 800, color: '#ea580c' }}>{s.count}</div>
          </div>
        ))}
        {(!stats?.by_service || stats.by_service.length === 0) && (
          <div className="empty-state">Wala pang requests.</div>
        )}
      </div>
      <div className="mservice-list">
        <button className="mservice" onClick={() => setPage('requests')}>
          <div className="mservice-icon" style={{ background: '#fde8d7' }}>📋</div>
          <div className="mservice-body">
            <div className="mservice-title">Manage All Requests</div>
            <div className="mservice-desc">Review, approve, reject na may dahilan, at i-print ang official documents.</div>
          </div>
          <div className="mservice-chev">→</div>
        </button>
        <button className="mservice" onClick={() => setPage('chat')}>
          <div className="mservice-icon" style={{ background: '#d9f2e4' }}>💬</div>
          <div className="mservice-body">
            <div className="mservice-title">Live Chat</div>
            <div className="mservice-desc">Sumagot sa mga tanong ng mga residente.</div>
          </div>
          <div className="mservice-chev">→</div>
        </button>
      </div>
    </div>
  );
}
