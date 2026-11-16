import { useAuth } from '../context/AuthContext';
import sealImg from '../assets/seal.png';

export default function Sidebar({ user, setPage, currentPage }) {
  const { logout } = useAuth();

  const residentLinks = [
    { label: 'Home', page: 'home', icon: '🏠' },
    { label: 'New Request', page: 'request', icon: '📝' },
    { label: 'My Requests', page: 'my-requests', icon: '🕒' },
    { label: 'Check Status', page: 'status', icon: '🔍' },
    { label: 'Live Chat', page: 'chat', icon: '💬' },
  ];
  const adminLinks = [
    { label: 'Dashboard', page: 'dashboard', icon: '📊' },
    { label: 'Registrations', page: 'users', icon: '🪪' },
    { label: 'Manage Requests', page: 'requests', icon: '📋' },
    { label: 'History', page: 'history', icon: '🗂️' },
    { label: 'Live Chat', page: 'chat', icon: '💬' },
  ];

  const links = user.role === 'admin' ? adminLinks : residentLinks;
  const roleLabel = user.role === 'admin' ? 'Administrator' : 'Resident';
  const initials = user.full_name
    .split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <img src={sealImg} alt="Barangay San Jose" className="sidebar-seal" />
        <div className="sidebar-brand-text">
          <strong>BARANGAY SAN JOSE</strong>
          <small>RESIDENT SERVICES</small>
        </div>
      </div>

      {/* User card */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials || 'U'}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.full_name}</div>
          <div className="sidebar-user-role">{roleLabel}</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {links.map((l) => (
          <button
            key={l.page}
            onClick={() => setPage(l.page)}
            className={`sidebar-link ${currentPage === l.page ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{l.icon}</span>
            <span className="sidebar-link-label">{l.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer: profile + logout */}
      <div className="sidebar-footer">
        <button
          className="sidebar-link"
          onClick={() => setPage(user.role === 'admin' ? 'dashboard' : 'profile')}
        >
          <span className="sidebar-link-icon">⚙️</span>
          <span className="sidebar-link-label">Profile</span>
        </button>
        <button className="sidebar-logout" onClick={logout}>
          <span className="sidebar-link-icon">🚪</span>
          <span className="sidebar-link-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
