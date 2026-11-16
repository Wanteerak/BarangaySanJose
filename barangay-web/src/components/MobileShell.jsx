import { useEffect, useState } from 'react';
import sealImg from '../assets/seal.png';
import Icon from './Icons';

// Header title kada page (mobile shell)
const PAGE_TITLES = {
  home: 'Resident Services',
  services: 'Document Services',
  request: 'New Application',
  'my-requests': 'My Requests',
  status: 'Check Status',
  profile: 'My Profile',
  chat: 'Live Chat',
};

const TABS = [
  { page: 'home', label: 'Home', icon: 'home' },
  { page: 'services', label: 'Services', icon: 'layers' },
  { page: 'request', label: 'Apply', icon: 'edit' },
  { page: 'my-requests', label: 'Requests', icon: 'clock', dot: true },
  { page: 'chat', label: 'Chat', icon: 'chat' },
];

export default function MobileShell({ user, page, setPage, children }) {
  const [hasReady, setHasReady] = useState(false);

  // Green dot sa Requests tab kapag may approved/ready na dokumento
  useEffect(() => {
    let alive = true;
    import('../api').then(({ requestAPI }) => {
      requestAPI.getMyRequests().then((res) => {
        if (!alive) return;
        if (res.data.success) {
          setHasReady(res.data.data.some((r) => r.status === 'approved' || r.status === 'released'));
        }
      }).catch(() => {});
    });
    return () => { alive = false; };
  }, [page]);

  const initials = (user.full_name || 'U')
    .split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');

  return (
    <div className="mshell">
      {/* Slim top strip */}
      <div className="mshell-statusbar">
        <span>SAN JOSE • ONLINE</span>
      </div>

      {/* Orange header: seal + brand + avatar */}
      <header className="mshell-header">
        <div className="mshell-header-row">
          <img src={sealImg} alt="Barangay San Jose" className="mshell-seal" />
          <div className="mshell-brand">
            <strong>BARANGAY SAN JOSE</strong>
            <small>RESIDENT SERVICES</small>
          </div>
          <button className="mshell-avatar" onClick={() => setPage('profile')}>{initials || 'U'}</button>
        </div>
        <div className="mshell-pagetitle">{PAGE_TITLES[page] || 'Resident Services'}</div>
      </header>

      {/* Page content */}
      <main className="mshell-content">{children}</main>

      {/* Bottom tab bar */}
      <nav className="mtabbar">
        {TABS.map((t) => (
          <button
            key={t.page}
            className={`mtab ${page === t.page ? 'active' : ''}`}
            onClick={() => setPage(t.page)}
          >
            <span className="mtab-icon">
              <Icon name={t.icon} size={22} />
              {t.dot && hasReady && <span className="mtab-dot" />}
            </span>
            <span className="mtab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
