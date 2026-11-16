import { useEffect, useState } from 'react';
import { profileAPI } from '../api';

export default function EditProfile({ setPage }) {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    address: '',
    purok: '',
    birthdate: '',
    civil_status: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    profileAPI.get()
      .then((res) => {
        if (res.data.success) setProfile(res.data.data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await profileAPI.update(profile);
      if (res.data.success) {
        setSuccess('Profile updated successfully.');
      } else {
        setError(res.data.message || 'Update failed');
      }
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={() => setPage('dashboard')}>← Back</button>

      <h1>Edit Profile</h1>
      <p className="welcome-text">Update your personal information.</p>

      {error && <div className="flash-error">{error}</div>}
      {success && <div className="flash-success">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="full_name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" rows="3" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Purok / Zone</label>
            <input type="text" name="purok" value={profile.purok} onChange={(e) => setProfile({ ...profile, purok: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Birthdate</label>
            <input type="date" name="birthdate" value={profile.birthdate} onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Civil Status</label>
            <select name="civil_status" value={profile.civil_status} onChange={(e) => setProfile({ ...profile, civil_status: e.target.value })}>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPage('dashboard')}
            style={{ marginLeft: '0.5rem' }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
