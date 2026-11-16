import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import useIsMobile from '../useIsMobile';
import sealImg from '../assets/seal.png';

export default function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setWarning('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      if (res.pending) {
        setPendingEmail(res.email || email);
        setError(res.message || 'Please verify your email first.');
      } else if (res.message && res.message.toLowerCase().includes('pending admin approval')) {
        setWarning(res.message);
      } else {
        setError(res.message || 'Invalid email or password');
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    const r = await authAPI.verifyOtp(pendingEmail, otp);
    setLoading(false);
    if (r.data && r.data.success) {
      setSuccess(r.data.message || 'Verified! You can now login.');
      setPendingEmail(''); setOtp('');
    } else {
      setError((r.data && r.data.message) || 'Verification failed');
    }
  };

  const handleResend = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    const r = await authAPI.resendOtp(pendingEmail);
    setLoading(false);
    if (r.data && r.data.success) setSuccess(r.data.message || 'OTP resent.');
    else setError((r.data && r.data.message) || 'Failed to resend OTP');
  };

  // ============ MOBILE PWA DESIGN (≤768px) ============
  if (isMobile) {
    return (
      <div className="mauth">
        <div className="mauth-hero">
          <img src={sealImg} alt="Barangay San Jose" className="mauth-seal" />
          <h1>Barangay San Jose</h1>
          <p>Resident Services</p>
        </div>

        <div className="mauth-toggle">
          <button className="on">Login</button>
          <button onClick={onSwitchToRegister}>Register</button>
        </div>

        <div className="mauth-card">
          <h2>Welcome back</h2>
          <p className="mauth-sub">Sign in to apply for and track barangay documents.</p>

          {error && <div className="flash-error">{error}</div>}
          {success && <div className="flash-success">{success}</div>}
          {warning && <div className="flash-warning">{warning}</div>}

          {pendingEmail ? (
            <form onSubmit={handleVerify}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                I-enter ang OTP na na-send sa <b>{pendingEmail}</b>.
              </p>
              <div className="form-group">
                <label>OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: 6, textAlign: 'center', fontSize: '1.2rem' }} />
              </div>
              <button type="submit" className="mauth-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" className="mauth-btn" style={{ background: '#fff', color: '#ea580c', border: '1px solid #f3e3d3', marginTop: 8 }} onClick={handleResend} disabled={loading}>
                Resend OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ width: '100%', paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                      color: '#64748b', padding: 4,
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="mauth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          <div className="mauth-privacy">
            Your resident details and document requests are private and visible only to you and authorized barangay personnel.
          </div>
        </div>
      </div>
    );
  }

  // ============ DESKTOP (walang binago) ============
  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#ea580c', marginBottom: '1.5rem' }}>Barangay Login</h2>

        {error && <div className="flash-error">{error}</div>}
        {success && <div className="flash-success">{success}</div>}
        {warning && <div className="flash-warning">{warning}</div>}

        {pendingEmail && (
          <form onSubmit={handleVerify} style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
              I-enter ang OTP na na-send sa <b>{pendingEmail}</b>.
            </p>
            <div className="form-group">
              <label>OTP Code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required style={{ letterSpacing: 6, textAlign: 'center', fontSize: '1.2rem' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={handleResend} disabled={loading}>
              Resend OTP
            </button>
          </form>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@barangay.gov"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ width: '100%', paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: '#64748b',
                  padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
