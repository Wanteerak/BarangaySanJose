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

// Lahat ng posibleng field label (para sa detail view — per type via SERVICE_FORMS)
function detailFields(r) {
  if (r.type === 'id') {
    const name = [r.first_name, r.middle_name, r.surname].filter(Boolean).join(' ');
    return [
      ['ID Request Type', r.id_request_type === 'renew' ? 'Renew ID' : 'New ID (First Time)'],
      ['Complete Name', name],
      ['Place of Birth', r.birth_place],
      ['Contact Number', r.contact_number],
      ['Emergency Contact Person', r.emergency_contact_name],
      ['Emergency Contact Number', r.emergency_contact_number],
      ...(r.id_request_type === 'renew'
        ? [['Registered Voter (Botante)', r.is_voter === 1 || r.is_voter === '1' ? 'Yes' : r.is_voter === 0 || r.is_voter === '0' ? 'No' : '—']]
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

// Uploaded documents na puwedeng ipakita bilang image
function docList(r) {
  return [
    ['Proof of Identity', r.requirement_doc],
    ['Valid ID Photo', r.id_photo],
    ['Old ID - Front', r.front_photo],
    ['Old ID - Back', r.back_photo],
    ['HOA Certificate', r.hoa_cert],
  ].filter(([, v]) => v);
}

export default function AdminRequests({ setPage }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null); // buong request object sa modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectText, setRejectText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    requestAPI.getAllRequests()
      .then((res) => {
        if (res.data.success) setRequests(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refreshAction = (id, patch) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (detail && detail.id === id) setDetail({ ...detail, ...patch });
  };

  const doAction = async (r, action, extra = {}) => {
    try {
      const res = await requestAPI.adminAction({ action, request_id: r.id, ...extra });
      const ok = res.data.success;
      setMsg(ok ? '' : res.data.message || 'Action failed');
      if (ok) {
        refreshAction(r.id, extra.reject_reason !== undefined
          ? { status: 'rejected', reject_reason: extra.reject_reason }
          : action === 'approve'
            ? { status: 'approved' }
            : { status: 'released', scheduled_date: extra.schedule_date || new Date().toISOString() });
        setRejectOpen(false);
        setRejectText('');
      }
    } catch {
      setMsg('Action failed. Is the backend running?');
    }
  };

  const confirmReject = async (r) => {
    if (!rejectText.trim()) {
      setMsg('Please write the reason for rejection.');
      return;
    }
    await doAction(r, 'reject', { reject_reason: rejectText.trim() });
  };

  const openDetail = (r) => {
    setDetail(r);
    setRejectOpen(false);
    setRejectText('');
    setScheduleDate('');
    setMsg('');
  };

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    released: requests.filter((r) => r.status === 'released').length,
  };

  if (loading) return <div className="empty-state">Loading requests...</div>;

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>Manage Requests</h1>
      <p className="welcome-text">I-review ang bawat request, i-approve, i-reject na may dahilan, at i-print ang official document.</p>

      {msg && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{msg}</div>}

      {/* Filter chips */}
      <div className="afilter-row">
        {['all', 'pending', 'approved', 'rejected', 'released'].map((f) => (
          <button
            key={f}
            className={`afilter ${filter === f ? 'afilter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="empty-state">No {filter === 'all' ? '' : filter + ' '}requests.</div>
      ) : (
        <div className="alist">
          {filtered.map((r) => (
            <button key={r.id} className="arow" onClick={() => openDetail(r)}>
              <div className="arow-top">
                <span className="arow-code">{r.request_code}</span>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              </div>
              <div className="arow-name">{r.full_name}</div>
              <div className="arow-sub">
                {typeLabel(r.type)} · filed {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                {r.priority ? ` · ${r.priority}` : ''}
              </div>
              {r.status === 'rejected' && r.reject_reason && (
                <div className="arow-reject">✏️ {r.reject_reason}</div>
              )}
              <div className="arow-actions" onClick={(e) => e.stopPropagation()}>
                {r.status === 'pending' && (
                  <>
                    <button
                      className="abtn abtn-ok"
                      onClick={() => doAction(r, 'approve')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="abtn abtn-no"
                      onClick={() => { setDetail(r); setRejectOpen(true); }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                {r.status === 'approved' && (
                  <>
                    <input
                      type="date"
                      className="adate"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <button
                      className="abtn abtn-warn"
                      onClick={() => doAction(r, 'schedule', { schedule_date: scheduleDate || null })}
                    >
                      📅 Release
                    </button>
                    <button
                      className="abtn abtn-print"
                      onClick={() => printDocument(r)}
                    >
                      🖨️ Print Document
                    </button>
                  </>
                )}
                {r.status === 'released' && (
                  <button className="abtn abtn-print" onClick={() => printDocument(r)}>
                    🖨️ Print Document
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ================= DETAIL MODAL ================= */}
      {detail && (
        <div className="amodal-overlay" onClick={() => { setDetail(null); setRejectOpen(false); }}>
          <div className="amodal" onClick={(e) => e.stopPropagation()}>
            <div className="amodal-head">
              <div>
                <div className="amodal-code">{detail.request_code}</div>
                <div className="amodal-title">{TYPE_TITLES[detail.type] || typeLabel(detail.type)}</div>
                <div className="amodal-resident">👤 {detail.full_name}</div>
              </div>
              <div className="amodal-head-right">
                <span className={`badge badge-${detail.status}`}>{detail.status}</span>
                <button className="amodal-close" onClick={() => { setDetail(null); setRejectOpen(false); }}>✕</button>
              </div>
            </div>

            <div className="amodal-body">
              {/* Lahat ng detalye na sinagutan ng resident (POV ng submission) */}
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
                    <div className="afield-label">Priority Classification</div>
                    <div className="afield-value">⭐ {detail.priority}</div>
                  </div>
                )}
                <div className="afield">
                  <div className="afield-label">Certified by applicant</div>
                  <div className="afield-value">{detail.certified === 1 || detail.certified === true ? '✅ Yes — certified true and correct' : '—'}</div>
                </div>
                <div className="afield">
                  <div className="afield-label">Date filed</div>
                  <div className="afield-value">{detail.created_at ? new Date(detail.created_at).toLocaleString() : '—'}</div>
                </div>
                {detail.scheduled_date && (
                  <div className="afield">
                    <div className="afield-label">Scheduled / Released</div>
                    <div className="afield-value">{new Date(detail.scheduled_date).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Uploaded documents */}
              {docList(detail).length > 0 && (
                <>
                  <div className="amodal-section">Uploaded Documents</div>
                  <div className="adocs">
                    {docList(detail).map(([label, dataUrl]) => (
                      <div className="adoc" key={label}>
                        <div className="adoc-label">{label}</div>
                        {String(dataUrl).startsWith('data:application/pdf') ? (
                          <a href={dataUrl} target="_blank" rel="noreferrer" className="adoc-pdf">📄 View PDF</a>
                        ) : (
                          <img src={dataUrl} alt={label} className="adoc-img" />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Reject reason (kapag rejected) */}
              {detail.status === 'rejected' && detail.reject_reason && (
                <>
                  <div className="amodal-section">Rejection Reason</div>
                  <div className="areject-box">✏️ {detail.reject_reason}</div>
                </>
              )}

              {/* Reject flow (required comment) */}
              {rejectOpen && detail.status === 'pending' && (
                <>
                  <div className="amodal-section">Reject — Reason is REQUIRED</div>
                  <textarea
                    className="areject-input"
                    rows="3"
                    placeholder="Isulat ang dahilan ng pag-reject (makikita ito ng resident)…"
                    value={rejectText}
                    onChange={(e) => setRejectText(e.target.value)}
                    autoFocus
                  />
                  <div className="arow-btns">
                    <button className="abtn abtn-no" onClick={() => confirmReject(detail)}>✕ Confirm Reject</button>
                    <button className="abtn abtn-ghost" onClick={() => { setRejectOpen(false); setRejectText(''); }}>Cancel</button>
                  </div>
                </>
              )}
            </div>

            <div className="amodal-foot">
              <button className="abtn abtn-ghost" onClick={() => { setDetail(null); setRejectOpen(false); }}>Close</button>
              {detail.status === 'pending' && !rejectOpen && (
                <>
                  <button className="abtn abtn-no" onClick={() => setRejectOpen(true)}>✕ Reject</button>
                  <button className="abtn abtn-ok" onClick={() => doAction(detail, 'approve')}>✓ Approve</button>
                </>
              )}
              {detail.status === 'approved' && (
                <>
                  <div className="adate-wrap">
                    <input
                      type="date"
                      className="adate"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <button className="abtn abtn-warn" onClick={() => doAction(detail, 'schedule', { schedule_date: scheduleDate || null })}>📅 Release</button>
                  </div>
                  <button className="abtn abtn-print" onClick={() => printDocument(detail)}>🖨️ Print Document</button>
                </>
              )}
              {(detail.status === 'released' || detail.status === 'rejected') && detail.status === 'released' && (
                <button className="abtn abtn-print" onClick={() => printDocument(detail)}>🖨️ Print Document</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
