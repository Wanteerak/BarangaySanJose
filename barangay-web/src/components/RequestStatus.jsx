import { useState } from 'react';
import { requestAPI } from '../api';

export default function RequestStatus({ setPage }) {
  const [requestId, setRequestId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async () => {
    const inputEl = document.querySelector('input');
    const code = (inputEl?.value || requestId).trim().toUpperCase();
    if (!code) return;
    setRequestId(code);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await requestAPI.checkStatus(code);
      console.log('checkStatus response:', res);
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.message || 'Request ID not found.');
      }
    } catch (err) {
      console.error('checkStatus error:', err);
      setError('Failed to check status: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>Check Request Status</h1>
      <p className="welcome-text">Ilagay ang iyong Request ID (hal. BSJ-123456) para makita ang status.</p>

      {error && <div className="flash-error">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label>Request ID</label>
          <input
            type="text"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value.toUpperCase())}
            placeholder="e.g., BSJ-123456"
            onKeyPress={(e) => e.key === 'Enter' && checkStatus()}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={checkStatus}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>

        {result && (
          <div className="status-card" style={{ marginTop: '1.5rem' }}>
            <h3>Request Details</h3>
            <p><strong>Request ID:</strong> {result.request_code}</p>
            {result.full_name && <p><strong>Resident:</strong> {result.full_name}</p>}
            <p><strong>Type:</strong> {result.type}</p>
            <p><strong>Purpose:</strong> {result.purpose}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`badge badge-${result.status}`}>{result.status}</span>
            </p>
            {result.scheduled_date && (
              <p><strong>Scheduled Release:</strong> {new Date(result.scheduled_date).toLocaleDateString()}</p>
            )}
            <p><strong>Submitted:</strong> {new Date(result.created_at).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
