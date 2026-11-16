import { useState } from 'react';
import { SERVICES } from './Home';
import Icon, { SERVICE_ICONS } from './Icons';

// Services tab (mobile): search bar + listahan ng lahat ng serbisyo
export default function Services({ setPage }) {
  const [q, setQ] = useState('');

  const filtered = SERVICES.filter((s) =>
    (s.label + ' ' + s.desc).toLowerCase().includes(q.toLowerCase())
  );

  const open = (svcValue) => {
    window.__bsj_preset_service = svcValue;
    setPage('request');
  };

  return (
    <div className="page">
      {/* Search bar */}
      <div className="msearch">
        <span className="msearch-icon"><Icon name="search" size={18} /></span>
        <input
          type="text"
          placeholder="Search certificates and IDs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="msection-head">
        <div>
          <h2 className="msection-title">Available services</h2>
          <p className="msection-sub">For all verified residents</p>
        </div>
        <span className="mcount">{filtered.length} results</span>
      </div>

      {filtered.length === 0 && (
        <div className="mnote">
          <p>Walang nahanap na serbisyo para sa “{q}”. Subukan ang ibang salita.</p>
        </div>
      )}

      {filtered.map((s) => (
        <button key={s.value} className="mservice" onClick={() => open(s.value)}>
          <span className="mservice-icon" style={{ background: s.iconBg }}>
            <Icon name={SERVICE_ICONS[s.value]} size={24} color={s.iconColor} />
          </span>
          <span className="mservice-body">
            <strong className="mservice-title">{s.label}</strong>
            <span className="mservice-desc">{s.desc}</span>
            <span className="mservice-meta">
              <span className="mservice-price" style={s.price === 'Free' ? { background: '#d9f2e4', color: '#15803d' } : {}}>{s.price}</span>
              <span className="mservice-time"><Icon name="clock" size={13} color="#64748b" /> {s.time}</span>
            </span>
          </span>
          <span className="mservice-chev">›</span>
        </button>
      ))}
    </div>
  );
}
