import { useEffect, useState } from 'react';
import { requestAPI, statsAPI } from '../api';
import Icon, { SERVICE_ICONS } from './Icons';

// Kapareho ng SERVICES sa mobile app
export const SERVICES = [
  {
    value: 'clearance', label: 'Barangay Clearance', price: '₱50', time: '3-5 min',
    icon: '📋', iconBg: '#fde8d7', iconColor: '#c2410c',
    desc: 'For employment, school, loan, travel, passport, postal ID, police/NBI, and other legal purposes.',
  },
  {
    value: 'indigency', label: 'Certificate of Indigency', price: 'Free', time: '3-5 min',
    icon: '🧾', iconBg: '#d9f2e4', iconColor: '#15803d',
    desc: 'Financial assistance certification for hospitals, schools, government offices, and social services.',
  },
  {
    value: 'low_income', label: 'Low Income Certificate (BIR)', price: '₱50', time: '3-5 min',
    icon: '📑', iconBg: '#dbeafe', iconColor: '#1d4ed8',
    desc: 'Certification for low-income households and BIR-related requirements.',
  },
  {
    value: 'guardianship', label: 'Guardianship Certificate', price: '₱50', time: '3-5 min',
    icon: '👶', iconBg: '#ede9fe', iconColor: '#6d28d9',
    desc: 'Proof of guardianship for a minor or dependent resident.',
  },
  {
    value: 'cohabitation', label: 'Cohabitation Certificate', price: '₱50', time: '3-5 min',
    icon: '💞', iconBg: '#ffe4e6', iconColor: '#be123c',
    desc: 'Certification for couples living together within Barangay San Jose.',
  },
  {
    value: 'id', label: 'Barangay ID Application', price: 'Free', time: '5-10 min',
    icon: '🪪', iconBg: '#fef3c7', iconColor: '#b45309',
    desc: 'New application or renewal of an official Barangay San Jose resident ID.',
  },
];

export default function Home({ user, setPage }) {
  const isAdmin = user.role === 'admin';
  const [myRequests, setMyRequests] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      requestAPI.getMyRequests().then((res) => res.data.success && setMyRequests(res.data.data)).catch(() => {});
    } else {
      statsAPI.getStats().then((res) => res.data.success && setStats(res.data.data)).catch(() => {});
    }
  }, [isAdmin]);

  const readyCount = myRequests.filter((r) => r.status === 'approved' || r.status === 'released').length;
  const popular = SERVICES.slice(0, 3);

  const goRequest = (svcValue) => {
    if (isAdmin) {
      setPage('requests');
      return;
    }
    setPage('request');
    // Idala ang napiling serbisyo (storage trick: ilagay sa window)
    window.__bsj_preset_service = svcValue;
  };

  return (
    <div className="page">
      {/* Hero card - katulad ng mobile */}
      <div className="mhero">
        <div className="mhero-kicker">BARANGAY SAN JOSE — MAIN HALL</div>
        <h1 className="mhero-title">Barangay<br />documents, made<br />easier.</h1>
        <p className="mhero-sub">Apply online, check requirements, and track your request before visiting the barangay hall.</p>
        <button className="mhero-btn" onClick={() => goRequest('clearance')}>
          Start a request
        </button>
      </div>

      {/* Stat cards */}
      <div className="mstat-row">
        <button className="mstat-card" onClick={() => setPage(isAdmin ? 'requests' : 'request')}>
          <span className="mstat-icon"><Icon name="layers" size={24} color="#c2410c" /></span>
          <strong>{isAdmin ? (stats?.total_requests ?? 0) : SERVICES.length} services</strong>
          <small>{isAdmin ? 'Total requests' : 'View certificates'}</small>
        </button>
        <button className="mstat-card" onClick={() => setPage(isAdmin ? 'requests' : 'my-requests')}>
          <span className="mstat-icon"><Icon name="check-circle" size={24} color="#15803d" /></span>
          <strong>{isAdmin ? (stats?.pending ?? 0) : readyCount} {isAdmin ? 'pending' : 'ready'}</strong>
          <small>{isAdmin ? 'To process' : 'For pickup'}</small>
        </button>
      </div>

      {/* Popular services */}
      <div className="msection-head">
        <div>
          <h2 className="msection-title">Popular services</h2>
          <p className="msection-sub">Most requested by residents</p>
        </div>
        <button className="mlink" onClick={() => setPage('request')}>View all</button>
      </div>

      {popular.map((s) => (
        <button key={s.value} className="mservice" onClick={() => goRequest(s.value)}>
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

      {/* Before you apply */}
      {!isAdmin && (
        <div className="mnote">
          <strong>Before you apply</strong>
          <p>
            For Barangay ID: prepare your requirements first. For renewal, you will be asked if you are a
            registered voter (botante). Standard counter processing is 3-5 minutes after verification at
            the Barangay San Jose hall.
          </p>
        </div>
      )}
    </div>
  );
}
