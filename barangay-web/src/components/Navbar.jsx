import { useAuth } from '../context/AuthContext';
import sealImg from '../assets/seal.png';

export default function Navbar({ user, setPage, currentPage }) {
  const { logout } = useAuth();

  const residentLinks = [
    { label: 'Home', page: 'home' },
    { label: 'New Request', page: 'request' },
    { label: 'My Requests', page: 'my-requests' },
    { label: 'Check Status', page: 'status' },
    { label: 'Live Chat', page: 'chat' },
  ];

  const adminLinks = [
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Manage Requests', page: 'requests' },
    { label: 'History', page: 'history' },
    { label: 'Live Chat', page: 'chat' },
  ];

  const links = user.role === 'admin' ? adminLinks : residentLinks;
  const roleLabel = user.role === 'admin' ? 'ADMIN' : 'RESIDENT';

  const initials = user.full_name
    .split(' ').filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join('');

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
        <img src={sealImg} alt="Barangay San Jose" className="nav-seal-img" />
        <span className="nav-brand-text">
          <strong>BARANGAY SAN JOSE</strong>
          <small>RESIDENT SERVICES</small>
        </span>
      </div>
      <div className="nav-links">
        {links.map((l) => (
          <button
            key={l.page}
            onClick={() => setPage(l.page)}
            className={currentPage === l.page ? 'active' : ''}
          >
            {l.label}
          </button>
        ))}
        <button className="nav-avatar" onClick={() => setPage(user.role === 'admin' ? 'dashboard' : 'profile')} title="Profile">
          {initials || 'U'}
        </button>
        <span className={`role-badge ${user.role}`}>{roleLabel}</span>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
