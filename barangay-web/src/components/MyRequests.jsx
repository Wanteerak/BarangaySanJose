import { useEffect, useState } from 'react';
import { requestAPI } from '../api';
import useIsMobile from '../useIsMobile';
import Icon from './Icons';

const TYPE_LABELS = {
  clearance: 'Barangay Clearance',
  indigency: 'Certificate of Indigency',
  low_income: 'Low Income Certificate (BIR)',
  guardianship: 'Guardianship Certificate',
  cohabitation: 'Cohabitation Certificate',
  id: 'Barangay ID Application',
};

// Status labels para sa mobile badges
const STATUS_LABELS = {
  pending: 'For Review',
  approved: 'Ready for Pickup',
  released: 'Released',
  rejected: 'Rejected',
};

function dateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Submitted Today';
  return 'Submitted ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== MOBILE: card layout =====
function MobileRequests({ requests, setPage }) {
  const hasReady = requests.some((r) => r.status === 'approved' || r.status === 'released');

  return (
    <div className="page">
      {hasReady && (
        <div className="mreminder">
          <span className="mreminder-icon"><Icon name="check" size={22} color="#10b981" /></span>
          <div>
            <strong>Pickup reminder</strong>
            <small>Bring your original ID and required payment.</small>
          </div>
        </div>
      )}

      <div className="msection-head">
        <div>
          <h2 className="msection-title">My requests</h2>
          <p className="msection-sub">Private and visible only to you and authorized staff</p>
        </div>
      </div>

      {requests.length === 0 && (
        <div className="mnote">
          <p>Wala ka pang request. I-tap ang <b>Apply</b> tab para mag-apply.</p>
        </div>
      )}

      {requests.map((r) => (
        <div className="mreq-card" key={r.id}>
          <div className="mreq-top">
            <span className="mreq-code">{r.request_code}</span>
            <span className={`mreq-badge ${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span>
          </div>
          <div className="mreq-title">{TYPE_LABELS[r.type] || r.type}</div>
          <div className="mreq-date">{dateLabel(r.created_at)}</div>

          {r.status === 'pending' && (
            <div className="mreq-update">
              <small>LATEST UPDATE</small>
              <p>Your uploaded document and resident information are being checked by the information desk.</p>
              <div className="mreq-live">Updates will appear here automatically</div>
            </div>
          )}

          {r.status === 'approved' && (
            <div className="mreq-update">
              <small>LATEST UPDATE</small>
              <p>Your document is ready for pickup at the Barangay San Jose Main Hall. Bring your original ID and the required payment.</p>
              <div className="mreq-live">Claim it on your scheduled date</div>
            </div>
          )}

          {r.status === 'released' && (
            <div className="mreq-update">
              <small>LATEST UPDATE</small>
              <p>This document has been claimed and released. Thank you!</p>
            </div>
          )}

          {r.status === 'rejected' && r.reject_reason && (
            <div className="mreq-reason">
              ✏️ <b>Dahilan:</b> {r.reject_reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== DESKTOP: table layout (walang binago) =====
export default function MyRequests({ setPage }) {
  const isMobile = useIsMobile();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestAPI.getMyRequests()
      .then((res) => {
        if (res.data.success) setRequests(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Loading requests...</div>;

  if (isMobile) return <MobileRequests requests={requests} setPage={setPage} />;

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>My Requests</h1>
      <p className="welcome-text">Track the status of your submitted requests.</p>

      <div className="card">
        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No requests yet.</p>
            <button className="btn btn-primary" onClick={() => setPage('request')}>
              Submit New Request
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Date Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: '#ea580c' }}>{r.request_code}</td>
                  <td>{TYPE_LABELS[r.type] || r.type}</td>
                  <td>{r.purpose}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                    {r.status === 'rejected' && r.reject_reason && (
                      <div style={{
                        fontSize: '0.8rem', color: '#b91c1c', background: '#fee2e2',
                        borderRadius: 8, padding: '0.35rem 0.6rem', marginTop: 6, maxWidth: 260,
                      }}>
                        ✏️ <b>Dahilan:</b> {r.reject_reason}
                      </div>
                    )}
                  </td>
                  <td>{r.scheduled_date ? new Date(r.scheduled_date).toLocaleDateString() : '-'}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
