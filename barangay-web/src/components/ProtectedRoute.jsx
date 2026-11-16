import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }
  if (!user) {
    return <div className="empty-state">Please login to continue.</div>;
  }

  return <>{children}</>;
}
