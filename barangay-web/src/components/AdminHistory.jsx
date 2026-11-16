import { useEffect, useState } from 'react';
import { requestAPI } from '../api';
import { SERVICE_FORMS } from './RequestForm';
import { printDocument, TYPE_TITLES } from './PrintDocument';

const TYPE_LABELS = {
  clearance: 'Barangay Clearance',
  indigency: 'Certificate of Indigency',
  low_income: 'Low Income Certificate (BIR)',
  guardianship: 'Guardianship Certificate',
  cohabitation: 'Cohabitation Certificate',
  id: 'Barangay ID Application',
};
const typeLabel = (v) => TYPE_LABELS[v] || v;
const TYPE_ICONS = { clearance: '📋', indigency: '🧾', low_income: '📑', guardianship: '👶', cohabitation: '💞', id: '🪪' };

function detailFields(r) {
  if (r.type === 'id') {
    const name = [r.first_name, r.middle_name, r.surname].filter(Boolean).join(' ');
    return [
      ['ID Request Type', r.id_request_type === 'renew' ? 'Renew ID' : 'New ID (First Time)'],
      ['Complete Name', name],
      ['Place of Birth', r.birth_place],
      ['Contact Number', r.contact_number],
      ['Emergency Contact', r.emergency_contact_name],
      ['Emergency Contact Number', r.emergency_contact_number],
      ...(r.id_request_type === 'renew'
        ? [['Registered Voter', r.is_voter === 1 || r.is_voter === '1' ? 'Yes' : r.is_voter === 0 || r.is_voter === '0' ? 'No' : '—']]
        : []),
    ];
  }
  const cfg = SERVICE_FORMS[r.type];
  if (cfg) {
    return cfg.fields
      .map((f) => [f.label, r[f.key]])
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');
  }
  return [['Purpose', r.purpose]];
}

export default function AdminHistory({ setPage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    requestAPI.getAllRequests()
      .then((res) => {
        if (res.data.success) setRequests(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">Loading history...</div>;

  // Per-service totals
  const serviceTotals = {};
  requests.forEach((r) => { serviceTotals[r.type] = (serviceTotals[r.type] || 0) + 1; });

  // Filter logic
  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const hay = [
        r.request_code, r.full_name, typeLabel(r.type), r.purpose, r.status,
        r.complete_name, r.complete_address, r.contact_number, r.beneficiary_name,
        r.guardian_name, r.partner1_name, r.partner2_name,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>Request History</h1>
      <p className="welcome-text">
        Lahat ng request records na may petsa at oras. I-search, i-filter, at i-print ang kahit anong dokumento.
      </p>

      {/* Per-service totals */}
      <div className="msection-head" style={{ marginTop: '0.5rem' }}>
        <div className="msection-title">Total per Service</div>
        <div className="msection-sub">I-click ang isa para i-filter ang listahan</div>
      </div>
      <div className="afilter-row">
        <button
          className={`afilter ${typeFilter === 'all' ? 'afilter-active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          Lahat ({requests.length})
        </button>
        {Object.keys(TYPE_LABELS).map((t) => (
          <button
            key={t}
            className={`afilter ${typeFilter === t ? 'afilter-active' : ''}`}
            onClick={() => setTypeFilter(t)}
          >
            {TYPE_ICONS[t]} {TYPE_LABELS[t]} ({serviceTotals[t] || 0})
          </button>
        ))}
      </div>

      {/* Search + status filter */}
      <div className="ahistory-toolbar">
        <input
          className="asearch"
          type="text"
          placeholder="🔍 Hanapin: pangalan, request ID, serbisyo, status, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="afilter-row" style={{ margin: 0 }}>
          {['all', 'pending', 'approved', 'rejected', 'released'].map((s) => (
            <button
              key={s}
              className={`afilter ${statusFilter === s ? 'afilter-active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s[0].toUpperCase() + s.slice(1)} ({requests.filter((r) => s === 'all' || r.status === s).length})
            </button>
          ))}
        </div>
      </div>

      <div className="ahistory-count">
        Nagpapakita ng <b>{filtered.length}</b> sa {requests.length} request
        {search || statusFilter !== 'all' || typeFilter !== 'all' ? ' (may filter)' : ''}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">Walang request na tumutugma.</div>
      ) : (
        <div className="alist">
          {filtered.map((r) => (
            <button key={r.id} className="arow" onClick={() => setDetail(r)}>
              <div className="arow-top">
                <span className="arow-code">{r.request_code}</span>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              </div>
              <div className="arow-name">{r.full_name}</div>
              <div className="arow-sub">
                {TYPE_ICONS[r.type]} {typeLabel(r.type)} · filed {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                {r.priority ? ` · ${r.priority}` : ''}
              </div>
              {r.status === 'rejected' && r.reject_reason && (
                <div className="arow-reject">✏️ {r.reject_reason}</div>
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
                <div className="amodal-code">{detail.request_code}</div>
                <div className="amodal-title">{TYPE_TITLES[detail.type] || typeLabel(detail.type)}</div>
                <div className="amodal-resident">👤 {detail.full_name}</div>
              </div>
              <div className="amodal-head-right">
                <span className={`badge badge-${detail.status}`}>{detail.status}</span>
                <button className="amodal-close" onClick={() => setDetail(null)}>✕</button>
              </div>
            </div>
            <div className="amodal-body">
              <div className="amodal-section">Request Details</div>
              <div className="afields">
                {detailFields(detail).map(([label, value]) => (
                  <div className="afield" key={label}>
                    <div className="afield-label">{label}</div>
                    <div className="afield-value">{value === null || value === undefined || value === '' ? '—' : String(value)}</div>
                  </div>
                ))}
                {detail.priority && (
                  <div className="afield">
                    <div className="afield-label">Priority</div>
                    <div className="afield-value">⭐ {detail.priority}</div>
                  </div>
                )}
                <div className="afield">
                  <div className="afield-label">Date Filed</div>
                  <div className="afield-value">{detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'}</div>
                </div>
                {detail.scheduled_date && (
                  <div className="afield">
                    <div className="afield-label">Scheduled / Released</div>
                    <div className="afield-value">{new Date(detail.scheduled_date).toLocaleString()}</div>
                  </div>
                )}
              </div>
              {detail.status === 'rejected' && detail.reject_reason && (
                <>
                  <div className="amodal-section">Rejection Reason</div>
                  <div className="areject-box">✏️ {detail.reject_reason}</div>
                </>
              )}
            </div>
            <div className="amodal-foot">
              <button className="abtn abtn-ghost" onClick={() => setDetail(null)}>Close</button>
              {(detail.status === 'approved' || detail.status === 'released') && (
                <button className="abtn abtn-print" onClick={() => printDocument(detail)}>🖨️ Print Document</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
