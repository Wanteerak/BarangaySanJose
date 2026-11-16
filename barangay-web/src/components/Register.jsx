import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'resident',
    address: '',
    purok: '',
    birthdate: '',
    civil_status: '',
    id_photo: '',
  });
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Max 5 MB ang file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, id_photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.role === 'resident' && !form.id_photo) {
      setError('I-upload ang valid ID (proof of identity) para mag-register.');
      return;
    }
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.success && res.pending) {
      setPendingEmail(form.email);
      setStep(2);
      setSuccess(res.message || 'OTP sent to your email.');
    } else if (res.success) {
      setSuccess(res.message || 'Registration successful. You can now login.');
      setForm({ full_name: '', email: '', password: '', role: 'resident', address: '', purok: '', birthdate: '', civil_status: '', id_photo: '' });
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    const r = await authAPI.verifyOtp(pendingEmail, otp);
    setLoading(false);
    if (r.data && r.data.success) {
      setSuccess(r.data.message || 'Email verified. You can now login.');
      setStep(1);
      setOtp('');
      setPendingEmail('');
      setForm({ full_name: '', email: '', password: '', role: 'resident', address: '', purok: '', birthdate: '', civil_status: '', id_photo: '' });
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

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 450, width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#ea580c', marginBottom: '1.5rem' }}>
          {step === 1 ? 'Create Account' : 'Verify Your Email'}
        </h2>

        {error && <div className="flash-error">{error}</div>}
        {success && <div className="flash-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'resident' && (
              <>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={form.address} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Purok / Zone</label>
                  <input type="text" name="purok" value={form.purok} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Birthdate</label>
                  <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Civil Status</label>
                  <select name="civil_status" value={form.civil_status} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Valid ID (Proof of Identity) *</label>
                  <input type="file" accept="image/*,application/pdf" onChange={handleFile} required />
                  {form.id_photo && <div style={{ fontSize: '0.8rem', color: '#155724', marginTop: 4 }}>✔ ID uploaded</div>}
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register & Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Na-send na ang 6-digit OTP sa <b>{pendingEmail}</b>. I-enter dito (valid sa 10 minuto).
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
            <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => { setStep(1); setOtp(''); setPendingEmail(''); }}>
              Bumalik
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontWeight: 600 }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
