import { useEffect, useState } from 'react';
import { userAPI } from '../api';
import { printDocument } from './PrintDocument';

const STATUS_COLOR = { pending: '#d97706', approved: '#16a34a', rejected: '#dc2626' };

export default function AdminUsers({ setPage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [detail, setDetail] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    const api = filter === 'pending' ? userAPI.getPending() : userAPI.getAll();
    api.then((res) => {
      if (res.data.success) setUsers(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const approve = async (u) => {
    const r = await userAPI.approve(u.user_id);
    if (r.data.success) {
      setMsg('Account approved: ' + u.full_name);
      setDetail(null);
      load();
    } else {
      setMsg(r.data.message || 'Failed to approve.');
    }
  };

  const decline = async (u) => {
    if (!declineReason.trim()) {
      setMsg('Please provide a reason for declining.');
      return;
    }
    const r = await userAPI.decline(u.user_id, declineReason.trim());
    if (r.data.success) {
      setMsg('Account declined: ' + u.full_name);
      setDetail(null);
      setShowDecline(false);
      setDeclineReason('');
      load();
    } else {
      setMsg(r.data.message || 'Failed to decline.');
    }
  };

  if (loading) return <div className="empty-state">Loading registrations...</div>;

  const pendingCount = users.filter((u) => u.account_status === 'pending').length;

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>Resident Registrations</h1>
      <p className="welcome-text">
        I-review ang mga bagong sign-up. I-approve o i-decline base sa submitted valid ID.
      </p>

      {msg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{msg}</div>}

      <div className="afilter-row">
        <button className={`afilter ${filter === 'pending' ? 'afilter-active' : ''}`} onClick={() => setFilter('pending')}>
          Pending ({pendingCount})
        </button>
        <button className={`afilter ${filter === 'all' ? 'afilter-active' : ''}`} onClick={() => setFilter('all')}>
          All Users
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">Walang {filter === 'pending' ? 'pending ' : ''}registrations.</div>
      ) : (
        <div className="alist">
          {users.map((u) => (
            <button key={u.user_id} className="arow" onClick={() => { setDetail(u); setShowDecline(false); setDeclineReason(''); setMsg(''); }}>
              <div className="arow-top">
                <span className="arow-code">{u.full_name}</span>
                <span className="badge" style={{ background: STATUS_COLOR[u.account_status] || '#64748b', color: '#fff' }}>
                  {u.account_status}
                </span>
              </div>
              <div className="arow-sub">
                {u.email} · filed {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                {u.is_verified === 1 ? ' · ✔ email verified' : ' · ⚠ unverified'}
              </div>
              {u.account_status === 'rejected' && u.decline_reason && (
                <div className="arow-reject">✏️ {u.decline_reason}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="amodal-overlay" onClick={() => setDetail(null)}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <div className="amodal-head">
              <div>
                <div className="amodal-code">{detail.full_name}</div>
                <div className="amodal-title">{detail.email}</div>
                <div className="amodal-resident">👤 {detail.role} · {detail.account_status}</div>
              </div>
              <div className="amodal-head-right">
                <span className="badge" style={{ background: STATUS_COLOR[detail.account_status] || '#64748b', color: '#fff' }}>
                  {detail.account_status}
                </span>
                <button className="amodal-close" onClick={() => setDetail(null)}>✕</button>
              </div>
            </div>
            <div className="amodal-body">
              <div className="amodal-section">Registration Details</div>
              <div className="afields">
                <div className="afield"><div className="afield-label">Full Name</div><div className="afield-value">{detail.full_name}</div></div>
                <div className="afield"><div className="afield-label">Email</div><div className="afield-value">{detail.email}</div></div>
                <div className="afield"><div className="afield-label">Address</div><div className="afield-value">{detail.address || '—'}</div></div>
                <div className="afield"><div className="afield-label">Purok</div><div className="afield-value">{detail.purok || '—'}</div></div>
                <div className="afield"><div className="afield-label">Birthdate</div><div className="afield-value">{detail.birthdate ? new Date(detail.birthdate).toLocaleDateString() : '—'}</div></div>
                <div className="afield"><div className="afield-label">Civil Status</div><div className="afield-value">{detail.civil_status || '—'}</div></div>
                <div className="afield"><div className="afield-label">Email Verified</div><div className="afield-value">{detail.is_verified === 1 ? '✔ Yes' : '⚠ No'}</div></div>
                <div className="afield"><div className="afield-label">Date Registered</div><div className="afield-value">{detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'}</div></div>
              </div>

              {detail.id_photo && (
                <>
                  <div className="amodal-section">Submitted Valid ID</div>
                  <div className="adocs">
                    <div className="adoc">
                      <div className="adoc-label">Proof of Identity</div>
                      {String(detail.id_photo).startsWith('data:application/pdf') ? (
                        <a href={detail.id_photo} target="_blank" rel="noreferrer" className="adoc-pdf">📄 View PDF</a>
                      ) : (
                        <img src={detail.id_photo} alt="Valid ID" className="adoc-img" style={{ maxWidth: 320, maxHeight: 220 }} />
                      )}
                    </div>
                  </div>
                </>
              )}

              {detail.account_status === 'rejected' && detail.decline_reason && (
                <>
                  <div className="amodal-section">Decline Reason</div>
                  <div className="areject-box">✏️ {detail.decline_reason}</div>
                </>
              )}

              {showDecline && (
                <>
                  <div className="amodal-section">Decline — Reason (optional)</div>
                  <textarea
                    className="areject-input"
                    rows="3"
                    placeholder="Isulat ang dahilan ng pag-decline (makikita ito ng resident)…"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    autoFocus
                  />
                </>
              )}
            </div>
            <div className="amodal-foot">
              <button className="abtn abtn-ghost" onClick={() => setDetail(null)}>Close</button>
              {detail.account_status === 'pending' && !showDecline && (
                <>
                  <button className="abtn abtn-no" onClick={() => setShowDecline(true)}>✕ Decline</button>
                  <button className="abtn abtn-ok" onClick={() => approve(detail)}>✓ Approve</button>
                </>
              )}
              {showDecline && (
                <>
                  <button className="abtn abtn-ghost" onClick={() => { setShowDecline(false); setDeclineReason(''); }}>Cancel</button>
                  <button className="abtn abtn-no" onClick={() => decline(detail)}>✕ Confirm Decline</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
