import { useEffect, useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import MobileShell from './components/MobileShell';
import Services from './components/Services';
import useIsMobile from './useIsMobile';
import sealImg from './assets/seal.png';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ResidentDashboard from './components/ResidentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminRequests from './components/AdminRequests';
import AdminHistory from './components/AdminHistory';
import AdminUsers from './components/AdminUsers';
import RequestForm from './components/RequestForm';
import MyRequests from './components/MyRequests';
import EditProfile from './components/EditProfile';
import Chat from './components/Chat';
import RequestStatus from './components/RequestStatus';

function AppInner() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [page, setPage] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // I-reset ang page kapag nagpalit ng user (login/logout/account switch)
  useEffect(() => {
    setPage('home');
    setMobileNavOpen(false);
  }, [user?.user_id]);

  // Kapag hindi naka-login: Login/Register lang ang makikita
  if (!user) {
    return (
      <div className="app">
        {page === 'register' ? (
          <Register onSwitchToLogin={() => setPage('login')} />
        ) : (
          <Login onSwitchToRegister={() => setPage('register')} />
        )}
      </div>
    );
  }

  const navigate = (p) => { setPage(p); setMobileNavOpen(false); };

  // ==================== MOBILE (resident, ≤768px) ====================
  // PWA design: orange header + bottom tabs, walang sidebar
  if (isMobile && user && user.role === 'resident') {
    return (
      <MobileShell user={user} page={page} setPage={navigate}>
        {page === 'home' && <Home user={user} setPage={navigate} />}
        {page === 'services' && <Services setPage={navigate} />}
        {page === 'dashboard' && <ResidentDashboard setPage={navigate} />}
        {page === 'request' && <RequestForm setPage={navigate} />}
        {page === 'my-requests' && <MyRequests setPage={navigate} />}
        {page === 'profile' && <EditProfile setPage={navigate} />}
        {page === 'chat' && <Chat setPage={navigate} user={user} />}
        {page === 'status' && <RequestStatus setPage={navigate} />}
      </MobileShell>
    );
  }

  return (
    <div className="app-layout">
      {/* Mobile top bar (visible only on small screens) */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(true)}>☰</button>
        <div className="mobile-brand">
          <img src={sealImg} alt="BSJ" className="mobile-seal" />
          <span>BARANGAY SAN JOSE</span>
        </div>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileNavOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Sidebar (desktop: always visible; mobile: drawer) */}
      <div className={`sidebar-wrap ${mobileNavOpen ? 'open' : ''}`}>
        <Sidebar user={user} setPage={navigate} currentPage={page} />
      </div>

      <main className="app-main">
        {page === 'home' && <Home user={user} setPage={navigate} />}

        {user.role === 'resident' && (
          <>
            {page === 'dashboard' && <ResidentDashboard setPage={navigate} />}
            {page === 'services' && <Services setPage={navigate} />}
            {page === 'request' && <RequestForm setPage={navigate} />}
            {page === 'my-requests' && <MyRequests setPage={navigate} />}
            {page === 'profile' && <EditProfile setPage={navigate} />}
            {page === 'chat' && <Chat setPage={navigate} user={user} />}
            {page === 'status' && <RequestStatus setPage={navigate} />}
          </>
        )}

        {user.role === 'admin' && (
          <>
            {page === 'dashboard' && <AdminDashboard setPage={navigate} />}
            {page === 'requests' && <AdminRequests setPage={navigate} />}
            {page === 'history' && <AdminHistory setPage={navigate} />}
            {page === 'users' && <AdminUsers setPage={navigate} />}
            {page === 'chat' && <Chat setPage={navigate} user={user} />}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
