// ============================================================
// API layer - TOTOO na ito: kumokonekta sa Express backend
// (http://localhost:3001) + MySQL (barangay_san_jose).
// Same response shape pa rin ({data: {...}}) kaya hindi
// na kailangang baguhin ang mga components.
// ============================================================

// Kapag nasa browser (http/https): relative '/api' — dina-daanan ng
// Vite proxy papuntang backend (port 3001), gumana kahit HTTPS.
// Kapag Electron desktop (file://): diretso sa backend gamit ang LAN IP.
const BASE = window.location.protocol === 'file:'
  ? 'http://10.23.44.44:3001/api'
  : '/api';
const TOKEN_KEY = 'bsj_token';

async function req(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(BASE + path, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const json = await res.json();
    return { data: json };
  } catch (err) {
    return { data: { success: false, message: 'Cannot reach the server. Is the backend running?' } };
  }
}

// ============================================================
// Auth API (tinatawag ng AuthContext)
// ============================================================
export const authAPI = {
  async login(email, password) {
    const r = await req('/auth/login', { method: 'POST', body: { email, password } });
    if (r.data.success) {
      localStorage.setItem(TOKEN_KEY, r.data.data.token);
      localStorage.setItem('bsj_current_user', JSON.stringify(r.data.data.user));
    }
    return r;
  },

  async register(form) {
    return req('/auth/register', { method: 'POST', body: form });
  },

  async verifyOtp(email, otp) {
    return req('/auth/verify-otp', { method: 'POST', body: { email, otp } });
  },

  async resendOtp(email) {
    return req('/auth/resend-otp', { method: 'POST', body: { email } });
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('bsj_current_user');
  },
};

// ============================================================
// User Management API (admin: approve/decline registrations)
// ============================================================
export const userAPI = {
  getPending() { return req('/users/pending'); },
  getAll() { return req('/users'); },
  getResidents() { return req('/users/residents'); },
  approve(user_id) { return req('/users/approve', { method: 'PUT', body: { user_id } }); },
  decline(user_id, reason) { return req('/users/decline', { method: 'PUT', body: { user_id, reason } }); },
};

// ============================================================
// Requests API
// ============================================================
export const requestAPI = {
  submitRequest(form) {
    return req('/requests', { method: 'POST', body: form });
  },

  getMyRequests() {
    return req('/requests/my');
  },

  getAllRequests() {
    return req('/requests');
  },

  adminAction({ action, request_id, schedule_date, reject_reason }) {
    return req('/requests/action', {
      method: 'PUT',
      body: { action, request_id, schedule_date, reject_reason },
    });
  },

  checkStatus(code) {
    return req(`/requests/status/${encodeURIComponent(code)}`);
  },
};

// ============================================================
// Profile API
// ============================================================
export const profileAPI = {
  get() {
    return req('/profile');
  },

  update(profile) {
    return req('/profile', { method: 'PUT', body: profile });
  },
};

// ============================================================
// Messages API (Live Chat)
// ============================================================
export const messageAPI = {
  getMessages(partnerId) {
    return req(`/messages/${partnerId}`);
  },

  sendMessage({ receiver_id, message }) {
    return req('/messages', { method: 'POST', body: { receiver_id, message } });
  },
};

export const statsAPI = {
  getStats() {
    return req('/stats');
  },
};
