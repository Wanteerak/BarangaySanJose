import { createContext, useContext, useState } from 'react';
import { authAPI } from '../api';

const SESSION_KEY = 'bsj_current_user';

const AuthContext = createContext(null);

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const [loading, setLoading] = useState(false);

  // Login: dumadaan na sa totoong backend (MySQL)
  const login = (email, password) => {
    setLoading(true);
    return authAPI.login(email, password).then((r) => {
      setLoading(false);
      if (r.data.success) {
        setUser(r.data.data.user);
        return { success: true, user: r.data.data.user };
      }
      return {
        success: false,
        pending: !!r.data.pending,
        email: r.data.email,
        message: r.data.message || 'Invalid email or password.',
      };
    });
  };

  // Register: dumadaan din sa backend
  const register = (form) => {
    setLoading(true);
    return authAPI.register(form).then((r) => {
      setLoading(false);
      return {
        success: !!r.data.success,
        pending: !!r.data.pending,
        email: r.data.data && r.data.data.email,
        message: r.data.message || (r.data.success ? 'Registration successful.' : 'Registration failed.'),
      };
    });
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
