import { useEffect, useState } from 'react';
import { requestAPI } from '../api';

const TYPE_LABELS = {
  clearance: 'Barangay Clearance',
  indigency: 'Certificate of Indigency',
  low_income: 'Low Income Certificate (BIR)',
  guardianship: 'Guardianship Certificate',
  cohabitation: 'Cohabitation Certificate',
  id: 'Barangay ID Application',
};

export default function MyRequests({ setPage }) {
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
